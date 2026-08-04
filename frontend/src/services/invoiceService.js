import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${BACKEND_URL}/api/orders`;

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// GET — idempotent: returns the existing invoice if one was already
// generated for this order, otherwise creates and returns a new one.
const generateInvoice = async (orderId, token) => {
  const res = await axios.get(
    `${API_URL}/admin/order/${orderId}/invoice`,
    authHeader(token),
  );
  return res.data;
};

const getAllInvoices = async (token) => {
  const res = await axios.get(`${API_URL}/admin/invoices`, authHeader(token));
  return res.data;
};

const emailInvoice = async (orderId, token) => {
  const res = await axios.post(
    `${API_URL}/admin/order/${orderId}/invoice/email`,
    {},
    authHeader(token),
  );
  return res.data;
};

const invoiceService = { generateInvoice, getAllInvoices, emailInvoice };
export default invoiceService;
