// pages/LandingPage.jsx
import { useEffect } from "react";
import { Link } from "react-router-dom";
import identeeLogo from "../assets/identee-logo.png";
import bannerVideo from "../assets/videos/banner-video.mp4";

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
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        height: "100vh",
        color: T.text,
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "30px 24px",
        overflow: "hidden",
      }}
    >
      {/* background video replaces the black bg */}
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: "translate(-50%, -50%)",
          zIndex: 0,
        }}
      >
        <source src={bannerVideo} type="video/mp4" />
      </video>

      {/* dark overlay so text stays readable over the video */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(11,11,12,0.55) 0%, rgba(11,11,12,0.7) 100%)",
          zIndex: 1,
        }}
      />

      {/* focused dark spotlight behind the text block */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(92%, 820px)",
          height: "90%",
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0) 100%)",
          zIndex: 1,
        }}
      />

      <img
        src={identeeLogo}
        alt="Identee"
        style={{
          width: 180,
          height: "auto",
          objectFit: "contain",
          zIndex: 2,
          position: "relative",
        }}
      />

      <h1
        style={{
          margin: "12px 0 0",
          fontSize: "clamp(28px, 5vw, 56px)",
          fontWeight: 600,
          lineHeight: 1.1,
          fontFamily: "'Cormorant Garamond', serif",
          zIndex: 2,
          position: "relative",
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
          margin: "14px 0 0",
          fontSize: 15,
          color: T.muted,
          maxWidth: 460,
          lineHeight: 1.5,
          zIndex: 2,
          position: "relative",
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
          marginTop: 24,
          zIndex: 2,
          position: "relative",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Link
          to="/login"
          style={{
            textDecoration: "none",
            padding: "11px 28px",
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
            padding: "11px 28px",
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
          gap: 32,
          marginTop: 32,
          zIndex: 2,
          position: "relative",
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
                fontSize: 18,
                fontWeight: 600,
                color: T.text,
              }}
            >
              {val}
            </p>
            <p
              style={{
                margin: "2px 0 0",
                fontSize: 10.5,
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
