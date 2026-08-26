// config/garmentCanvasCalibration.js
//
// How many real-world inches the flat canvas represents, per garment
// shape and per view, based on a SIZE-M reference garment laid flat.
//
// Why this exists: PRINT_POSITION_CATALOG measurements are in real
// inches. To place a "Left Chest, 3.5in wide" box correctly on screen,
// we need to know how many inches wide the canvas actually represents
// for THIS garment shape — a hoodie front is physically bigger than a
// tee front, so the same 3.5in box must land at a different % on each.
//
// Print position size stays FIXED across S–XXL on most POD platforms
// (only the garment grows, not the print) — so a single size-M
// reference per shape is enough; you do not need per-size calibration.
//
// ⚠️ PLACEHOLDER VALUES — replace every number below with a real
// tape-measure reading off your actual size-M flat-lay garments:
//   w = width in inches, measured pit-to-pit x2 (flat width) for
//       front/back, or across the sleeve for left/right
//   h = height in inches, measured collar-to-hem for front/back,
//       or shoulder-to-cuff for left/right
//
// This is a one-time setup per garment shape, not per SKU/color —
// all colors of the same shape share one calibration entry.

export const GARMENT_REFERENCE_DIMENSIONS_IN = {
  tee: {
    front: { w: 20, h: 29 },
    back: { w: 20, h: 29 },
    left: { w: 9, h: 29 },
    right: { w: 9, h: 29 },
  },
  "tee-oversized": {
    front: { w: 24, h: 31 },
    back: { w: 24, h: 31 },
    left: { w: 10, h: 31 },
    right: { w: 10, h: 31 },
  },
  vneck: {
    front: { w: 20, h: 28 },
    back: { w: 20, h: 28 },
    left: { w: 9, h: 28 },
    right: { w: 9, h: 28 },
  },
  polo: {
    front: { w: 20, h: 27 },
    back: { w: 20, h: 27 },
    left: { w: 9, h: 27 },
    right: { w: 9, h: 27 },
  },
  hoodie: {
    front: { w: 22, h: 28 },
    back: { w: 22, h: 28 },
    left: { w: 10, h: 28 },
    right: { w: 10, h: 28 },
  },
  sweatshirt: {
    front: { w: 21, h: 27 },
    back: { w: 21, h: 27 },
    left: { w: 9, h: 27 },
    right: { w: 9, h: 27 },
  },
};

// Quick sanity check you can run after filling in real numbers —
// flags any garment/view combo where a position's default size
// wouldn't actually fit inside the reference dimensions.
export function validateCalibration(PRINT_POSITION_CATALOG) {
  const problems = [];
  Object.entries(PRINT_POSITION_CATALOG).forEach(([key, pos]) => {
    const shapes =
      pos.garmentTypes || Object.keys(GARMENT_REFERENCE_DIMENSIONS_IN);
    shapes.forEach((shape) => {
      const ref = GARMENT_REFERENCE_DIMENSIONS_IN[shape]?.[pos.side];
      if (!ref) {
        problems.push(`${key}: no calibration for ${shape}/${pos.side}`);
        return;
      }
      if (pos.defaultWidthIn > ref.w || pos.defaultHeightIn > ref.h) {
        problems.push(
          `${key} on ${shape}: default size ${pos.defaultWidthIn}x${pos.defaultHeightIn}in ` +
            `exceeds reference ${ref.w}x${ref.h}in — check your measurements`,
        );
      }
    });
  });
  return problems;
}
