import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${BACKEND_URL}/api/art-categories`;

const getArtCategories = async () => (await axios.get(API_URL)).data;

const createArtCategory = async (name, thumbnailFile) => {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("thumbnail", thumbnailFile);
  const res = await axios.post(API_URL, formData);
  return res.data;
};

const deleteArtCategory = async (id) => (await axios.delete(`${API_URL}/${id}`)).data;

export default { getArtCategories, createArtCategory, deleteArtCategory };