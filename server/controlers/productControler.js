import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import multer from "multer";
import { fileURLToPath } from "url";
import AdmZip from "adm-zip";
import XLSX from "xlsx";
import path from "path";
import Product from "../models/productModel.js";
import ProductGroup from "../models/productgroupModel.js";
import User from "../models/userModel.js";
import reviewnotificatioEmail from "../utils/reviewnotificationEmail.js";
import fs from "fs";
import { applySubscriptionPrice } from "../utils/applySubscriptionPrice.js";

// @desc Fetch all products
// @route GET /api/products
// @access Public
const getProducts = asyncHandler(async (req, res) => {
  const {
    brandname,
    gender,
    offerfilter,
    category,
    subcategory,
    type,
    color,
    fabric,
    sizes,
    from,
    to,
    discount,
    rating,
    sortBy,
    keyword,
  } = req.query;
  const keywordFilter = keyword
    ? {
        $or: [
          { brandname: { $regex: keyword, $options: "i" } }, // Search in brandname
          { "productdetails.category": { $regex: keyword, $options: "i" } }, // Search in category
          { "productdetails.subcategory": { $regex: keyword, $options: "i" } }, // Search in subcategory
          { "productdetails.color": { $regex: keyword, $options: "i" } }, // Search in color
          { "productdetails.fabric": { $regex: keyword, $options: "i" } }, // Search in fabric
          { "productdetails.type": { $regex: keyword, $options: "i" } }, // Search in type
        ],
      }
    : {};
  let filterCriteria = {
    ...keywordFilter,
  };
  if (brandname) filterCriteria.brandname = brandname;
  if (gender) filterCriteria["productdetails.gender"] = gender;
  if (category) filterCriteria["productdetails.category"] = category;
  if (subcategory) filterCriteria["productdetails.subcategory"] = subcategory;
  if (type) filterCriteria["productdetails.type"] = type;
  if (color) filterCriteria["productdetails.color"] = color;
  if (fabric) filterCriteria["productdetails.fabric"] = fabric;
  if (sizes) {
    filterCriteria["productdetails.stockBySize"] = {
      $elemMatch: { size: sizes, stock: { $gt: 0 } },
    };
  }

  if (offerfilter) {
    switch (offerfilter) {
      case "under499":
        filterCriteria.price = { $lte: 499 };
        break;
      case "under1499":
        filterCriteria.price = { $lte: 1499 };
        break;
      case "upto50":
        filterCriteria.discount = { $gte: 50 };
        break;
      case "upto70":
        filterCriteria.discount = { $gte: 70 };
        break;
      default:
        console.log("Invalid Offer Filter");
    }
  }
  console.log("Final Filter Criteria:", filterCriteria);
  // Price Range Filter
  if (from && to) {
    filterCriteria.price = { $gte: from, $lte: to };
  } else if (from) {
    filterCriteria.price = { $gte: from };
  } else if (to) {
    filterCriteria.price = { $lte: to };
  }
  // Discount Filter
  if (discount) {
    filterCriteria.discount = { $gte: discount }; // Get products with at least this discount
  }

  // Rating Filter
  if (rating) {
    filterCriteria.rating = { $gte: rating }; // Get products with at least this rating
  }

  // Sorting Logic
  let sortOptions = {};
  switch (sortBy) {
    case "Rating":
      sortOptions.rating = -1;
      break;
    case "date":
      sortOptions.createdAt = -1;
      break;
    case "highprice":
      sortOptions.price = -1;
      break;
    case "lowprice":
      sortOptions.price = 1;
      break;
    default:
      sortOptions.createdAt = -1; // Default: Newest first
  }

  // Fetch Products
  const products = await Product.find(filterCriteria).sort(sortOptions).lean();

  const finalProducts = products.map((product) =>
    applySubscriptionPrice(product, req.user),
  );

  res.json(finalProducts);
});

// @desc Fetch single  product
// @route GET /api/products/:id
// @access Public
// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate({
      path: "reviews.user",
      select: "name profilePicture",
    })
    .lean(); // plain JS object

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // ✅ Filter only approved reviews
  const approvedReviews = product.reviews.filter((r) => r.approved === true);

  // ✅ Apply subscription price
  const pricedProduct = applySubscriptionPrice(product, req.user);

  // ✅ Attach approved reviews
  pricedProduct.reviews = approvedReviews;

  res.json(pricedProduct);
});

const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  if (!rating || !comment) {
    res.status(400);
    throw new Error("Rating and comment required");
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // ✅ PHOTOS OPTIONAL
  let photos = [];
  if (req.files && req.files.length > 0) {
    photos = req.files.map((file) => file.path);
  }

  const review = {
    name: req.user.name,
    rating: Number(rating),
    comment,
    photos, // [] if no images
    user: req.user._id,
    approved: false,
  };

  product.reviews.push(review);

  product.numReviews = product.reviews.length;
  product.rating =
    product.reviews.reduce((acc, r) => acc + r.rating, 0) /
    product.reviews.length;

  await product.save();

  res.status(201).json({ message: "Review added successfully" });
});

