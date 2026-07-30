import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${BACKEND_URL}/api/shipping`;

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

const getShippingCost = async () => {
  const res = await axios.get(`${API_URL}/getshippingcost`);
  return res.data;
};

const addState = async ({ state, cost }, token) => {
  const res = await axios.post(
    `${API_URL}/addstate`,
    { state, cost },
    authHeader(token),
  );
  return res.data;
};

const updateState = async (id, cost, token) => {
  const res = await axios.put(
    `${API_URL}/updatestate/${id}`,
    { cost },
    authHeader(token),
  );
  return res.data;
};

const deleteState = async (id, token) => {
  const res = await axios.delete(
    `${API_URL}/deletestate/${id}`,
    authHeader(token),
  );
  return res.data;
};

const updateFreeShipping = async (freeShippingAbove, token) => {
  const res = await axios.put(
    `${API_URL}/updatefreeshipping`,
    { freeShippingAbove },
    authHeader(token),
  );
  return res.data;
};

const shippingService = {
  getShippingCost,
  addState,
  updateState,
  deleteState,
  updateFreeShipping,
};

export default shippingService;
