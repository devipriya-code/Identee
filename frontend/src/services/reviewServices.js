// services/reviewService.js
// Same conventions as your existing invoiceService.js: axios, BACKEND_URL
// env var, token passed in explicitly (pulled from redux by the caller).

import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${BACKEND_URL}/api/products`;

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// ── Customer ────────────────────────────────────────────────────────────

// formData must include: rating, comment, orderId, recommend, images[]
const submitReview = async (productId, formData, token) => {
  const res = await axios.post(`${API_URL}/${productId}/reviews`, formData, {
    headers: { Authorization: `Bearer ${token}` }, // let axios set multipart boundary itself
  });
  return res.data;
};

const getReviewEligibility = async (orderId, token) => {
  const res = await axios.get(
    `${API_URL}/reviews/eligibility/${orderId}`,
    authHeader(token),
  );
  return res.data;
};

const markHelpful = async (productId, reviewId, token) => {
  const res = await axios.put(
    `${API_URL}/${productId}/reviews/${reviewId}/helpful`,
    {},
    authHeader(token),
  );
  return res.data;
};

const markNotHelpful = async (productId, reviewId, token) => {
  const res = await axios.put(
    `${API_URL}/${productId}/reviews/${reviewId}/not-helpful`,
    {},
    authHeader(token),
  );
  return res.data;
};

// ── Public ──────────────────────────────────────────────────────────────

const getFeaturedReviews = async () => {
  const res = await axios.get(`${API_URL}/reviews/featured`);
  return res.data;
};

// ── Admin ───────────────────────────────────────────────────────────────

// params: { status, rating, productId, search }
const getAllReviews = async (params, token) => {
  const res = await axios.get(`${API_URL}/reviews/all`, {
    ...authHeader(token),
    params,
  });
  return res.data; // { stats, reviews }
};

const getPendingReviewsCount = async (token) => {
  const res = await axios.get(
    `${API_URL}/reviews/pending-count`,
    authHeader(token),
  );
  return res.data; // { pending }
};

const approveReview = async (productId, reviewId, token) => {
  const res = await axios.put(
    `${API_URL}/${productId}/reviews/${reviewId}/approve`,
    {},
    authHeader(token),
  );
  return res.data;
};

const rejectReview = async (productId, reviewId, reason, token) => {
  const res = await axios.put(
    `${API_URL}/${productId}/reviews/${reviewId}/reject`,
    { reason },
    authHeader(token),
  );
  return res.data;
};

const unapproveReview = async (productId, reviewId, token) => {
  const res = await axios.put(
    `${API_URL}/${productId}/reviews/${reviewId}/unapprove`,
    {},
    authHeader(token),
  );
  return res.data;
};

const toggleFeaturedReview = async (productId, reviewId, token) => {
  const res = await axios.put(
    `${API_URL}/${productId}/reviews/${reviewId}/feature`,
    {},
    authHeader(token),
  );
  return res.data;
};

const respondToReview = async (productId, reviewId, text, token) => {
  const res = await axios.put(
    `${API_URL}/${productId}/reviews/${reviewId}/response`,
    { text },
    authHeader(token),
  );
  return res.data;
};

const deleteReview = async (reviewId, token) => {
  const res = await axios.delete(
    `${API_URL}/reviews/${reviewId}`,
    authHeader(token),
  );
  return res.data;
};

const reviewService = {
  submitReview,
  getReviewEligibility,
  markHelpful,
  markNotHelpful,
  getFeaturedReviews,
  getAllReviews,
  getPendingReviewsCount,
  approveReview,
  rejectReview,
  unapproveReview,
  toggleFeaturedReview,
  respondToReview,
  deleteReview,
};

export default reviewService;