// Alternative: If you want a separate endpoint for variants
const getProductVariants = async (req, res) => {
  try {
    const { sku } = req.params;

    // Extract prefix from the given SKU
    const skuPrefix = sku.split("-")[0];

    // Find all products with this prefix
    const variants = await Product.find({
      SKU: { $regex: `^${skuPrefix}-` },
    }).select("SKU productdetails.color images brandname price");

    res.json(variants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getProductBySku = asyncHandler(async (req, res) => {
  const { sku } = req.params;

  // 1️⃣ Find current product
  const product = await Product.findOne({ SKU: sku });

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // 2️⃣ Extract unified/base SKU (before first "-")
  const baseSKU = sku.split("-")[0];

  // 3️⃣ Find all color variants
  const variants = await Product.find({
    SKU: { $regex: `^${baseSKU}-` },
  }).select("SKU productdetails.color images price productdetails.stockBySize");

  // 4️⃣ Response
  res.json({
    product: applySubscriptionPrice(product.toObject(), req.user),
    variants: variants.map((v) =>
      applySubscriptionPrice(v.toObject(), req.user),
    ),
  });
});

// @desc Add product to cart
// @route POST /api/products/:id/addtocart
// @access Private
// const addToCart = asyncHandler(async (req, res) => {
//   const userId = req.user._id;
//   const { qty = 1, size, action = "add", cartItemId } = req.body; // default qty=1

//   if (cartItemId && !existingCartItem) {
//     return res.status(404).json({ message: "Cart item not found" });
//   }

//   if (!size) return res.status(400).json({ message: "Size is required" });
//   if (qty < 0) return res.status(400).json({ message: "Invalid quantity" });

//   const product = await Product.findById(req.params.id);
//   if (!product) return res.status(404).json({ message: "Product not found" });

//   const user = await User.findById(userId);
//   if (!user) return res.status(404).json({ message: "User not found" });

//   user.cartItems = user.cartItems || [];

//   const sizeStock = product.productdetails?.stockBySize?.find(
//     (s) => s.size === size
//   );

//   if (!sizeStock)
//     return res.status(400).json({ message: "Size not available" });

//   let existingCartItem = null;

//   // 1️⃣ If cartItemId exists → update THAT item (size change case)
//   if (cartItemId) {
//     existingCartItem = user.cartItems.id(cartItemId);
//   }

//   // 2️⃣ Else → normal add/find by product + size
//   if (!existingCartItem) {
//     existingCartItem = user.cartItems.find(
//       (item) =>
//         item.product.toString() === product._id.toString() && item.size === size
//     );
//   }

//   if (existingCartItem && qty === 0) {
//     user.cartItems = user.cartItems.filter(
//       (item) => item._id.toString() !== existingCartItem._id.toString()
//     );
//   } else if (existingCartItem) {
//     const pricedProduct = applySubscriptionPrice(product.toObject(), user);

//     // update size & qty safely
//     existingCartItem.size = size;

//     if (action === "set") {
//       existingCartItem.qty = qty;
//     } else {
//       existingCartItem.qty += 1;
//     }

//     // stock check
//     if (existingCartItem.qty > sizeStock.stock) {
//       return res.status(400).json({ message: "Not enough stock available" });
//     }

//     // recalc price
//     existingCartItem.price =
//       existingCartItem.qty * pricedProduct.subscriptionPrice;
//   } else {
//     const pricedProduct = applySubscriptionPrice(product.toObject(), user);

//     user.cartItems.push({
//       product: product._id,
//       qty,
//       size,
//       price: qty * pricedProduct.subscriptionPrice, // ✅ CORRECT
//     });
//   }

//   await user.save();

//   // const updatedUser = await User.findById(userId).populate("cartItems.product");

//   const updatedUser = await User.findById(userId).populate({
//     path: "cartItems.product",
//     select:
//       "name brandname images oldPrice isSubscriptionApplied subscriptionDiscountPercent productdetails",
//   });

//   res.status(200).json({ cartItems: updatedUser.cartItems });
// });

const addToCart = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { qty = 1, size, action = "add", cartItemId } = req.body;

    console.log("📦 addToCart called:", {
      userId,
      qty,
      size,
      action,
      cartItemId,
    });

    if (!size) return res.status(400).json({ message: "Size is required" });
    if (qty < 0) return res.status(400).json({ message: "Invalid quantity" });

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    console.log("👤 User found, cartItems count:", user.cartItems?.length);
    console.log("📦 Product stockBySize:", product.productdetails?.stockBySize);

    user.cartItems = user.cartItems || [];

    const sizeStock = product.productdetails?.stockBySize?.find(
      (s) => s.size === size,
    );

    console.log("📏 sizeStock found:", sizeStock);

    if (!sizeStock)
      return res.status(400).json({ message: "Size not available" });

    let existingCartItem = null;

    if (cartItemId) {
      existingCartItem = user.cartItems.id(cartItemId);
      if (!existingCartItem)
        return res.status(404).json({ message: "Cart item not found" });
    }

    if (!existingCartItem) {
      existingCartItem = user.cartItems.find(
        (item) =>
          item.product.toString() === product._id.toString() &&
          item.size === size,
      );
    }

    console.log("🛒 existingCartItem:", existingCartItem);

    if (existingCartItem && qty === 0) {
      user.cartItems = user.cartItems.filter(
        (item) => item._id.toString() !== existingCartItem._id.toString(),
      );
    } else if (existingCartItem) {
      const pricedProduct = applySubscriptionPrice(product.toObject(), user);
      console.log(
        "💰 pricedProduct.subscriptionPrice:",
        pricedProduct.subscriptionPrice,
      );

      existingCartItem.size = size;
      existingCartItem.qty = action === "set" ? qty : existingCartItem.qty + 1;

      if (existingCartItem.qty > sizeStock.stock) {
        return res.status(400).json({ message: "Not enough stock available" });
      }

      existingCartItem.price =
        existingCartItem.qty * pricedProduct.subscriptionPrice;
    } else {
      const pricedProduct = applySubscriptionPrice(product.toObject(), user);
      console.log(
        "💰 new item pricedProduct.subscriptionPrice:",
        pricedProduct.subscriptionPrice,
      );

      user.cartItems.push({
        product: product._id,
        qty,
        size,
        price: qty * pricedProduct.subscriptionPrice,
      });
    }

    console.log("💾 Saving user...");
    await user.save();
    console.log("✅ User saved");

    const updatedUser = await User.findById(userId).populate({
      path: "cartItems.product",
      select:
        "name brandname images oldPrice isSubscriptionApplied subscriptionDiscountPercent productdetails",
    });

    res.status(200).json({ cartItems: updatedUser.cartItems });
  } catch (err) {
    // ✅ This will show the REAL error in your terminal
    console.error("💥 addToCart CRASH:", err.message);
    console.error(err.stack);
    res.status(500).json({ message: err.message });
  }
});

