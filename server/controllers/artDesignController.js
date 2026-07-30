import asyncHandler from "express-async-handler";
import path from "path";
import fs from "fs";
import ArtDesign from "../models/artDesignModel.js";

// GET /api/art-designs?category=<categoryId>
export const getArtDesigns = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const filter = { isActive: true };
  if (category) filter.category = category;
  const designs = await ArtDesign.find(filter)
    .populate("category", "name thumbnail")
    .sort({ createdAt: -1 });
  res.json(designs);
});

// GET /api/art-designs/all (admin — includes category info, all designs)
export const getAllArtDesignsAdmin = asyncHandler(async (req, res) => {
  const designs = await ArtDesign.find()
    .populate("category", "name")
    .sort({ createdAt: -1 });
  res.json(designs);
});

// POST /api/art-designs  (multipart, field name "image")
export const createArtDesign = asyncHandler(async (req, res) => {
  const { name, category, price } = req.body;
  if (!name || !category || price === undefined) {
    res.status(400);
    throw new Error("name, category and price are required");
  }
  if (!req.file) {
    res.status(400);
    throw new Error("Design image is required");
  }

  const design = await ArtDesign.create({
    name: name.trim(),
    category,
    price: Number(price),
    imageUrl: `uploads/art-designs/${req.file.filename}`,
  });
  res.status(201).json(design);
});

// DELETE /api/art-designs/:id
export const deleteArtDesign = asyncHandler(async (req, res) => {
  const design = await ArtDesign.findById(req.params.id);
  if (!design) {
    res.status(404);
    throw new Error("Design not found");
  }
  if (design.imageUrl) {
    const imgPath = path.join(process.cwd(), design.imageUrl);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  }
  await design.deleteOne();
  res.json({ message: "Design deleted" });
});
