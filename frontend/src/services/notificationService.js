import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${BACKEND_URL}/api/notifications`;

const getNotifications = async (token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  return (await axios.get(API_URL, config)).data;
};

const getUnreadCount = async (token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  return (await axios.get(`${API_URL}/unread-count`, config)).data;
};

const markAsRead = async (id, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  return (await axios.put(`${API_URL}/${id}/read`, {}, config)).data;
};

const markAllAsRead = async (token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  return (await axios.put(`${API_URL}/read-all`, {}, config)).data;
};

export default { getNotifications, getUnreadCount, markAsRead, markAllAsRead };
