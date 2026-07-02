import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${BACKEND_URL}/api`;

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// ── OFFER BANNER (announcement strip text) ──────────────────────
const getActiveOffer = async () => {
  const res = await axios.get(`${API_URL}/offerbanner`);
  return res.data;
};

const getAllOffers = async (token) => {
  const res = await axios.get(`${API_URL}/offerbanners`, authHeader(token));
  return res.data;
};

const createOffer = async (offerText, token) => {
  const res = await axios.post(
    `${API_URL}/offerbanner`,
    { offerText },
    authHeader(token),
  );
  return res.data;
};

const updateOffer = async (id, data, token) => {
  const res = await axios.put(
    `${API_URL}/offerbanner/${id}`,
    data,
    authHeader(token),
  );
  return res.data;
};

const deleteOffer = async (id, token) => {
  const res = await axios.delete(`${API_URL}/offerbanner/${id}`, authHeader(token));
  return res.data;
};

const activateOffer = async (id, token) => {
  const res = await axios.put(
    `${API_URL}/offerbanner/activate/${id}`,
    {},
    authHeader(token),
  );
  return res.data;
};

// ── VIDEO BANNER (Home page hero video) ──────────────────────────
const getVideoBanner = async () => {
  const res = await axios.get(`${API_URL}/getvideobanner`);
  return res.data; // array — backend allows only ONE globally
};

const addVideoBanner = async (formData, token) => {
  const res = await axios.post(
    `${API_URL}/addvideobanner`,
    formData,
    authHeader(token),
  );
  return res.data;
};

const deleteVideoBanner = async (videoId, token) => {
  const res = await axios.delete(
    `${API_URL}/deletevideobanner/${videoId}`,
    authHeader(token),
  );
  return res.data;
};

const bannerService = {
  getActiveOffer,
  getAllOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  activateOffer,
  getVideoBanner,
  addVideoBanner,
  deleteVideoBanner,
};

export default bannerService;