import express from "express";
import {
  upsertCategoryBanner,
  getCategoryBanners,
  deleteCategoryBanner,
  getCategoryShowcase,
} from "../controlers/categoryBannerController.js";
import { uploadSingleImage } from "../multer/multer.js";
import { protect, adminOrSeller } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/showcase", getCategoryShowcase); // public, for Home page
router.get("/", protect, adminOrSeller, getCategoryBanners);
router.post("/", protect, adminOrSeller, uploadSingleImage, upsertCategoryBanner);
router.delete("/:category", protect, adminOrSeller, deleteCategoryBanner);

export default router;