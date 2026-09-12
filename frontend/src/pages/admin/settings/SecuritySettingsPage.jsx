import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { THEME, getInputStyle, getLabelStyle } from "../../../theme/theme";
import profileService from "../../../services/profileService";

function EyeIcon({ open }) {
  return open ? (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.7 19.7 0 0 1 5.06-5.94M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 8 11 8a19.6 19.6 0 0 1-2.17 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  theme,
  inputStyle,
  labelStyle,
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: "relative", marginTop: 5 }}>
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          style={{
            ...inputStyle,
            paddingRight: 40,
            width: "100%",
            boxSizing: "border-box",
          }}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            color: theme.textMuted,
            display: "flex",
          }}
        >
          <EyeIcon open={visible} />
        </button>
      </div>
    </div>
  );
}

export default function SecuritySettingsPage() {
  const { user } = useSelector((s) => s.auth);
  const theme = THEME;
  const inputStyle = getInputStyle(theme);
  const labelStyle = getLabelStyle(theme);

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
          color: theme.gold,
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
          color: theme.text,
        }}
      >
        Security
      </h1>
      <p style={{ margin: "0 0 24px", fontSize: 13, color: theme.textMuted }}>
        Change your admin account password.
      </p>

      <div
        style={{
          border: `1px solid ${theme.border}`,
          borderRadius: 12,
          padding: 20,
          background: theme.surface,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <PasswordField
          label="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          theme={theme}
          inputStyle={inputStyle}
          labelStyle={labelStyle}
        />
        <PasswordField
          label="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          theme={theme}
          inputStyle={inputStyle}
          labelStyle={labelStyle}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          marginTop: 20,
          padding: "10px 28px",
          borderRadius: 8,
          border: "none",
          background: `linear-gradient(135deg, ${theme.gold}, ${theme.goldBright})`,
          color: theme.ink,
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
