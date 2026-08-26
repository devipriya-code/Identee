import { useState } from "react";
import { THEME } from "../../../theme/theme";
import GeneralSettingsPage from "./GeneralSettingsPage";
import ProfileSettingsPage from "./ProfileSettingsPage";
import SecuritySettingsPage from "./SecuritySettingsPage";
import AppearanceSettingsPage from "./AppearanceSettingsPage";

const SECTIONS = [
  { key: "profile", label: "Profile" },
  { key: "security", label: "Security" },
  { key: "appearance", label: "Appearance" },
  { key: "general", label: "Store Branding" },
];

const PAGES = {
  profile: ProfileSettingsPage,
  security: SecuritySettingsPage,
  appearance: AppearanceSettingsPage,
  general: GeneralSettingsPage,
};

export default function SettingsLayout() {
  const [active, setActive] = useState("profile");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const ActivePage = PAGES[active];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: THEME.bg,
        color: THEME.text,
        fontFamily: "'Inter', sans-serif",
        display: "flex",
      }}
      className="settings-shell"
    >
      <div className="settings-mobile-nav" style={{ display: "none" }}>
        <button
          onClick={() => setMobileNavOpen((v) => !v)}
          style={{
            width: "100%",
            padding: "12px 16px",
            background: THEME.surface,
            border: `1px solid ${THEME.border}`,
            color: THEME.text,
            fontSize: 13,
            fontWeight: 600,
            textAlign: "left",
          }}
        >
          {SECTIONS.find((s) => s.key === active)?.label} ▾
        </button>
        {mobileNavOpen && (
          <div
            style={{
              background: THEME.surface,
              border: `1px solid ${THEME.border}`,
            }}
          >
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => {
                  setActive(s.key);
                  setMobileNavOpen(false);
                }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 16px",
                  background: active === s.key ? THEME.goldBg : "transparent",
                  border: "none",
                  color: active === s.key ? THEME.goldBright : THEME.textMuted,
                  fontSize: 13,
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <aside
        className="settings-sidebar"
        style={{
          width: 220,
          flexShrink: 0,
          borderRight: `1px solid ${THEME.border}`,
          padding: "24px 0",
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: THEME.gold,
            padding: "0 20px",
            margin: "0 0 16px",
          }}
        >
          Settings
        </p>
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setActive(s.key)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "9px 20px",
              background: active === s.key ? THEME.goldBg : "transparent",
              border: "none",
              borderLeft:
                active === s.key
                  ? `2px solid ${THEME.gold}`
                  : "2px solid transparent",
              color: active === s.key ? THEME.goldBright : THEME.textMuted,
              fontSize: 13,
              fontWeight: active === s.key ? 600 : 400,
              cursor: "pointer",
            }}
          >
            {s.label}
          </button>
        ))}
      </aside>

      <main style={{ flex: 1, padding: "32px 40px", minWidth: 0 }}>
        <ActivePage />
      </main>

      <style>{`
        @media (max-width: 860px) {
          .settings-sidebar { display: none !important; }
          .settings-mobile-nav { display: block !important; }
        }
      `}</style>
    </div>
  );
}
