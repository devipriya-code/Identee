import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";

// ── Placeholder pages (replace with your real components) ──────────────────
const CustomerHome = () => (
  <div className="min-h-screen flex items-center justify-center text-gray-700">
    <p className="text-lg font-medium">
      🛍️ Customer Home — wire your component here
    </p>
  </div>
);

const AdminDashboard = () => (
  <div className="min-h-screen flex items-center justify-center text-gray-700">
    <p className="text-lg font-medium">
      🛠️ Admin Dashboard — wire your component here
    </p>
  </div>
);

const SellerDashboard = () => (
  <div className="min-h-screen flex items-center justify-center text-gray-700">
    <p className="text-lg font-medium">
      📦 Seller Dashboard — wire your component here
    </p>
  </div>
);

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center text-gray-500">
    <p className="text-lg">404 — Page not found</p>
  </div>
);
// ──────────────────────────────────────────────────────────────────────────

// ── Auth helpers ──────────────────────────────────────────────────────────
const getUserInfo = () => {
  try {
    return JSON.parse(localStorage.getItem("userInfo"));
  } catch {
    return null;
  }
};

// Redirect to login if not authenticated
const PrivateRoute = ({ children }) => {
  const user = getUserInfo();
  return user ? children : <Navigate to="/login" replace />;
};

// Redirect non-admins away from admin routes
const AdminRoute = ({ children }) => {
  const user = getUserInfo();
  if (!user) return <Navigate to="/login" replace />;
  if (!user.isAdmin) return <Navigate to="/" replace />;
  return children;
};

// Redirect non-sellers away from seller routes
const SellerRoute = ({ children }) => {
  const user = getUserInfo();
  if (!user) return <Navigate to="/login" replace />;
  if (!user.isSeller) return <Navigate to="/" replace />;
  return children;
};

// Redirect already-logged-in users away from login page
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
        {/* Public: login */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />

        {/* Customer routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <CustomerHome />
            </PrivateRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

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
