import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${BACKEND_URL}/api/garment-types`;

const getGarmentTypes = async () => (await axios.get(API_URL)).data;
const createGarmentType = async (label, category, basePrice) =>
  (await axios.post(API_URL, { label, category, basePrice })).data;
const updateGarmentBasePrice = async (id, basePrice) =>
  (await axios.put(`${API_URL}/${id}`, { basePrice })).data;
const addColor = async (id, name, hex) =>
  (await axios.post(`${API_URL}/${id}/colors`, { name, hex })).data;
const removeColor = async (id, slug) =>
  (await axios.delete(`${API_URL}/${id}/colors/${slug}`)).data;
const deleteGarmentType = async (id) =>
  (await axios.delete(`${API_URL}/${id}`)).data;

export default {
  getGarmentTypes,
  updateGarmentBasePrice,
  createGarmentType,
  addColor,
  removeColor,
  deleteGarmentType,
};
