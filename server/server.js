import dotenv from "dotenv";
dotenv.config();
import path from "path";
import express from "express";
import connectDB from "./config/db.js";
import morgan from "morgan";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import subscriptionsRoutes from "./routes/subscriptionRoutes.js";
import offerRoutes from "./routes/offerRoutes.js";
import shippingRoutes from "./routes/shippingRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import enquiryRoutes from "./routes/Enquiryroutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import cors from "cors";
import "./utils/subscriptionCron.js";
import "./utils/razorpayInstance.js";

connectDB();
const app = express();
app.use(
  cors({
    origin: [
      "https://new-vyavarclient-3f1f.vercel.app",
      "http://localhost:3000",
    ], // Adjust for your frontend's URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
// https://vyavar.vercel.app

app.options("*", cors());
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ limit: "500mb", extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.get("/", (req, res) => {
  res.send("Backend is running!");
});
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/subscriptions", subscriptionsRoutes);
// app.use("/api/users", subscriptionPaymentRoutes);
// app.use("/api/transactions", transactionRoutes);
app.use("/api", transactionRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/enquiry", enquiryRoutes);
app.use("/api/shipping", shippingRoutes);
app.use("/api/contact", contactRoutes);

app.get("/api/config/paypal", (req, res) =>
  res.send(process.env.PAYPAL_CLIENT_ID),
);
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // ← always the folder server.js is IN
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// if (process.env.NODE_ENV === "production") {
// app.use(express.static(path.join(__dirname, "/frontend/build")));
// //   app.get("*", (req, res) =>
// //     res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"))
// //   );
// // } else {
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "frontend/build", "index.html"));
// });
// }
app.use(notFound);
app.use(errorHandler);
const PORT = process.env.PORT;
app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`),
);

//runingin
// In server.js — add AFTER all routes
app.use((err, req, res, next) => {
  console.error("💥 SERVER ERROR:", err.stack); // ← shows exact line
  res.status(500).json({
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});
