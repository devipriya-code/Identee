import { async } from "regenerator-runtime";
import Product from "../models/productModel.js";
import OfferBanner from "../models/offerBannerModel.js";

import asyncHandler from "express-async-handler";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";

// @desc Create add banners
// @route POST /api/banners
// @access Private / Admin

const addBanner = asyncHandler(async (req, res) => {
  const { title, subtitle, productId, gender } = req.body;

  // ✅ 1. Basic validation
  if (!req.file || !title || !subtitle || !productId || !gender) {
    return res.status(400).json({
      message: "All fields are required.",
    });
  }

  // ✅ 2. Trim productId (FIX for ObjectId cast error)
  const trimmedProductId = productId.trim();

  // ✅ 3. Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(trimmedProductId)) {
    return res.status(400).json({
      message: "Invalid Product ID format.",
    });
  }

  // ✅ 4. Find product safely
  const product = await Product.findById(trimmedProductId);

  if (!product) {
    return res.status(404).json({
      message: "Product not found.",
    });
  }

  // ✅ 5. Correct banner limit check (MAX = 3)
  if (product.banners.length >= 3) {
    return res.status(400).json({
      message: "Maximum of 3 banners allowed per product.",
    });
  }

  // ✅ 6. Create banner object
  const banner = {
    image: `/uploads/banners/images/${req.file.filename}`,
    title: title.trim(),
    subtitle: subtitle.trim(),
    productId: trimmedProductId,
    gender: gender.trim(),
  };

  // ✅ 7. Push banner & save
  product.banners.push(banner);
  await product.save();

  // ✅ 8. Success response
  res.status(201).json({
    message: "Banner added successfully.",
    banner,
  });
});
// @desc deleteBanner
// @route delete /api/banners/:id
// @access Private/admin
const deleteBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 1️⃣ Find product containing this banner
  const product = await Product.findOne({ "banners._id": id });

  if (!product) {
    return res.status(404).json({ message: "Banner not found." });
  }

  // 2️⃣ Find banner object
  const bannerToDelete = product.banners.find((b) => b._id.toString() === id);

  // 3️⃣ Delete image file from server
  if (bannerToDelete?.image) {
    // If image is like: /uploads/banners/images/xxx.jpg
    const relativePath = bannerToDelete.image.replace(/^https?:\/\/[^/]+/, "");

    const imagePath = path.join(process.cwd(), relativePath);

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  // 4️⃣ Remove banner from DB
  product.banners = product.banners.filter(
    (banner) => banner._id.toString() !== id,
  );

  await product.save();

  res.status(200).json({ message: "Banner deleted successfully." });
});

// @desc getBanners
// @route get /api/banners
// @access Private
const getBanners = asyncHandler(async (req, res) => {
  try {
    const { gender } = req.query;
    const productsWithBanners = await Product.find({
      "banners.0": { $exists: true },
    }).select("banners");

    const banners = productsWithBanners.flatMap((product) =>
      product.banners
        .filter((banner) => banner.image && banner.title) // ← add this
        .map((banner) => ({
          _id: banner._id,
          image: banner.image,
          title: banner.title,
          subtitle: banner.subtitle,
          gender: banner.gender,
          productId: banner.productId,
        })),
    );

    res.status(200).json(banners);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch banners.", error: error.message });
  }
});

// @desc Create addvideobanners
// @route POST /api/videobanners
// @access Private / Admin
const addvideobanner = asyncHandler(async (req, res) => {
  console.log("🎥 Received Upload Request");
  console.log("Request Body:", req.body);
  console.log("Uploaded File:", req.file);

  const { productId } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "No video uploaded." });
  }

  // 🚫 GLOBAL SINGLE VIDEO CHECK
  const existingVideo = await Product.findOne({
    "VideoBanner.0": { $exists: true },
  });

  if (existingVideo) {
    return res.status(400).json({
      message: "Only one video banner is allowed in the entire system.",
    });
  }

  // ✅ Check product exists
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // ✅ Create video banner
  const videoBanner = {
    _id: new mongoose.Types.ObjectId(),
    videoUrl: `/uploads/banners/videos/${req.file.filename}`,
    uploadedAt: new Date(),
  };

  product.VideoBanner.push(videoBanner);
  await product.save();

  console.log("✅ Video Banner Added Successfully:", videoBanner);

  res.status(201).json({
    message: "Video banner added successfully",
    videoBanner,
  });
});
// @desc getvideoBanners
// @route get /api/videobanners
// @access Private
const getvideobanner = asyncHandler(async (req, res) => {
  // ✅ Find product that has a video banner
  const productWithVideo = await Product.findOne(
    { "VideoBanner.0": { $exists: true } },
    { VideoBanner: 1 },
  );

  if (!productWithVideo) {
    return res.json([]); // No video uploaded yet
  }

  res.json(productWithVideo.VideoBanner);
});

