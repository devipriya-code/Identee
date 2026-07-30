import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import {
  getAllGarmentImages,
  getGarmentImage,
  uploadGarmentViewPhoto,
  updatePrintArea,
  deleteGarmentImage,
} from "../controllers/garmentColorImageController.js";
// import { protect, admin } from "../middleware/authMiddleware.js"; // uncomment if you want to guard admin-only routes

const router = express.Router();

const uploadPath = path.join(process.cwd(), "uploads/garments");

// 🔥 auto-create uploads/garments folder
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Dedicated storage so garment photos don't mix with design uploads —
// swap this for your existing shared multer config if you'd rather
// keep everything in one uploads folder/middleware file.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `garment-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});
const upload = multer({ storage });

router.get("/", getAllGarmentImages);
router.get("/:garmentType/:colorSlug", getGarmentImage);
router.post(
  "/upload-photo",
  /* protect, admin, */ upload.single("photo"),
  uploadGarmentViewPhoto,
);
router.put("/print-area", /* protect, admin, */ updatePrintArea);
router.delete(
  "/:garmentType/:colorSlug",
  /* protect, admin, */ deleteGarmentImage,
);

export default router;
