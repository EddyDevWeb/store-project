const express = require("express");
const router = express.Router();

const {
  deleteProduct,
  updateProduct,
  getProducts,
  createProduct,
  getProductById,
} = require("../controllers/productController");

const {
  protect,
  admin,
} = require("../middleware/authMiddleware");

router.get("/", getProducts);

router.get("/:id", getProductById);

router.post("/", protect, admin, createProduct);

router.put("/:id", protect, admin, updateProduct);

router.delete("/:id", protect, admin, deleteProduct);


module.exports = router;
