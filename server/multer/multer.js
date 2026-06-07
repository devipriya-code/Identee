import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

/* ==========================
   ABSOLUTE PROJECT ROOT
========================== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../");

/* ==========================
   UTILITY: Ensure Directory
========================== */
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

/* ==========================
   STORAGE ENGINE
========================== */
const storage = multer.diskStorage({
  destination(req, file, cb) {
    let relDir = "uploads/others";

    if (file.fieldname === "profilePicture") {
      relDir = "uploads/profiles";
    } else if (file.fieldname === "bannerImage") {
      relDir = "uploads/banners/images";
    } else if (file.fieldname === "images") {
      // ✅ ALL product images → products/images regardless of mimetype
      relDir = "uploads/products/images";
    } else if (file.fieldname === "sizeChart") {
      // ✅ sizeChart always goes to pdfs folder (handles both PDF and image size charts)
      relDir = "uploads/pdfs";
    } else if (
      file.fieldname === "image" &&
      req.originalUrl.includes("/api/banners")
    ) {
      relDir = "uploads/banners/images";
    } else if (file.mimetype.startsWith("video/")) {
      relDir = "uploads/banners/videos";
    } else if (file.mimetype === "application/pdf") {
      relDir = "uploads/pdfs";
    }

    const absDir = path.join(PROJECT_ROOT, relDir);
    ensureDir(absDir);

    // Store relDir so filename() can build the relative path
    file._relDir = relDir;

    cb(null, absDir);
  },

  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    file._relativePath = `${file._relDir}/${filename}`.replace(/\\/g, "/");
    cb(null, filename);
  },
});

/* ==========================
   FILE FILTER
========================== */
const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
    "image/avif",
    "image/jfif",
    "video/mp4",
    "video/avi",
    "application/pdf",
    "application/octet-stream",
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
  }
};

/* ==========================
   MULTER INSTANCE
========================== */
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
});

/* ==========================
   PATH REWRITER MIDDLEWARE
   Ensures file.path is always the relative DB-safe path
========================== */
const rewritePaths = (req, res, next) => {
  if (req.file?._relativePath) {
    req.file.path = req.file._relativePath;
  }
  if (Array.isArray(req.files)) {
    req.files.forEach((f) => {
      if (f._relativePath) f.path = f._relativePath;
    });
  }
  if (req.files && typeof req.files === "object" && !Array.isArray(req.files)) {
    Object.values(req.files).forEach((arr) => {
      arr.forEach((f) => {
        if (f._relativePath) f.path = f._relativePath;
      });
    });
  }
  next();
};

/* ==========================
   EXPORTS
========================== */
export const uploadSingleImage = [upload.single("image"), rewritePaths];
export const uploadSingleVideo = [upload.single("video"), rewritePaths];
export const uploadReviewImages = [upload.array("photos", 3), rewritePaths];
export const uploadProfileImage = [
  upload.single("profilePicture"),
  rewritePaths,
];

// ✅ For variant image replacement — allow up to 5 files
export const uploadMultipleImages = [upload.array("images", 5), rewritePaths];

// ✅ For product create/update — handles both "images" and "sizeChart" fields
export const uploadProductFiles = [
  upload.fields([
    { name: "images", maxCount: 50 },
    { name: "sizeChart", maxCount: 1 },
  ]),
  rewritePaths,
];
