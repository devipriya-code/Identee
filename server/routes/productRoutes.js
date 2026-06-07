import express from "express";
const router = express.Router();
import zipUpload from "../multer/zipUpload.js";

import {
  getProducts,
  getCategories,
  deleteProduct,
  createProduct,
  updateProduct,
  uploadProducts,
  addToCart,
  getCart,
  deleteCartItem,
  getProductById,
  approveReview,
  getPendingReviews,
  deleteReviewById,
  getProductBySku,
  updateGroupCommonFields,
  addVariantToGroup,
  updateProductGroup,
  getProductFullById,
  getProductsByGroupId,
  markReviewHelpful,
  markReviewNotHelpful,
  getProductGroup,
  updateVariant,
  createProductReview,
  unapproveReview,
  getAllReviews,
} from "../controlers/productControler.js";

import {
  uploadProductFiles,
  uploadMultipleImages,
  uploadReviewImages,
} from "../multer/multer.js";
import { protect, adminOrSeller } from "../middleware/authMiddleware.js";
import optionalAuth from "../middleware/optionalAuthMiddleware.js";

// ============================================================
// ✅ RULE: All fixed-path routes MUST come before /:id routes
// ============================================================

// ── 1. SKU lookup ──
router.get("/sku/:sku", optionalAuth, getProductBySku);

// ── 2. Review routes (static paths) ──
router.get("/reviews/pending", protect, adminOrSeller, getPendingReviews);
router.get("/reviews/all", protect, adminOrSeller, getAllReviews);
router.delete("/reviews/:reviewId", protect, adminOrSeller, deleteReviewById);

// ── 3. Cart ──
router.get("/getcart", protect, getCart);

// ── 4. Create / Upload ──
router.post(
  "/create",
  protect,
  adminOrSeller,
  uploadProductFiles,
  createProduct,
);
router.post(
  "/upload",
  protect,
  adminOrSeller,
  zipUpload.single("file"),
  uploadProducts,
);
router.get("/categories", optionalAuth, getCategories);
// ── 5. Group routes (all fixed, must be before /:id) ──
// ⚠️  /group/comman/:groupId must be before /group/:groupId
// ⚠️  /group/variant/:id   must be before /group/:groupId
router.get("/group/comman/:groupId", protect, adminOrSeller, getProductGroup);
router.put(
  "/group/variant/:id",
  protect,
  adminOrSeller,
  uploadMultipleImages,
  updateVariant,
);
router.get("/group/:groupId", optionalAuth, getProductsByGroupId);
router.put(
  "/group/:groupId/common",
  protect,
  adminOrSeller,
  uploadProductFiles,
  updateGroupCommonFields,
);
router.post(
  "/group/:groupId/variant",
  protect,
  adminOrSeller,
  uploadMultipleImages,
  addVariantToGroup,
);
router.put(
  "/group/:groupId/variant",
  protect,
  adminOrSeller,
  updateProductGroup,
);

// ── 6. Root list ──
router.get("/", optionalAuth, getProducts);

// ============================================================
// ✅ Wildcard /:id routes — ALWAYS LAST
// ============================================================

router.get("/:id/full", optionalAuth, getProductFullById);
router.post("/:id/addtocart", protect, addToCart);
router.delete("/:cartItemId/deletecart", protect, deleteCartItem);
router.post("/:id/reviews", protect, uploadReviewImages, createProductReview);
router.put(
  "/:id/reviews/:reviewId/approve",
  protect,
  adminOrSeller,
  approveReview,
);
router.put(
  "/:id/reviews/:reviewId/unapprove",
  protect,
  adminOrSeller,
  unapproveReview,
);
router.put("/:productId/reviews/:reviewId/helpful", protect, markReviewHelpful);
router.put(
  "/:productId/reviews/:reviewId/not-helpful",
  protect,
  markReviewNotHelpful,
);

router
  .route("/:id")
  .get(optionalAuth, getProductById)
  .delete(protect, adminOrSeller, deleteProduct)
  .put(protect, adminOrSeller, uploadProductFiles, updateProduct);

export default router;
