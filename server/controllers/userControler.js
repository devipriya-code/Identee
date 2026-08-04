import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import RegisterEmailOtp from "../utils/registerEmailOtp.js";
import ResetEmailOtp from "../utils/resetEmailOtp.js";
import Subscription from "../models/subscriptionModel.js";
import Order from "../models/orderModel.js";
import ShippingCost from "../models/shippingcostModel.js";
import path from "path";
import fs from "fs";
// @desc Auth user & get token
// @route POST /api/users/login
// @access Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      subscription: user.subscription,
      isSeller: user.isSeller,
      isDelivery: user.isDelivery,

      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc Register a new user
// @route POST /api/users
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, otp } = req.body;

  const user = await User.findOne({ email }).select("+otp +expiresAt");

  if (!user) {
    res.status(400);
    throw new Error("User not found. Please send OTP first.");
  }

  if (!user.isEmailVerified) {
    res.status(400);
    throw new Error("Email not verified. Please verify OTP first.");
  }

  // Defensive re-check: same otp that was verified, and not expired since.
  if (user.otp !== otp) {
    res.status(400);
    throw new Error("Invalid OTP");
  }

  const isExpired = user.expiresAt && user.expiresAt < new Date();
  if (isExpired) {
    res.status(400);
    throw new Error("OTP expired. Please request a new one.");
  }

  const tempUserCheck = await User.findOne({
    email,
    name: { $ne: "temp" },
  });

  if (tempUserCheck) {
    res.status(400);
    throw new Error("User already exists");
  }

  user.name = name;
  user.password = password;
  user.otp = undefined;
  user.expiresAt = undefined;
  user.isEmailVerified = true; // keep true; this IS the verified account now

  await user.save();

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    isDelivery: user.isDelivery,
    isSeller: user.isSeller,
    token: generateToken(user._id),
  });
});

// @desc SEND OTP
// @route POST /api/users/otp
// @access Public
const sendOtpToEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log("OTP:", otp);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  let user = await User.findOne({ email });

  if (user) {
    // Update existing user with new OTP
    user.otp = otp;
    user.expiresAt = expiresAt;
    user.isEmailVerified = false; // Reset verification status when new OTP is sent
    await user.save({ validateBeforeSave: false });
  } else {
    // Create new temp user
    user = new User({
      name: "temp",
      email,
      password: "temp1234",
      otp,
      expiresAt,
      isEmailVerified: false,
      addresses: [],
    });
    await user.save({ validateBeforeSave: false });
  }

  // Send email
  await RegisterEmailOtp({
    email,
    status: "OTP Verification",
    orderId: `OTP-${otp}`,
    html: `<p>Your OTP for verification is <strong>${otp}</strong>. It will expire in 10 minutes.</p>`,
  });

  res.status(200).json({ message: "OTP sent successfully" });
});

// @route POST /api/users/verify-otp
// @desc Verify OTP for email
// @access Public
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email }).select("+otp +expiresAt");

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  if (!user.otp) {
    return res
      .status(400)
      .json({ message: "No OTP found. Please request again." });
  }

  const isExpired = user.expiresAt && user.expiresAt < new Date();
  if (isExpired) {
    return res
      .status(400)
      .json({ message: "OTP expired. Please request again." });
  }

  if (user.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  // ✅ Mark verified, but DO NOT clear user.otp here.
  // registerUser still needs to confirm this same otp later.
  user.isEmailVerified = true;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ message: "OTP verified successfully", success: true });
});
// @desc Send OTP to email for password reset
// @route POST /api/users/forgot-password
// @access Public
const PasswordResetOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  user.otp = otp;
  user.expiresAt = expiresAt;
  user.isPasswordResetVerified = false;
  await user.save({ validateBeforeSave: false });

  await ResetEmailOtp({
    email,
    status: "Password Reset OTP",
    orderId: `RESET-${otp}`,
    html: `<p>Your OTP for password reset is <strong>${otp}</strong>. It will expire in 10 minutes.</p>`,
    otp,
  });

  res.status(200).json({ message: "OTP sent for password reset" });
});