// @desc get cart product
// @route get /api/products/getcart
// @access Private
const getCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "cartItems.product",
    select:
      "name images brandname description price oldPrice discount productdetails",
  });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const cartItems = user.cartItems.map((item) => {
    const pricedProduct = applySubscriptionPrice(item.product.toObject(), user);

    return {
      ...item.toObject(),
      product: pricedProduct,
    };
  });

  res.status(200).json({ cartItems });
});

// @desc detlete cart product
// @route delete /api/products/deletecart
// @access Private

// const deleteCartItem = asyncHandler(async (req, res) => {
//   const userId = req.user._id; // Logged-in user's ID
//   const { cartItemId } = req.params; // Cart item ID to delete

//   console.log("Cart Item ID from request:", cartItemId);

//   // Use MongoDB's $pull operator to remove the item by its `_id`
//   const updatedUser = await User.findByIdAndUpdate(
//     userId,
//     {
//       $pull: { cartItems: { _id: cartItemId } }, // Match by cart item `_id`
//     },
//     { new: true } // Return the updated document
//   ).populate("cartItems.product"); // Populate product details after update

//   if (!updatedUser) {
//     res.status(404);
//     throw new Error("User not found");
//   }

//   console.log("Updated Cart Items:", updatedUser.cartItems);

//   // Send the updated cart back to the client
//   res.status(200).json(updatedUser);
// });

// @desc Delete cart product
// @route DELETE /api/products/deletecart/:cartItemId
// @access Private
const deleteCartItem = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { cartItemId } = req.params;

  const user = await User.findById(userId).populate("cartItems.product");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // 🔍 FIND THE CART ITEM (IMPORTANT)
  const cartItem = user.cartItems.find(
    (item) => item._id.toString() === cartItemId,
  );

  if (!cartItem) {
    return res.status(404).json({ message: "Cart item not found" });
  }

  // 🔁 RESTORE STOCK
  const product = await Product.findById(cartItem.product._id);

  if (product) {
    const sizeStock = product.productdetails.stockBySize.find(
      (s) => s.size === cartItem.size,
    );

    if (sizeStock) {
      sizeStock.stock += cartItem.qty;

      await product.save();
    }
  }

  // 🗑 REMOVE ITEM
  user.cartItems = user.cartItems.filter(
    (item) => item._id.toString() !== cartItemId,
  );

  await user.save();

  const updatedUser = await User.findById(userId).populate("cartItems.product");

  res.status(200).json({
    cartItems: updatedUser.cartItems,
  });
});

