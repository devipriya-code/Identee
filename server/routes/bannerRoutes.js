import express from "express";
import {
  getBanners,
  addBanner,
  deleteBanner,
  addvideobanner,
  getvideobanner,
  deletevideobanner,
  getUserVideoBanners,
  addOfferBanner,
  getAllOfferBanners,
  getActiveOfferBanner,
  updateOfferBanner,
  deleteOfferBanner,
  activateOfferBanner,
} from "../controlers/bannerController.js";
import { uploadSingleImage, uploadSingleVideo } from "../multer/multer.js";
import { protect, adminOrSeller } from "../middleware/authMiddleware.js";

const router = express.Router();

// Banner Routes
// router.route("/banner").post(protect, admin, addBanner);
router
  .route("/banner")
  .post(protect, adminOrSeller, uploadSingleImage, addBanner);
router.route("/banners/:id").delete(protect, adminOrSeller, deleteBanner);
router.route("/banners").get(getBanners);
router
  .route("/addvideobanner")
  .post(protect, adminOrSeller, uploadSingleVideo, addvideobanner);
router.route("/getvideobanner").get(getvideobanner);
router
  .route("/deletevideobanner/:videoId")
  .delete(protect, adminOrSeller, deletevideobanner);
router.route("/getuservideobanners").get(getUserVideoBanners);

// OFFER BANNERS
router.post("/offerbanner", protect, adminOrSeller, addOfferBanner);
router.get("/offerbanner", getActiveOfferBanner);
router.get("/offerbanners", protect, adminOrSeller, getAllOfferBanners);
router.put("/offerbanner/:id", protect, adminOrSeller, updateOfferBanner);
router.delete("/offerbanner/:id", protect, adminOrSeller, deleteOfferBanner);
// ACTIVATE OFFER (Radio button)
router.put(
  "/offerbanner/activate/:id",
  protect,
  adminOrSeller,
  activateOfferBanner,
);
export default router;
