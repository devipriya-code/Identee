import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${BACKEND_URL}/api/categorybanner`;

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

const getShowcase = async () => {
  const res = await axios.get(`${API_URL}/showcase`);
  return res.data;
};

const getAllCategoryBanners = async (token) => {
  const res = await axios.get(`${API_URL}`, authHeader(token));
  return res.data;
};

const upsertCategoryBanner = async (formData, token) => {
  const res = await axios.post(`${API_URL}`, formData, authHeader(token));
  return res.data;
};

const deleteCategoryBanner = async (category, token) => {
  const res = await axios.delete(
    `${API_URL}/${encodeURIComponent(category)}`,
    authHeader(token),
  );
  return res.data;
};

const categoryBannerService = {
  getShowcase,
  getAllCategoryBanners,
  upsertCategoryBanner,
  deleteCategoryBanner,
};

export default categoryBannerService;