// @desc Delete a product
// @route GET /api/products/:id
// @access Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product Removed" });
  } else {
    // status it's 500 by default cuz of errHandler
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc Create a product
// @route Post /api/products
// @access Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  console.log("BODY:", req.body);
  console.log("FILES:", req.files);
  console.log("📦 washCare received:", req.body.washCare);

  try {
    const {
      brandname,
      description,
      SKU,
      shippingDetails,
      isFeatured,
      products,
      productType = "single",
      comboName = "",
      hsnCode,
    } = req.body;

    // ✅ IMPROVED VALIDATION - Check if products exists AND is not empty
    if (!products || products === "" || products === "[]") {
      console.error("❌ No products data received");
      return res.status(400).json({ message: "No product variants provided" });
    }

    // ✅ Parse products safely
    let parsedProducts;
    try {
      parsedProducts = typeof products === "string" ? JSON.parse(products) : products;
    } catch (parseError) {
      console.error("❌ Error parsing products:", parseError);
      return res.status(400).json({ message: "Invalid product data format" });
    }

    // ✅ Check if parsed products is actually an array with items
    if (!Array.isArray(parsedProducts) || parsedProducts.length === 0) {
      console.error("❌ Parsed products is empty or not an array");
      return res.status(400).json({ message: "No product variants provided" });
    }

    const washCare =
      typeof req.body.washCare === "string"
        ? JSON.parse(req.body.washCare)
        : req.body.washCare || [];
    const parsedShippingDetails =
      typeof shippingDetails === "string"
        ? JSON.parse(shippingDetails)
        : shippingDetails;
    
    if (parsedShippingDetails?.originAddress?.street2 !== undefined) {
      delete parsedShippingDetails.originAddress.street2;
    }

    // 🔥 GROUP ID
    const productGroupId = new mongoose.Types.ObjectId().toString();

    const sizeChart = req.files?.sizeChart?.[0]?.path || "";
    console.log("🚀 [createProduct] Size Chart received:", sizeChart);
    const allImages = req.files?.images || [];

    let imageIndex = 0;
    const createdProducts = [];

    // ✅ SINGLE LOOP (FIXED)
    for (let i = 0; i < parsedProducts.length; i++) {
      const variant = parsedProducts[i];

      const imageCount = Number(variant.imagesCount || 3);

      if (imageCount < 3 || imageCount > 5) {
        return res.status(400).json({
          message: `Variant ${variant.productdetails.color} must have 3–5 images`,
        });
      }

      const images = allImages
        .slice(imageIndex, imageIndex + imageCount)
        .map((file) => file.path);

      imageIndex += imageCount;
      
      if (productType === "combo") {
        variant.productdetails.subcategory = "Combo";
      }

      const product = new Product({
        user: req.user._id,
        brandname,
        description,
        productType,
        comboName: productType === "combo" ? comboName : "",
        hsnCode: hsnCode || "6109",
        price: Number(variant.price),
        oldPrice: Number(variant.oldPrice),
        discount: Number(variant.discount),
        washCare,
        images,
        sizeChart,
        productGroupId,
        SKU: `${SKU}-${variant.productdetails.color.toUpperCase()}-${Date.now()}`,
        productdetails: variant.productdetails,
        shippingDetails: parsedShippingDetails,
        isFeatured: isFeatured === "true",
        rating: 0,
        numReviews: 0,
      });

      createdProducts.push(await product.save());
    }

    // ✅ SUCCESS RESPONSE
    res.status(201).json({
      message: "Product variants created successfully",
      productGroupId,
      products: createdProducts,
    });
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// @desc Mark review as Helpful / Not Helpful
// @route PUT /api/products/:id/review/helpful
// @access Private

// @desc Update a product
// @route PUT /api/products/:id
// @access Private/Admin

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Basic fields
  product.brandname = req.body.brandname || product.brandname;
  product.description = req.body.description || product.description;
  product.oldPrice = req.body.oldPrice || product.oldPrice;
  product.discount = req.body.discount || product.discount;
  product.price = req.body.price || product.price;
  product.SKU = req.body.SKU || product.SKU;
  product.isFeatured = req.body.isFeatured ?? product.isFeatured;
  product.hsnCode = req.body.hsnCode || product.hsnCode;

  // JSON fields
  if (req.body.productdetails) {
    product.productdetails = JSON.parse(req.body.productdetails);
  }

  if (req.body.shippingDetails) {
    const shipping = JSON.parse(req.body.shippingDetails);

    if (shipping?.originAddress?.street2 !== undefined) {
      delete shipping.originAddress.street2;
    }

    product.shippingDetails = shipping;
  }

  // Images (optional replace)
  if (req.files?.images?.length > 0) {
    product.images = req.files.images.map((file) => file.path);
  }

  // Size chart (optional)
  if (req.files?.sizeChart?.length > 0) {
    product.sizeChart = req.files.sizeChart[0].path;
    console.log("🚀 [updateProduct] Size Chart received:", product.sizeChart);
  }
  if (req.body.washCare !== undefined) {
    product.washCare =
      typeof req.body.washCare === "string"
        ? JSON.parse(req.body.washCare)
        : req.body.washCare;
  }
  const updatedProduct = await product.save();
  res.json(updatedProduct);
});

