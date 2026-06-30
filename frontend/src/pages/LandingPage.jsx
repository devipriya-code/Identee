// pages/LandingPage.jsx
import { Link } from "react-router-dom";

const T = {
  bg: "#0B0B0C",
  surface: "#16161A",
  border: "#2B2B30",
  text: "#F3EFE6",
  muted: "#8A877F",
  gold: "#C9A24B",
  goldBright: "#F0D585",
};

export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 70px)",
        background: T.bg,
        color: T.text,
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "60px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ambient gold glow */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${T.gold}14, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <p
        style={{
          margin: 0,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: T.gold,
          zIndex: 1,
        }}
      >
        IDENTEE
      </p>

      <h1
        style={{
          margin: "16px 0 0",
          fontSize: "clamp(36px, 6vw, 64px)",
          fontWeight: 600,
          lineHeight: 1.1,
          fontFamily: "'Cormorant Garamond', serif",
          zIndex: 1,
        }}
      >
        Your style, your story,
        <br />
        your{" "}
        <span style={{ color: T.goldBright, fontStyle: "italic" }}>
          identity
        </span>
        .
      </h1>

      <p
        style={{
          margin: "20px 0 0",
          fontSize: 16,
          color: T.muted,
          maxWidth: 480,
          lineHeight: 1.6,
          zIndex: 1,
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
          marginTop: 34,
          zIndex: 1,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Link
          to="/login"
          style={{
            textDecoration: "none",
            padding: "12px 30px",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            background: `linear-gradient(135deg, ${T.gold}, ${T.goldBright})`,
            color: "#0B0B0C",
          }}
        >
          Sign In
        </Link>
        <Link
          to="/register"
          style={{
            textDecoration: "none",
            padding: "12px 30px",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            border: `1px solid ${T.gold}`,
            color: T.goldBright,
          }}
        >
          Create Account
        </Link>
      </div>

      <div
        style={{
          display: "flex",
          gap: 36,
          marginTop: 56,
          zIndex: 1,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {[
          ["4-6 → XXL", "All sizes"],
          ["100%", "Cotton fabric"],
          ["Pan India", "Shipping"],
        ].map(([val, label]) => (
          <div key={label}>
            <p
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 600,
                color: T.text,
              }}
            >
              {val}
            </p>
            <p
              style={{
                margin: "2px 0 0",
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: T.muted,
              }}
            >
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
