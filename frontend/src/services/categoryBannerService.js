// services/categoryBannerService.js
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${BACKEND_URL}/api/categorybanner`;

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// ── PUBLIC — used by Home.jsx ─────────────────────────────────────
// Returns 5 categories, each with { category, image, products }
const getShowcase = async () => {
  const res = await axios.get(`${API_URL}/showcase`);
  return res.data;
};

// ── ADMIN — list all uploaded category banners ────────────────────
const getAllCategoryBanners = async (token) => {
  const res = await axios.get(`${API_URL}`, authHeader(token));
  return res.data;
};

// ── ADMIN — upload/replace a category's banner image ──────────────
// formData must contain: { category: "T-Shirts", image: File }
const upsertCategoryBanner = async (formData, token) => {
  const res = await axios.post(`${API_URL}`, formData, authHeader(token));
  return res.data;
};

// ── ADMIN — delete a category's banner ─────────────────────────────
const deleteCategoryBanner = async (category, token) => {
  const res = await axios.delete(`${API_URL}/${category}`, authHeader(token));
  return res.data;
};

const categoryBannerService = {
  getShowcase,
  getAllCategoryBanners,
  upsertCategoryBanner,
  deleteCategoryBanner,
};

export default categoryBannerService;