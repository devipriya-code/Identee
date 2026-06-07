import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import RegisterEmailOtp from "../utils/registerEmailOtp.js";
import ResetEmailOtp from "../utils/resetEmailOtp.js";
import Subscription from "../models/subscriptionModel.js";
import Order from "../models/orderModel.js";
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

  const user = await User.findOne({ email });

  if (!user || user.otp !== otp || user.expiresAt < new Date()) {
    res.status(400);
    throw new Error("Invalid or expired OTP");
  }

  const userExists = await User.findOne({
    email,
    name: { $ne: "temp" }, // don't count the temp user
  });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  user.name = name;
  user.password = password;
  user.otp = undefined;
  user.expiresAt = undefined;

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
    user.otp = otp;
    user.expiresAt = expiresAt;
    // if (user) {
    //   user.otp = otp;
    //   user.expiresAt = expiresAt;
    //   await user.save({ validateBeforeSave: false });
    // } else {
    //   user = new User({
    //     name: "temp",
    //     email,
    //     password: "temp1234",
    //     otp,
    //     expiresAt,
    //     addresses: [], // ✅ KEEP EMPTY ARRAY
    //   });
    //   await user.save({ validateBeforeSave: false });
    // }

    await user.save({ validateBeforeSave: false });
  } else {
    user = new User({
      name: "temp",
      email,
      password: "temp1234",
      otp,
      addresses: [],
      expiresAt,
      // address: {
      //   phoneNumber: phone, // ✅ STORE PHONE
      // },
    });
    await user.save({ validateBeforeSave: false });
  }

  // try {
  await RegisterEmailOtp({
    email,
    status: "OTP Verification",
    orderId: `OTP-${otp}`,
    html: `<p>Your OTP for verification is <strong>${otp}</strong>. It will expire in 10 minutes.</p>`,
  });
  // } catch (error) {
  //   console.error("Email OTP failed:", error.message);
  //   return res.status(500).json({ message: "Failed to send OTP email" });
  // }

  res.status(200).json({ message: "OTP sent successfully" });
});

// @route POST /api/users/verify-otp
// @desc Verify OTP for email
// @access Public
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  console.log("Incoming verify request:", req.body);

  const user = await User.findOne({ email }).select("+otp +expiresAt");
  console.log("Found user:", user);

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  console.log("Stored OTP:", user.otp, "Received OTP:", otp);

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
    console.log("OTP mismatch:", { stored: user.otp, received: otp });
    return res.status(400).json({ message: "Invalid OTP" });
  }

  // ✅ OTP verified successfully
  user.otp = undefined;
  user.expiresAt = undefined;
  await user.save();

  console.log("OTP verified successfully for:", email);

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
  await user.save();

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
  const { email, otp, password } = req.body; // 🛑 Check for empty values, which would fail Mongoose's 'required: true'

  if (!email || !otp || !password || password.trim() === "") {
    res.status(400);
    throw new Error("Email, OTP, and a non-empty new password are required");
  }

  const user = await User.findOne({ email });

  if (!user || user.otp !== otp || user.expiresAt < new Date()) {
    res.status(400);
    throw new Error("Invalid or expired OTP");
  }

  user.password = password; // This will now be the non-empty string
  user.otp = undefined;
  user.expiresAt = undefined;

  await user.save(); // This should now successfully hash and save the new password

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
    user.isAdmin = req.body.isAdmin;
    user.isDelivery = req.body.isDelivery;
    user.isSeller = req.body.isSeller;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      isDelivery: updatedUser.isDelivery,
      isSeller: updatedUser.isSeller,
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
};
