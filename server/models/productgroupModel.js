import mongoose from "mongoose";

const productGroupSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

const ProductGroup = mongoose.model("ProductGroup", productGroupSchema);

export default ProductGroup;
