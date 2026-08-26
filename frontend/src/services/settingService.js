import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${BACKEND_URL}/api/settings`;

const getPublicSettings = async () =>
  (await axios.get(`${API_URL}/public`)).data;

const getSettings = async (category, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const params = category ? { category } : {};
  const res = await axios.get(API_URL, { ...config, params });
  return res.data;
};

const updateSettingsBulk = async (category, values, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const res = await axios.put(`${API_URL}/bulk`, { category, values }, config);
  return res.data;
};

const uploadSettingAsset = async (file, token) => {
  const formData = new FormData();
  formData.append("settingsAsset", file); // must match multer's file.fieldname branch
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const res = await axios.put(`${API_URL}/upload-asset`, formData, config);
  return res.data; // { path }
};

const settingService = {
  getPublicSettings,
  getSettings,
  updateSettingsBulk,
  uploadSettingAsset,
};
export default settingService;
