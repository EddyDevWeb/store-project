const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");

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

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  getFavorites,
  toggleFavorite,
};