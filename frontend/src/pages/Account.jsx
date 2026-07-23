// pages/Account.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
  {
    key: "explorer",
    label: "Explorer",
    sub: "Order 3 times to enroll",
    icon: "⭐",
  },
  {
    key: "trendsetter",
    label: "Trendsetter",
    sub: "Order 5 times to enroll",
    icon: "🎖️",
  },
  { key: "icon", label: "Icon", sub: "Order 10 times to enroll", icon: "👑" },
];

const emptyAddress = {
  doorNo: "",
  street: "",
  nearestLandmark: "",
  city: "",
  state: "",
  pin: "",
  phoneNumber: "",
  isDefault: false,
};

export default function Account() {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth); // expects user.token from login/register response
  const [activeTab, setActiveTab] = useState("profile");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const [form, setForm] = useState({
    name: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    gender: "Male",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [addresses, setAddresses] = useState([]);
  const [editingAddress, setEditingAddress] = useState(null); // index or "new"
  const [addressForm, setAddressForm] = useState(emptyAddress);

  const authToken = user?.token;

  // ── Load profile from backend on mount ─────────────────────────
  useEffect(() => {
    if (!authToken) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    fetch(`${BACKEND_URL}/api/users/profile`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not load profile");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setForm({
          name: data.name || "",
          lastName: data.lastName || "",
          email: data.email || "",
          dateOfBirth: data.dateOfBirth
            ? new Date(data.dateOfBirth).toISOString().split("T")[0]
            : "",
          gender: data.gender || "Male",
        });
        setAddresses(Array.isArray(data.addresses) ? data.addresses : []);
        if (data.profilePicture) {
          setAvatarPreview(`${BACKEND_URL}${data.profilePicture}`);
        }
      })
      .catch((err) => {
        if (!cancelled) setMsg({ type: "error", text: err.message });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authToken]);

  const handleChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // ── Save profile fields (name/lastName/email/dob/gender/avatar) ─
  const saveToBackend = async (extraFormData) => {
    if (!authToken) {
      setMsg({ type: "error", text: "Please log in again." });
      return null;
    }
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("lastName", form.lastName);
    fd.append("email", form.email);
    if (form.dateOfBirth) fd.append("dateOfBirth", form.dateOfBirth);
    fd.append("gender", form.gender);
    if (avatarFile) fd.append("profilePicture", avatarFile);

    // allow callers (address save) to override/add fields, e.g. addresses JSON
    if (extraFormData) {
      for (const [key, value] of extraFormData.entries()) {
        fd.append(key, value);
      }
    }

    const res = await fetch(`${BACKEND_URL}/api/users/profile`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${authToken}` },
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Update failed");
    return data;
  };

  const handleUpdate = async () => {
    setMsg(null);
    setSaving(true);
    try {
      const updated = await saveToBackend();
      setMsg({ type: "ok", text: "Profile updated successfully." });
      if (updated?.profilePicture) {
        setAvatarPreview(`${BACKEND_URL}${updated.profilePicture}`);
      }
      setAvatarFile(null);
    } catch (err) {
      setMsg({ type: "error", text: err.message || "Something went wrong." });
    } finally {
      setSaving(false);
    }
  };

  // ── Address handlers ─────────────────────────────────────────
  const openNewAddress = () => {
    setAddressForm(emptyAddress);
    setEditingAddress("new");
  };

  const openEditAddress = (idx) => {
    setAddressForm({ ...addresses[idx] });
    setEditingAddress(idx);
  };

  const cancelAddressEdit = () => {
    setEditingAddress(null);
    setAddressForm(emptyAddress);
  };

  const persistAddresses = async (nextAddresses) => {
    setMsg(null);
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("addresses", JSON.stringify(nextAddresses));
      const updated = await saveToBackend(fd);
      setAddresses(updated?.addresses || nextAddresses);
      setMsg({ type: "ok", text: "Address saved." });
      cancelAddressEdit();
    } catch (err) {
      setMsg({ type: "error", text: err.message || "Could not save address." });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAddress = () => {
    if (!addressForm.state || !addressForm.city || !addressForm.pin) {
      setMsg({ type: "error", text: "City, State and PIN are required." });
      return;
    }

    const cleaned = {
      ...addressForm,
      pin: addressForm.pin ? Number(addressForm.pin) : null,
      phoneNumber: addressForm.phoneNumber
        ? Number(addressForm.phoneNumber)
        : null,
    };

    let next;
    if (editingAddress === "new") {
      next = [...addresses, cleaned];
    } else {
      next = addresses.map((a, i) => (i === editingAddress ? cleaned : a));
    }

    // if this one is marked default, unmark others
    if (cleaned.isDefault) {
      next = next.map((a, i) =>
        a === cleaned || (editingAddress !== "new" && i === editingAddress)
          ? { ...a, isDefault: true }
          : { ...a, isDefault: false },
      );
    }

    persistAddresses(next);
  };

  const handleDeleteAddress = (idx) => {
    const next = addresses.filter((_, i) => i !== idx);
    persistAddresses(next);
  };

  const handleSetDefault = (idx) => {
    const next = addresses.map((a, i) => ({ ...a, isDefault: i === idx }));
    persistAddresses(next);
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
          height: "fit-content",
        }}
      >
        <div
          style={{
            background: "#5C0F35",
            padding: "20px 16px 14px",
            color: "#FFF",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              textAlign: "center",
            }}
          >
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
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.03em",
                  }}
                >
                  {t.label.toUpperCase()}
                </div>
                <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>
                  {t.sub}
                </div>
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

        <div
          style={{
            padding: 10,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
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

      {/* ── Right: content ── */}
      <div
        style={{
          border: "1px solid #E5E5E5",
          borderRadius: 12,
          background: "#FFFFFF",
          padding: 28,
        }}
      >
        {loading && <p style={{ color: "#71695B" }}>Loading…</p>}

        {!loading && msg && (
          <p
            style={{
              color: msg.type === "ok" ? "#3E7C4A" : "#B3432B",
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            {msg.text}
          </p>
        )}

        {!loading && activeTab === "profile" && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 24,
              }}
            >
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
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    form.name?.[0]?.toUpperCase() || "I"
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
                value={form.name}
                onChange={handleChange("name")}
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
                value={form.dateOfBirth}
                onChange={handleChange("dateOfBirth")}
                style={inputStyle}
              />
            </Field>

            <Field label="Gender">
              <select
                value={form.gender}
                onChange={handleChange("gender")}
                style={inputStyle}
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </Field>

            <button
              onClick={handleUpdate}
              disabled={saving}
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
                cursor: saving ? "wait" : "pointer",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "SAVING…" : "Update"}
            </button>
          </>
        )}

        {!loading && activeTab === "address" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
                Saved Addresses
              </h3>
              {editingAddress === null && (
                <button onClick={openNewAddress} style={smallBtnStyle}>
                  + Add New
                </button>
              )}
            </div>

            {editingAddress === null && addresses.length === 0 && (
              <p style={{ color: "#71695B" }}>No addresses saved yet.</p>
            )}

            {editingAddress === null &&
              addresses.map((addr, idx) => (
                <div
                  key={idx}
                  style={{
                    border: "1px solid #E5E5E5",
                    borderRadius: 10,
                    padding: 14,
                    marginBottom: 12,
                    position: "relative",
                  }}
                >
                  {addr.isDefault && (
                    <span
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#111111",
                        background: "#EEF0F2",
                        padding: "2px 8px",
                        borderRadius: 999,
                      }}
                    >
                      DEFAULT
                    </span>
                  )}
                  <p style={{ margin: 0, fontWeight: 600 }}>
                    {addr.doorNo}, {addr.street}
                  </p>
                  {addr.nearestLandmark && (
                    <p
                      style={{
                        margin: "2px 0",
                        fontSize: 13,
                        color: "#71695B",
                      }}
                    >
                      Near {addr.nearestLandmark}
                    </p>
                  )}
                  <p
                    style={{ margin: "2px 0", fontSize: 13, color: "#71695B" }}
                  >
                    {addr.city}, {addr.state} - {addr.pin}
                  </p>
                  {addr.phoneNumber && (
                    <p
                      style={{
                        margin: "2px 0",
                        fontSize: 13,
                        color: "#71695B",
                      }}
                    >
                      📞 {addr.phoneNumber}
                    </p>
                  )}

                  <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                    <button
                      onClick={() => openEditAddress(idx)}
                      style={linkBtnStyle}
                    >
                      Edit
                    </button>
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefault(idx)}
                        style={linkBtnStyle}
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteAddress(idx)}
                      style={{ ...linkBtnStyle, color: "#B3432B" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

            {editingAddress !== null && (
              <div
                style={{
                  border: "1px solid #E5E5E5",
                  borderRadius: 10,
                  padding: 16,
                }}
              >
                <Field label="Door No.">
                  <input
                    value={addressForm.doorNo}
                    onChange={(e) =>
                      setAddressForm((f) => ({ ...f, doorNo: e.target.value }))
                    }
                    style={inputStyle}
                  />
                </Field>
                <Field label="Street">
                  <input
                    value={addressForm.street}
                    onChange={(e) =>
                      setAddressForm((f) => ({ ...f, street: e.target.value }))
                    }
                    style={inputStyle}
                  />
                </Field>
                <Field label="Nearest Landmark">
                  <input
                    value={addressForm.nearestLandmark}
                    onChange={(e) =>
                      setAddressForm((f) => ({
                        ...f,
                        nearestLandmark: e.target.value,
                      }))
                    }
                    style={inputStyle}
                  />
                </Field>
                <Field label="City">
                  <input
                    value={addressForm.city}
                    onChange={(e) =>
                      setAddressForm((f) => ({ ...f, city: e.target.value }))
                    }
                    style={inputStyle}
                  />
                </Field>
                <Field label="State">
                  <input
                    value={addressForm.state}
                    onChange={(e) =>
                      setAddressForm((f) => ({ ...f, state: e.target.value }))
                    }
                    placeholder="e.g. Tamil Nadu"
                    style={inputStyle}
                  />
                </Field>
                <Field label="PIN Code">
                  <input
                    value={addressForm.pin}
                    onChange={(e) =>
                      setAddressForm((f) => ({ ...f, pin: e.target.value }))
                    }
                    style={inputStyle}
                  />
                </Field>
                <Field label="Phone Number">
                  <input
                    value={addressForm.phoneNumber}
                    onChange={(e) =>
                      setAddressForm((f) => ({
                        ...f,
                        phoneNumber: e.target.value,
                      }))
                    }
                    style={inputStyle}
                  />
                </Field>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 18,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) =>
                      setAddressForm((f) => ({
                        ...f,
                        isDefault: e.target.checked,
                      }))
                    }
                  />
                  Set as default address
                </label>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={handleSaveAddress}
                    disabled={saving}
                    style={{
                      flex: 1,
                      padding: "12px 0",
                      background: "#111111",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 700,
                      cursor: saving ? "wait" : "pointer",
                    }}
                  >
                    {saving ? "SAVING…" : "Save Address"}
                  </button>
                  <button
                    onClick={cancelAddressEdit}
                    disabled={saving}
                    style={{
                      flex: 1,
                      padding: "12px 0",
                      background: "#EEF0F2",
                      color: "#1A1A1A",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 700,
                      cursor: saving ? "wait" : "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && !["profile", "address"].includes(activeTab) && (
          <p style={{ color: "#71695B" }}>
            {MENU.find((m) => m.key === activeTab)?.label} — coming soon.
          </p>
        )}
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

const smallBtnStyle = {
  padding: "8px 14px",
  background: "#111111",
  color: "#FFFFFF",
  border: "none",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};

const linkBtnStyle = {
  background: "none",
  border: "none",
  padding: 0,
  fontSize: 13,
  fontWeight: 600,
  color: "#1A2A4A",
  textDecoration: "underline",
  cursor: "pointer",
};
                                                                                                                                       