// @desc deletevideoBanner
// @route delete /api/videobanners/:id
// @access Private/admin

const deletevideobanner = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // 1️⃣ Find product containing this video
  const product = await Product.findOne({
    "VideoBanner._id": videoId,
  });

  if (!product) {
    return res.status(404).json({ message: "Video not found" });
  }

  // 2️⃣ Find video object
  const video = product.VideoBanner.find((v) => v._id.toString() === videoId);

  if (!video) {
    return res.status(404).json({ message: "Video not found" });
  }

  // 3️⃣ Convert URL → local file path
  // URL: http://localhost:3001/uploads/banners/videos/xxx.mp4
  const relativePath = video.videoUrl.replace(/^https?:\/\/[^/]+/, "");

  const filePath = path.join(process.cwd(), relativePath);

  // 4️⃣ Delete file from server
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Video file delete failed:", err.message);
    }
  });

  // 5️⃣ Remove from DB
  product.VideoBanner = product.VideoBanner.filter(
    (v) => v._id.toString() !== videoId,
  );

  await product.save();

  res.json({ message: "Video banner deleted successfully" });
});

// @desc getallvideoBanners
// @route get /api/allvideobanners
// @access Private
const getUserVideoBanners = asyncHandler(async (req, res) => {
  // Find all products and extract video banners
  const products = await Product.find({}, "VideoBanner");

  // Flatten all video banners into a single array
  const allVideoBanners = products.flatMap((product) => product.VideoBanner);

  res.json(allVideoBanners);
});
export const addOfferBanner = asyncHandler(async (req, res) => {
  const { offerText } = req.body;

  // Check if any active offer already exists
  const existingActive = await OfferBanner.findOne({ isActive: true });

  const banner = await OfferBanner.create({
    offerText,
    isActive: existingActive ? false : true, // ⭐ KEY LOGIC
  });

  res.status(201).json(banner);
});

export const getActiveOfferBanner = asyncHandler(async (req, res) => {
  const banner = await OfferBanner.findOne({ isActive: true });
  res.json(banner);
});

export const getAllOfferBanners = asyncHandler(async (req, res) => {
  const banners = await OfferBanner.find().sort({ createdAt: -1 });
  res.json(banners);
});

export const updateOfferBanner = asyncHandler(async (req, res) => {
  const banner = await OfferBanner.findById(req.params.id);
  if (!banner) {
    res.status(404);
    throw new Error("Offer banner not found");
  }

  banner.offerText = req.body.offerText || banner.offerText;
  banner.isActive = req.body.isActive ?? banner.isActive;

  const updated = await banner.save();
  res.json(updated);
});

export const deleteOfferBanner = asyncHandler(async (req, res) => {
  await OfferBanner.findByIdAndDelete(req.params.id);
  res.json({ message: "Offer banner deleted" });
});
export const activateOfferBanner = asyncHandler(async (req, res) => {
  console.log("Activate Offer ID:", req.params.id);
  const { id } = req.params;

  // Deactivate all offers
  await OfferBanner.updateMany({}, { isActive: false });

  // Activate selected offer
  const banner = await OfferBanner.findByIdAndUpdate(
    id,
    { isActive: true },
    { new: true },
  );

  if (!banner) {
    res.status(404);
    throw new Error("Offer banner not found");
  }

  res.json(banner);
});

export {
  addBanner,
  deleteBanner,
  getBanners,
  addvideobanner,
  getvideobanner,
  deletevideobanner,
  getUserVideoBanners,
  // activateOfferBanner,
};
