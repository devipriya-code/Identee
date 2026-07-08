// components/WarpedText.jsx
//
// Renders text with one of the 6 TEXT_EFFECTS (data/textEffects.js) as
// SVG. Used in TWO places with the same component so there's no
// mismatch between preview and real render:
//   1. The small preview cards inside TextEffectsPanel.jsx
//   2. The actual text element on the garment canvas
//
// How each effect is built:
//   straight        — plain <text>, no warp
//   arc             — native SVG <textPath> along a shallow bezier arc
//                     (glyphs naturally rotate to follow the curve —
//                     this is what makes "arc" text look arched)
//   circle          — native SVG <textPath> along a full circle path
//   bulge           — per-character <tspan>s with font-size on a bell
//                     curve (small at both ends, largest in the
//                     middle) — baseline stays flat, nothing rotates
//   smallToLarge    — per-character <tspan>s, font-size ramps up
//                     left -> right
//   largeToSmall    — per-character <tspan>s, font-size ramps down
//                     left -> right
//
// viewBox is always "0 0 300 120" so this drops into a small preview
// card or scales up to fill the real canvas — same math either way.

import { getTextEffect } from "../data/textEffects";

const VB_W = 300;
const VB_H = 120;

// Rough average glyph advance width as a fraction of font-size — good
// enough for laying out a design-tool preview. (Exact kerning isn't
// needed here since the final print art is rasterized from this same
// SVG, not measured character-by-character elsewhere.)
const AVG_CHAR_WIDTH_FACTOR = 0.58;

function buildArcPath(curveDeg, direction = 1) {
  const sagitta = (curveDeg / 90) * (VB_H * 0.4) * direction;
  const y0 = VB_H * 0.65;
  return `M 10,${y0} Q ${VB_W / 2},${y0 - sagitta * 2} ${VB_W - 10},${y0}`;
}

function buildCirclePath() {
  const cx = VB_W / 2;
  const cy = VB_H / 2;
  const r = VB_H * 0.42;
  return `M ${cx},${cy - r} A ${r},${r} 0 1,1 ${cx - 0.001},${cy - r}`;
}

function fontStyleProps({ bold, italic }) {
  return {
    fontWeight: bold ? 700 : 400,
    fontStyle: italic ? "italic" : "normal",
  };
}

export default function WarpedText({
  text = "YOUR DESIGN",
  effect = "straight",
  fontFamily = "Arial",
  fontSize = 26,
  color = "#000000",
  bold = false,
  italic = false,
  underline = false,
  align = "left",
  idSuffix = "warp",
}) {
  const config = getTextEffect(effect);
  const styleProps = fontStyleProps({ bold, italic });
  const chars = text.split("");

  // --- straight -----------------------------------------------------
  if (effect === "straight" || chars.length === 0) {
    return (
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        style={{ width: "100%", height: "100%" }}
      >
        <text
          x="50%"
          y="50%"
          textAnchor={align === "left" ? "middle" : align}
          dominantBaseline="middle"
          fontFamily={fontFamily}
          fontSize={fontSize}
          fill={color}
          textDecoration={underline ? "underline" : "none"}
          style={styleProps}
        >
          {text}
        </text>
      </svg>
    );
  }

  // --- arc ------------------------------------------------------------
  if (effect === "arc") {
    const pathId = `arc-${idSuffix}`;
    return (
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        style={{ width: "100%", height: "100%" }}
      >
        <defs>
          <path id={pathId} d={buildArcPath(config.curveDeg, 1)} fill="none" />
        </defs>
        <text
          fontFamily={fontFamily}
          fontSize={fontSize}
          fill={color}
          textDecoration={underline ? "underline" : "none"}
          style={styleProps}
        >
          <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
            {text}
          </textPath>
        </text>
      </svg>
    );
  }

  // --- circle -----------------------------------------------------------
  if (effect === "circle") {
    const pathId = `circle-${idSuffix}`;
    return (
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        style={{ width: "100%", height: "100%" }}
      >
        <defs>
          <path id={pathId} d={buildCirclePath()} fill="none" />
        </defs>
        <text
          fontFamily={fontFamily}
          fontSize={fontSize * 0.75}
          fill={color}
          textDecoration={underline ? "underline" : "none"}
          style={styleProps}
        >
          <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
            {text}
          </textPath>
        </text>
      </svg>
    );
  }

  // --- per-character effects: bulge / smallToLarge / largeToSmall -----
  // compute a font-size for each character index, then lay characters
  // out left-to-right using their own advance widths so spacing still
  // looks even despite the size ramp.
  const n = chars.length;
  const sizes = chars.map((_, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1); // 0..1 across the string

    if (effect === "bulge") {
      // bell curve: small at edges (t=0/1), largest in the middle (t=0.5)
      const bell = Math.sin(Math.PI * t); // 0 at edges, 1 at center
      const minScale = 0.7;
      return fontSize * (minScale + (1 - minScale) * bell);
    }

    if (effect === "smallToLarge") {
      return (
        fontSize * (config.fromScale + (config.toScale - config.fromScale) * t)
      );
    }

    if (effect === "largeToSmall") {
      return (
        fontSize * (config.fromScale + (config.toScale - config.fromScale) * t)
      );
    }

    return fontSize;
  });

  const widths = chars.map((c, i) =>
    c === " " ? sizes[i] * 0.35 : sizes[i] * AVG_CHAR_WIDTH_FACTOR,
  );
  const totalWidth = widths.reduce((a, b) => a + b, 0);
  let cursor = VB_W / 2 - totalWidth / 2;

  const tspans = chars.map((c, i) => {
    const x = cursor + widths[i] / 2;
    cursor += widths[i];
    return (
      <tspan
        key={i}
        x={x}
        y={VB_H / 2}
        fontSize={sizes[i]}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {c}
      </tspan>
    );
  });

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      style={{ width: "100%", height: "100%" }}
    >
      <text
        fontFamily={fontFamily}
        fill={color}
        textDecoration={underline ? "underline" : "none"}
        style={styleProps}
      >
        {tspans}
      </text>
    </svg>
  );
}
