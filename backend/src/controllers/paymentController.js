const Stripe = require("stripe");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");

const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_COST = 9.99;

const isStripeConfigured = () => {
  const key = process.env.STRIPE_SECRET_KEY;

  return (
    typeof key === "string" &&
    key.startsWith("sk_test_")
  );
};

const createCheckoutSession = async (req, res) => {
  try {
    if (!isStripeConfigured()) {
      return res.status(503).json({
        message:
          "El pago con tarjeta no está configurado todavía.",
      });
    }

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
        message:
          "El carrito está vacío o contiene datos inválidos",
      });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const products = await Product.find({
      _id: { $in: orderItems.map((item) => item.product) },
    });

    const productMap = new Map(
      products.map((product) => [String(product._id), product])
    );

    for (const item of orderItems) {
      const product = productMap.get(String(item.product));

      if (!product) {
        return res.status(400).json({
          message:
            "Un producto del carrito ya no existe. Actualiza tu carrito.",
        });
      }

      if (product.stock < Number(item.qty)) {
        return res.status(400).json({
          message: `"${product.title}" solo tiene ${product.stock} unidad(es) disponible(s)`,
        });
      }
    }

    const resolvedItems = orderItems.map((item) => {
      const product = productMap.get(String(item.product));

      return {
        product: product._id,
        title: product.title,
        image: product.image,
        price: product.price,
        qty: Number(item.qty),
      };
    });

    const goodsTotal = resolvedItems.reduce(
      (acc, item) => acc + item.price * item.qty,
      0
    );

    const shipping =
      goodsTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

    const totalPrice =
      Math.round((goodsTotal + shipping) * 100) / 100;

    const line_items = resolvedItems.map((item) => ({
      quantity: item.qty,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(item.price * 100),
        product_data: {
          name: item.title,
        },
      },
    }));

    if (shipping > 0) {
      line_items.push({
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(shipping * 100),
          product_data: {
            name: "Envío",
          },
        },
      });
    }

    const order = await Order.create({
      user: req.user._id,
      orderItems: resolvedItems,
      totalPrice,
    });

    const bulkResult = await Product.bulkWrite(
      resolvedItems.map((item) => ({
        updateOne: {
          filter: { _id: item.product, stock: { $gte: item.qty } },
          update: { $inc: { stock: -item.qty } },
        },
      }))
    );

    if (bulkResult.modifiedCount !== resolvedItems.length) {
      await Order.findByIdAndDelete(order._id);

      return res.status(409).json({
        message:
          "El stock cambió mientras procesábamos tu orden. Revisa tu carrito e inténtalo de nuevo.",
      });
    }

    const clientUrl =
      process.env.CLIENT_URL ?? "http://localhost:5173";

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items,
        customer_email: req.user.email,
        success_url: `${clientUrl}/pago-exitoso?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
        cancel_url: `${clientUrl}/pago-cancelado?order_id=${order._id}`,
        metadata: {
          orderId: String(order._id),
        },
      });

      order.stripeSessionId = session.id;
      await order.save();

      res.json({ url: session.url, orderId: order._id });
    } catch (stripeError) {
      console.error("Stripe error:", stripeError.message);

      await Order.findByIdAndDelete(order._id);

      await Product.bulkWrite(
        resolvedItems.map((item) => ({
          updateOne: {
            filter: { _id: item.product },
            update: { $inc: { stock: item.qty } },
          },
        }))
      );

      res.status(502).json({
        message:
          "No se pudo iniciar el pago con tarjeta. Inténtalo de nuevo en unos segundos.",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const verifySession = async (req, res) => {
  try {
    if (!isStripeConfigured()) {
      return res.status(503).json({
        message:
          "El pago con tarjeta no está configurado todavía.",
      });
    }

    const { sessionId } = req.params;

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session =
      await stripe.checkout.sessions.retrieve(sessionId);

    const orderId = session.metadata?.orderId;

    const order = orderId
      ? await Order.findById(orderId)
      : null;

    if (!order || String(order.user) !== String(req.user._id)) {
      return res.status(404).json({
        message: "Orden no encontrada",
      });
    }

    if (
      session.payment_status === "paid" &&
      order.paymentStatus !== "Pagado"
    ) {
      order.paymentStatus = "Pagado";
      await order.save();
    }

    res.json({
      paid: order.paymentStatus === "Pagado",
      order,
    });
  } catch (error) {
    console.error("Verify error:", error.message);
    res.status(500).json({
      message:
        "No se pudo verificar el estado del pago. Inténtalo más tarde.",
    });
  }
};

module.exports = {
  createCheckoutSession,
  verifySession,
};
