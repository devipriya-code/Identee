// pages/Home.jsx
import { useState, useEffect } from "react";

const T = {
  bg: "#0B0B0C",
  surface: "#16161A",
  border: "#2B2B30",
  text: "#F3EFE6",
  muted: "#8A877F",
  gold: "#C9A24B",
  goldBright: "#F0D585",
};

const BANNERS = [
  {
    title: "New Drop",
    img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=80",
  },
  {
    title: "Customise Now",
    img: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1200&q=80",
  },
  {
    title: "Explore All Products",
    img: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1200&q=80",
  },
];

const FEATURES = [
  { title: "RUSH DELIVERY", desc: "Pan India, in 4 working days" },
  { title: "SINGLE PIECE ORDERS", desc: "No minimum order amount" },
  { title: "CUSTOMISATION TOOL", desc: "With 360° preview" },
  { title: "ZERO PLASTIC", desc: "Eco friendly packaging" },
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
    quote:
      "Total value for money — right from material and customising to the pricing. Very honest with the business.",
  },
  {
    name: "Vineeth Vincent",
    role: "Beat-boxer / MC",
    quote:
      "I've been ordering from this brand for years and haven't been dissatisfied a single time.",
  },
  {
    name: "Arushi Parashar",
    role: "Amazon India",
    quote:
      "They are the kind of people I love working with — solution finders, not problem highlighters.",
  },
  {
    name: "Jayanth Joseph",
    role: "Ernst & Young",
    quote:
      "Great quality merchandise and amazing design suggestions. Recommended for corporate gifting.",
  },
];

export default function Home() {
  const [activeBanner, setActiveBanner] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setActiveBanner((i) => (i + 1) % BANNERS.length),
      4000,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div
      style={{
        background: T.bg,
        color: T.text,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── Hero banner carousel ───────────────────────────── */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "60vh",
          minHeight: 380,
          overflow: "hidden",
        }}
      >
        {BANNERS.map((b, i) => (
          <div
            key={b.title}
            style={{
              position: "absolute",
              inset: 0,
              opacity: activeBanner === i ? 1 : 0,
              transition: "opacity 0.6s ease",
            }}
          >
            <img
              src={b.img}
              alt={b.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(11,11,12,0.2) 0%, rgba(11,11,12,0.75) 100%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 40,
                left: 40,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  letterSpacing: "0.2em",
                  color: T.gold,
                  textTransform: "uppercase",
                }}
              >
                IDENTEE
              </p>
              <h2
                style={{
                  margin: "8px 0 0",
                  fontSize: "clamp(26px, 4vw, 44px)",
                  fontFamily: "'Cormorant Garamond', serif",
                }}
              >
                {b.title}
              </h2>
            </div>
          </div>
        ))}

        {/* dots */}
        <div
          style={{
            position: "absolute",
            bottom: 16,
            right: 40,
            display: "flex",
            gap: 8,
          }}
        >
          {BANNERS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveBanner(i)}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                background:
                  activeBanner === i ? T.gold : "rgba(255,255,255,0.3)",
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Feature strip ──────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 40,
          padding: "36px 24px",
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        {FEATURES.map((f) => (
          <div key={f.title} style={{ textAlign: "center", minWidth: 160 }}>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.1em",
                color: T.gold,
                textTransform: "uppercase",
              }}
            >
              {f.title}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: T.muted }}>
              {f.desc}
            </p>
          </div>
        ))}
      </div>

      {/* ── Product categories ─────────────────────────────── */}
      <div style={{ padding: "60px 24px", textAlign: "center" }}>
        <p
          style={{
            margin: 0,
            fontSize: 12,
            letterSpacing: "0.2em",
            color: T.gold,
            textTransform: "uppercase",
          }}
        >
          Browse
        </p>
        <h2
          style={{
            margin: "8px 0 40px",
            fontSize: "clamp(26px, 4vw, 40px)",
            fontFamily: "'Cormorant Garamond', serif",
          }}
        >
          Product Categories
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 20,
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >
          {CATEGORIES.map((c) => (
            <div
              key={c.name}
              style={{
                position: "relative",
                borderRadius: 12,
                overflow: "hidden",
                height: 240,
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
                    "linear-gradient(180deg, rgba(11,11,12,0) 40%, rgba(11,11,12,0.85) 100%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 16,
                  left: 16,
                  textAlign: "left",
                }}
              >
                <p style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
                  {c.name}
                </p>
                <span
                  style={{
                    fontSize: 11,
                    color: T.goldBright,
                    letterSpacing: "0.08em",
                  }}
                >
                  SHOP NOW →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── What we do / video explainer ───────────────────── */}
      <div
        style={{
          padding: "60px 24px",
          textAlign: "center",
          background: T.surface,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 12,
            letterSpacing: "0.2em",
            color: T.gold,
            textTransform: "uppercase",
          }}
        >
          Here's what we do
        </p>
        <h2
          style={{
            margin: "8px 0 32px",
            fontSize: "clamp(24px, 3.5vw, 36px)",
            fontFamily: "'Cormorant Garamond', serif",
          }}
        >
          Explained under a minute
        </h2>
        <div
          style={{
            maxWidth: 800,
            margin: "0 auto",
            aspectRatio: "16/9",
            borderRadius: 12,
            overflow: "hidden",
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
      </div>

      {/* ── Testimonials ───────────────────────────────────── */}
      <div style={{ padding: "60px 24px", textAlign: "center" }}>
        <p
          style={{
            margin: 0,
            fontSize: 12,
            letterSpacing: "0.2em",
            color: T.gold,
            textTransform: "uppercase",
          }}
        >
          Happy customers
        </p>
        <h2
          style={{
            margin: "8px 0 40px",
            fontSize: "clamp(26px, 4vw, 40px)",
            fontFamily: "'Cormorant Garamond', serif",
          }}
        >
          Our Testimonials
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 20,
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 12,
                padding: 24,
                textAlign: "left",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: T.muted,
                  lineHeight: 1.6,
                }}
              >
                "{t.quote}"
              </p>
              <p style={{ margin: "16px 0 0", fontSize: 14, fontWeight: 600 }}>
                {t.name}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: T.gold }}>
                {t.role}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bulk orders CTA ─────────────────────────────────── */}
      <div
        style={{
          padding: "50px 24px",
          textAlign: "center",
          background: `linear-gradient(135deg, ${T.gold}22, transparent)`,
          borderTop: `1px solid ${T.border}`,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 12,
            letterSpacing: "0.2em",
            color: T.gold,
            textTransform: "uppercase",
          }}
        >
          Need Help
        </p>
        <h2
          style={{
            margin: "8px 0 24px",
            fontSize: "clamp(22px, 3.5vw, 32px)",
            fontFamily: "'Cormorant Garamond', serif",
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
            onClick={() => {
              window.location.href = "tel:+910000000000";
            }}
            style={{
              textDecoration: "none",
              padding: "11px 28px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              background: `linear-gradient(135deg, ${T.gold}, ${T.goldBright})`,
              color: "#0B0B0C",
              border: "none",
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
              textDecoration: "none",
              padding: "11px 28px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              border: `1px solid ${T.gold}`,
              color: T.goldBright,
              background: "transparent",
              cursor: "pointer",
            }}
          >
            Email Us
          </button>
        </div>
      </div>
    </div>
  );
}
