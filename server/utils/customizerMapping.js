// utils/customizerMapping.js
const GARMENT_STYLE_TO_KEY = {
  "round neck": "round-neck-tshirt",
  oversized: "oversized-tshirt",
  hoodie: "hoodie",
  sweatshirt: "sweatshirt",
  polo: "polo",
  "v neck": "vneck-tshirt",
};

export function garmentStyleToKey(garmentStyle = "") {
  return GARMENT_STYLE_TO_KEY[garmentStyle.trim().toLowerCase()] || null;
}

export function colorNameToSlug(colorName = "") {
  return colorName.trim().toLowerCase().replace(/\s+/g, "-");
}
