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
];
 
// `shape` selects which silhouette <GarmentSilhouette> draws.
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
 
export function getGarmentType(key) {
  return GARMENT_TYPES.find((g) => g.key === key) || null;
}
 
export function getGarmentColor(garmentType, colorSlug) {
  if (!garmentType) return null;
  return (
    garmentType.colors.find((c) => c.slug === colorSlug) ||
    garmentType.colors[0] ||
    null
  );
}
 