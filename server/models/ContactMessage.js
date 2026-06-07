import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const ContactMessage= mongoose.model("ContactMessage", contactMessageSchema);
export default ContactMessage;