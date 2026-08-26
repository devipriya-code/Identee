import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const API_URL = `${BACKEND_URL}/api/products`;

// GET ALL PRODUCTS
const getProducts = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// GET FULL PRODUCT (used by CustomizePage — product + variants + group)
const getProductFull = async (id) => {
  const response = await axios.get(`${API_URL}/${id}/full`);
  return response.data;
};

// GET PRODUCTS BY GARMENT STYLE (+ optional subcategory) — used by the
// navbar's "Products" dropdown AND the Home page category banners, so both
// surfaces always show the exact same product set for a given style.
const getProductsByGarmentStyle = async ({ garmentStyle, subcategory }) => {
  const params = new URLSearchParams();
  if (garmentStyle) params.set("garmentStyle", garmentStyle);
  if (subcategory) params.set("subcategory", subcategory);
  const response = await axios.get(`${API_URL}?${params.toString()}`);
  return response.data;
};

// GET PRODUCT BY ID
const getProductById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// CREATE PRODUCT
const createProduct = async (productData, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.post(`${API_URL}/create`, productData, config);
  return response.data;
};

// UPDATE PRODUCT
const updateProduct = async (id, productData, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.put(`${API_URL}/${id}`, productData, config);
  return response.data;
};

// UPDATE A SINGLE VARIANT — price, discount, color, sizes, stockBySize
// (and optionally images via FormData). Hits the existing
// group/variant/:id route (updateVariant controller) — this is what
// powers restocking/editing an already-uploaded product without having
// to re-upload it from scratch.
const updateProductVariant = async (id, formData, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.put(
    `${API_URL}/group/variant/${id}`,
    formData,
    config,
  );
  return response.data;
};

// DELETE PRODUCT
const deleteProduct = async (id, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.delete(`${API_URL}/${id}`, config);
  return response.data;
};

const productService = {
  getProducts,
  getProductFull,
  getProductsByGarmentStyle,
  getProductById,
  createProduct,
  updateProduct,
  updateProductVariant,
  deleteProduct,
};

export default productService;
