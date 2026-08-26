// config/printPositions.js
//
// Canonical fixed print-position catalog, based on the standard
// DTF/screen-print placement guide (Left Chest, Center Chest, Full
// Front, Oversize Front, Back Collar, Upper Back, Full Back, Sleeve).
//
// IMPORTANT: these are FIXED positions with a RANGE, not free
// placement. A customer can resize their design within [min, max] for
// a given position, but the design can never move outside its named
// zone or be resized past the documented range — this matches how
// real print shops quote placements ("Left Chest, up to 4in wide").
//
// Fields:
//   label              — shown in the position-picker UI
//   side               — which garment view this lives on (front/back/left/right)
//   anchor             — how the box is horizontally/vertically anchored
//                         (see resolvePrintZone.js for how each anchor is resolved)
//   widthIn / heightIn — [min, max] allowed size range, in inches
//   offsetFromCollarIn / offsetFromHemIn — [min, max] distance from the
//                         garment landmark used to anchor this position
//   defaultWidthIn / defaultHeightIn — starting size when a customer
//                         first picks this position (must fall inside
//                         the widthIn/heightIn range)
//   garmentTypes       — optional allow-list; if present, this position
//                         is only offered for these garment shapes
//                         (matches the `shape` keys in GarmentSilhouette.jsx
//                         / garmentCanvasCalibration.js)

export const PRINT_POSITION_CATALOG = {
  "left-chest": {
    label: "Left Chest",
    side: "front",
    anchor: "collar-left",
    widthIn: [2.5, 5],
    heightIn: [2.5, 5],
    offsetFromCollarIn: [3, 4],
    defaultWidthIn: 3.5,
    defaultHeightIn: 3.5,
  },

  "center-chest": {
    label: "Center Chest",
    side: "front",
    anchor: "collar-center",
    widthIn: [6, 10],
    heightIn: [6, 8],
    offsetFromCollarIn: [4, 5],
    defaultWidthIn: 8,
    defaultHeightIn: 7,
  },

  "full-front": {
    label: "Full Front",
    side: "front",
    anchor: "collar-center",
    widthIn: [10, 12],
    heightIn: [10, 14],
    offsetFromCollarIn: [3, 3],
    defaultWidthIn: 11,
    defaultHeightIn: 12,
  },

  "oversize-front": {
    label: "Oversize Front",
    side: "front",
    anchor: "collar-center",
    widthIn: [12, 15],
    heightIn: [14, 16],
    offsetFromCollarIn: [2, 3],
    defaultWidthIn: 13.5,
    defaultHeightIn: 15,
    // Only makes sense on garments with enough flat front area —
    // hide this option for a regular slim tee.
    garmentTypes: ["tee-oversized", "hoodie", "sweatshirt"],
  },

  "back-collar": {
    label: "Back Collar",
    side: "back",
    anchor: "collar-center",
    widthIn: [1, 3],
    heightIn: [1, 3],
    offsetFromCollarIn: [2, 2],
    defaultWidthIn: 2,
    defaultHeightIn: 2,
  },

  "upper-back": {
    label: "Upper Back",
    side: "back",
    anchor: "collar-center",
    widthIn: [10, 14],
    heightIn: [1, 6],
    offsetFromCollarIn: [3, 4],
    defaultWidthIn: 12,
    defaultHeightIn: 4,
  },

  "full-back": {
    label: "Full Back",
    side: "back",
    anchor: "collar-center",
    widthIn: [10, 14],
    heightIn: [6, 15],
    offsetFromCollarIn: [3, 4],
    defaultWidthIn: 12,
    defaultHeightIn: 12,
  },

  "left-sleeve": {
    label: "Left Sleeve",
    side: "left",
    anchor: "hem-center",
    widthIn: [1, 4],
    heightIn: [1, 4],
    offsetFromHemIn: [1, 4],
    defaultWidthIn: 2.5,
    defaultHeightIn: 2.5,
  },

  "right-sleeve": {
    label: "Right Sleeve",
    side: "right",
    anchor: "hem-center",
    widthIn: [1, 4],
    heightIn: [1, 4],
    offsetFromHemIn: [1, 4],
    defaultWidthIn: 2.5,
    defaultHeightIn: 2.5,
  },
};

// Returns only the positions valid for a given garment shape key
// (e.g. "tee", "hoodie" — matches GarmentSilhouette.jsx's SHAPE_MAP).
// Positions with no `garmentTypes` allow-list are valid everywhere.
export function getPositionsForGarment(garmentShape) {
  return Object.entries(PRINT_POSITION_CATALOG)
    .filter(
      ([, pos]) => !pos.garmentTypes || pos.garmentTypes.includes(garmentShape),
    )
    .map(([key, pos]) => ({ key, ...pos }));
}