// @desc Create a bulk product
// @route Post /api/products
// @access Private/Admin
export const markReviewHelpful = async (req, res) => {
  const { productId, reviewId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const review = product.reviews.id(reviewId);
  if (!review) {
    return res.status(404).json({ message: "Review not found" });
  }

  review.helpful = (review.helpful || 0) + 1;

  await product.save();
  res.json({ message: "Marked as helpful" });
};
export const markReviewNotHelpful = async (req, res) => {
  const { productId, reviewId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const review = product.reviews.id(reviewId);
  if (!review) {
    return res.status(404).json({ message: "Review not found" });
  }

  review.notHelpful = (review.notHelpful || 0) + 1;

  await product.save();
  res.json({ message: "Marked as not helpful" });
};

const uploadProducts = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("ZIP file required");
  }

  // ✅ server/controlers/productControler.js → one level up = server/
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const PROJECT_ROOT = path.resolve(__dirname, "../"); // server/controlers → server/

  const safeNum = (val, fallback = 0) => {
    const n = parseFloat(val);
    return isNaN(n) ? fallback : n;
  };

  const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  };

  // ✅ Extract ZIP from memory buffer
  const zip = new AdmZip(req.file.buffer);
  const zipEntries = zip.getEntries();

  // ✅ Find Excel file inside ZIP
  const excelEntry = zipEntries.find(
    (e) =>
      !e.isDirectory &&
      (e.entryName.endsWith(".xlsx") || e.entryName.endsWith(".xls")) &&
      !e.entryName.includes("__MACOSX"),
  );

  if (!excelEntry) {
    res.status(400);
    throw new Error("No Excel file (.xlsx / .xls) found inside the ZIP");
  }

  // ✅ Build flat filename → ZipEntry map
  const allowedImageExts = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".jfif"];
  const allowedPdfExts = [".pdf"];
  const imageEntryMap = {};

  zipEntries.forEach((entry) => {
    if (entry.isDirectory || entry.entryName.includes("__MACOSX")) return;
    const ext = path.extname(entry.entryName).toLowerCase();
    const basename = path.basename(entry.entryName);
    if (allowedImageExts.includes(ext) || allowedPdfExts.includes(ext)) {
      imageEntryMap[basename] = entry;
    }
  });

  // ✅ Parse Excel
  const excelBuffer = excelEntry.getData();
  const workbook = XLSX.read(excelBuffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  // ✅ Write ZIP entry to disk → return RELATIVE path for DB
  const saveEntryToDisk = (entry, relativeFolder) => {
    const absFolder = path.join(PROJECT_ROOT, relativeFolder); // ✅ absolute on disk
    ensureDir(absFolder);
    const ext = path.extname(entry.entryName).toLowerCase();
    const filename = `images-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const destAbs = path.join(absFolder, filename);
    fs.writeFileSync(destAbs, entry.getData());
    // ✅ relative path stored in DB — matches what static server serves
    return `${relativeFolder}/${filename}`.replace(/\\/g, "/");
  };

  // ✅ Resolve pipe-separated filenames from Excel cell
  const resolveFiles = (cellValue, folder) => {
    if (!cellValue) return [];
    return cellValue
      .split("|")
      .map((p) => p.trim())
      .filter(Boolean)
      .reduce((acc, p) => {
        const basename = path.basename(p); // handles "img.jpg" or "D:/path/img.jpg"
        const entry = imageEntryMap[basename];
        if (entry) {
          acc.push(saveEntryToDisk(entry, folder));
        } else {
          console.warn(`Not found in ZIP: ${basename}`);
        }
        return acc;
      }, []);
  };

  const groupMap = {};
  let created = 0;
  const skipped = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    if (!row.SKU || !row.productGroupId) {
      throw new Error(`Row ${i + 2}: SKU & productGroupId required`);
    }

    if (!groupMap[row.productGroupId]) {
      groupMap[row.productGroupId] = new mongoose.Types.ObjectId().toString();
    }

    // ✅ Skip duplicate SKUs
    const exists = await Product.findOne({ SKU: row.SKU });
    if (exists) {
      console.warn(`Row ${i + 2}: SKU "${row.SKU}" already exists — skipped`);
      skipped.push(row.SKU);
      continue;
    }

    // 🔹 Images & sizeChart from ZIP
    const images = resolveFiles(row.images, "uploads/products/images");
    const pdfPaths = resolveFiles(row.sizeChart, "uploads/pdfs");
    const sizeChart = pdfPaths[0] || "";
    const washCare = row.washCare
      ? row.washCare
          .split("|")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    // 🔹 Sizes & stock
    const sizes = row.sizes
      ? row.sizes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const stockBySize = row.stockBySize
      ? row.stockBySize.split(",").map((s) => {
          const [size, stock] = s.split(":");
          return { size: (size || "").trim(), stock: safeNum(stock, 0) };
        })
      : [];

    // 🔹 Prices
    const oldPrice = safeNum(row.oldPrice, 0);
    const discount = safeNum(row.discount, 0);
    const price = Math.round(oldPrice - (oldPrice * discount) / 100);

    // 🔹 Shipping
    const weight = safeNum(row.weight, 0.5);
    const length = safeNum(row.length, 10);
    const width = safeNum(row.width, 10);
    const height = safeNum(row.height, 2);
    const zip = safeNum(row.zip, 0);

    await Product.create({
      user: req.user._id,
      SKU: `${row.SKU}-${(row.color || "DEFAULT").toUpperCase()}-${Date.now()}`,
      hsnCode: row.hsnCode || "6109",
      productGroupId: groupMap[row.productGroupId],
      brandname: row.brandname || "Default Brand",
      description: row.description || "",
      images,
      sizeChart,
      price,
      oldPrice,
      discount,
      washCare,
      productdetails: {
        gender: row.gender || "Unisex",
        category: row.category || "General",
        subcategory: row.subcategory || "General",
        type: row.type || "Casual",
        ageRange: row.ageRange || "Adult",
        fabric: row.fabric || "Cotton",
        color: row.color || "",
        sizes,
        stockBySize,
      },
      shippingDetails: {
        weight,
        dimensions: { length, width, height },
        originAddress: {
          street1: row.street1 || "Warehouse",
          city: row.city || "Chennai",
          state: row.state || "Tamil Nadu",
          zip,
          country: row.country || "India",
        },
      },
    });

    created++;
  }

  res.status(201).json({
    message: "Bulk upload successful",
    productsCreated: created,
    ...(skipped.length > 0 && {
      skipped: skipped.length,
      skippedSKUs: skipped,
      warning: `${skipped.length} SKU(s) already existed and were skipped`,
    }),
  });
});

// @desc Create new Review
// @route PUT /api/products/:id/reviews
// @access Private
// const createproductreview = asyncHandler(async (req, res) => {
//   console.log("Incoming Review Request:", req.body);
//   const { rating, comment } = req.body;

//   // ✅ Fetch existing product instead of creating a new one
//   const product = await Product.findById(req.params.id);

//   if (!product) {
//     return res.status(404).json({ message: "Product not found" });
//   }

//   const alreadyReviewed = product.reviews.find(
//     (r) => r.user.toString() === req.user._id.toString()
//   );
//   if (alreadyReviewed) {
//     res.status(400);
//     throw new Error("Product already reviewed");
//   }

//   const review = {
//     name: req.user.name,
//     rating: Number(rating),
//     comment,
//     user: req.user._id,
//     approved: false,
//     profilePicture: req.user.profilePicture,
//   };

//   product.reviews.push(review);
//   product.numReviews = product.reviews.length;
//   product.rating =
//     product.reviews.reduce((acc, item) => item.rating + acc, 0) /
//     product.reviews.length;

//   await product.save();

//   /* ================= MAIL SECTION ================= */

//   try {
//     console.log("➡️ Sending admin mail...");

//     await reviewnotificatioEmail({
//       to: process.env.ADMIN_EMAIL,
//       subject: "📝 New Product Review Submitted",
//       text: `
// Product: ${product.brandname}
// Reviewer: ${req.user.name}
// Rating: ${rating}
// Comment: ${comment}
//     `,
//     });

//     console.log("✅ Admin mail sent");

//     console.log("➡️ Fetching sellers...");
//     const sellers = await User.find({
//       isSeller: true,
//       email: { $exists: true, $ne: "" },
//     });
//     console.log("🧾 SELLERS FOUND COUNT:", sellers.length);

//     if (sellers.length === 0) {
//       console.log("❌ SELLER NOT FOUND");
//     }

//     for (const seller of sellers) {
//       console.log("📧 Sending mail to seller:", seller.email);

//       await reviewnotificatioEmail({
//         to: seller.email,
//         subject: "📝 New Product Review Submitted",
//         text: `
// Product: ${product.brandname}
// Rating: ${rating}
// Comment: ${comment}
//       `,
//       });
//     }

//     console.log("✅ Seller mail section completed");
//   } catch (err) {
//     console.error("❌ MAIL ERROR:", err);
//   }

//   /* ================= END MAIL ================= */

//   // 🔥 SEND RESPONSE ONLY AFTER ALL LOGIC
//   res.status(201).json({ message: "Review added & notifications sent" });
// });

// const createproductreview = asyncHandler(async (req, res) => {
//   console.log("Incoming Review Request:", req.body);

//   const { rating, comment } = req.body;
//   const product = await Product.findById(req.params.id);

//   if (!product) {
//     return res.status(404).json({ message: "Product not found" });
//   }

//   const alreadyReviewed = product.reviews.find(
//     (r) => r.user.toString() === req.user._id.toString()
//   );

//   if (alreadyReviewed) {
//     res.status(400);
//     throw new Error("Product Already Reviewed");
//   }

//   const review = {
//     name: req.user.name,
//     rating: Number(rating),
//     comment,
//     user: req.user._id,
//     approved: false,
//   };

//   product.reviews.push(review);
//   product.numReviews = product.reviews.length;
//   product.rating =
//     product.reviews.reduce((acc, item) => item.rating + acc, 0) /
//     product.reviews.length;

//   await product.save();

//   // ⭐ Email notification to admin
//   const adminEmail = process.env.ADMIN_EMAIL;

//   const emailMessage = `
//     <h2>New Review Submitted</h2>
//     <p>A new review has been submitted and needs your approval.</p>
//     <h3>Review Details</h3>
//     <p><strong>User:</strong> ${req.user.name}</p>
//     <p><strong>Rating:</strong> ${rating}</p>
//     <p><strong>Comment:</strong> ${comment}</p>
//     <p><strong>Product:</strong> ${product.brandname}</p>
//     <br/>
//     <a href="https://your-admin-panel-url.com/reviews">Click here to approve reviews</a>
//   `;

//   await sendEmail(
//     adminEmail,
//     "New Product Review Awaiting Approval",
//     emailMessage
//   );

//   res.status(201).json({ message: "Review added & admin notified" });
// });

// @desc Approve Review
// @route PUT /api/products/approve review
// @access Private

const approveReview = asyncHandler(async (req, res) => {
  console.log(
    "🔍 Approving Review - Product ID:",
    req.params.id,
    "Review ID:",
    req.params.reviewId,
  );

  const product = await Product.findById(req.params.id);

  if (!product) {
    console.error("❌ ERROR: Product not found");
    return res.status(404).json({ message: "Product not found" });
  }

  const review = product.reviews.find(
    (r) => r._id.toString() === req.params.reviewId,
  );

  if (!review) {
    console.error("❌ ERROR: Review not found inside product");
    return res.status(404).json({ message: "Review not found" });
  }

  review.approved = true; // ✅ Mark review as approved

  try {
    console.log("✅ Before Saving:", product.reviews);

    await product.save();

    console.log("✅ After Saving:", product.reviews);
    res.json({ message: "Review approved" });
  } catch (error) {
    console.error("❌ ERROR Saving Review:", error);
    res.status(500).json({ message: "Error saving approved review" });
  }
});

// @desc Pending Review
// @route get /api/products/pending review
// @access Private
const getPendingReviews = asyncHandler(async (req, res) => {
  const products = await Product.find({ "reviews.approved": false })
    .populate({
      path: "reviews.user",
      select: "name profilePicture",
    })
    .select("reviews brandname images");

  const pendingReviews = [];

  products.forEach((product) => {
    product.reviews.forEach((review) => {
      if (!review.approved) {
        pendingReviews.push({
          _id: review._id,
          productId: product._id,
          product: {
            name: product.brandname,
            image: product.images?.[0] || null,
          },
          user: {
            name: review.user?.name || review.name,
            avatar: review.user?.profilePicture || null,
          },
          rating: review.rating,
          comment: review.comment,
          photos: review.photos || [],
          createdAt: review.createdAt,
        });
      }
    });
  });

  res.json(pendingReviews);
});

// Alternative: Delete review by review ID only (searches across all products)
const deleteReviewById = async (req, res) => {
  console.log("Backend received reviewId:", req.params.reviewId);
  try {
    const { reviewId } = req.params;
    console.log("🚀 deleteReviewById called with reviewId:", reviewId);

    // Find the product that contains this review
    const product = await Product.findOne({ "reviews._id": reviewId });
    console.log("🔍 Product found for review:", product ? product._id : null);

    if (!product) {
      return res
        .status(404)
        .json({ message: "Review not found in any product" });
    }

    // Remove the review
    product.reviews = product.reviews.filter(
      (r) => r._id.toString() !== reviewId,
    );

    // Recalculate rating
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.length > 0
        ? product.reviews.reduce((acc, r) => acc + r.rating, 0) /
          product.reviews.length
        : 0;

    await product.save();

    console.log("✅ Review deleted successfully");
    res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    console.error("❌ deleteReviewById error:", error);
    res.status(500).json({ message: error.message });
  }
};

// controllers/productController.js

const getProductFullById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).lean();
  if (!product) return res.status(404).json({ message: "Product not found" });

  const variants = await Product.find({
    productGroupId: product.productGroupId,
  }).lean();

  const group = await ProductGroup.findById(product.productGroupId).lean();

  res.json({
    product: applySubscriptionPrice(product, req.user),
    variants: variants.map((v) => applySubscriptionPrice(v, req.user)),
    group,
  });
});

