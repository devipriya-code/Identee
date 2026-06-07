import asyncHandler from "express-async-handler";
import Offer from "../models/OfferModel.js";

const getOfferByCouponCode = asyncHandler(async (req, res) => {
  const { couponCode } = req.params;
  const userId = req.user._id; // 🔥 important

  const offer = await Offer.findOne({
    code: couponCode.toUpperCase(),
  });

  if (!offer) {
    res.status(404);
    throw new Error("Invalid coupon code");
  }

  const currentDate = new Date();

  // Date validation
  if (currentDate < offer.startDate || currentDate > offer.expiryDate) {
    res.status(400);
    throw new Error("Coupon expired or not active");
  }

  // Max usage validation
  if (offer.maxUsage > 0 && offer.usedCount >= offer.maxUsage) {
    res.status(400);
    throw new Error("Coupon usage limit reached");
  }

  // Per-user validation
  if (offer.usedBy.includes(userId)) {
    res.status(400);
    throw new Error("You already used this coupon");
  }

  res.status(200).json({
    code: offer.code,
    offerPercentage: offer.offerPercentage,
  });
});

const createOffer = asyncHandler(async (req, res) => {
  const { code, offerPercentage, startDate, expiryDate, maxUsage } = req.body;

  const existingOffer = await Offer.findOne({
    code: code.toUpperCase(),
  });

  if (existingOffer) {
    res.status(400);
    throw new Error("Coupon code already exists");
  }

  const offer = await Offer.create({
    code: code.toUpperCase(),
    offerPercentage,
    startDate,
    expiryDate,
    maxUsage: maxUsage || 0,
  });

  res.status(201).json(offer);
});

const updateOffer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { code, offerPercentage, startDate, expiryDate, maxUsage } = req.body;

  const offer = await Offer.findById(id);

  if (!offer) {
    res.status(404);
    throw new Error("Offer not found");
  }

  if (code) offer.code = code.toUpperCase();
  if (offerPercentage !== undefined) offer.offerPercentage = offerPercentage;
  if (startDate) offer.startDate = startDate;
  if (expiryDate) offer.expiryDate = expiryDate;
  if (maxUsage !== undefined) offer.maxUsage = maxUsage;

  const updatedOffer = await offer.save();
  res.status(200).json(updatedOffer);
});

const getAllOffers = asyncHandler(async (req, res) => {
  const offers = await Offer.find().sort({ createdAt: -1 });

  res.status(200).json(offers);
});
const deleteOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);

  if (!offer) {
    res.status(404);
    throw new Error("Offer not found");
  }

  await offer.deleteOne();

  res.json({
    message: "Offer deleted successfully",
  });
});

export {
  getOfferByCouponCode,
  createOffer,
  updateOffer,
  getAllOffers,
  deleteOffer,
};
