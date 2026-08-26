import mongoose from "mongoose";

const notificationSchema = mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "NEW_ORDER",
        "LOW_STOCK",
        "NEW_REVIEW",
        "NEW_ENQUIRY",
        "PAYMENT_FAILED",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: "" }, // e.g. "/admin/orders" — where clicking it navigates
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