const updateGroupCommonFields = asyncHandler(async (req, res) => {
  console.log("📁 req.files:", req.files);
  console.log("📦 req.body:", req.body);

  // ✅ Parse shippingDetails since it comes as a JSON string from FormData
  let shipping = req.body.shippingDetails;
  if (typeof shipping === "string") {
    shipping = JSON.parse(shipping);
  }

  if (shipping?.originAddress?.street2 !== undefined) {
    delete shipping.originAddress.street2;
  }

  let sizeChartPath = null;
  if (req.files?.sizeChart?.length > 0) {
    sizeChartPath = req.files.sizeChart[0].path.replace(/\\/g, "/");
  }

  const updateFields = {
    brandname: req.body.brandname,
    description: req.body.description,
    hsnCode: req.body.hsnCode, // ✅ ADD THIS LINE
    shippingDetails: shipping,
    isFeatured: req.body.isFeatured,
    "productdetails.gender": req.body.gender,
    "productdetails.category": req.body.category,
    "productdetails.subcategory": req.body.subcategory,
    "productdetails.type": req.body.type,
    "productdetails.fabric": req.body.fabric,
    "productdetails.ageRange": req.body.ageRange,
    washCare:
      typeof req.body.washCare === "string"
        ? JSON.parse(req.body.washCare)
        : req.body.washCare || [],
  };

  if (sizeChartPath !== null) {
    updateFields.sizeChart = sizeChartPath;
  }

  const result = await Product.updateMany(
    { productGroupId: req.params.groupId },
    { $set: updateFields },
  );

  res.json({
    message: "Common fields updated",
    updatedCount: result.modifiedCount,
  });
});
const addVariantToGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  let { color, sizes, stockBySize, oldPrice, discount, price } = req.body;

  if (typeof sizes === "string") sizes = JSON.parse(sizes);
  if (typeof stockBySize === "string") stockBySize = JSON.parse(stockBySize);

  oldPrice = Number(oldPrice);
  discount = Number(discount);
  price = Number(price);

  const files = req.files || [];

  // ✅ BASIC VALIDATION
  if (!color || !sizes || !stockBySize) {
    res.status(400);
    throw new Error("Variant fields are missing");
  }

  // ✅ IMAGE VALIDATION (3–5)
  if (files.length < 3 || files.length > 5) {
    res.status(400);
    throw new Error("Each variant must have between 3 and 5 images");
  }

  const images = files.map((file) => file.path);

  // ✅ FIND BASE PRODUCT
  const baseProduct = await Product.findOne({ productGroupId: groupId });
  if (!baseProduct) {
    res.status(404);
    throw new Error("Product group not found");
  }

  // ✅ PREVENT DUPLICATE COLOR
  const existingVariant = await Product.findOne({
    productGroupId: groupId,
    "productdetails.color": color,
  });

  if (existingVariant) {
    res.status(400);
    throw new Error("Variant with this color already exists");
  }

  // ✅ SKU GENERATION
  const SKU = `${
    baseProduct.SKU.split("-")[0]
  }-${color.toUpperCase()}-${Date.now()}`;

  // ✅ CREATE VARIANT
  const newVariant = new Product({
    productGroupId: groupId,
    brandname: baseProduct.brandname,
    description: baseProduct.description,
    shippingDetails: baseProduct.shippingDetails,
    isFeatured: baseProduct.isFeatured,
    washCare: baseProduct.washCare || [],
    oldPrice,
    discount,
    price,
    SKU,
    images,

    productdetails: {
      gender: baseProduct.productdetails.gender,
      category: baseProduct.productdetails.category,
      subcategory: baseProduct.productdetails.subcategory,
      type: baseProduct.productdetails.type,
      fabric: baseProduct.productdetails.fabric,
      ageRange: baseProduct.productdetails.ageRange,
      color,
      sizes,
      stockBySize,
    },

    user: req.user._id,
    rating: 0,
    numReviews: 0,
  });

  const createdVariant = await newVariant.save();

  res.status(201).json({
    message: "Variant added successfully",
    variant: createdVariant,
  });
});

const updateProductGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { brandname, description, price, oldPrice, discount, isFeatured } =
    req.body;

  // Only fields that should propagate
  const updateFields = {
    ...(brandname && { brandname }),
    ...(description && { description }),
    ...(price !== undefined && { price }),
    ...(oldPrice !== undefined && { oldPrice }),
    ...(discount !== undefined && { discount }),
    ...(isFeatured !== undefined && { isFeatured }),
  };

  const updatedProducts = await Product.updateMany(
    { productGroupId: groupId },
    { $set: updateFields },
    { new: true },
  );

  if (!updatedProducts) {
    res.status(404);
    throw new Error("Product group not found");
  }

  res.json({
    message: "Product group updated successfully",
    updatedCount: updatedProducts.nModified,
  });
});

const getProductsByGroupId = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  if (!groupId) {
    res.status(400);
    throw new Error("Group ID is required");
  }

  const products = await Product.find({ productGroupId: groupId }).lean();

  const finalProducts = products.map((product) =>
    applySubscriptionPrice(product, req.user),
  );

  if (!products) {
    res.status(404);
    throw new Error("No products found for this group");
  }

  res.json(finalProducts); // ✅ Must return JSON
});
const getProductGroup = asyncHandler(async (req, res) => {
  const products = await Product.find({
    productGroupId: req.params.groupId,
  });

  if (!products.length) {
    res.status(404);
    throw new Error("Product group not found");
  }

  // parent/common fields from first product
  const base = products[0];

  res.json({
    common: {
      brandname: base.brandname,
      description: base.description,
      hsnCode: base.hsnCode, 
      shippingDetails: base.shippingDetails,
      isFeatured: base.isFeatured,
      sizeChart: base.sizeChart,
      washCare: base.washCare || [],
      productdetails: {
        gender: base.productdetails.gender,
        category: base.productdetails.category,
        subcategory: base.productdetails.subcategory,
        type: base.productdetails.type,
        fabric: base.productdetails.fabric,
        ageRange: base.productdetails.ageRange,
      },
    },
    variants: products,
  });
});
// ─── DROP-IN REPLACEMENT for updateVariant in productControler.js ───────────
//
// BUGS FIXED:
//  1. product.images[index] existence check blocked adding images at new indexes
//  2. imageIndexes not normalised to array for single-file uploads
//  3. Added server-side guard: never save blob: or data: URIs to DB
//
const updateVariant = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Variant not found");
  }

  // ── Prices ──────────────────────────────────────────────────
  if (req.body.oldPrice !== undefined && req.body.oldPrice !== "")
    product.oldPrice = Number(req.body.oldPrice);
  if (req.body.discount !== undefined && req.body.discount !== "")
    product.discount = Number(req.body.discount);
  if (req.body.price !== undefined && req.body.price !== "")
    product.price = Number(req.body.price);

  // ── Product details ─────────────────────────────────────────
  if (req.body.color) product.productdetails.color = req.body.color;
  if (req.body.sizes) product.productdetails.sizes = JSON.parse(req.body.sizes);
  if (req.body.stockBySize)
    product.productdetails.stockBySize = JSON.parse(req.body.stockBySize);

  // ── Image replacement ────────────────────────────────────────
  if (req.files && req.files.length > 0) {
    // Normalise to array (single upload sends a string)
    let imageIndexes = req.body.imageIndexes;
    if (!imageIndexes) {
      imageIndexes = [];
    } else if (typeof imageIndexes === "string") {
      imageIndexes = [imageIndexes];
    }

    req.files.forEach((file, i) => {
      const slotIndex = Number(imageIndexes[i]);
      if (isNaN(slotIndex)) return;

      const filePath = file.path;

      // ✅ Server-side guard: reject any path that looks like a data URI or blob URL
      if (filePath.startsWith("data:") || filePath.startsWith("blob:")) {
        console.warn(
          `Rejected bad image path at index ${slotIndex}:`,
          filePath.slice(0, 40),
        );
        return;
      }

      product.images[slotIndex] = filePath;
    });

    product.markModified("images");
  }

  const updated = await product.save();
  res.json(updated);
});
// @desc Unapprove Review
// @route PUT /api/products/:id/reviews/:reviewId/unapprove
// @access Private/Admin

