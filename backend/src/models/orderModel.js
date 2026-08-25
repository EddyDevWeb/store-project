const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        title: String,
        image: String,
        price: Number,

        qty: {
          type: Number,
          required: true,
        },
      },
    ],

    totalPrice: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "Pendiente",
        "Procesando",
        "Enviado",
        "Entregado",
      ],
      default: "Pendiente",
    },

    paymentStatus: {
      type: String,
      enum: ["Pendiente", "Pagado"],
      default: "Pendiente",
    },

    stripeSessionId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Order",
  orderSchema
);