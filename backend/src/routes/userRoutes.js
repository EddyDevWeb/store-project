const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      "Demasiados intentos. Espera 15 minutos antes de volver a probar.",
  },
});

const {
  registerUser,
  loginUser,
  googleLogin,
  getFavorites,
  toggleFavorite,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.get("/profile", protect, (req, res) => {
  res.json(req.user);
});

router.get("/favorites", protect, getFavorites);
router.post("/favorites/:productId", protect, toggleFavorite);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password/:token", authLimiter, resetPassword);

router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.post("/google", authLimiter, googleLogin);

module.exports = router;