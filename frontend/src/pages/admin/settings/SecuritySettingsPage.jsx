import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { THEME, inputStyle, labelStyle } from "../../../theme/theme";
import profileService from "../../../services/profileService";

export default function SecuritySettingsPage() {
  const { user } = useSelector((s) => s.auth);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("password", newPassword);
      await profileService.updateProfile(fd, user.token);
      toast.success("Password updated");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 480 }}>
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
        Security
      </h1>
      <p style={{ margin: "0 0 24px", fontSize: 13, color: THEME.textMuted }}>
        Change your admin account password.
      </p>

      <div
        style={{
          border: `1px solid ${THEME.border}`,
          borderRadius: 12,
          padding: 20,
          background: THEME.surface,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div>
          <label style={labelStyle}>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ ...inputStyle, marginTop: 5 }}
          />
        </div>
        <div>
          <label style={labelStyle}>Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ ...inputStyle, marginTop: 5 }}
          />
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
        {saving ? "Saving…" : "Update Password"}
      </button>
    </div>
  );
}
