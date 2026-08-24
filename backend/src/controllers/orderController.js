const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const mongoose = require("mongoose");

const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_COST = 9.99;

const createOrder = async (req, res) => {
  try {
    const { orderItems } = req.body;

    const isValidItems =
      Array.isArray(orderItems) &&
      orderItems.length > 0 &&
      orderItems.every(
        (item) =>
          item.product &&
          Number.isInteger(Number(item.qty)) &&
          Number(item.qty) > 0
      );

    if (!isValidItems) {
      return res.status(400).json({
        message: "El carrito está vacío o contiene datos inválidos",
      });
    }

    const products = await Product.find({
      _id: { $in: orderItems.map((item) => item.product) },
    });

    const productMap = new Map(
      products.map((product) => [String(product._id), product])
    );

    const problems = [];

    for (const item of orderItems) {
      const product = productMap.get(String(item.product));

      if (!product) {
        problems.push("un producto del carrito ya no existe");
      } else if (product.stock < Number(item.qty)) {
        problems.push(
          `"${product.title}" solo tiene ${product.stock} unidad(es) disponible(s)`
        );
      }
    }

    if (problems.length > 0) {
      return res.status(400).json({
        message: `No se pudo completar la compra: ${problems.join("; ")}. Actualiza tu carrito.`,
      });
    }

    const items = orderItems.map((item) => {
      const product = productMap.get(String(item.product));

      return {
        product: product._id,
        title: product.title,
        image: product.image,
        price: product.price,
        qty: Number(item.qty),
      };
    });

    const goodsTotal = items.reduce(
      (acc, item) => acc + item.price * item.qty,
      0
    );

    const shipping =
      goodsTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

    const totalPrice =
      Math.round((goodsTotal + shipping) * 100) / 100;

    const order = await Order.create({
      user: req.user._id,
      orderItems: items,
      totalPrice,
    });

    const bulkResult = await Product.bulkWrite(
      items.map((item) => ({
        updateOne: {
          filter: { _id: item.product, stock: { $gte: item.qty } },
          update: { $inc: { stock: -item.qty } },
        },
      }))
    );

    if (bulkResult.modifiedCount !== items.length) {
      await Order.findByIdAndDelete(order._id);

      return res.status(409).json({
        message:
          "El stock cambió mientras procesábamos tu orden. Revisa tu carrito e inténtalo de nuevo.",
      });
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            user: req.user._id,
        }).sort({
            createdAt: -1,
        });

        res.json(orders);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "ID inválido",
      });
    }

    const order = await Order.findById(id).populate(
      "orderItems.product",
      "title image price stock"
    );

    if (!order) {
      return res.status(404).json({
        message: "Orden no encontrada",
      });
    }

    if (
      req.user.role !== "admin" &&
      String(order.user) !== String(req.user._id)
    ) {
      return res.status(403).json({
        message: "No tienes permiso para ver esta orden",
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(
            req.params.id
        );

        if (!order) {
            return res.status(404).json({
                message: "Orden no encontrada",
            });
        }

        order.status = req.body.status;

        const updatedOrder =
            await order.save();

        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const hasPurchased = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: "ID de producto inválido",
      });
    }

    const purchased = await Order.exists({
      user: req.user._id,
      "orderItems.product": productId,
    });

    res.json({ purchased: Boolean(purchased) });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getSalesStats = async (req, res) => {
  try {
    const now = new Date();

    const since = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - 29
      )
    );

    const daily = await Order.aggregate([
      {
        $match: { createdAt: { $gte: since } },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          revenue: { $sum: "$totalPrice" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const byDate = new Map(
      daily.map((day) => [day._id, day])
    );

    const series = [];

    for (let i = 0; i < 30; i++) {
      const day = new Date(since);
      day.setUTCDate(day.getUTCDate() + i);

      const key = day.toISOString().slice(0, 10);
      const found = byDate.get(key);

      series.push({
        date: key,
        revenue: found?.revenue ?? 0,
        count: found?.count ?? 0,
      });
    }

    const [totals] = await Order.aggregate([
      {
        $group: {
          _id: null,
          revenue: { $sum: "$totalPrice" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      daily: series,
      totals: {
        revenue:
          Math.round((totals?.revenue ?? 0) * 100) / 100,
        count: totals?.count ?? 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getMyOrders,
  getOrderById,
  hasPurchased,
  getSalesStats,
  updateOrderStatus,
};
