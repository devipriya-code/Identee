// utils/resolvePrintZone.js
//
// Converts a named print position (e.g. "left-chest") + a garment
// shape (e.g. "hoodie") into:
//   - the on-screen % box to render (side, area: {left, top, width, height})
//   - the min/max % bounds the customer is allowed to resize within
//
// This is the single source of truth for "where can a design go" —
// the position-picker UI, the dashed print-area overlay, and the
// drag/resize clamp logic in CustomizePage.jsx should all call this
// instead of hardcoding percentages.

import { PRINT_POSITION_CATALOG } from "../config/printPositions";
import { GARMENT_REFERENCE_DIMENSIONS_IN } from "../config/garmentCanvasCalibration";

/**
 * @param {string} positionKey - key into PRINT_POSITION_CATALOG, e.g. "left-chest"
 * @param {string} garmentShape - key into GARMENT_REFERENCE_DIMENSIONS_IN, e.g. "tee"
 * @returns {{
 *   side: string,
 *   area: { left: number, top: number, width: number, height: number },
 *   minWidthPct: number, maxWidthPct: number,
 *   minHeightPct: number, maxHeightPct: number,
 * } | null}
 */
export function resolvePrintZone(positionKey, garmentShape) {
  const pos = PRINT_POSITION_CATALOG[positionKey];
  if (!pos) {
    console.warn(`resolvePrintZone: unknown position "${positionKey}"`);
    return null;
  }

  const ref = GARMENT_REFERENCE_DIMENSIONS_IN[garmentShape]?.[pos.side];
  if (!ref) {
    console.warn(
      `resolvePrintZone: no calibration for garment "${garmentShape}" / side "${pos.side}"`,
    );
    return null;
  }

  const widthPct = (pos.defaultWidthIn / ref.w) * 100;
  const heightPct = (pos.defaultHeightIn / ref.h) * 100;

  let leftPct;
  let topPct;

  switch (pos.anchor) {
    case "collar-center":
      leftPct = 50 - widthPct / 2;
      topPct = (pos.offsetFromCollarIn[0] / ref.h) * 100;
      break;

    case "collar-left":
      leftPct = (pos.offsetFromCollarIn[0] / ref.w) * 100;
      topPct = (pos.offsetFromCollarIn[0] / ref.h) * 100;
      break;

    case "collar-right":
      leftPct = 100 - widthPct - (pos.offsetFromCollarIn[0] / ref.w) * 100;
      topPct = (pos.offsetFromCollarIn[0] / ref.h) * 100;
      break;

    case "hem-center":
      leftPct = 50 - widthPct / 2;
      topPct = 100 - heightPct - (pos.offsetFromHemIn[0] / ref.h) * 100;
      break;

    default:
      console.warn(
        `resolvePrintZone: unknown anchor "${pos.anchor}" for "${positionKey}"`,
      );
      return null;
  }

  return {
    side: pos.side,
    area: {
      left: clampPct(leftPct),
      top: clampPct(topPct),
      width: clampPct(widthPct),
      height: clampPct(heightPct),
    },
    minWidthPct: (pos.widthIn[0] / ref.w) * 100,
    maxWidthPct: (pos.widthIn[1] / ref.w) * 100,
    minHeightPct: (pos.heightIn[0] / ref.h) * 100,
    maxHeightPct: (pos.heightIn[1] / ref.h) * 100,
  };
}

function clampPct(n) {
  return Math.min(Math.max(n, 0), 100);
}

/**
 * Given a garment shape, returns every valid position pre-resolved to
 * its on-screen zone — this is what feeds the position-picker grid UI
 * (one call per shape, not per position).
 */
export function resolveAllZonesForGarment(garmentShape) {
  return Object.keys(PRINT_POSITION_CATALOG)
    .map((key) => {
      const pos = PRINT_POSITION_CATALOG[key];
      if (pos.garmentTypes && !pos.garmentTypes.includes(garmentShape))
        return null;
      const zone = resolvePrintZone(key, garmentShape);
      return zone ? { key, label: pos.label, ...zone } : null;
    })
    .filter(Boolean);
}
