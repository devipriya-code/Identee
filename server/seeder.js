import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/userModel.js"; // adjust path if needed

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

const seedAdmin = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const adminExists = await User.findOne({
      email: email,
    });

    if (adminExists) {
      console.log("Admin already exists");
      process.exit();
    }

    // Create Admin
    const admin = new User({
      name: "Admin",
      email: email,
      password: password, // auto hashed by pre-save hook
      isAdmin: true,
      isSeller: false,
      isDelivery: false,
    });

    await admin.save();

    console.log("Admin account created successfully");
    process.exit();
  } catch (error) {
    console.error("Seeder Error:", error.message);
    process.exit(1);
  }
};

seedAdmin();
