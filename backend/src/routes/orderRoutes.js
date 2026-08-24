const express = require("express");

const router = express.Router();

const {
  createOrder,
  getOrders,
  getMyOrders,
  getOrderById,
  hasPurchased,
  getSalesStats,
  updateOrderStatus,
} = require("../controllers/orderController");

const {
  protect,
  admin,
} = require("../middleware/authMiddleware");

router.post("/", protect, createOrder);

router.get("/myorders", protect, getMyOrders);

router.get("/stats", protect, admin, getSalesStats);

router.get("/has-purchased/:productId", protect, hasPurchased);

router.get("/myorders", protect, getMyOrders);

router.get("/", protect, admin, getOrders);

router.get("/:id", protect, getOrderById);

router.put("/:id", protect, admin, updateOrderStatus);

module.exports = router;