// components/AdminTopbar.jsx
import { useNavigate } from "react-router-dom";
import logo from "../assets/identee-logo.png";

export default function AdminTopbar() {
  const navigate = useNavigate();

  const handleBack = () => navigate(-1);
  const handlePreview = () => window.open("/", "_blank", "noopener,noreferrer");
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
        background: "transparent",
        borderBottom: "1px solid #E5E5E5",
      }}
    >
      <img
        src={logo}
        alt="Logo"
        style={{ height: 80, width: "60", objectFit: "contain" }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
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
