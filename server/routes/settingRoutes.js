import express from "express";
const router = express.Router();

import {
  getPublicSettings,
  getSettings,
  updateSettingsBulk,
  updateSetting,
  uploadSettingAsset,
} from "../controllers/settingController.js";
import {
  protect,
  adminOrSeller,
  adminOnly,
} from "../middleware/authMiddleware.js";
import { uploadSettingsAsset } from "../multer/multer.js";

// Public — no auth. Storefront reads store name/logo/socials/currency etc.
router.get("/public", getPublicSettings);

// Admin/seller can VIEW settings; only true admins (adminOnly) can WRITE.
// This mirrors your existing adminOnly semantics (admin, not also
// seller) rather than inventing a role system your User model doesn't have.
router.get("/", protect, adminOrSeller, getSettings);
router.put("/bulk", protect, adminOnly, updateSettingsBulk);
router.put(
  "/upload-asset",
  protect,
  adminOnly,
  uploadSettingsAsset,
  uploadSettingAsset,
);
router.put("/:key", protect, adminOnly, updateSetting);

export default router;
