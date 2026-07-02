// pages/Home.jsx
// Redesigned flow (per new structure):
// Navbar (unchanged, lives outside this file)
// -> Hero banner (unchanged)
// -> Running marquee strip (unchanged)
// -> Auto-scrolling categories slider (new)
// -> Per-category banner + product grid, repeated for every category (new)
// -> "Design Your Own" customization CTA (replaces old Bulk Order band)
// -> Young's Favourite
// -> Footer contact strip
import { useState, useEffect, useRef } from "react";
// One pre-made clip per swatch color — same shot, shirt actually recolored
// in editing ahead of time. Swapping the <source> is how the color-change
// effect gets built without live-recoloring real footage in the browser.
// Single hero banner video — you only have one clip, so the earlier
// "swap a different clip per color" idea is on hold until you have
// actual color-graded variants to swap between.
import homeBannerVideo from "../assets/videos/homebanner-video.mp4";
// Reused for the "Design Your Own" band until a dedicated customizer
// preview clip is recorded — same footage the old Bulk Order band used.
import customizeVideo from "../assets/videos/sub-video2.mp4";

// Sub-videos used for Young's Favourite and Testimonials
import subVideo1 from "../assets/videos/sub-video1.mp4";
import subVideo7 from "../assets/videos/sub-video7.mp4";
import subVideo8 from "../assets/videos/sub-video8.mp4";
import subVideo9 from "../assets/videos/suv-video9.mp4";
// Dedicated clips reused inside the Hoodies / Polos product grids
import hoodieVideo from "../assets/videos/hoodie.mp4";
import polosVideo from "../assets/videos/polos.mp4";

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

const FAVOURITES = [
  { name: "Trending", tag: "Explore Now", video: subVideo9 },
  { name: "Trending", tag: "Explore Now", video: subVideo8 },
  { name: "Trending", tag: "Explore Now", video: subVideo1 },
];

