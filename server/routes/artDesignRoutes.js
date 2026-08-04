import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import {
  getArtDesigns,
  getAllArtDesignsAdmin,
  createArtDesign,
  deleteArtDesign,
  bulkUploadArtDesigns,
} from "../controllers/artDesignController.js";
import zipUpload from "../multer/zipUpload.js";
import { protect, adminOrSeller } from "../middleware/authMiddleware.js";

const router = express.Router();

const uploadPath = path.join(process.cwd(), "uploads/art-designs");
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(
      null,
      `artdesign-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`,
    );
  },
});
const upload = multer({ storage });

router.get("/", getArtDesigns);
router.get("/all", getAllArtDesignsAdmin);

// ⚠️ Static path — must come before any future "/:id" route
router.post(
  "/bulk-upload",
  protect,
  adminOrSeller,
  zipUpload.single("file"),
  bulkUploadArtDesigns,
);

router.post("/", upload.single("image"), createArtDesign);
router.delete("/:id", deleteArtDesign);

export default router;
