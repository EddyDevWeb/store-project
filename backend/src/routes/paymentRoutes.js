const express = require("express");

const router = express.Router();

const {
  createCheckoutSession,
  verifySession,
} = require("../controllers/paymentController");

const { protect } = require("../middleware/authMiddleware");

router.post("/checkout-session", protect, createCheckoutSession);

router.get("/verify/:sessionId", protect, verifySession);

module.exports = router;