/* ------------------------------------------------------------------ */
/*  CATEGORIES — slider items + full banner/product sections          */
/*  Each entry drives: the auto-scroll slider card, the category      */
/*  banner, and the product grid beneath that banner.                 */
/* ------------------------------------------------------------------ */
const CATEGORIES = [
  {
    slug: "t-shirt",
    name: "T-Shirt",
    thumb:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80",
    bannerImg:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1400&q=80",
    tagline: "Everyday staples, cut for comfort",
    products: [
      {
        name: "Classic Crew Tee",
        price: "₹799",
        img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80",
      },
      {
        name: "Heavyweight Tee",
        price: "₹899",
        img: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&q=80",
      },
      {
        name: "Graphic Print Tee",
        price: "₹849",
        img: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80",
      },
      {
        name: "Essential Plain Tee",
        price: "₹749",
        img: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500&q=80",
      },
    ],
  },
  {
    slug: "round-neck",
    name: "Round Neck",
    thumb:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80",
    bannerImg:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=1400&q=80",
    tagline: "Clean necklines, all-day fit",
    products: [
      {
        name: "Signature Round Neck",
        price: "₹749",
        img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&q=80",
      },
      {
        name: "Ribbed Round Neck",
        price: "₹799",
        img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&q=80",
      },
      {
        name: "Two-Tone Round Neck",
        price: "₹849",
        img: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&q=80",
      },
      {
        name: "Basic Round Neck",
        price: "₹699",
        img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80",
      },
    ],
  },
  {
    slug: "oversized",
    name: "Oversized",
    thumb:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80",
    bannerImg:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1400&q=80",
    tagline: "Relaxed drop-shoulder silhouettes",
    products: [
      {
        name: "Drop-Shoulder Oversized",
        price: "₹999",
        img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80",
      },
      {
        name: "Boxy Fit Oversized",
        price: "₹1049",
        img: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&q=80",
      },
      {
        name: "Oversized Graphic Tee",
        price: "₹1099",
        img: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80",
      },
      {
        name: "Washed Oversized Tee",
        price: "₹999",
        img: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500&q=80",
      },
    ],
  },
  {
    slug: "hoodies",
    name: "Hoodies",
    thumb:
      "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=500&q=80",
    bannerImg:
      "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=1400&q=80",
    tagline: "Heavy fleece, built for layering",
    products: [
      { name: "Signature Hoodie", price: "₹1499", video: hoodieVideo },
      {
        name: "Zip-Up Hoodie",
        price: "₹1599",
        img: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=500&q=80",
      },
      {
        name: "Fleece-Lined Hoodie",
        price: "₹1649",
        img: "https://images.unsplash.com/photo-1571945153237-4929e783be03?w=500&q=80",
      },
      {
        name: "Pullover Hoodie",
        price: "₹1449",
        img: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&q=80",
      },
    ],
  },
  {
    slug: "sweatshirt",
    name: "Sweatshirt",
    thumb:
      "https://images.unsplash.com/photo-1593030103066-0093718efeb9?w=500&q=80",
    bannerImg:
      "https://images.unsplash.com/photo-1593030103066-0093718efeb9?w=1400&q=80",
    tagline: "Soft fleece for cooler days",
    products: [
      {
        name: "Crewneck Sweatshirt",
        price: "₹1299",
        img: "https://images.unsplash.com/photo-1593030103066-0093718efeb9?w=500&q=80",
      },
      {
        name: "Colour-Block Sweatshirt",
        price: "₹1349",
        img: "https://images.unsplash.com/photo-1571945153237-4929e783be03?w=500&q=80",
      },
      {
        name: "Washed Sweatshirt",
        price: "₹1299",
        img: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=500&q=80",
      },
      {
        name: "Graphic Sweatshirt",
        price: "₹1399",
        img: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80",
      },
    ],
  },
  {
    slug: "polos",
    name: "Polos",
    thumb:
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&q=80",
    bannerImg:
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=1400&q=80",
    tagline: "Smart-casual, on your terms",
    products: [
      { name: "Signature Polo", price: "₹999", video: polosVideo },
      {
        name: "Pique Polo",
        price: "₹1049",
        img: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&q=80",
      },
      {
        name: "Striped Collar Polo",
        price: "₹1099",
        img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&q=80",
      },
      {
        name: "Zip-Neck Polo",
        price: "₹1099",
        img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&q=80",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  SMALL HELPERS                                                      */
/* ------------------------------------------------------------------ */
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

// Product card for the per-category grids — image/video, name, price.
function ProductCard({ product, bg }) {
  return (
    <div
      className="identee-pastel-card"
      style={{
        background: bg,
        borderRadius: 16,
        overflow: "hidden",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ aspectRatio: "4/5", overflow: "hidden" }}>
        {product.video ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          >
            <source src={product.video} type="video/mp4" />
          </video>
        ) : (
          <img
            src={product.img}
            alt={product.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
      </div>
      <div style={{ padding: "12px 14px 16px" }}>
        <p
          style={{
            margin: 0,
            fontSize: 13.5,
            fontWeight: 600,
            color: C.ink,
          }}
        >
          {product.name}
        </p>
        <p
          style={{
            margin: "4px 0 0",
            fontSize: 13,
            fontWeight: 700,
            color: C.gold,
          }}
        >
          {product.price}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  AUTO-SCROLL CATEGORY SLIDER                                        */
/*  Continuous, self-scrolling strip of category cards. Clicking a     */
/*  card smooth-scrolls the page down to that category's own section.  */
/* ------------------------------------------------------------------ */
function CategorySlider({ categories, onSelect }) {
  const track = [...categories, ...categories]; // duplicated for seamless loop
  return (
    <div className="identee-cat-slider">
      <div className="identee-cat-track">
        {track.map((c, i) => (
          <button
            key={c.slug + i}
            onClick={() => onSelect(c.slug)}
            className="identee-cat-slide"
          >
            <span className="identee-cat-slide-img">
              <img src={c.thumb} alt={c.name} />
            </span>
            <span className="identee-cat-slide-name">{c.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CATEGORY SECTION — banner + product grid, repeated per category    */
/* ------------------------------------------------------------------ */
function CategorySection({ category, index }) {
  const reversed = index % 2 === 1;
  const pastel = PASTELS[index % PASTELS.length];

  return (
    <section
      id={`cat-${category.slug}`}
      style={{
        padding: "64px 24px",
        maxWidth: 1280,
        margin: "0 auto",
        scrollMarginTop: 90,
      }}
    >
      {/* ---- category banner ---- */}
      <div
        style={{
          position: "relative",
          borderRadius: 24,
          overflow: "hidden",
          minHeight: 280,
          display: "flex",
          flexDirection: reversed ? "row-reverse" : "row",
          alignItems: "stretch",
          background: pastel,
        }}
      >
        <div style={{ flex: "1 1 55%", minHeight: 280 }}>
          <img
            src={category.bannerImg}
            alt={category.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <div
          style={{
            flex: "1 1 45%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "36px 44px",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 12,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: C.muted,
            }}
          >
            Shop the Category
          </p>
          <h2
            style={{
              margin: "10px 0 0",
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: "clamp(28px, 3.6vw, 42px)",
              color: C.ink,
              lineHeight: 1.08,
            }}
          >
            {category.name}
          </h2>
          <p
            style={{
              margin: "12px 0 0",
              fontSize: 14.5,
              color: C.text,
              lineHeight: 1.6,
              maxWidth: 320,
            }}
          >
            {category.tagline}
          </p>
          <button
            className="identee-cta-btn"
            onClick={() => {
              window.location.href = "/category/" + category.slug;
            }}
            style={{
              marginTop: 24,
              alignSelf: "flex-start",
              padding: "13px 28px",
              borderRadius: 10,
              border: "none",
              background: C.ink,
              color: C.bg,
              fontSize: 13.5,
              fontWeight: 700,
              letterSpacing: "0.03em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Shop {category.name}
          </button>
        </div>
      </div>

      {/* ---- product grid for this category ---- */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
          marginTop: 28,
        }}
      >
        {category.products.map((p, i) => (
          <ProductCard
            key={category.slug + p.name + i}
            product={p}
            bg={PASTELS[(index + i + 1) % PASTELS.length]}
          />
        ))}
      </div>
    </section>
  );
}

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
/*  MAIN COMPONENT                                                     */
/* ------------------------------------------------------------------ */
export default function Home() {
  const [heroColorIdx, setHeroColorIdx] = useState(0);

  const scrollToCategory = (slug) => {
    const el = document.getElementById(`cat-${slug}`);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

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
        @keyframes identee-cat-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .identee-pastel-card { transition: transform 0.4s cubic-bezier(.2,.8,.2,1), box-shadow 0.4s ease; }
        .identee-pastel-card:hover { transform: translateY(-6px); box-shadow: 0 20px 34px -18px rgba(21,19,15,0.22); }
        .identee-pastel-card img { transition: transform 0.6s ease; }
        .identee-pastel-card:hover img { transform: scale(1.06); }
        .identee-cta-btn { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .identee-cta-btn:hover { transform: translateY(-2px); }
        .identee-testimonial-avatar { position: relative; width: 56px; height: 56px; border-radius: 50%; overflow: hidden; margin-bottom: 14px; border: 1px solid ${C.border}; background: ${C.bg}; }
        .identee-testimonial-avatar video { position: absolute; top: 50%; left: 50%; width: 100%; height: 100%; min-width: 100%; min-height: 100%; transform: translate(-50%, -50%); object-fit: cover; object-position: center; }

        /* ---- auto-scrolling category slider ---- */
        .identee-cat-slider { overflow: hidden; padding: 8px 0 4px; }
        .identee-cat-track {
          display: inline-flex;
          gap: 22px;
          animation: identee-cat-scroll 28s linear infinite;
          width: max-content;
        }
        .identee-cat-slider:hover .identee-cat-track { animation-play-state: paused; }
        .identee-cat-slide {
          border: none;
          background: transparent;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          width: 150px;
          flex: 0 0 auto;
          padding: 0;
        }
        .identee-cat-slide-img {
          display: block;
          width: 150px;
          height: 190px;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: ${C.shadow};
          transition: transform 0.35s ease, box-shadow 0.35s ease;
        }
        .identee-cat-slide-img img { width: 100%; height: 100%; object-fit: cover; }
        .identee-cat-slide:hover .identee-cat-slide-img { transform: translateY(-6px); box-shadow: 0 24px 40px -18px rgba(21,19,15,0.3); }
        .identee-cat-slide-name { font-size: 13.5px; font-weight: 700; color: ${C.ink}; }

        @media (max-width: 720px) {
          .hero-color-widget { display: none !important; }
        }
      `}</style>

      {/* ================= HERO — full-bleed video background (unchanged) ================= */}
      <section
        style={{
          position: "relative",
          minHeight: "82vh",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
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

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(100deg, rgba(21,19,15,0.82) 0%, rgba(21,19,15,0.55) 45%, rgba(21,19,15,0.28) 100%)",
            zIndex: 1,
          }}
        />

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
          <HeroColorWidget
            activeIdx={heroColorIdx}
            setActiveIdx={setHeroColorIdx}
          />
        </div>
      </section>

      {/* ================= MARQUEE STRIP (unchanged) ================= */}
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

      {/* ================= AUTO-SCROLLING CATEGORY SLIDER ================= */}
      <section
        style={{ padding: "56px 24px 12px", maxWidth: 1280, margin: "0 auto" }}
      >
        <p
          style={{
            margin: "0 0 18px",
            fontSize: 12,
            letterSpacing: "0.2em",
            color: C.muted,
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          Shop by Category
        </p>
        <CategorySlider categories={CATEGORIES} onSelect={scrollToCategory} />
      </section>

      {/* ================= PER-CATEGORY BANNER + PRODUCTS ================= */}
      {CATEGORIES.map((category, i) => (
        <CategorySection key={category.slug} category={category} index={i} />
      ))}

      {/* ================= DESIGN YOUR OWN — replaces Bulk Order band ================= */}
      <section
        style={{
          margin: "24px 24px 48px",
          maxWidth: 1280,
          marginLeft: "auto",
          marginRight: "auto",
          background: C.yellow,
          borderRadius: 28,
          padding: "56px 48px",
          display: "grid",
          gridTemplateColumns: "0.9fr 1.1fr",
          gap: 40,
          alignItems: "stretch",
          overflow: "visible",
          boxShadow: "0 30px 60px -30px rgba(21,19,15,0.28)",
        }}
      >
        <div style={{ position: "relative", aspectRatio: "1/1" }}>
          <div
            style={{
              position: "absolute",
              top: 14,
              right: -14,
              width: "100%",
              height: "100%",
              background: C.ink,
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
              boxShadow: "0 18px 36px -16px rgba(21,19,15,0.35)",
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
              <source src={customizeVideo} type="video/mp4" />
            </video>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            textAlign: "center",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: "clamp(20px, 2.6vw, 28px)",
              color: C.ink,
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
              textTransform: "uppercase",
            }}
          >
            Your Style,
            <br />
            Your Story,
            <br />
            <span
              style={{
                background: C.ink,
                color: C.yellow,
                padding: "2px 10px",
                display: "inline-block",
              }}
            >
              Your Identee
            </span>
          </h3>
          <h2
            style={{
              margin: "22px 0 0",
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: "clamp(30px, 4.4vw, 48px)",
              color: C.ink,
              lineHeight: 1.08,
            }}
          >
            DESIGN YOUR
            <br />
            OWN
          </h2>
          <p
            style={{
              margin: "18px 0 0",
              fontSize: 14.5,
              color: C.ink,
              maxWidth: 400,
              lineHeight: 1.65,
              opacity: 0.85,
            }}
          >
            Drop your own artwork, pick placement and preview it live on the
            garment — our 360° customiser lets you build a piece that's entirely
            yours before you order.
          </p>
          <button
            className="identee-cta-btn"
            onClick={() => {
              window.location.href = "/customize";
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
            Start Customising
          </button>
          <div
            style={{
              display: "flex",
              gap: 36,
              marginTop: 34,
              justifyContent: "center",
            }}
          >
            {[
              ["Drag & Drop", "Your artwork"],
              ["Live Preview", "360° view"],
              ["Pan India", "Shipping"],
            ].map(([val, label]) => (
              <div key={label}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 700,
                    color: C.ink,
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
                    color: C.ink,
                    opacity: 0.65,
                  }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
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
                <div className="identee-testimonial-avatar">
                  <video autoPlay muted loop playsInline>
                    <source src={t.video} type="video/mp4" />
                  </video>
                </div>
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

      {/* ================= FOOTER CONTACT STRIP ================= */}
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
