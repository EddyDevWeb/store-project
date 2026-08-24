const mongoose = require("mongoose");
const Review = require("../models/reviewModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");

const recalcProductStats = async (productId) => {
  const [stats] = await Review.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
      },
    },
    {
      $group: {
        _id: "$product",
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  await Product.findByIdAndUpdate(productId, {
    ratingAvg:
      Math.round((stats?.avg ?? 0) * 10) / 10,
    ratingCount: stats?.count ?? 0,
  });
};

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: "ID de producto inválido",
      });
    }

    const reviews = await Review.find({ product: productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: "ID de producto inválido",
      });
    }

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        message: "La valoración debe ser un número del 1 al 5",
      });
    }

    const productExists = await Product.exists({
      _id: productId,
    });

    if (!productExists) {
      return res.status(404).json({
        message: "Producto no encontrado",
      });
    }

    const purchased = await Order.exists({
      user: req.user._id,
      "orderItems.product": productId,
    });

    if (!purchased) {
      return res.status(403).json({
        message:
          "Solo puedes opinar sobre productos que hayas comprado",
      });
    }

    const review = await Review.findOneAndUpdate(
      {
        user: req.user._id,
        product: productId,
      },
      {
        rating: numericRating,
        comment: String(comment ?? "").trim(),
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    await recalcProductStats(productId);

    const populated = await review.populate("user", "name");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "ID inválido",
      });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        message: "Reseña no encontrada",
      });
    }

    if (
      String(review.user) !== String(req.user._id) &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "No tienes permiso para eliminar esta reseña",
      });
    }

    await review.deleteOne();

    await recalcProductStats(review.product.toString());

    res.json({
      message: "Reseña eliminada correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getProductReviews,
  createReview,
  deleteReview,
};
