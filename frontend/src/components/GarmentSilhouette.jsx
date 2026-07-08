// components/GarmentSilhouette.jsx
//
// Draws a flat, tinted garment shape for a given `shape` (see
// garmentCatalog.js) and `view` (front/back/right/left). This stands in
// for a real no-print product photo — see the note at the top of
// garmentCatalog.js for how to swap in real photography per color later.
//
// UPDATED: previously this was a single flat-color path, which reads as
// a cartoon icon rather than a photographed garment. It now layers in
// the things that make a flat-lay product photo look real:
//   - a soft directional light gradient across the body
//   - ribbed collar/cuff/hem bands (a slightly darker double-line)
//   - a shoulder/sleeve fold shadow (the diagonal crease you get from a
//     garment being folded flat for the photo)
//   - a few low-opacity wrinkle strokes across the chest
// None of this is a substitute for real product photography — it's a
// closer-reading placeholder until real photos are wired up per
// getGarmentImagePath() in garmentCatalog.js.

// Rough luminance check so shading direction/opacity reads correctly on
// both light and dark garment colors (e.g. white vs black tee).
function isLight(hex) {
  const h = hex.replace("#", "");
  if (h.length < 6) return true;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 175;
}

// Shared texture overlay: directional light gradient + ribbed trim +
// fold shadow + wrinkle strokes. `ribPaths` are the collar/cuff/hem
// bands to darken slightly; `foldPath` is the diagonal shoulder crease;
// `wrinklePaths` are a few soft highlight/shadow strokes.
function FabricTexture({
  id,
  color,
  ribPaths = [],
  foldPath,
  wrinklePaths = [],
}) {
  const light = isLight(color);
  const shadeDark = light ? "rgba(0,0,0,0.16)" : "rgba(0,0,0,0.32)";
  const shadeLight = light
    ? "rgba(255,255,255,0.55)"
    : "rgba(255,255,255,0.14)";

  return (
    <>
      <defs>
        <linearGradient id={`${id}-light`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={shadeLight} />
          <stop offset="45%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor={shadeDark} />
        </linearGradient>
      </defs>
      {/* directional light/shadow wash across the whole garment */}
      <rect
        x="0"
        y="0"
        width="320"
        height="280"
        fill={`url(#${id}-light)`}
        style={{ mixBlendMode: "multiply" }}
      />

      {/* ribbed trim bands (collar / cuffs / hem) */}
      {ribPaths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke={shadeDark}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.55"
        />
      ))}

      {/* the diagonal fold crease every flat-laid garment photo has */}
      {foldPath && <path d={foldPath} fill={shadeDark} opacity="0.14" />}

      {/* soft wrinkle strokes */}
      {wrinklePaths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke={i % 2 === 0 ? shadeLight : shadeDark}
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.3"
        />
      ))}
    </>
  );
}

