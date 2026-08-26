// controllers/customizerCatalogController.js

import asyncHandler from "express-async-handler";
import Product from "../models/productModel.js";

const COLOR_HEX_MAP = {
  black: "#15130F",
  white: "#FFFFFF",
  red: "#D0342C",
  crimson: "#DC143C",
  blue: "#2A4D9B",
  navy: "#1B2340",
  green: "#3E7C4A",
  olive: "#6B6B2E",
  yellow: "#F4C43C",
  mustard: "#E3A72E",
  orange: "#E08E0B",
  pink: "#E8A0BF",
  purple: "#6A54C8",
  grey: "#8A877F",
  gray: "#8A877F",
  maroon: "#6E1F2A",
  brown: "#6B4A32",
  beige: "#E7DEC9",
};

function slugify(str = "") {
  return str.toLowerCase().trim().replace(/\s+/g, "-");
}

function hexForColor(name = "") {
  return COLOR_HEX_MAP[name.toLowerCase().trim()] || "#CCCCCC";
}

// @desc  Get every distinct garment style ("pattern") that has at
//        least one product, for the Choose Pattern grid
// @route GET /api/customizer/styles
// @access Public
export const getGarmentStyles = asyncHandler(async (req, res) => {
  const products = await Product.find({
    "productdetails.garmentStyle": { $exists: true, $ne: "" },
  })
    .select("productdetails.garmentStyle productdetails.category images")
    .lean();

  const map = {};
  products.forEach((p) => {
    const style = p.productdetails?.garmentStyle;
    if (!style) return;
    const key = slugify(style);
    if (!map[key]) {
      map[key] = {
        key,
        label: style,
        category: p.productdetails?.category || "Apparel",
        image: p.images?.[0] || null,
      };
    }
  });

  res.json(Object.values(map));
});

// @desc  Get every distinct color available for a given garment style
// @route GET /api/customizer/styles/:style/colors
// @access Public
export const getGarmentColors = asyncHandler(async (req, res) => {
  const { style } = req.params;

  const products = await Product.find({
    "productdetails.garmentStyle": { $regex: `^${style}$`, $options: "i" },
  })
    .select("productdetails.color productdetails.garmentStyle images")
    .lean();

  if (products.length === 0) {
    return res.json([]);
  }

  const map = {};
  products.forEach((p) => {
    const color = p.productdetails?.color;
    if (!color) return;
    const slug = slugify(color);
    if (!map[slug]) {
      map[slug] = {
        slug,
        name: color,
        hex: hexForColor(color),
        image: p.images?.[0] || null,
      };
    }
  });

  res.json(Object.values(map));
});

// @desc  Get the real product matching a style + color, so the
//        Customize canvas can show real photography (instead of just
//        a drawn silhouette) and saved customizations can link to a
//        real, sellable Product/variant.
// @route GET /api/customizer/styles/:style/colors/:colorSlug
// @access Public
export const getCustomizerProduct = asyncHandler(async (req, res) => {
  const { style, colorSlug } = req.params;

  const products = await Product.find({
    "productdetails.garmentStyle": { $regex: `^${style}$`, $options: "i" },
  }).lean();

  const match = products.find(
    (p) => slugify(p.productdetails?.color || "") === colorSlug,
  );

  if (!match) {
    res.status(404);
    throw new Error("No product found for this pattern/color combination");
  }

  res.json({
    productId: match._id,
    style,
    color: match.productdetails.color,
    colorSlug,
    hex: hexForColor(match.productdetails.color),
    images: match.images || [],
    SKU: match.SKU,
    price: match.price,
  });
});