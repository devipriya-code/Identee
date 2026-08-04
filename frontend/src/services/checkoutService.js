import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${BACKEND_URL}/api`;

const authConfig = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// Preview a coupon's discount % before payment (GET /api/offers/:couponCode)
const validateCoupon = async (couponCode, token) => {
  const response = await axios.get(
    `${API_URL}/offers/${couponCode}`,
    authConfig(token),
  );
  return response.data;
};

// Creates the Razorpay order — backend computes subtotal, CGST/SGST,
// shipping cost (from shippingAddress.state), and coupon discount.
const createRazorpayOrder = async (
  { shippingAddress, couponCode, buyNowProductId, buyNowCustomizationId, qty },
  token,
) => {
  const response = await axios.post(
    `${API_URL}/orders/razorpay`,
    {
      shippingAddress,
      couponCode,
      buyNowProductId,
      buyNowCustomizationId,
      qty,
    },
    authConfig(token),
  );
  return response.data;
};

const verifyRazorpayPayment = async (paymentData, token) => {
  const response = await axios.post(
    `${API_URL}/orders/razorpay/verify`,
    paymentData,
    authConfig(token),
  );
  return response.data;
};

const checkoutService = {
  validateCoupon,
  createRazorpayOrder,
  verifyRazorpayPayment,
};

export default checkoutService;