// controllers/reviewController.js
// @desc Unapprove Review
// @route PUT /api/products/:id/reviews/:reviewId/unapprove
// @access Private/Admin
const unapproveReview = asyncHandler(async (req, res) => {
  const { id: productId, reviewId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const review = product.reviews.id(reviewId);
  if (!review) {
    return res.status(404).json({ message: "Review not found" });
  }

  review.approved = false; // ✅ Unapprove the review

  await product.save();

  res.json({ message: "Review unapproved successfully", review });
});
// @desc Get all reviews (admin)
// @route GET /api/products/reviews/all
// @access Private/Admin
// @desc Get all reviews (pending + approved)
// @route GET /api/products/all-reviews
// @access Private/Admin
const getAllReviews = asyncHandler(async (req, res) => {
  const products = await Product.find()
    .populate({ path: "reviews.user", select: "name profilePicture" })
    .select("reviews brandname images");

  const allReviews = [];

  products.forEach((product) => {
    product.reviews.forEach((review) => {
      allReviews.push({
        _id: review._id,
        approved: review.approved,
        productId: product._id,
        product: {
          name: product.brandname,
          image: product.images?.[0] || null,
        },
        user: {
          name: review.user?.name || review.name,
          avatar: review.user?.profilePicture || null,
        },
        rating: review.rating,
        comment: review.comment,
        photos: review.photos || [],
        createdAt: review.createdAt,
      });
    });
  });

  console.log("🔹 All reviews from backend:", allReviews.length);

  res.json(allReviews);
});
const getCategories = asyncHandler(async (req, res) => {
  const { gender } = req.query;
  const filter = gender ? { "productdetails.gender": gender } : {};

  // ✅ Fix: select the full productdetails object, not nested paths
  const products = await Product.find(filter)
    .select("productdetails -_id")
    .lean();

  const map = {};
  products.forEach((p) => {
    const cat = p.productdetails?.category;
    const sub = p.productdetails?.subcategory;
    if (!cat) return;
    if (!map[cat]) map[cat] = [];
    if (sub && !map[cat].includes(sub)) map[cat].push(sub);
  });

  res.json(map);
});
export {
  getProducts,
  deleteProduct,
  createProduct,
  updateProduct,
  uploadProducts,
  addToCart,
  getCart,
  deleteCartItem,
  getProductById,
  approveReview,
  getPendingReviews,
  deleteReviewById,
  getProductBySku,
  getProductVariants,
  updateGroupCommonFields,
  addVariantToGroup,
  updateProductGroup,
  getProductFullById,
  getProductsByGroupId,
  getProductGroup,
  updateVariant,
  createProductReview,
  unapproveReview,
  getAllReviews,
  getCategories,
};
