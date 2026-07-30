import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${BACKEND_URL}/api/art-designs`;

const getArtDesigns = async (categoryId) => {
  const url = categoryId ? `${API_URL}?category=${categoryId}` : API_URL;
  return (await axios.get(url)).data;
};

const getAllArtDesignsAdmin = async () => (await axios.get(`${API_URL}/all`)).data;

const createArtDesign = async (name, category, price, imageFile) => {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("category", category);
  formData.append("price", price);
  formData.append("image", imageFile);
  const res = await axios.post(API_URL, formData);
  return res.data;
};

const deleteArtDesign = async (id) => (await axios.delete(`${API_URL}/${id}`)).data;

export default {
  getArtDesigns,
  getAllArtDesignsAdmin,
  createArtDesign,
  deleteArtDesign,
};