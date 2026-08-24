const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  googleLogin,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.get("/profile", protect, (req, res) => {
  res.json(req.user);
});

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleLogin);

module.exports = router;