import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/productModel.js";
import User from "./models/userModel.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

const seedProducts = async () => {
  try {
    await connectDB();

    // Get admin user
    const admin = await User.findOne({ isAdmin: true });

    if (!admin) {
      console.log("Admin user not found");
      process.exit();
    }

    // Remove old products (optional)
    await Product.deleteMany();

    const products = [
      {
        user: admin._id,
        brandname: "Nike",
        SKU: "NIKE-TSHIRT-001",
        productGroupId: "GRP001",
        description: "Premium cotton oversized t-shirt",
        price: 999,
        oldPrice: 1299,
        discount: 20,

        images: [
          "https://via.placeholder.com/300",
          "https://via.placeholder.com/300",
          "https://via.placeholder.com/300"
        ],

        washCare: [
          "Machine wash",
          "Do not bleach",
          "Dry in shade",
        ],

        productdetails: {
          gender: "Men",
          category: "Clothing",
          subcategory: "T-Shirts",
          type: "Oversized",
          ageRange: "Adult",
          color: "Black",
          fabric: "Cotton",
          sizes: ["S", "M", "L", "XL"],

          stockBySize: [
            { size: "S", stock: 10 },
            { size: "M", stock: 15 },
            { size: "L", stock: 8 },
            { size: "XL", stock: 5 },
          ],
        },

        shippingDetails: {
          weight: 0.5,
          dimensions: {
            length: 30,
            width: 25,
            height: 3,
          },
          originAddress: {
            street1: "Anna Nagar",
            city: "Chennai",
            state: "Tamil Nadu",
            zip: 600040,
            country: "India",
          },
        },

        isFeatured: true,
      },

      {
        user: admin._id,
        brandname: "Adidas",
        SKU: "ADIDAS-HOODIE-001",
        productGroupId: "GRP002",
        description: "Comfort fit hoodie for winter",
        price: 1999,
        oldPrice: 2499,
        discount: 20,

        images: [
          "https://via.placeholder.com/300",
          "https://via.placeholder.com/300",
          "https://via.placeholder.com/300"
        ],

        washCare: [
          "Hand wash",
          "Do not iron",
        ],

        productdetails: {
          gender: "Men",
          category: "Clothing",
          subcategory: "Hoodies",
          type: "Regular",
          ageRange: "Adult",
          color: "Grey",
          fabric: "Fleece",
          sizes: ["M", "L", "XL"],

          stockBySize: [
            { size: "M", stock: 20 },
            { size: "L", stock: 12 },
            { size: "XL", stock: 7 },
          ],
        },

        shippingDetails: {
          weight: 0.7,
          dimensions: {
            length: 35,
            width: 30,
            height: 5,
          },
          originAddress: {
            street1: "T Nagar",
            city: "Chennai",
            state: "Tamil Nadu",
            zip: 600017,
            country: "India",
          },
        },
      },
    ];

    await Product.insertMany(products);

    console.log("Products Seeded Successfully");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedProducts();