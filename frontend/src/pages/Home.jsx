// pages/Home.jsx
// Redesigned to match the "F.Fashion" style reference:
// white/cream base, mustard-yellow accent bands, black text & buttons,
// pastel-colour blocks behind product photography.
import { useState, useEffect, useRef } from "react";
// One pre-made clip per swatch color — same shot, shirt actually recolored
// in editing ahead of time. Swapping the <source> is how the color-change
// effect gets built without live-recoloring real footage in the browser.
// Single hero banner video — you only have one clip, so the earlier
// "swap a different clip per color" idea is on hold until you have
// actual color-graded variants to swap between.
import homeBannerVideo from "../assets/videos/homebanner-video.mp4";

// Sub-videos used for New Arrivals (1-3), Young's Favourite (4-6),
// and Testimonials (7-9, cycled if there are more than 3 testimonials)
import subVideo1 from "../assets/videos/sub-video1.mp4";
import subVideo2 from "../assets/videos/sub-video2.mp4";
import subVideo3 from "../assets/videos/sub-video3.mp4";
import subVideo4 from "../assets/videos/sub-video4.mp4";
import subVideo5 from "../assets/videos/sub-video5.mp4";
import subVideo6 from "../assets/videos/sub-video6.mp4";
import subVideo7 from "../assets/videos/sub-video7.mp4";
import subVideo8 from "../assets/videos/sub-video8.mp4";
import subVideo9 from "../assets/videos/suv-video9.mp4";

/* ------------------------------------------------------------------ */
/*  PALETTE — white base, yellow accent, black ink (NO dark bg)       */
/* ------------------------------------------------------------------ */
const C = {
  bg: "#FFFFFF", // primary page background
  bgAlt: "#FBF7EE", // soft warm cream for alternating sections
  yellow: "#F4C43C", // primary accent — bands, marquee, highlights
  yellowDeep: "#E3A72E", // hover / deeper accent
  yellowSoft: "#FCEFC7", // light wash for chips/badges
  gold: "#C9A24B", // brand gold, used sparingly for detail lines
  ink: "#15130F", // buttons, headlines, primary text
  text: "#221F1A",
  muted: "#71695B",
  border: "#ECE4D2",
  card: "#FFFFFF",
  shadow: "0 18px 36px -18px rgba(21,19,15,0.18)",
};

// soft pastel backgrounds cycled behind product / category imagery
const PASTELS = [
  "#ECECEC",
  "#E7DEF3",
  "#D8ECE6",
  "#F6DCE3",
  "#FDEFD9",
  "#DDEAF6",
];

// color-morph themes for the hero "pick a color" widget
const HERO_COLOR_THEMES = [
  { name: "Amber Glow", dot: "#E3963B", from: "#F8CE86", to: "#D9843A" },
  { name: "Mystic Mauve", dot: "#8C6FE8", from: "#C3B2F8", to: "#6A54C8" },
  { name: "Fresh Moss", dot: "#6FA35A", from: "#BEDBA0", to: "#598F62" },
];

// Video clip per theme, same index order as HERO_COLOR_THEMES above —
// left in place for when you have actual color-graded variants; for now
// the hero just plays the single homeBannerVideo below.
// const HERO_VIDEOS = [heroVideoAmber, heroVideoMauve, heroVideoMoss];

const HERO_PRODUCTS = ["Tees", "Hoodie", "Pants"];

// tiny flat garment glyphs, tinted with the active color
function GarmentIcon({ type, color }) {
  const common = { width: 26, height: 26, viewBox: "0 0 24 24", fill: color };
  if (type === "Hoodie") {
    return (
      <svg {...common}>
        <path d="M12 2c-1.4 0-2.6.8-3.2 2L6 5.4C4.8 6 4 7.2 4 8.6V11l2-.6V20a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9.6l2 .6V8.6c0-1.4-.8-2.6-2-3.2l-2.8-1.4A3.6 3.6 0 0 0 12 2Zm0 2.2c.7 0 1.3.3 1.7.9l.4.6H9.9l.4-.6c.4-.6 1-.9 1.7-.9Z" />
      </svg>
    );
  }
  if (type === "Pants") {
    return (
      <svg {...common}>
        <path d="M6 2h12l.9 18.9a1 1 0 0 1-1 1.1h-2.4a1 1 0 0 1-1-.9L13.6 12h-1.2l-.9 9.1a1 1 0 0 1-1 .9H8.1a1 1 0 0 1-1-1.1L6 2Z" />
      </svg>
    );
  }
  // Tee
  return (
    <svg {...common}>
      <path d="M8 2 4 5v4l2.5-.9V21a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V8.1L20 9V5l-4-3-1 1.6a2.8 2.8 0 0 1-6 0L8 2Z" />
    </svg>
  );
}

function HeroColorWidget({ activeIdx, setActiveIdx }) {
  const active = HERO_COLOR_THEMES[activeIdx];
  return (
    <>
      {/* morphing silk gradient — crossfades between themes */}
      {HERO_COLOR_THEMES.map((theme, i) => (
        <div
          key={theme.name}
          style={{
            position: "absolute",
            inset: 0,
            opacity: activeIdx === i ? 1 : 0,
            transition: "opacity 0.7s ease",
            background: `linear-gradient(135deg, ${theme.from} 0%, ${theme.to} 100%)`,
          }}
        />
      ))}

      {/* Buy Now pill */}
      <button
        className="identee-cta-btn"
        onClick={() => {
          window.location.href = "/shop";
        }}
        style={{
          position: "absolute",
          top: 18,
          right: 18,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "10px 18px",
          borderRadius: 999,
          border: "none",
          background: C.ink,
          color: C.bg,
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
          zIndex: 2,
        }}
      >
        Buy Now <span style={{ fontSize: 14 }}>↗</span>
      </button>

      {/* Tees / Hoodie / Pants cards with color dots */}
      <div
        style={{
          position: "absolute",
          bottom: 18,
          right: 18,
          display: "flex",
          gap: 10,
          zIndex: 2,
        }}
      >
        {HERO_PRODUCTS.map((label) => (
          <div
            key={label}
            style={{
              background: "rgba(255,255,255,0.94)",
              borderRadius: 14,
              padding: "10px 10px 12px",
              width: 76,
              textAlign: "center",
              boxShadow: C.shadow,
            }}
          >
            <div
              style={{
                height: 30,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <GarmentIcon type={label} color={active.dot} />
            </div>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 11,
                fontWeight: 700,
                color: C.ink,
              }}
            >
              {label}
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 5,
                marginTop: 7,
              }}
            >
              {HERO_COLOR_THEMES.map((theme, i) => (
                <button
                  key={theme.name}
                  onClick={() => setActiveIdx(i)}
                  aria-label={theme.name}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    padding: 0,
                    cursor: "pointer",
                    background: theme.dot,
                    border:
                      activeIdx === i
                        ? `2px solid ${C.ink}`
                        : "2px solid transparent",
                    boxSizing: "content-box",
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

const FONT_DISPLAY =
  "'Bricolage Grotesque', 'Helvetica Neue', Arial, sans-serif";
const FONT_BODY = "'Inter', 'Helvetica Neue', Arial, sans-serif";

/* ------------------------------------------------------------------ */
/*  CONTENT                                                            */
/* ------------------------------------------------------------------ */
const MARQUEE_WORDS = [
  "NEW ARRIVALS",
  "FREE SHIPPING",
  "SINGLE PIECE ORDERS",
  "360° CUSTOMISATION",
  "PAN INDIA DELIVERY",
  "ZERO PLASTIC PACKAGING",
];

const FEATURES = [
  { title: "RUSH DELIVERY", desc: "Pan India, in 4 working days" },
  { title: "SINGLE PIECE ORDERS", desc: "No minimum order amount" },
  { title: "CUSTOMISATION TOOL", desc: "With 360° preview" },
  { title: "ZERO PLASTIC", desc: "Eco friendly packaging" },
];

const NEW_ARRIVALS = [
  {
    name: "Oversized Hoodie",
    tag: "Explore Now",
    video: subVideo1,
  },
  {
    name: "Denim Jacket",
    tag: "Explore Now",
    video: subVideo2,
  },
  {
    name: "Graphic Tee",
    tag: "Explore Now",
    video: subVideo3,
  },
];

const FAVOURITES = [
  {
    name: "Trending",
    tag: "Explore Now",
    video: subVideo7,
  },
  {
    name: "Trending",
    tag: "Explore Now",
    video: subVideo8,
  },
  {
    name: "Trending",
    tag: "Explore Now",
    video: subVideo9,
  },
];

const CATEGORIES = [
  {
    name: "Apparel",
    img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80",
  },
  {
    name: "Jackets & Pullovers",
    img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80",
  },
  {
    name: "Accessories",
    img: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=500&q=80",
  },
  {
    name: "Stationery",
    img: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500&q=80",
  },
  {
    name: "Miscellaneous",
    img: "https://images.unsplash.com/photo-1593030103066-0093718efeb9?w=500&q=80",
  },
  {
    name: "Branded Merch",
    img: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&q=80",
  },
];

const TESTIMONIALS = [
  {
    name: "Reo Raymond",
    role: "Radio Indigo 91.9FM",
    video: subVideo7,
    quote:
      "Total value for money — right from material and customising to the pricing. Very honest with the business.",
  },
  {
    name: "Vineeth Vincent",
    role: "Beat-boxer / MC",
    video: subVideo8,
    quote:
      "I've been ordering from this brand for years and haven't been dissatisfied a single time.",
  },
  {
    name: "Arushi Parashar",
    role: "Amazon India",
    video: subVideo9,
    quote:
      "They are the kind of people I love working with — solution finders, not problem highlighters.",
  },
  {
    name: "Jayanth Joseph",
    role: "Ernst & Young",
    video: subVideo7,
    quote:
      "Great quality merchandise and amazing design suggestions. Recommended for corporate gifting.",
  },
];

/* ------------------------------------------------------------------ */
/*  SMALL HELPERS                                                      */
/* ------------------------------------------------------------------ */
function useCountUp(target, start) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    const numeric = parseInt(String(target).replace(/[^\d]/g, ""), 10) || 0;
    if (!numeric) return;
    let frame = 0;
    const totalFrames = 40;
    const timer = setInterval(() => {
      frame++;
      setVal(Math.round((numeric / totalFrames) * frame));
      if (frame >= totalFrames) clearInterval(timer);
    }, 25);
    return () => clearInterval(timer);
  }, [start, target]);
  return val;
}

function PastelCard({ item, bg, big }) {
  return (
    <div
      className="identee-pastel-card"
      style={{
        background: bg,
        borderRadius: 18,
        overflow: "hidden",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ aspectRatio: big ? "3/4" : "4/5", overflow: "hidden" }}>
        {item.video ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          >
            <source src={item.video} type="video/mp4" />
          </video>
        ) : (
          <img
            src={item.img}
            alt={item.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
      </div>
      <div
        style={{
          padding: "14px 16px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>
          {item.name}
        </span>
        <span
          style={{
            fontSize: 12,
            color: C.muted,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {item.tag} →
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN COMPONENT                                                     */
/* ------------------------------------------------------------------ */
export default function Home() {
  const [statsVisible, setStatsVisible] = useState(false);
  const [heroColorIdx, setHeroColorIdx] = useState(0);
  const statsRef = useRef(null);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      style={{
        background: C.bg,
        color: C.text,
        fontFamily: FONT_BODY,
        overflowX: "hidden",
      }}
    >
      <style>{`
        @keyframes identee-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .identee-pastel-card { transition: transform 0.4s cubic-bezier(.2,.8,.2,1), box-shadow 0.4s ease; }
        .identee-pastel-card:hover { transform: translateY(-6px); box-shadow: 0 20px 34px -18px rgba(21,19,15,0.22); }
        .identee-pastel-card img { transition: transform 0.6s ease; }
        .identee-pastel-card:hover img { transform: scale(1.06); }
        .identee-cta-btn { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .identee-cta-btn:hover { transform: translateY(-2px); }
        .identee-cat-pill { transition: background 0.25s ease, color 0.25s ease; }
        .identee-cat-pill:hover { background: ${C.ink} !important; color: ${C.bg} !important; }
        @media (max-width: 720px) {
          .hero-color-widget { display: none !important; }
        }
      `}</style>

      {/* ================= HERO — full-bleed video background ================= */}
      <section
        style={{
          position: "relative",
          minHeight: "82vh",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {/* Video fills the entire hero — single clip for now. */}
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
          }}
        >
          <source src={homeBannerVideo} type="video/mp4" />
        </video>

        {/* Dark warm overlay so the headline stays readable over the footage */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(100deg, rgba(21,19,15,0.82) 0%, rgba(21,19,15,0.55) 45%, rgba(21,19,15,0.28) 100%)",
            zIndex: 1,
          }}
        />

        {/* Content, sitting on top of the video */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: 1280,
            width: "100%",
            margin: "0 auto",
            padding: "40px 24px",
          }}
        >
          <div style={{ maxWidth: 560 }}>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                letterSpacing: "0.24em",
                color: C.yellow,
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              IDENTEE — SIGNATURE STREETWEAR
            </p>
            <h1
              style={{
                margin: "22px 0 0",
                fontFamily: FONT_DISPLAY,
                fontWeight: 800,
                fontSize: "clamp(40px, 6vw, 64px)",
                lineHeight: 1.05,
                color: "#FFF8EC",
              }}
            >
              LET&apos;S EXPLORE
              <br />
              <span
                style={{
                  background: C.yellow,
                  color: C.ink,
                  padding: "2px 10px",
                  borderRadius: 8,
                }}
              >
                UNIQUE
              </span>
              <br />
              CLOTHES.
            </h1>
            <p
              style={{
                margin: "24px 0 0",
                maxWidth: 380,
                fontSize: 15,
                lineHeight: 1.7,
                color: "#E4D9C4",
              }}
            >
              Custom-built apparel for brands, teams and individuals —
              single-piece orders, 360° design preview, delivered pan India in
              days, not weeks.
            </p>
            <button
              className="identee-cta-btn"
              onClick={() => {
                window.location.href = "/shop";
              }}
              style={{
                marginTop: 32,
                padding: "15px 34px",
                borderRadius: 10,
                border: "none",
                background: C.yellow,
                color: C.ink,
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Shop Now
            </button>
          </div>
        </div>

        {/* Floating interactive color-swatch card — click a dot to change
            the garment color live, layered on top of the video */}
        <div
          style={{
            position: "absolute",
            zIndex: 3,
            bottom: 32,
            right: 32,
            width: 320,
            height: 210,
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 24px 48px -20px rgba(0,0,0,0.45)",
          }}
          className="hero-color-widget"
        >
          <HeroColorWidget activeIdx={heroColorIdx} setActiveIdx={setHeroColorIdx} />
        </div>
      </section>

      {/* ================= MARQUEE STRIP ================= */}
      <div
        style={{
          background: C.yellow,
          overflow: "hidden",
          whiteSpace: "nowrap",
          padding: "16px 0",
          marginTop: 60,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            animation: "identee-marquee 22s linear infinite",
          }}
        >
          {[...MARQUEE_WORDS, ...MARQUEE_WORDS, ...MARQUEE_WORDS].map(
            (w, i) => (
              <span
                key={i}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 800,
                  fontSize: 18,
                  color: C.ink,
                  margin: "0 26px",
                  letterSpacing: "0.02em",
                }}
              >
                {w}
                <span style={{ margin: "0 26px", fontSize: 13 }}>✦</span>
              </span>
            ),
          )}
        </div>
      </div>

      {/* ================= FEATURES ================= */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 48,
          padding: "40px 24px",
          background: C.bgAlt,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        {FEATURES.map((f) => (
          <div key={f.title} style={{ textAlign: "center", minWidth: 170 }}>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.1em",
                color: C.ink,
                textTransform: "uppercase",
              }}
            >
              {f.title}
            </p>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: C.muted }}>
              {f.desc}
            </p>
          </div>
        ))}
      </div>

      {/* ================= NEW ARRIVALS ================= */}
      <section
        style={{ padding: "80px 24px 60px", maxWidth: 1280, margin: "0 auto" }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 12,
            letterSpacing: "0.2em",
            color: C.muted,
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          New Arrivals
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 22,
            marginTop: 22,
          }}
        >
          {NEW_ARRIVALS.map((p, i) => (
            <PastelCard
              key={p.name + i}
              item={p}
              bg={PASTELS[i % PASTELS.length]}
            />
          ))}
        </div>
      </section>

      {/* ================= SALE BAND ================= */}
      <section
        style={{
          margin: "48px 24px",
          maxWidth: 1280,
          marginLeft: "auto",
          marginRight: "auto",
          background: C.yellow,
          borderRadius: 28,
          padding: "56px 48px",
          display: "grid",
          gridTemplateColumns: "0.9fr 1.1fr",
          gap: 40,
          alignItems: "center",
          overflow: "hidden",
          boxShadow: "0 30px 60px -30px rgba(21,19,15,0.28)",
        }}
      >
        <div
          style={{
            borderRadius: 20,
            overflow: "hidden",
            aspectRatio: "1/1",
            boxShadow: "0 18px 36px -16px rgba(21,19,15,0.35)",
          }}
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          >
            <source src={subVideo6} type="video/mp4" />
          </video>
        </div>
        <div>
          <h2
            style={{
              margin: 0,
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: "clamp(30px, 4.4vw, 48px)",
              color: C.ink,
              lineHeight: 1.08,
              letterSpacing: "-0.01em",
            }}
          >
            BULK ORDER
            <br />
            SPECIAL NOW
          </h2>
          <p
            style={{
              margin: "18px 0 0",
              fontSize: 14.5,
              color: C.ink,
              maxWidth: 360,
              lineHeight: 1.65,
              opacity: 0.85,
            }}
          >
            Order 20+ pieces and get 15% off, with free 360° customisation
            preview and priority pan-India delivery.
          </p>
          <p
            style={{
              margin: "12px 0 0",
              fontSize: 12,
              color: C.ink,
              opacity: 0.65,
            }}
          >
            1 – 30 July 2026 &nbsp;•&nbsp; *Terms &amp; conditions apply
          </p>
          <button
            className="identee-cta-btn"
            onClick={() => {
              window.location.href = "/bulk-orders";
            }}
            style={{
              marginTop: 26,
              padding: "15px 32px",
              borderRadius: 10,
              border: "none",
              background: C.ink,
              color: C.bg,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              cursor: "pointer",
              boxShadow: "0 12px 24px -8px rgba(21,19,15,0.4)",

            }}
          >
            Get Started
          </button>
        </div>
      </section>

      {/* ================= YOUNG'S FAVOURITE ================= */}
      <section
        style={{ padding: "40px 24px 80px", maxWidth: 1280, margin: "0 auto" }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 12,
            letterSpacing: "0.2em",
            color: C.muted,
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          Young&apos;s Favourite
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 22,
            marginTop: 22,
          }}
        >
          {FAVOURITES.map((p, i) => (
            <PastelCard
              key={p.name + i}
              item={p}
              bg={PASTELS[(i + 3) % PASTELS.length]}
              big
            />
          ))}
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section
        style={{ padding: "20px 24px 80px", maxWidth: 1280, margin: "0 auto" }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 12,
            letterSpacing: "0.2em",
            color: C.muted,
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          Shop by Category
        </p>
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 20 }}
        >
          {CATEGORIES.map((c) => (
            <button
              key={c.name}
              className="identee-cat-pill"
              onClick={() => {
                window.location.href =
                  "/category/" + c.name.toLowerCase().replace(/\s+/g, "-");
              }}
              style={{
                border: `1px solid ${C.border}`,
                background: C.bgAlt,
                color: C.ink,
                fontSize: 13,
                fontWeight: 600,
                padding: "10px 20px",
                borderRadius: 999,
                cursor: "pointer",
              }}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 20,
            marginTop: 28,
          }}
        >
          {CATEGORIES.map((c, i) => (
            <div
              key={c.name}
              className="identee-pastel-card"
              style={{
                position: "relative",
                borderRadius: 16,
                overflow: "hidden",
                height: 220,
                background: PASTELS[i % PASTELS.length],
                cursor: "pointer",
              }}
            >
              <img
                src={c.img}
                alt={c.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(21,19,15,0) 45%, rgba(21,19,15,0.72) 100%)",
                }}
              />
              <div style={{ position: "absolute", bottom: 14, left: 14 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#FFF8EC",
                  }}
                >
                  {c.name}
                </p>
                <span
                  style={{
                    fontSize: 11,
                    color: C.yellow,
                    letterSpacing: "0.08em",
                  }}
                >
                  SHOP NOW →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= WHAT WE DO / VIDEO ================= */}
      <section
        style={{
          padding: "20px 24px 80px",
          textAlign: "center",
          background: C.bgAlt,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 12,
            letterSpacing: "0.2em",
            color: C.muted,
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          Here&apos;s what we do
        </p>
        <h2
          style={{
            margin: "10px 0 32px",
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
            fontSize: "clamp(26px, 3.4vw, 38px)",
            color: C.ink,
          }}
        >
          Explained under a minute
        </h2>
        <div
          style={{
            maxWidth: 800,
            margin: "0 auto",
            aspectRatio: "16/9",
            borderRadius: 18,
            overflow: "hidden",
            border: `1px solid ${C.border}`,
            boxShadow: C.shadow,
          }}
        >
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/FX4AKvfSFvs"
            title="What we do"
            style={{ border: "none" }}
            allowFullScreen
          />
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section style={{ padding: "80px 24px", background: C.bg }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              letterSpacing: "0.2em",
              color: C.muted,
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Happy Customers
          </p>
          <h2
            style={{
              margin: "10px 0 0",
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: "clamp(26px, 3.4vw, 38px)",
              color: C.ink,
            }}
          >
            Our Testimonials
          </h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 20,
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              style={{
                background: PASTELS[i % PASTELS.length],
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: 24,
                textAlign: "left",
              }}
            >
              {t.video && (
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    objectFit: "cover",
                    marginBottom: 14,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <source src={t.video} type="video/mp4" />
                </video>
              )}
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: C.text,
                  lineHeight: 1.6,
                }}
              >
                &quot;{t.quote}&quot;
              </p>
              <p
                style={{
                  margin: "16px 0 0",
                  fontSize: 14,
                  fontWeight: 700,
                  color: C.ink,
                }}
              >
                {t.name}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: C.muted }}>
                {t.role}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= BULK ORDER / NEWSLETTER FOOTER STRIP ================= */}
      <section
        style={{
          background: C.yellow,
          padding: "50px 24px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 12,
            letterSpacing: "0.2em",
            color: C.ink,
            textTransform: "uppercase",
            fontWeight: 800,
          }}
        >
          Need Help
        </p>
        <h2
          style={{
            margin: "10px 0 24px",
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
            fontSize: "clamp(24px, 3.4vw, 34px)",
            color: C.ink,
          }}
        >
          For Bulk Orders
        </h2>
        <div
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            className="identee-cta-btn"
            onClick={() => {
              window.location.href = "tel:+910000000000";
            }}
            style={{
              padding: "13px 28px",
              borderRadius: 10,
              border: "none",
              background: C.ink,
              color: C.bg,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Call Us
          </button>
          <button
            onClick={() => {
              window.location.href = "mailto:hello@identee.com";
            }}
            style={{
              padding: "13px 28px",
              borderRadius: 10,
              border: `1px solid ${C.ink}`,
              color: C.ink,
              background: "transparent",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Email Us
          </button>
        </div>
      </section>
    </div>
  );
}