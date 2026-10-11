const nodemailer = require("nodemailer");

let transporterPromise = null;

const isSmtpConfigured = () =>
  Boolean(process.env.SMTP_HOST);

const createSmtpTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
  });

const createTestTransporter = () =>
  nodemailer.createTestAccount().then((account) =>
    nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: {
        user: account.user,
        pass: account.pass,
      },
    })
  );

const getTransporter = async () => {
  if (!transporterPromise) {
    transporterPromise = isSmtpConfigured()
      ? Promise.resolve(createSmtpTransporter())
      : createTestTransporter();
  }

  return transporterPromise;
};

const getFromAddress = () =>
  process.env.EMAIL_FROM || '"TechStore" <no-reply@techstore.dev>';

module.exports = { getTransporter, getFromAddress, isSmtpConfigured };
