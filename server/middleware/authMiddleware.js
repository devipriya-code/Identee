import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

const protect = asyncHandler(async (req, res, next) => {
  console.log("Token header:", req.headers.authorization);

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

const adminOrSeller = (req, res, next) => {
  if (req.user && (req.user.isAdmin || req.user.isSeller)) {
    next();
  } else {
    res.status(403);
    throw new Error("Not authorized as Admin or Seller");
  }
};
const isDelivery = (req, res, next) => {
  if (req.user && req.user.isDelivery) {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized as a delivery person");
  }
};
const adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin && !req.user.isSeller) {
    next();
  } else {
    res.status(403);
    throw new Error("Not authorized as Admin without seller privileges");
  }
};

export { protect, adminOrSeller, isDelivery, adminOnly };
