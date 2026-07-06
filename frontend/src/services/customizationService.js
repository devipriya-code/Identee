import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${BACKEND_URL}/api/customizations`;

const uploadDesignImage = async (file) => {
  const formData = new FormData();
  formData.append("design", file);
  const res = await axios.post(`${API_URL}/upload-design`, formData);
  return res.data; // { path }
};

const saveCustomization = async (productId, elements) => {
  const res = await axios.post(API_URL, { productId, elements });
  return res.data;
};

const getCustomizationById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

const customizationService = {
  uploadDesignImage,
  saveCustomization,
  getCustomizationById,
};

export default customizationService;