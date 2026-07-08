// App.jsx
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
import Navbar from "./components/Navbar";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProductUploadPage from "./pages/admin/ProductUploadPage";
import ProductListPage from "./pages/admin/ProductListPage";
import OfferBannerPage from "./pages/admin/OfferBannerPage";
import VideoBannerPage from "./pages/admin/VideoBannerPage";
import CategoryBannerPage from "./pages/admin/CategoryBannerPage";
import Home from "./pages/Home";
import CategoryProductsPage from "./pages/CategoryProductsPage";
import SingleProductPage from "./pages/SingleProductPage";
import CustomizePage from "./pages/CustomizePage";
import AdminUsersPage from "./pages/admin/AdminUserPage";
import AdminEditUserPage from "./pages/admin/AdminEditUserPage";
import AdminUserDetailsPage from "./pages/admin/AdminUserDetailsPage";
import BuyNowPage from "./pages/BuyNowPage";
import FavoritesPage from "./pages/FavoritesPage";
import CartPage from "./pages/CartPage";
import AllProductsPage from "./pages/AllProductsPage";
import Account from "./pages/Account";
import ChooseProductPage from "./pages/ChooseProductPage";
import ChooseColorPage from "./pages/ChooseColorPage";

const OrdersPage = () => (
  <PlaceholderAdminPage
    title="Orders"
    desc="Wire your orders API + table here."
  />
);

const TransactionsPage = () => (
  <PlaceholderAdminPage
    title="Transactions"
    desc="Wire your transactions API + table here."
  />
);

const SellersPage = () => (
  <PlaceholderAdminPage
    title="Sellers"
    desc="Wire your sellers API + table here."
  />
);

function PlaceholderAdminPage({ title, desc }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0B0B0C",
        color: "#F3EFE6",
        padding: "32px 40px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#C9A24B",
        }}
      >
        Admin
      </p>
      <h1
        style={{
          margin: "4px 0 0",
          fontSize: 26,
          fontWeight: 600,
          fontFamily: "'Cormorant Garamond', serif",
        }}
      >
        {title}
      </h1>
      <p style={{ margin: "10px 0 0", fontSize: 14, color: "#8A877F" }}>
        {desc}
      </p>
    </div>
  );
}

const SellerDashboard = () => (
  <div
    className="min-h-screen flex items-center justify-center"
    style={{ background: "#0B0B0C", color: "#8A877F" }}
  >
    <p className="text-lg font-medium">
      📦 Seller Dashboard — wire your component here
    </p>
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
// ──────────────────────────────────────────────────────────────────────────

// ── Customer layout: Navbar + page content ──────────────────────────────
const CustomerLayout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

// ── Auth helpers ──────────────────────────────────────────────────────────
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

// Guests only — already-logged-in users get bounced to their dashboard
const GuestRoute = ({ children }) => {
  const user = getUserInfo();
  if (!user) return children;
  if (user.isAdmin) return <Navigate to="/admin/dashboard" replace />;
  if (user.isSeller) return <Navigate to="/seller/dashboard" replace />;
  return <Navigate to="/" replace />;
};
// ──────────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public: auth pages (only for guests) */}
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

        {/* Everything with the Navbar — Home is PUBLIC (no login required) */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Home />} />
          <Route
            path="/category/:categoryName"
            element={<CategoryProductsPage />}
            
          />
          <Route path="/customize/:id" element={<CustomizePage />} />
          <Route path="/choose-product" element={<ChooseProductPage />} />
          <Route path="/choose-color/:id" element={<ChooseColorPage />} />
          <Route path="/product/:id" element={<SingleProductPage />} />
          <Route path="/buy-now/:id" element={<BuyNowPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/products" element={<AllProductsPage />} />
          <Route path="/account" element={<Account />} />
          <Route path="/cart" element={<CartPage />} />
          
        </Route>

        {/* Admin routes — AdminSidebar layout wraps every /admin/* page */}
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
          <Route path="products" element={<ProductListPage />} />
          <Route path="offer-banner" element={<OfferBannerPage />} />
          <Route path="video-banner" element={<VideoBannerPage />} />
          <Route path="category-banner" element={<CategoryBannerPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="users/:id" element={<AdminUserDetailsPage />} />
          <Route path="users/:id/edit" element={<AdminEditUserPage />} />
          <Route path="sellers" element={<SellersPage />} />
        </Route>

        {/* Seller routes */}
        <Route
          path="/seller/dashboard"
          element={
            <SellerRoute>
              <SellerDashboard />
            </SellerRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
