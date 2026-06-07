import express from "express";
import { getOfferByCouponCode,createOffer, updateOffer,getAllOffers,deleteOffer } from "../controlers/offerController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/:couponCode").get(protect,getOfferByCouponCode);
router.route("/").post(protect, adminOnly, createOffer);
router.route("/:id").put(protect, adminOnly, updateOffer);
router.route("/").get(protect, adminOnly, getAllOffers);
router.route("/:id").delete(protect, adminOnly, deleteOffer);

export default router;
