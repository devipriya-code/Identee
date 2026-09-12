import { useState } from "react";
import { THEME } from "../../../theme/theme"; // add this import
import GeneralSettingsPage from "./GeneralSettingsPage";
import ProfileSettingsPage from "./ProfileSettingsPage";
import SecuritySettingsPage from "./SecuritySettingsPage";
import AppearanceSettingsPage from "./AppearanceSettingsPage";

const ICONS = {
  profile: (
    <svg viewBox="0 0 20 20" fill="currentColor" width={17} height={17}>
      <path d="M10 9a4 4 0 100-8 4 4 0 000 8zM10 11c-4.4 0-8 2.24-8 5v1a1 1 0 001 1h14a1 1 0 001-1v-1c0-2.76-3.6-5-8-5z" />
    </svg>
  ),
  security: (
    <svg viewBox="0 0 20 20" fill="currentColor" width={17} height={17}>
      <path
        fillRule="evenodd"
        d="M10 1l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V4l7-3zm-1 9V6a1 1 0 112 0v4h2l-3 4-3-4h2z"
        clipRule="evenodd"
      />
    </svg>
  ),
  appearance: (
    <svg viewBox="0 0 20 20" fill="currentColor" width={17} height={17}>
      <path d="M10 2a8 8 0 100 16 1.5 1.5 0 001.06-2.56 1.5 1.5 0 011.06-2.56H14a4 4 0 004-4c0-3.87-3.58-7-8-7zM5.5 10a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm2-4a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm5 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm2 4a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
    </svg>
  ),
  general: (
    <svg viewBox="0 0 20 20" fill="currentColor" width={17} height={17}>
      <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5.586l-1.707-1.707A1 1 0 007 4H4z" />
    </svg>
  ),
};

const SECTIONS = [
  { key: "profile", label: "Profile", desc: "Name, email, photo" },
  { key: "security", label: "Security", desc: "Password" },
  { key: "appearance", label: "Appearance", desc: "Light / dark" },
  { key: "general", label: "Store Branding", desc: "Logo, contact, socials" },
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
  const theme = THEME; // was: const { theme } = useTheme();
  const ActivePage = PAGES[active];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.bg,
        color: theme.text,
        fontFamily: "'Inter', sans-serif",
        padding: "36px 44px",
      }}
      className="settings-shell"
    >
      {/* Mobile nav */}
      <div className="settings-mobile-nav" style={{ display: "none" }}>
        <button
          onClick={() => setMobileNavOpen((v) => !v)}
          style={{
            width: "100%",
            padding: "12px 16px",
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            color: theme.text,
            fontSize: 13,
            fontWeight: 600,
            textAlign: "left",
            borderRadius: 10,
          }}
        >
          {SECTIONS.find((s) => s.key === active)?.label} ▾
        </button>
        {mobileNavOpen && (
          <div
            style={{
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: 10,
              marginTop: 6,
              overflow: "hidden",
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
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 16px",
                  background: active === s.key ? theme.goldBg : "transparent",
                  border: "none",
                  color: active === s.key ? theme.goldBright : theme.textMuted,
                  fontSize: 13,
                }}
              >
                {ICONS[s.key]}
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="settings-grid">
        {/* Desktop sidebar — elevated card */}
        <aside
          className="settings-sidebar"
          style={{
            background: `linear-gradient(160deg, ${theme.surface} 0%, ${theme.surface2} 100%)`,
            border: `1px solid ${theme.border}`,
            borderRadius: 16,
            padding: "26px 16px",
            boxShadow: theme.shadow,
            height: "fit-content",
          }}
        >
          <div style={{ padding: "0 10px", marginBottom: 22 }}>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 22,
                fontWeight: 600,
                color: theme.text,
                margin: 0,
              }}
            >
              Settings
            </p>
            <div
              style={{
                width: 34,
                height: 3,
                borderRadius: 2,
                marginTop: 8,
                background: `linear-gradient(90deg, ${theme.gold}, ${theme.goldBright})`,
              }}
            />
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {SECTIONS.map((s) => {
              const isActive = active === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => setActive(s.key)}
                  className="settings-nav-item"
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                    textAlign: "left",
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: isActive
                      ? `linear-gradient(135deg, ${theme.goldBg}, transparent)`
                      : "transparent",
                    border: "none",
                    cursor: "pointer",
                    transition: "background 0.18s ease, transform 0.12s ease",
                    overflow: "hidden",
                  }}
                >
                  {isActive && (
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 3,
                        height: "62%",
                        borderRadius: "0 3px 3px 0",
                        background: `linear-gradient(180deg, ${theme.gold}, ${theme.goldBright})`,
                      }}
                    />
                  )}
                  <span
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isActive
                        ? `linear-gradient(135deg, ${theme.gold}, ${theme.goldBright})`
                        : theme.surface,
                      border: isActive ? "none" : `1px solid ${theme.border}`,
                      color: isActive ? theme.ink : theme.textMuted,
                      boxShadow: isActive
                        ? `0 3px 10px ${theme.goldBorder}`
                        : "none",
                      transition: "all 0.18s ease",
                    }}
                  >
                    {ICONS[s.key]}
                  </span>
                  <span
                    style={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <span
                      style={{
                        fontSize: 13.5,
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? theme.goldBright : theme.text,
                        letterSpacing: "0.01em",
                      }}
                    >
                      {s.label}
                    </span>
                    <span style={{ fontSize: 11, color: theme.textFaint }}>
                      {s.desc}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main style={{ minWidth: 0 }}>
          <div style={{ maxWidth: 760 }}>
            <ActivePage />
          </div>
        </main>
      </div>

      <style>{`
        .settings-grid {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 28px;
          align-items: start;
        }
        .settings-nav-item:hover {
          background: ${theme.surface2} !important;
          transform: translateX(2px);
        }
        @media (max-width: 860px) {
          .settings-shell { padding: 20px !important; }
          .settings-grid { grid-template-columns: 1fr; }
          .settings-sidebar { display: none !important; }
          .settings-mobile-nav { display: block !important; margin-bottom: 16px; }
        }
      `}</style>
    </div>
  );
}
