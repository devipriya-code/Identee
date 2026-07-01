// pages/LandingPage.jsx
import { useEffect } from "react";
import { Link } from "react-router-dom";
import identeeLogo from "../assets/identee-logo.png";
import bannerVideo from "../assets/videos/banner-video.mp4";
import { THEME } from "../theme/theme";

export default function LandingPage() {
  useEffect(() => {
    // lock scrolling — this page is a single, self-contained viewport
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: THEME.bg,
        fontFamily: THEME.fontBody,
        color: THEME.text,
        overflow: "hidden",
      }}
    >
      {/* ── Top bar ─────────────────────────────────────────── */}
      <div
        style={{
          flex: "0 0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 40px",
          borderBottom: `1px solid ${THEME.border}`,
        }}
      >
        <img src={identeeLogo} alt="Identee" style={{ height: 58 }} />
        <div
          style={{
            display: "flex",
            gap: 28,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.04em",
          }}
          className="topbar-links"
        >
          <span style={{ color: THEME.textMuted }}>CATALOGUE</span>
          <span style={{ color: THEME.textMuted }}>LIFESTYLE</span>
        </div>
        <Link
          to="/login"
          style={{
            textDecoration: "none",
            background: THEME.ink,
            color: "#FFFFFF",
            padding: "9px 22px",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          Sign In
        </Link>
      </div>

      {/* ── Hero: bold split layout, fills remaining space ───── */}
      <div
        style={{
          flex: "1 1 auto",
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          alignItems: "center",
          gap: "clamp(20px, 3vw, 40px)",
          padding: "clamp(16px, 3vh, 32px) 40px",
          maxWidth: 1280,
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
        }}
        className="hero-grid"
      >
        {/* Left: bold headline */}
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(26px, 4.2vw, 54px)",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
              fontFamily: THEME.fontBody,
            }}
          >
            Your Style,
            <br />
            Your Story,
            <br />
            <span
              style={{
                background: THEME.goldBlock,
                padding: "2px 10px",
                display: "inline-block",
              }}
            >
              Your Identee
            </span>
          </h1>

          <p
            style={{
              margin: "clamp(10px, 2vh, 22px) 0 0",
              fontSize: 14,
              color: THEME.textMuted,
              maxWidth: 420,
              lineHeight: 1.5,
            }}
          >
            Custom T-shirts, patches, and apparel made the way you imagine them.
            Sign in to pick up where you left off, or create an account to start
            designing.
          </p>

          <div
            style={{
              display: "flex",
              gap: 14,
              marginTop: "clamp(12px, 2.4vh, 30px)",
            }}
          >
            <Link
              to="/login"
              style={{
                textDecoration: "none",
                padding: "12px 28px",
                borderRadius: 999,
                fontSize: 14,
                fontWeight: 700,
                background: THEME.ink,
                color: "#FFFFFF",
              }}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              style={{
                textDecoration: "none",
                padding: "12px 28px",
                borderRadius: 999,
                fontSize: 14,
                fontWeight: 700,
                border: `2px solid ${THEME.ink}`,
                color: THEME.ink,
              }}
            >
              Create Account
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              gap: 36,
              marginTop: "clamp(14px, 3vh, 44px)",
            }}
          >
            {[
              ["4-6 → XXL", "All sizes"],
              ["100%", "Cotton fabric"],
              ["Pan India", "Shipping"],
            ].map(([val, label]) => (
              <div key={label}>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                  {val}
                </p>
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: 10.5,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: THEME.textMuted,
                  }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: video panel with a gold block peeking out behind it,
            sized to fill the available height exactly — no aspect-ratio
            overflow, so it never pushes the page taller than the viewport */}
        <div style={{ position: "relative", height: "100%", minHeight: 0 }}>
          <div
            style={{
              position: "absolute",
              top: 16,
              right: -16,
              width: "100%",
              height: "100%",
              background: THEME.goldBlock,
              borderRadius: 20,
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: "relative",
              zIndex: 1,
              borderRadius: 20,
              overflow: "hidden",
              height: "100%",
              boxShadow: THEME.shadow,
            }}
          >
            <video
              autoPlay
              muted
              loop
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            >
              <source src={bannerVideo} type="video/mp4" />
            </video>
          </div>
        </div>
      </div>

      {/* ── Gold block strip ──────────────────────────────────── */}
      <div
        style={{
          flex: "0 0 auto",
          background: THEME.goldBlock,
          padding: "12px 40px",
          textAlign: "center",
          fontSize: 11.5,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: THEME.ink,
        }}
      >
        Rush Delivery · Single Piece Orders · 360° Customisation · Zero Plastic
        Packaging
      </div>

      <style>{`
        /* Below ~900px there isn't room to keep everything on one screen
           without the text/CTAs getting crushed — so on smaller screens we
           stack the hero and allow the page to scroll instead of clipping
           content off-screen. */
        @media (max-width: 900px) {
          body { overflow: auto !important; }
        }
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .topbar-links { display: none !important; }
        }
      `}</style>
    </div>
  );
}
