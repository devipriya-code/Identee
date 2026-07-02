import asyncHandler from "express-async-handler";
import path from "path";
import fs from "fs";
import CategoryBanner from "../models/categoryBannerModel.js";
import Product from "../models/productModel.js";

const CATEGORIES = ["T-Shirts", "Hoodies", "Polo", "Sweatshirt", "Oversized"];

// @desc Add or replace a category's banner image
// @route POST /api/categorybanner
// @access Private/Admin
export const upsertCategoryBanner = asyncHandler(async (req, res) => {
  const { category } = req.body;

  if (!req.file || !category) {
    return res.status(400).json({ message: "Category and image are required." });
  }
  if (!CATEGORIES.includes(category)) {
    return res.status(400).json({ message: "Invalid category." });
  }

  const imagePath = `/uploads/banners/images/${req.file.filename}`;
  const existing = await CategoryBanner.findOne({ category });

  // remove old file when replacing
  if (existing?.image) {
    const oldPath = path.join(process.cwd(), existing.image);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  const banner = await CategoryBanner.findOneAndUpdate(
    { category },
    { image: imagePath },
    { new: true, upsert: true }
  );

  res.status(200).json(banner);
});

// @desc Get all category banners (admin list)
// @route GET /api/categorybanner
// @access Private/Admin
export const getCategoryBanners = asyncHandler(async (req, res) => {
  const banners = await CategoryBanner.find();
  res.json(banners);
});

// @desc Delete a category's banner
// @route DELETE /api/categorybanner/:category
// @access Private/Admin
export const deleteCategoryBanner = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const banner = await CategoryBanner.findOne({ category });
  if (!banner) {
    res.status(404);
    throw new Error("Category banner not found");
  }
  if (banner.image) {
    const imgPath = path.join(process.cwd(), banner.image);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  }
  await banner.deleteOne();
  res.json({ message: "Category banner deleted" });
});

// @desc Banner + 4 featured products per category — for Home page
// @route GET /api/categorybanner/showcase
// @access Public
export const getCategoryShowcase = asyncHandler(async (req, res) => {
  const banners = await CategoryBanner.find();
  const bannerMap = {};
  banners.forEach((b) => (bannerMap[b.category] = b.image));

  const showcase = await Promise.all(
    CATEGORIES.map(async (category) => {
      const products = await Product.find({
        isFeatured: true,
        "productdetails.garmentStyle": category,
      })
        .sort({ createdAt: -1 })
        .limit(4);

      return { category, image: bannerMap[category] || null, products };
    })
  );

  res.json(showcase);
});