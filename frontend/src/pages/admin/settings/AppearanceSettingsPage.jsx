import { useState } from "react";
import { toast } from "react-toastify";
import { THEME, labelStyle } from "../../../theme/theme";

export default function AppearanceSettingsPage() {
  const [theme, setTheme] = useState(
    localStorage.getItem("adminTheme") || "dark",
  );

  const handleSelect = (value) => {
    setTheme(value);
    localStorage.setItem("adminTheme", value);
    toast.info(
      value === "light"
        ? "Light mode preference saved — full light theme requires theme.js to support dynamic tokens (not yet wired)."
        : "Dark mode preference saved.",
    );
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
        Appearance
      </h1>
      <p style={{ margin: "0 0 24px", fontSize: 13, color: THEME.textMuted }}>
        Preference is saved now. Full light-theme rendering across the admin
        panel needs a follow-up change to theme.js.
      </p>

      <div style={{ display: "flex", gap: 12 }}>
        {["dark", "light"].map((t) => (
          <button
            key={t}
            onClick={() => handleSelect(t)}
            style={{
              flex: 1,
              padding: "20px 0",
              borderRadius: 12,
              border: `2px solid ${theme === t ? THEME.gold : THEME.border}`,
              background: t === "dark" ? "#0B0B0C" : "#FFFFFF",
              color: t === "dark" ? "#F3EFE6" : "#15130F",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
