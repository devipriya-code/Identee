import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { THEME, inputStyle, labelStyle } from "../../../theme/theme";
import profileService from "../../../services/profileService";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ProfileSettingsPage() {
  const { user } = useSelector((s) => s.auth);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    if (!user?.token) return;
    profileService
      .getProfile(user.token)
      .then((data) =>
        setForm({
          name: data.name || "",
          lastName: data.lastName || "",
          email: data.email || "",
          gender: data.gender || "Male",
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.slice(0, 10) : "",
          profilePicture: data.profilePicture || "",
        }),
      )
      .catch(() => toast.error("Could not load profile"));
  }, [user?.token]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handlePhotoChange = (file) => {
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("lastName", form.lastName);
      fd.append("email", form.email);
      fd.append("gender", form.gender);
      if (form.dateOfBirth) fd.append("dateOfBirth", form.dateOfBirth);
      if (photoFile) fd.append("profilePicture", photoFile);

      const updated = await profileService.updateProfile(fd, user.token);

      // Keep localStorage in sync so the sidebar avatar/name reflect the
      // change without requiring a full re-login. Redux state.auth.user
      // itself isn't patched here since that depends on authSlice, which
      // isn't in scope for this file — a page refresh will pick up the
      // localStorage value on next load.
      const stored = JSON.parse(localStorage.getItem("userInfo") || "{}");
      localStorage.setItem(
        "userInfo",
        JSON.stringify({ ...stored, name: updated.name, email: updated.email }),
      );

      toast.success("Profile updated");
      setPhotoFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <p style={{ color: THEME.textMuted }}>Loading profile…</p>;

  const currentPhoto =
    photoPreview ||
    (form.profilePicture ? `${BACKEND_URL}${form.profilePicture}` : "");

  return (
    <div style={{ maxWidth: 560 }}>
      <p
        style={{
          margin: 0,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: THEME.gold,
        }}
      >
        Settings
      </p>
      <h1
        style={{
          margin: "4px 0 4px",
          fontSize: 24,
          fontWeight: 600,
          fontFamily: "'Cormorant Garamond', serif",
        }}
      >
        Profile
      </h1>
      <p style={{ margin: "0 0 24px", fontSize: 13, color: THEME.textMuted }}>
        Your admin account details.
      </p>

      <div
        style={{
          border: `1px solid ${THEME.border}`,
          borderRadius: 12,
          padding: 20,
          background: THEME.surface,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {currentPhoto ? (
            <img
              src={currentPhoto}
              alt=""
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                objectFit: "cover",
                border: `1px solid ${THEME.border}`,
              }}
            />
          ) : (
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: THEME.goldBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                fontWeight: 700,
                color: THEME.goldBright,
              }}
            >
              {form.name?.[0]?.toUpperCase() || "A"}
            </div>
          )}
          <label
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: `1px solid ${THEME.border}`,
              fontSize: 12,
              cursor: "pointer",
              color: THEME.textMuted,
            }}
          >
            Change photo
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handlePhotoChange(e.target.files?.[0])}
            />
          </label>
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
        >
          <div>
            <label style={labelStyle}>First Name</label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              style={{ ...inputStyle, marginTop: 5 }}
            />
          </div>
          <div>
            <label style={labelStyle}>Last Name</label>
            <input
              value={form.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              style={{ ...inputStyle, marginTop: 5 }}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Email</label>
          <input
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            style={{ ...inputStyle, marginTop: 5 }}
          />
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
        >
          <div>
            <label style={labelStyle}>Gender</label>
            <select
              value={form.gender}
              onChange={(e) => set("gender", e.target.value)}
              style={{ ...inputStyle, marginTop: 5 }}
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Date of Birth</label>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => set("dateOfBirth", e.target.value)}
              style={{ ...inputStyle, marginTop: 5 }}
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          marginTop: 20,
          padding: "10px 28px",
          borderRadius: 8,
          border: "none",
          background: `linear-gradient(135deg, ${THEME.gold}, ${THEME.goldBright})`,
          color: "#0B0B0C",
          fontWeight: 700,
          fontSize: 13,
          cursor: saving ? "not-allowed" : "pointer",
        }}
      >
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}
