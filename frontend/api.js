import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  withCredentials: true,
});

const img = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});

export default api;
export { img };