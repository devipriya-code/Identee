// theme.js — IDENTEE design tokens (gold on black)

export const THEME = {
  bg: "#0B0B0C",
  surface: "#16161A",
  surface2: "#1F1F24",
  border: "#2B2B30",
  borderLight: "#3A3A40",

  gold: "#C9A24B",
  goldBright: "#F0D585",
  goldDim: "#8A6F2E",
  goldBg: "#C9A24B14",
  goldBorder: "#C9A24B44",

  text: "#F3EFE6",
  textMuted: "#8A877F",
  textFaint: "#5A5852",

  danger: "#E2574C",
  dangerBg: "#E2574C18",
  dangerBorder: "#E2574C55",

  fontDisplay: "'Cormorant Garamond', serif",
  fontBody: "'Inter', sans-serif",

  shadow: "0 4px 20px rgba(0,0,0,0.45)",
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
  color: THEME.gold,
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
