import asyncHandler from "express-async-handler";
import GarmentType from "../models/garmentTypeModel.js";

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// GET /api/garment-types
export const getGarmentTypes = asyncHandler(async (req, res) => {
  const items = await GarmentType.find({ isActive: true }).sort({
    createdAt: 1,
  });
  res.json(items);
});

// GET /api/garment-types/:key
export const getGarmentTypeByKey = asyncHandler(async (req, res) => {
  const item = await GarmentType.findOne({
    key: req.params.key,
    isActive: true,
  });
  if (!item) {
    res.status(404);
    throw new Error("Garment type not found");
  }
  res.json(item);
});

// POST /api/garment-types
export const createGarmentType = asyncHandler(async (req, res) => {
  const { label, category, basePrice } = req.body;
  if (!label || !category) {
    res.status(400);
    throw new Error("label and category are required");
  }
  const key = slugify(label);

  const exists = await GarmentType.findOne({ key });
  if (exists) {
    res.status(400);
    throw new Error("A garment type with this name already exists");
  }

  const item = await GarmentType.create({
    key,
    label,
    category,
    basePrice: Number(basePrice) || 0,
    colors: [],
  });
  res.status(201).json(item);
});

// PUT /api/garment-types/:id  — edit label/category
export const updateGarmentType = asyncHandler(async (req, res) => {
  const { label, category, basePrice } = req.body;
  const item = await GarmentType.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("Garment type not found");
  }
  if (label) item.label = label;
  if (category) item.category = category;
  if (basePrice !== undefined) item.basePrice = Number(basePrice);
  await item.save();
  res.json(item);
});

// POST /api/garment-types/:id/colors  — add a color
export const addColor = asyncHandler(async (req, res) => {
  const { name, hex } = req.body;
  if (!name || !hex) {
    res.status(400);
    throw new Error("name and hex are required");
  }
  const item = await GarmentType.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("Garment type not found");
  }
  const slug = slugify(name);
  if (item.colors.some((c) => c.slug === slug)) {
    res.status(400);
    throw new Error("This color already exists on this garment type");
  }
  item.colors.push({ name, slug, hex });
  await item.save();
  res.status(201).json(item);
});

// DELETE /api/garment-types/:id/colors/:slug
export const removeColor = asyncHandler(async (req, res) => {
  const item = await GarmentType.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("Garment type not found");
  }
  item.colors = item.colors.filter((c) => c.slug !== req.params.slug);
  await item.save();
  res.json(item);
});

// DELETE /api/garment-types/:id
export const deleteGarmentType = asyncHandler(async (req, res) => {
  const item = await GarmentType.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("Garment type not found");
  }
  await item.deleteOne();
  res.json({ message: "Deleted" });
});
