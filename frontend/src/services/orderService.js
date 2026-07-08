import api from "../../api.js";

const createOrder = async (orderData, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const { data } = await api.post("/orders", orderData, config);
  return data;
};

const getMyOrders = async (token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const { data } = await api.get("/orders/myorders", config);
  return data;
};

const getOrderById = async (id, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const { data } = await api.get(`/orders/${id}`, config);
  return data;
};

const orderService = { createOrder, getMyOrders, getOrderById };
export default orderService;