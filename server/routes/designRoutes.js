import express from "express";
import { uploadDesign, getDesigns, deleteDesign } from "../controllers/designController.js";
import { uploadDesignFile } from "../middleware/uploadMiddleware.js"; // reuse existing multer
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(getDesigns)
  .post(protect, adminOnly, uploadDesignFile, uploadDesign);
router.delete("/:id", protect, adminOnly, deleteDesign);

export default router;