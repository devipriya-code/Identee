import Design from "../models/designModel.js";

// @route POST /api/designs  (admin, multipart field "design")
export const uploadDesign = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  const { name, price, category } = req.body;
  const design = await Design.create({
    name,
    price: Number(price) || 0,
    category,
    imageUrl: req.file.path,
  });
  res.status(201).json(design);
};

// @route GET /api/designs  (public — customer gallery)
export const getDesigns = async (req, res) => {
  const designs = await Design.find({ isActive: true }).sort({ createdAt: -1 });
  res.json(designs);
};

// @route DELETE /api/designs/:id (admin)
export const deleteDesign = async (req, res) => {
  await Design.findByIdAndDelete(req.params.id);
  res.json({ message: "Design removed" });
};