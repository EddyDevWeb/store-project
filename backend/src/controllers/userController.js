const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

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

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "El usuario ya existe",
      });
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  registerUser,
    loginUser,
};