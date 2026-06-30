import React, { useState } from "react"; // ← ADD THIS
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import HomePage from "./pages/HomePage";
import Navbar from "./components/Navbar";

// ─── Admin Imports ────────────────────────────────────────────
import AdminSidebar from "./components/AdminSidebar";
import AdminDashboard from "./pages/AdminDashboard";
import ProductUploadPage from "./pages/ProductUploadPage";

// ── Auth helpers ──────────────────────────────────────────────
const getUserInfo = () => {
  try {
    const raw = localStorage.getItem("userInfo");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed._id && parsed.email) return parsed;
    return null;
  } catch {
    return null;
  }
};

// ── Route guards ──────────────────────────────────────────────
const GuestRoute = ({ children }) => {
  const user = getUserInfo();
  if (user) return <Navigate to="/" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const user = getUserInfo();
  if (!user) return <Navigate to="/login" replace />;
  if (!user.isAdmin) return <Navigate to="/" replace />;
  return children;
};

// ── Layouts ────────────────────────────────────────────────────
const MainLayout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false); // ← fixed
  const toggle = () => setCollapsed(!collapsed);

  return (
    <div style={{ display: "flex" }}>
      <AdminSidebar collapsed={collapsed} onToggle={toggle} />
      <main
        style={{
          marginLeft: collapsed ? "64px" : "220px",
          padding: "24px",
          flex: 1,
          minHeight: "100vh",
          background: "#f8fafc",
          transition: "margin-left 0.22s cubic-bezier(.4,0,.2,1)",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

// ── Placeholders ──────────────────────────────────────────────
const SellerDashboard = () => (
  <div
    className="min-h-screen flex items-center justify-center"
    style={{ background: "#0B0B0C", color: "#8A877F" }}
  >
    <p className="text-lg font-medium">📦 Seller Dashboard</p>
  </div>
);

const NotFound = () => (
  <div
    className="min-h-screen flex items-center justify-center"
    style={{ background: "#0B0B0C", color: "#8A877F" }}
  >
    <p className="text-lg">404 — Page not found</p>
  </div>
);

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes with navbar */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
        </Route>

        {/* Auth pages (guest only) */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Admin routes (protected) */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="upload-product" element={<ProductUploadPage />} />
          {/* add other admin routes here */}
        </Route>

        {/* Seller route (optional) */}
        <Route path="/seller/dashboard" element={<SellerDashboard />} />

        {/* 404 – must be last */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