function TeeBody({ oversized, view, color }) {
  const isSide = view === "right" || view === "left";
  const bodyOffset = isSide ? 30 : 0; // narrower body suggests a side profile

  const bodyPath = `M ${90 - bodyOffset * 0.3},20
            L ${60 - bodyOffset},44
            L ${20 - bodyOffset * 1.4},${60 + (oversized ? 20 : 0)}
            L ${20 - bodyOffset * 1.4},${118 + (oversized ? 10 : 0)}
            L ${58 - bodyOffset},${104 + (oversized ? 10 : 0)}
            L ${58 - bodyOffset},260
            L ${262 + bodyOffset},260
            L ${262 + bodyOffset},${104 + (oversized ? 10 : 0)}
            L ${300 + bodyOffset * 1.4},${118 + (oversized ? 10 : 0)}
            L ${300 + bodyOffset * 1.4},${60 + (oversized ? 20 : 0)}
            L ${260 + bodyOffset},44
            L ${230 + bodyOffset * 0.3},20
            Q 160,${view === "back" ? 20 : 46} ${90 - bodyOffset * 0.3},20 Z`;

  return (
    <g transform={view === "left" ? "scale(-1,1) translate(-320,0)" : ""}>
      <path
        d={bodyPath}
        fill={color}
        stroke="rgba(0,0,0,0.18)"
        strokeWidth="2"
      />

      <FabricTexture
        id={`tee-${view}-${oversized ? "os" : "std"}`}
        color={color}
        ribPaths={[
          // collar rib (double line around the neckline)
          `M ${118 - bodyOffset * 0.3},22 Q 160,${view === "back" ? 26 : 50} ${202 + bodyOffset * 0.3},22`,
          // sleeve cuff hems
          `M ${20 - bodyOffset * 1.3},${104 + (oversized ? 12 : 2)} L ${58 - bodyOffset},${96 + (oversized ? 12 : 2)}`,
          `M ${300 + bodyOffset * 1.3},${104 + (oversized ? 12 : 2)} L ${262 + bodyOffset},${96 + (oversized ? 12 : 2)}`,
          // bottom hem
          `M ${58 - bodyOffset},254 L ${262 + bodyOffset},254`,
        ]}
        foldPath={`M ${70 - bodyOffset},40 L ${140},${oversized ? 130 : 118} L ${100},${oversized ? 150 : 138} L ${40 - bodyOffset},52 Z`}
        wrinklePaths={[
          `M 110,90 Q 160,100 210,88`,
          `M 100,150 Q 160,162 220,148`,
          `M 120,200 Q 160,208 200,198`,
        ]}
      />

      {view === "front" && (
        <ellipse cx="160" cy="26" rx="26" ry="10" fill="rgba(0,0,0,0.14)" />
      )}
    </g>
  );
}

function VNeckBody({ view, color }) {
  const bodyPath = `M 90,20 L 60,44 L 20,60 L 20,118 L 58,104 L 58,260 L 262,260
           L 262,104 L 300,118 L 300,60 L 260,44 L 230,20
           L 190,${view === "back" ? 20 : 60} L 160,${view === "back" ? 20 : 34} L 130,${view === "back" ? 20 : 60} Z`;
  return (
    <g>
      <path
        d={bodyPath}
        fill={color}
        stroke="rgba(0,0,0,0.18)"
        strokeWidth="2"
      />
      <FabricTexture
        id={`vneck-${view}`}
        color={color}
        ribPaths={[
          `M 130,60 L 160,34 L 190,60`,
          `M 20,104 L 58,96`,
          `M 300,104 L 262,96`,
          `M 58,254 L 262,254`,
        ]}
        foldPath={`M 70,40 L 140,118 L 100,138 L 40,52 Z`}
        wrinklePaths={[
          `M 110,100 Q 160,110 210,98`,
          `M 110,170 Q 160,180 210,168`,
        ]}
      />
    </g>
  );
}

function PoloBody({ view, color }) {
  const bodyPath = `M 90,24 L 60,46 L 20,62 L 20,120 L 58,106 L 58,260 L 262,260
           L 262,106 L 300,120 L 300,62 L 260,46 L 230,24
           L 230,50 L 205,64 L 190,44 L 160,52 L 130,44 L 115,64 L 90,50 Z`;
  return (
    <g>
      <path
        d={bodyPath}
        fill={color}
        stroke="rgba(0,0,0,0.18)"
        strokeWidth="2"
      />
      <FabricTexture
        id={`polo-${view}`}
        color={color}
        ribPaths={[
          `M 20,106 L 58,98`,
          `M 300,106 L 262,98`,
          `M 58,254 L 262,254`,
          `M 130,44 L 160,52 L 190,44`,
        ]}
        foldPath={`M 70,44 L 138,120 L 98,138 L 38,56 Z`}
        wrinklePaths={[
          `M 110,110 Q 160,118 210,106`,
          `M 110,180 Q 160,188 210,176`,
        ]}
      />
      {view === "front" && (
        <>
          <line
            x1="160"
            y1="60"
            x2="160"
            y2="96"
            stroke="rgba(0,0,0,0.24)"
            strokeWidth="2"
          />
          <circle cx="160" cy="70" r="2.4" fill="rgba(0,0,0,0.35)" />
          <circle cx="160" cy="86" r="2.4" fill="rgba(0,0,0,0.35)" />
        </>
      )}
    </g>
  );
}

