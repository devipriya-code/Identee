// components/AdminTopbar.jsx
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import logo from "../assets/identee-logo.png"; // 👉 swap this file to change the logo everywhere it's used here

export default function AdminTopbar() {
  const navigate = useNavigate();
  // NOTE: authSlice's initialState key is `user`, not `userInfo`.
  const { user } = useSelector((state) => state.auth);

  // Whatever admin page you're currently on, this always goes back ONE step
  // in browser history — not to a fixed route.
  const handleBack = () => navigate(-1);

  // Opens the live storefront in a new tab so the admin can see how
  // their changes look to a real shopper.
  const handlePreview = () => {
    window.open("/", "_blank", "noopener,noreferrer");
  };

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    window.dispatchEvent(new Event("storage"));
    navigate("/login", { replace: true });
  };

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 28px",
        background: "transparent", // ← background removed, as requested
        borderBottom: "1px solid #E5E5E5",
      }}
    >
      {/* Left: logo */}
      <img
        src={logo}
        alt="Logo"
        style={{ height: 80, width: "60", objectFit: "contain" }}
      />

      {/* Right: admin name + action buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: "#1A1A1A" }}>
          {user?.name || "admin"}
        </span>

        <button onClick={handlePreview} style={btnStyle("#111111", "#FFFFFF")}>
          Preview
        </button>
        <button onClick={handleBack} style={btnStyle("#14B8A6", "#FFFFFF")}>
          Back
        </button>
        <button onClick={handleLogout} style={btnStyle("#E879F9", "#1A1A1A")}>
          Logout
        </button>
      </div>
    </header>
  );
}

const btnStyle = (bg, color) => ({
  background: bg,
  color,
  border: "none",
  borderRadius: 10,
  padding: "9px 20px",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "'Inter', sans-serif",
});
