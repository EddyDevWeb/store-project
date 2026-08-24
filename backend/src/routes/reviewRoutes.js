const express = require("express");

const router = express.Router();

const {
  getProductReviews,
  createReview,
  deleteReview,
} = require("../controllers/reviewController");

const { protect } = require("../middleware/authMiddleware");

router.get("/:productId", getProductReviews);

router.post("/:productId", protect, createReview);

router.delete("/:id", protect, deleteReview);

module.exports = router;