function HoodieBody({ view, color }) {
  const hoodPath = "M 110,34 Q 160,4 210,34 L 226,58 Q 160,40 94,58 Z";
  const bodyPath = `M 96,44 L 58,64 L 16,82 L 16,142 L 56,128 L 56,264 L 264,264
           L 264,128 L 304,142 L 304,82 L 262,64 L 224,44
           L 224,58 Q 160,42 96,58 Z`;
  return (
    <g>
      <path
        d={hoodPath}
        fill={color}
        stroke="rgba(0,0,0,0.16)"
        strokeWidth="2"
      />
      <path
        d={bodyPath}
        fill={color}
        stroke="rgba(0,0,0,0.18)"
        strokeWidth="2"
      />
      <FabricTexture
        id={`hoodie-${view}`}
        color={color}
        ribPaths={[
          `M 16,142 L 56,128`,
          `M 304,142 L 264,128`,
          `M 56,254 L 264,254`,
        ]}
        foldPath={`M 76,64 L 150,150 L 106,172 L 40,74 Z`}
        wrinklePaths={[
          `M 100,110 Q 160,120 220,108`,
          `M 100,220 Q 160,230 220,218`,
        ]}
      />
      {view === "front" && (
        <>
          <path
            d="M 96,150 Q 160,168 224,150 L 224,190 Q 160,206 96,190 Z"
            fill="rgba(0,0,0,0.1)"
          />
          <line
            x1="140"
            y1="66"
            x2="132"
            y2="110"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1="180"
            y1="66"
            x2="188"
            y2="110"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      )}
    </g>
  );
}

function SweatshirtBody({ view, color }) {
  const bodyPath = `M 92,26 L 58,48 L 18,66 L 18,124 L 56,110 L 56,258 L 264,258
           L 264,110 L 302,124 L 302,66 L 262,48 L 228,26
           Q 160,44 92,26 Z`;
  return (
    <g>
      <path
        d={bodyPath}
        fill={color}
        stroke="rgba(0,0,0,0.18)"
        strokeWidth="2"
      />
      <FabricTexture
        id={`sweat-${view}`}
        color={color}
        ribPaths={[`M 92,26 Q 160,44 228,26`]}
        foldPath={`M 72,50 L 142,128 L 100,148 L 38,60 Z`}
        wrinklePaths={[
          `M 100,120 Q 160,130 220,118`,
          `M 100,190 Q 160,200 220,188`,
        ]}
      />
      {/* ribbed cuffs + hem — slightly darker fabric bands */}
      <rect x="18" y="112" width="38" height="10" fill="rgba(0,0,0,0.14)" />
      <rect x="264" y="112" width="38" height="10" fill="rgba(0,0,0,0.14)" />
      <rect x="56" y="248" width="208" height="10" fill="rgba(0,0,0,0.14)" />
      {view === "front" && (
        <ellipse cx="160" cy="32" rx="20" ry="7" fill="rgba(0,0,0,0.12)" />
      )}
    </g>
  );
}

const SHAPE_MAP = {
  tee: TeeBody,
  "tee-oversized": (props) => <TeeBody {...props} oversized />,
  vneck: VNeckBody,
  polo: PoloBody,
  hoodie: HoodieBody,
  sweatshirt: SweatshirtBody,
};

export default function GarmentSilhouette({
  shape,
  view = "front",
  color = "#1B1B1B",
}) {
  const Body = SHAPE_MAP[shape] || TeeBody;
  return (
    <svg
      viewBox="0 0 320 280"
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      {/* soft drop shadow under the garment, like it's resting on a table */}
      <ellipse cx="160" cy="270" rx="130" ry="10" fill="rgba(0,0,0,0.08)" />
      <Body view={view} color={color} />
    </svg>
  );
}
