const express = require("express");

const router = express.Router();

const {
  createOrder,
  getOrders,
  getMyOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

const {
  protect,
  admin,
} = require("../middleware/authMiddleware");

router.post("/", protect, createOrder);

router.get("/myorders", protect, getMyOrders);

router.get("/", protect, admin, getOrders);

router.put("/:id", protect, admin, updateOrderStatus);

module.exports = router;