// @desc Reset password using OTP
// @route POST /api/users/reset-password
// @access Public
// CONTROLLER: api/users/resetPassword
const resetPasswordWithOtp = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;

  if (!email || !otp || !password || password.trim() === "") {
    res.status(400);
    throw new Error("Email, OTP, and a non-empty new password are required");
  }

  const user = await User.findOne({ email }).select("+otp +expiresAt");

  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }

  if (user.otp !== otp.toString()) {
    res.status(400);
    throw new Error("Invalid OTP");
  }

  const isExpired = user.expiresAt && user.expiresAt < new Date();
  if (isExpired) {
    res.status(400);
    throw new Error("OTP expired");
  }

  user.password = password;
  user.otp = undefined;
  user.expiresAt = undefined;
  user.isPasswordResetVerified = false;

  await user.save();

  res.status(200).json({ message: "Password reset successfully" });
});
// @desc Delete user's profile picture
// @route DELETE /api/users/profile-picture
// @access Private
const deleteProfilePicture = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.profilePicture && !user.profilePicture.includes("default-profile")) {
    const imagePath = path.join(process.cwd(), user.profilePicture);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  user.profilePicture = "/images/default-profile.png";
  await user.save();

  res.status(200).json({ message: "Profile picture deleted" });
});

// ROUTER:
// router.post("/resetPassword", resetPasswordWithOtp); // No change needed here
// @desc Get user profile
// @route GET /api/users/profile
// @access Private
// const getUserProfile = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user._id);

//   if (user) {
//     res.json({
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       lastName: user.lastName,
//       gender: user.gender,
//       dateOfBirth: user.dateOfBirth,
//       isAdmin: user.isAdmin,
//       profilePicture: user.profilePicture,
//       isDelivery: user.isDelivery,
//       addresses: user.addresses,
//       subscription: user.subscription,
//       isSubscribed: user.isSubscribed,
//     });
//   } else {
//     res.status(404);
//     throw new Error("User not found");
//   }
// });

// @desc Get user profile with full subscription details
// @route GET /api/users/profile
// @access Private
const getUserProfile = asyncHandler(async (req, res) => {
  // Find user and populate subscription details
  const user = await User.findById(req.user._id)
    .populate(
      "subscription.subscriptionId",
      "title description offers price discountPercent startDate endDate",
    )
    .select("-password");

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      lastName: user.lastName,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      isAdmin: user.isAdmin,
      profilePicture: user.profilePicture,
      isDelivery: user.isDelivery,
      addresses: user.addresses,
      subscription: user.subscription
        ? {
            subscriptionId: user.subscription.subscriptionId?._id,
            title: user.subscription.subscriptionId?.title,
            description: user.subscription.subscriptionId?.description,
            offers: user.subscription.subscriptionId?.offers,
            planName: user.subscription.planName,
            price: user.subscription.price,
            discountPercent: user.subscription.discountPercent,
            isActive: user.subscription.isActive,
            startDate: user.subscription.startDate,
            endDate: user.subscription.endDate,
          }
        : null,
      isSubscribed: user.isSubscribed,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc Update user profile
// @route PUT /api/users/profile
// @access Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Store old profile picture path BEFORE any changes
  const oldProfilePicture = user.profilePicture;

  /* ---------- BASIC FIELDS ---------- */
  user.name = req.body.name ?? user.name;
  user.email = req.body.email ?? user.email;
  user.lastName = req.body.lastName ?? user.lastName;
  user.gender = req.body.gender ?? user.gender;
  user.dateOfBirth = req.body.dateOfBirth ?? user.dateOfBirth;

  if (req.body.password?.trim()) {
    user.password = req.body.password;
  }

  /* ---------- ADDRESSES ---------- */
  if (req.body.addresses) {
    let addresses =
      typeof req.body.addresses === "string"
        ? JSON.parse(req.body.addresses)
        : req.body.addresses;

    addresses = addresses.map((addr) => ({
      ...addr,
      pin: addr.pin ? Number(addr.pin) : null,
      phoneNumber: addr.phoneNumber ? Number(addr.phoneNumber) : null,
    }));

    if (!addresses.some((a) => a.isDefault) && addresses.length > 0) {
      addresses[0].isDefault = true;
    }

    // ✅ NEW — validate every address's state against the live ShippingCost
    // rules before saving. The frontend Account page now uses a <select>
    // fed from this same collection, so normal usage can't produce a bad
    // state string — but a direct API call still could, and a bad state
    // saved here is exactly what silently broke checkout later (the
    // "Shipping not available for state: X" error, or the address
    // slipping through with an unmatched state entirely). Reject up front
    // instead of saving addresses that can never actually be delivered to.
    const shippingSettings = await ShippingCost.findOne();
    const validStates = (shippingSettings?.shippingRules || []).map((r) =>
      r.state.trim().toLowerCase(),
    );

    if (validStates.length > 0) {
      const invalidAddress = addresses.find(
        (addr) =>
          !addr.state || !validStates.includes(addr.state.trim().toLowerCase()),
      );
      if (invalidAddress) {
        res.status(400);
        throw new Error(
          `"${invalidAddress.state || "(empty)"}" is not a state we currently deliver to. Please select a valid state.`,
        );
      }
    }
    // If no shipping rules are configured at all yet, skip this check —
    // there's nothing to validate against, and blocking address saves
    // entirely in that case would be worse than letting them through.

    user.addresses = addresses;
  }

  /* ---------- PROFILE IMAGE ---------- */
  if (req.file) {
    // Set new profile picture path
    user.profilePicture = `/uploads/profiles/${req.file.filename}`;
  }

  // Save the updated user FIRST
  const updatedUser = await user.save();

  /* ---------- DELETE OLD IMAGE AFTER SUCCESSFUL SAVE ---------- */
  // Only delete old image if:
  // 1. A new file was uploaded
  // 2. Old picture exists and is not default
  // 3. Old picture is different from new picture
  if (
    req.file &&
    oldProfilePicture &&
    !oldProfilePicture.includes("default-profile") &&
    oldProfilePicture !== updatedUser.profilePicture
  ) {
    try {
      const oldPath = path.join(process.cwd(), oldProfilePicture);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    } catch (error) {
      // Log error but don't fail the request
      console.error("Failed to delete old profile picture:", error);
    }
  }

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    profilePicture: updatedUser.profilePicture,
    addresses: updatedUser.addresses,
    isAdmin: updatedUser.isAdmin,
    isSeller: updatedUser.isSeller,
    isDelivery: updatedUser.isDelivery,
    token: generateToken(updatedUser._id),
  });
});

