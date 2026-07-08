export const COLOR_PALETTE = [
  { name: "Black", slug: "black", hex: "#1B1B1B" },
  { name: "Maroon", slug: "maroon", hex: "#5C1A24" },
  { name: "Navy Blue", slug: "navy-blue", hex: "#1B2A4A" },
  { name: "Red", slug: "red", hex: "#B3272B" },
  { name: "Royal Blue", slug: "royal-blue", hex: "#1F4FBF" },
  { name: "White", slug: "white", hex: "#F5F5F0" },
  { name: "Heather Grey", slug: "heather-grey", hex: "#9B9B93" },
  { name: "Olive Green", slug: "olive-green", hex: "#5C5E32" },
  { name: "Kiwi Green", slug: "kiwi-green", hex: "#8BB33B" },
  { name: "Yellow", slug: "yellow", hex: "#E9C13B" },
  { name: "Bottle Green", slug: "bottle-green", hex: "#1F4A34" },
  { name: "Pink", slug: "pink", hex: "#E8A0BF" },
];

// `shape` selects which silhouette <GarmentSilhouette> draws as a
// fallback when no real photo exists yet for a given color/view.
export const GARMENT_TYPES = [
  {
    key: "round-neck-tshirt",
    label: "Round Neck T-Shirt",
    category: "Apparel",
    shape: "tee",
    colors: COLOR_PALETTE,
  },
  {
    key: "oversized-tshirt",
    label: "Oversized T-Shirt",
    category: "Apparel",
    shape: "tee-oversized",
    colors: COLOR_PALETTE,
  },
  {
    key: "vneck-tshirt",
    label: "V Neck T-Shirt",
    category: "Apparel",
    shape: "vneck",
    colors: COLOR_PALETTE,
  },
  {
    key: "polo",
    label: "Polo T-Shirt",
    category: "Apparel",
    shape: "polo",
    colors: COLOR_PALETTE,
  },
  {
    key: "hoodie",
    label: "Hoodie",
    category: "Jackets & Pullovers",
    shape: "hoodie",
    colors: COLOR_PALETTE,
  },
  {
    key: "sweatshirt",
    label: "Crew Neck Sweatshirt",
    category: "Jackets & Pullovers",
    shape: "sweatshirt",
    colors: COLOR_PALETTE,
  },
];

// Manual overrides for specific garment+color+view combos that don't
// live at the standard /public/garments/<key>/<colorSlug>-<view>.jpg
// path. Leave empty until you need an exception.
export const IMAGE_OVERRIDES = {};

// Wider name->hex fallback table for colors that come from real
// Product documents but aren't part of the curated COLOR_PALETTE
// above. Extend this as new color names show up in your catalog —
// it mirrors COLOR_HEX_MAP in server/controllers/customizerCatalogController.js,
// keep the two in sync if you add entries.
const EXTRA_COLOR_HEX = {
  pink: "#E8A0BF",
  crimson: "#DC143C",
  mustard: "#E3A72E",
  orange: "#E08E0B",
  purple: "#6A54C8",
  grey: "#8A877F",
  gray: "#8A877F",
  brown: "#6B4A32",
  beige: "#E7DEC9",
  green: "#3E7C4A",
  blue: "#2A4D9B",
};

function titleCase(slug = "") {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function getGarmentType(key) {
  return GARMENT_TYPES.find((g) => g.key === key) || null;
}

export function getGarmentColor(garmentType, colorSlug) {
  if (!garmentType) return null;

  // No color specified at all (e.g. bare /customize/polo with no
  // ?color=) — default to the first curated swatch, same as before.
  if (!colorSlug) return garmentType.colors[0] || null;

  // Exact match in this garment's curated palette — the normal path
  // for the manual Choose Pattern -> Choose Color flow.
  const curated = garmentType.colors.find((c) => c.slug === colorSlug);
  if (curated) return curated;

  // No curated match — this is a real product's color that isn't one
  // of the 11 swatches (e.g. "pink"). Build a one-off color object
  // instead of silently defaulting to Black.
  const hex = EXTRA_COLOR_HEX[colorSlug];
  if (hex) {
    return { name: titleCase(colorSlug), slug: colorSlug, hex };
  }

  // Truly unknown color name — still better to show a neutral grey
  // than to lie and show black.
  console.warn(
    `[customizer] Unknown color slug "${colorSlug}" for garment "${garmentType.key}" — ` +
      `using a neutral placeholder. Add it to EXTRA_COLOR_HEX in garmentCatalog.js if this is a real color.`,
  );
  return { name: titleCase(colorSlug), slug: colorSlug, hex: "#CCCCCC" };
}

// Builds the expected path for a real product photo. Doesn't check
// whether the file actually exists — <GarmentVisual> handles the
// fallback via onError. Checks IMAGE_OVERRIDES first.
export function getGarmentImagePath(garmentKey, colorSlug, view = "front") {
  const override = IMAGE_OVERRIDES?.[garmentKey]?.[colorSlug]?.[view];
  if (override) return override;
  return `/garments/${garmentKey}/${colorSlug}-${view}.jpg`;
}
