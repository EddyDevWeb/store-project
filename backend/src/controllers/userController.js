const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const nodemailer = require("nodemailer");
const { getTransporter, getFromAddress } = require("../config/mailer");

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = String(email ?? "").trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (
      user &&
      (await bcrypt.compare(password, user.password))
    ) {
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
        message: "Inicio de sesión exitoso",
      });
    } else {
      res.status(401).json({
        message: "Credenciales inválidas",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const normalizedEmail = String(email ?? "").trim().toLowerCase();

    if (!password || String(password).length < 6) {
      return res.status(400).json({
        message:
          "La contraseña es obligatoria y debe tener al menos 6 caracteres",
      });
    }

    const userExists = await User.findOne({
      email: normalizedEmail,
    });

    if (userExists) {
      return res.status(400).json({
        message: "El usuario ya existe",
      });
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Falta la credencial de Google",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload.email || !payload.email_verified) {
      return res.status(401).json({
        message:
          "El email de tu cuenta de Google no está verificado",
      });
    }

    const email = payload.email.toLowerCase();
    const name = payload.name ?? email.split("@")[0];

    let user = await User.findOne({ email });

    if (!user) {
      const salt = await bcrypt.genSalt(10);

      const unusablePassword = await bcrypt.hash(
        crypto.randomBytes(32).toString("hex"),
        salt
      );

      user = await User.create({
        name,
        email,
        password: unusablePassword,
        googleId: payload.sub,
      });
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      await user.save();
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Google login error:", error.message);
    res.status(401).json({
      message: "No se pudo verificar tu sesión de Google",
    });
  }
};

const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("favorites");

    res.json(user?.favorites ?? []);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: "ID de producto inválido",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    const index = user.favorites.findIndex(
      (favoriteId) => favoriteId.toString() === productId
    );

    if (index >= 0) {
      user.favorites.splice(index, 1);
    } else {
      user.favorites.push(productId);
    }

    await user.save();

    res.json({
      favoriteIds: user.favorites.map((favoriteId) =>
        favoriteId.toString()
      ),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const email = String(req.body.email ?? "")
      .trim()
      .toLowerCase();

    const user = await User.findOne({ email });

    const genericResponse = {
      message:
        "Si ese email está registrado, te enviamos un enlace para restablecer tu contraseña.",
    };

    if (!user) {
      return res.json(genericResponse);
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;

    await user.save();

    const resetUrl = `${
      process.env.CLIENT_URL ?? "http://localhost:5173"
    }/resetear-contrasena/${token}`;

    const transporter = await getTransporter();

    const info = await transporter.sendMail({
      from: getFromAddress(),
      to: user.email,
      subject: "Recupera tu contraseña - TechStore",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background-color: #f8fafc; border-radius: 12px;">
          <h1 style="color: #0f172a; font-size: 22px;">Hola ${user.name},</h1>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">
            Recibimos una solicitud para restablecer tu contraseña en <strong>TechStore</strong>.
            Haz clic en el siguiente botón para continuar:
          </p>
          <p style="text-align: center; margin: 28px 0;">
            <a href="${resetUrl}" style="background-color: #1e293b; color: #ffffff; padding: 12px 28px; border-radius: 999px; text-decoration: none; font-weight: bold; font-size: 14px;">
              Restablecer contraseña
            </a>
          </p>
          <p style="color: #94a3b8; font-size: 13px; line-height: 1.6;">
            Este enlace expira en 1 hora. Si no fuiste tú, ignora este mensaje y tu contraseña seguirá siendo la misma.
          </p>
        </div>
      `,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);

    res.json({
      ...genericResponse,
      ...(previewUrl ? { previewUrl } : {}),
    });
  } catch (error) {
    console.error("Error enviando email:", error.message);
    res.status(500).json({
      message:
        "No se pudo enviar el email de recuperación. Inténtalo más tarde.",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || String(password).length < 6) {
      return res.status(400).json({
        message: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "El enlace es inválido o ha expirado",
      });
    }

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(
      String(password),
      salt
    );

    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  getFavorites,
  toggleFavorite,
  forgotPassword,
  resetPassword,
};