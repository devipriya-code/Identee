import mongoose from "mongoose";

const shippingRateSchema = mongoose.Schema(
  {
    serviceType: { type: String, required: true },
    totalNetCharge: { type: Number, required: true },
    estimatedDeliveryDate: { type: String, default: "N/A" },
    currency: { type: String, default: "USD" },
  },
  { timestamps: true }
);

const transactionSchema = mongoose.Schema(
  {
    deliveryPerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["deposit", "withdrawal"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejectionReason: {
      type: String,
    },
  },
  { timestamps: true }
);

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    deliveryPerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String },
        price: { type: Number, required: true },
        size: { type: String, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
      },
    ],
    shippingAddress: {
      doorNo: { type: String, default: "" },
      street: { type: String, default: "" },
      nearestLandmark: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pin: { type: Number, default: "" },
      country: { type: String, default: "" },
      phoneNumber: { type: Number, default: null },
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: [
        "CREATED",
        "CONFIRMED",
        "PACKED",
        "OUT_FOR_DELIVERY",
        "RETURN_APPROVED",
        "RETURN_COMPLETED",
        "DELIVERED",
      ],
      default: "CREATED",
    },
    size: { type: String, required: false },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_adress: { type: String },
    },
    shippingRates: { type: [shippingRateSchema], default: [] },

    cgstPrice: { type: Number, default: 0 },   // ✅ ADDED
    sgstPrice: { type: Number, default: 0 },   // ✅ ADDED

    taxPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },

    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },

    coupon: {
      code: { type: String },
      percentage: { type: Number },
      discountAmount: { type: Number },
    },

    invoiceNumber: { type: String, default: null }, // ✅ ADDED

    deliveredAt: { type: Date },

    invoiceDetails: { type: Object, default: null },
    transaction: { type: [transactionSchema], default: [] },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;