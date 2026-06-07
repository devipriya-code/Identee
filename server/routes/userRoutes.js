import express from "express";
const router = express.Router();
import {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserByID,
  updateUser,
  toggleFavorite,
  getFavorites,
  sendOtpToEmail,
  verifyOtp,
  PasswordResetOtp,
  resetPasswordWithOtp,
   deleteProfilePicture,
} from "../controlers/userControler.js";
import { uploadProfileImage } from "../multer/multer.js";
import { adminOrSeller,adminOnly, protect } from "../middleware/authMiddleware.js";

router.route("/").post(registerUser).get(protect, adminOrSeller, getUsers);
router.route("/sendOtp").post(sendOtpToEmail);
router.route("/verifyOtp").post(verifyOtp);
router.post("/forgotPassword", PasswordResetOtp);
router.post("/resetPassword", resetPasswordWithOtp);

router.post("/login", authUser);
router.route("/favorites/:id").post(protect, toggleFavorite);
router.route("/getfavorites").get(protect, getFavorites);

router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(
    protect,
    uploadProfileImage,
    updateUserProfile
  );

router.delete("/profile/picture", protect, deleteProfilePicture);

router
  .route("/:id")
  .delete(protect, adminOnly, deleteUser)
  .get(protect, adminOnly, getUserByID)
  .put(protect, adminOnly, updateUser);

export default router;
