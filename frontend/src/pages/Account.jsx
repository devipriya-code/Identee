// pages/Account.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const MENU = [
  { key: "profile", label: "Profile", icon: "👤" },
  { key: "subscriptions", label: "Subscriptions", icon: "🎟️" },
  { key: "address", label: "Address", icon: "📍" },
  { key: "orders", label: "My Orders", icon: "🛍️" },
  { key: "return-policy", label: "Return Policy", icon: "↩️" },
  { key: "about", label: "About", icon: "ℹ️" },
  { key: "contact", label: "Contact Us", icon: "📞" },
];

const TIERS = [
  { key: "explorer", label: "Explorer", sub: "Order 3 times to enroll", icon: "⭐" },
  { key: "trendsetter", label: "Trendsetter", sub: "Order 5 times to enroll", icon: "🎖️" },
  { key: "icon", label: "Icon", sub: "Order 10 times to enroll", icon: "👑" },
];

export default function Account() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  // TODO: wire these up to your auth/user redux slice + API
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dob: "",
    gender: "Male",
  });
  const [avatarPreview, setAvatarPreview] = useState(null);

  const handleChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  const handleUpdate = () => {
    // TODO: dispatch an update-profile thunk here
    console.log("updating profile", form);
  };

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    window.dispatchEvent(new Event("storage"));
    navigate("/");
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "320px 1fr",
        gap: 24,
        maxWidth: 1100,
        margin: "32px auto",
        padding: "0 16px",
      }}
    >
      {/* ── Left: tiers + menu ── */}
      <div
        style={{
          border: "1px solid #E5E5E5",
          borderRadius: 12,
          overflow: "hidden",
          background: "#FFFFFF",
        }}
      >
        {/* Tier banner */}
        <div style={{ background: "#5C0F35", padding: "20px 16px 14px", color: "#FFF" }}>
          <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
            {TIERS.map((t) => (
              <div key={t.key} style={{ flex: 1 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "#E11D48",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 6px",
                    fontSize: 18,
                  }}
                >
                  {t.icon}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.03em" }}>
                  {t.label.toUpperCase()}
                </div>
                <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>{t.sub}</div>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 14,
              textAlign: "center",
              fontSize: 12,
              fontWeight: 600,
              background: "#4A0C2A",
              padding: "8px 6px",
              borderRadius: 6,
            }}
          >
            You are just 3 orders away from becoming <b>EXPLORER!</b>
          </div>
        </div>

        {/* Menu */}
        <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
          {MENU.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  textAlign: "left",
                  background: isActive ? "#111111" : "#EEF0F2",
                  color: isActive ? "#FFFFFF" : "#1A1A1A",
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            );
          })}

          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 14px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 700,
              textAlign: "left",
              background: "#EF4444",
              color: "#FFFFFF",
              marginTop: 4,
            }}
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      </div>

      {/* ── Right: profile form ── */}
      <div
        style={{
          border: "1px solid #E5E5E5",
          borderRadius: 12,
          background: "#FFFFFF",
          padding: 28,
        }}
      >
        {/* Avatar */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <div style={{ position: "relative" }}>
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: "50%",
                background: "#CBD5E1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
                fontWeight: 700,
                color: "#FFFFFF",
                overflow: "hidden",
              }}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="avatar"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                form.firstName?.[0]?.toUpperCase() || "I"
              )}
            </div>
            <label
              htmlFor="avatar-upload"
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "#111111",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                border: "2px solid #FFFFFF",
              }}
            >
              📷
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
              />
            </label>
          </div>
        </div>

        <Field label="First Name">
          <input
            value={form.firstName}
            onChange={handleChange("firstName")}
            placeholder="Enter your first name"
            style={inputStyle}
          />
        </Field>

        <Field label="Last Name">
          <input
            value={form.lastName}
            onChange={handleChange("lastName")}
            placeholder="Enter your last name"
            style={inputStyle}
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            value={form.email}
            onChange={handleChange("email")}
            placeholder="you@example.com"
            style={inputStyle}
          />
        </Field>

        <Field label="Date of Birth">
          <input
            type="date"
            value={form.dob}
            onChange={handleChange("dob")}
            style={inputStyle}
          />
        </Field>

        <Field label="Gender">
          <select value={form.gender} onChange={handleChange("gender")} style={inputStyle}>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </Field>

        <button
          onClick={handleUpdate}
          style={{
            width: "100%",
            padding: "14px 0",
            marginTop: 8,
            background: "#111111",
            color: "#FFFFFF",
            border: "none",
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Update
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label
        style={{
          display: "block",
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 6,
          color: "#1A1A1A",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #D1D5DB",
  borderRadius: 8,
  fontSize: 14,
  color: "#1A1A1A",
  boxSizing: "border-box",
};