// theme.js — IDENTEE design tokens (bold editorial: white + gold blocks + ink)

export const THEME = {
  // ── Backgrounds ──────────────────────────────────────────────
  bg: "#FFFFFF", // clean white page background
  surface: "#FFFFFF",
  surface2: "#F7F4EC", // soft warm-neutral for inputs/recessed panels
  border: "#EAE3CF",
  borderLight: "#DED2AC",

  // ── Gold — the hero color, used as bold full-bleed blocks ───
  gold: "#C9A24B",
  goldBright: "#E8B94D",
  goldBlock: "#F0C24C", // vivid golden-yellow for large color-block sections
  goldDeep: "#9C7A2E",
  goldBg: "#C9A24B18",
  goldBorder: "#C9A24B4D",

  // ── Ink — near-black, used for text and bold CTA buttons ────
  ink: "#141110",
  inkSoft: "#241B14",

  // ── Small accent for tags/badges (sale flash, etc.) ─────────
  accent: "#C0392B",
  accentBg: "#C0392B14",
  accentBorder: "#C0392B44",

  // ── Text ─────────────────────────────────────────────────────
  text: "#141110",
  textMuted: "#6B6559",
  textFaint: "#A39C8C",

  // ── Status ───────────────────────────────────────────────────
  danger: "#C0392B",
  dangerBg: "#C0392B14",
  dangerBorder: "#C0392B44",

  fontDisplay: "'Cormorant Garamond', serif",
  fontBody: "'Inter', sans-serif",

  shadow: "0 4px 20px rgba(20,17,16,0.08)",
};

export const labelStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: THEME.textMuted,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  fontFamily: THEME.fontBody,
};

export const inputStyle = {
  width: "100%",
  background: THEME.surface2,
  border: `1px solid ${THEME.border}`,
  borderRadius: 7,
  padding: "8px 11px",
  color: THEME.text,
  fontSize: 13,
  fontFamily: THEME.fontBody,
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

export const sectionHeading = {
  fontSize: 13,
  fontWeight: 600,
  color: THEME.goldDeep,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  fontFamily: THEME.fontBody,
  margin: "30px 0 16px",
  paddingBottom: 10,
  borderBottom: `1px solid ${THEME.border}`,
  display: "flex",
  alignItems: "center",
  gap: 8,
};

// Dynamic size charts by product style
export const SIZE_CHARTS = {
  "Round Neck": [
    "4-6",
    "6-8",
    "8-10",
    "10-12",
    "12-14",
    "14-16",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
  ],
  Oversized: [
    "4-6",
    "6-8",
    "8-10",
    "10-12",
    "12-14",
    "14-16",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
  ],
  Hoodie: [
    "4-6",
    "6-8",
    "8-10",
    "10-12",
    "12-14",
    "14-16",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
  ],
  Sweatshirt: [
    "4-6",
    "6-8",
    "8-10",
    "10-12",
    "12-14",
    "14-16",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
  ],
  Polo: ["10-12", "12-14", "14-16", "S", "M", "L", "XL", "XXL"],
};

export const PRODUCT_STYLES = Object.keys(SIZE_CHARTS);
