import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import {
  getArtCategories,
  createArtCategory,
  deleteArtCategory,
} from "../controllers/artCategoryController.js";

const router = express.Router();

const uploadPath = path.join(process.cwd(), "uploads/art-categories");
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `artcat-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});
const upload = multer({ storage });

router.get("/", getArtCategories);
router.post("/", upload.single("thumbnail"), createArtCategory);
router.delete("/:id", deleteArtCategory);

export default router;