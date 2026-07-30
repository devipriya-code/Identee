// services/garmentImageService.js
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${BACKEND_URL}/api/garment-images`;

const getAllGarmentImages = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

const getGarmentImage = async (garmentType, colorSlug) => {
  const res = await axios.get(`${API_URL}/${garmentType}/${colorSlug}`);
  return res.data;
};

const uploadGarmentViewPhoto = async (
  garmentType,
  colorSlug,
  colorName,
  colorHex,
  view,
  file,
) => {
  const formData = new FormData();
  formData.append("garmentType", garmentType);
  formData.append("colorSlug", colorSlug);
  formData.append("colorName", colorName);
  formData.append("colorHex", colorHex);
  formData.append("view", view);
  formData.append("photo", file);
  const res = await axios.post(`${API_URL}/upload-photo`, formData);
  return res.data;
};
const updatePrintArea = async (garmentType, colorSlug, view, printArea) => {
  const res = await axios.put(`${API_URL}/print-area`, {
    garmentType,
    colorSlug,
    view,
    printArea,
  });
  return res.data;
};

const deleteGarmentImage = async (garmentType, colorSlug) => {
  const res = await axios.delete(`${API_URL}/${garmentType}/${colorSlug}`);
  return res.data;
};

const garmentImageService = {
  getAllGarmentImages,
  getGarmentImage,
  uploadGarmentViewPhoto,
  updatePrintArea,
  deleteGarmentImage,
};

export default garmentImageService;
