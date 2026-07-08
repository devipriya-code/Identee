// data/textEffects.js
//
// The 6 effects from the "TEXT EFFECTS" screenshot. Each entry just
// describes the effect; the actual rendering math lives in
// components/WarpedText.jsx (shared by both the small preview cards in
// TextEffectsPanel and the real text on the garment canvas — same
// component, different size, so what you pick is exactly what you get).

export const TEXT_EFFECTS = [
  {
    key: "straight",
    label: "Straight",
    // no warp — plain horizontal baseline
  },
  {
    key: "arc",
    label: "Arc",
    curveDeg: 35, // how much the baseline bows upward, in degrees of arc
  },
  {
    key: "circle",
    label: "Circle",
    // text runs the full way around a circle
  },
  {
    key: "bulge",
    label: "Bulge",
    curveDeg: 55, // taller hump than Arc, text stays upright (doesn't tilt with the curve)
  },
  {
    key: "smallToLarge",
    label: "Small To Large",
    fromScale: 0.55,
    toScale: 1.15,
  },
  {
    key: "largeToSmall",
    label: "Large To Small",
    fromScale: 1.15,
    toScale: 0.55,
  },
];

export function getTextEffect(key) {
  return TEXT_EFFECTS.find((e) => e.key === key) || TEXT_EFFECTS[0];
}
