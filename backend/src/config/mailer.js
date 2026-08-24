const nodemailer = require("nodemailer");

let transporterPromise = null;

const getTransporter = async () => {
  if (!transporterPromise) {
    transporterPromise = nodemailer
      .createTestAccount()
      .then((account) =>
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
  }

  return transporterPromise;
};

module.exports = { getTransporter };
