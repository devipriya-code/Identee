import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const API_URL = `${BACKEND_URL}/api/users`;

// REGISTER
const register = async (userData) => {
  const response = await axios.post(API_URL, userData);

  if (response.data) {
    localStorage.setItem("userInfo", JSON.stringify(response.data));
  }

  return response.data;
};

// LOGIN
const login = async (userData) => {
  const response = await axios.post(`${API_URL}/login`, userData);

  if (response.data) {
    localStorage.setItem("userInfo", JSON.stringify(response.data));
  }

  return response.data;
};

// GET PROFILE
const getProfile = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(`${API_URL}/profile`, config);

  return response.data;
};

// UPDATE PROFILE
const updateProfile = async (profileData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  };

  const response = await axios.put(`${API_URL}/profile`, profileData, config);

  localStorage.setItem("userInfo", JSON.stringify(response.data));

  return response.data;
};

// SEND OTP
const sendOtp = async (emailData) => {
  const response = await axios.post(`${API_URL}/sendOtp`, emailData);

  return response.data;
};

// VERIFY OTP
const verifyOtp = async (otpData) => {
  const response = await axios.post(`${API_URL}/verifyOtp`, otpData);

  return response.data;
};

// FORGOT PASSWORD
const forgotPassword = async (emailData) => {
  const response = await axios.post(`${API_URL}/forgotPassword`, emailData);

  return response.data;
};

// RESET PASSWORD
const resetPassword = async (resetData) => {
  const response = await axios.post(`${API_URL}/resetPassword`, resetData);

  return response.data;
};

// LOGOUT
const logout = () => {
  localStorage.removeItem("userInfo");
};

const authService = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
};

export default authService;
