import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import ProductUpload from "./pages/ProductUploadPage";
import AdminSidebar from "./components/AdminSidebar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// ── Placeholder pages ─────────────────────────
const CustomerHome = () => (
  <div className="min-h-screen flex items-center justify-center text-gray-700">
    <p className="text-lg font-medium">🛍️ Customer Home</p>
  </div>
);

const AdminDashboard = () => (
  <div className="text-gray-700">
    <p className="text-lg font-medium">🛠️ Admin Dashboard</p>
  </div>
);

const SellerDashboard = () => (
  <div className="min-h-screen flex items-center justify-center text-gray-700">
    <p className="text-lg font-medium">📦 Seller Dashboard</p>
  </div>
);

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center text-gray-500">
    <p className="text-lg">404 — Page not found</p>
  </div>
);

// ── Auth helpers ──────────────────────────────
const getUserInfo = () => {
  try {
    return JSON.parse(localStorage.getItem("userInfo"));
  } catch {
    return null;
  }
};

const PrivateRoute = ({ children }) => {
  const user = getUserInfo();
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const user = getUserInfo();
  if (!user) return <Navigate to="/login" replace />;
  if (!user.isAdmin) return <Navigate to="/" replace />;
  return children;
};

const SellerRoute = ({ children }) => {
  const user = getUserInfo();
  if (!user) return <Navigate to="/login" replace />;
  if (!user.isSeller) return <Navigate to="/" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const user = getUserInfo();
  if (!user) return children;
  if (user.isAdmin) return <Navigate to="/admin/upload-product" replace />;
  if (user.isSeller) return <Navigate to="/seller/dashboard" replace />;
  return <Navigate to="/" replace />;
};

// ── Admin Layout with Sidebar ─────────────────
const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />
      <main
        style={{
          marginLeft: collapsed ? 64 : 220,
          transition: "margin-left 0.22s cubic-bezier(.4,0,.2,1)",
          // No padding here — each page owns its own spacing
          padding: 0,
          flex: 1,
          minHeight: "100vh",
          background: "#080a12",
          // Prevent content from overflowing into sidebar
          minWidth: 0,
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

// ── App ───────────────────────────────────────
export default function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Login */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />

        {/* Customer */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <CustomerHome />
            </PrivateRoute>
          }
        />

        {/* Admin with Sidebar */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="upload-product" element={<ProductUpload />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route
            index
            element={<Navigate to="/admin/upload-product" replace />}
          />
        </Route>

        {/* Seller */}
        <Route
          path="/seller/dashboard"
          element={
            <SellerRoute>
              <SellerDashboard />
            </SellerRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App