// @desc Update user user
// @route PUT /api/users/:id
// @access Private/Admin

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isAdmin = req.body.isAdmin ?? user.isAdmin;
    user.isDelivery = req.body.isDelivery ?? user.isDelivery;
    user.isSeller = req.body.isSeller ?? user.isSeller;
    user.hideUserManagement =
      req.body.hideUserManagement ?? user.hideUserManagement;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      isDelivery: updatedUser.isDelivery,
      isSeller: updatedUser.isSeller,
      hideUserManagement: updatedUser.hideUserManagement,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc Get All users
// @route GET /api/users
// @access Private/admin
// const getUsers = asyncHandler(async (req, res) => {
//   const users = await User.find({}).populate(
//     "orderHistory",
//     "totalPrice isPaid createdAt _id"
//   );
//   res.json(users);
// });

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password");

  const usersWithOrderCount = await Promise.all(
    users.map(async (user) => {
      const orderCount = await Order.countDocuments({ user: user._id });

      return {
        ...user.toObject(),
        orderCount,
      };
    }),
  );

  res.json(usersWithOrderCount);
});

// @desc Get user by ID
// @route GET /api/users/:id
// @access Private/admin
const getUserByID = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (user) {
    res.json(user);
    console.log(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});
// @desc Delete User
// @route DELETE /api/users/:id
// @access Private/admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    await user.deleteOne({ _id: req.params.id });
    res.json({ message: "User removed" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});
// @desc Add or Remove from Favorites
// @route POST /api/products/favorites/:id
// @access Private
const toggleFavorite = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const product = await Product.findById(req.params.id);
  const user = await User.findById(userId).populate("favorites");

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const isFavorite = user.favorites.some(
    (item) => item._id.toString() === product._id.toString(),
  );

  if (isFavorite) {
    user.favorites = user.favorites.filter(
      (item) => item._id.toString() !== product._id.toString(),
    );
    await user.save();
    res
      .status(200)
      .json({ message: "Removed from favorites", favorites: user.favorites });
  } else {
    user.favorites.push(product);
    await user.save();
    res
      .status(200)
      .json({ message: "Added to favorites", favorites: user.favorites });
  }
});

// @desc Get user favorites
// @route GET /api/products/favorites
// @access Private
const getFavorites = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Check if the user exists and populate favorites
  const user = await User.findById(userId)
    .select("favorites")
    .populate("favorites");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json(user.favorites);
});
// @desc Get logged-in user's cart items (populated)
// @route GET /api/users/cart
// @access Private
const getCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    "cartItems.product",
    "brandname images price",
  );
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json(user.cartItems);
});

// @desc Activate user subscription after payment
// @route POST /api/users/subscribe
// @access Private

export {
  authUser,
  registerUser,
  sendOtpToEmail,
  verifyOtp,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserByID,
  updateUser,
  toggleFavorite,
  getFavorites,
  PasswordResetOtp,
  deleteProfilePicture,
  resetPasswordWithOtp,
  getCart,
};
