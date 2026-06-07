import mongoose from "mongoose";
import Counter from "./counterModel.js";

const billingInvoiceSchema = mongoose.Schema(
  {
    logo: { type: String },

    from: {
      name: String,
      businessName: String,
      email: String,
      address: String,
      phone: String,
      businessNumber: String,
    },

    to: {
      name: String,
      email: String,
      address: String,
      phone: String,
      mobile: String,
      fax: String,
    },

    invoiceNumber: { type: String, unique: true },
    date: { type: Date, required: true },

    items: [
      {
        description: { type: String, required: true },
        hsnCode: { type: String, default: "6109" },
        rate: { type: Number, required: true },
        qty: { type: Number, required: true },
        cgst: { type: Number, default: 0 },
        sgst: { type: Number, default: 0 },
        amount: { type: Number, required: true },
      },
    ],

    subtotal: { type: Number, default: 0 },
    cgstTotal: { type: Number, default: 0 },
    sgstTotal: { type: Number, default: 0 },

    // ✅ Coupon / discount support
    coupon: {
      code: { type: String },
      percentage: { type: Number },
      discountAmount: { type: Number, default: 0 },
    },

    shippingPrice: { type: Number, default: 0 },
    total: { type: Number, default: 0 },

    notes: { type: String },
    signature: { type: String },
  },
  { timestamps: true }
);

// ── Auto-generate invoice number before saving ─────────────────────────────
billingInvoiceSchema.pre("save", async function (next) {
  if (this.isNew && !this.invoiceNumber) {
    const year = new Date().getFullYear();
    const counter = await Counter.findByIdAndUpdate(
      `invoice-${year}`,
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    // Format: VF-2026-0001
    this.invoiceNumber = `VF-${year}-${String(counter.seq).padStart(4, "0")}`;
  }
  next();
});

const BillingInvoice = mongoose.model("BillingInvoice", billingInvoiceSchema);
export default BillingInvoice;