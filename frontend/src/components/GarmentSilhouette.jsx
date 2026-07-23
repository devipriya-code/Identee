// components/GarmentSilhouette.jsx

function isLight(hex) {
  const h = hex.replace("#", "");
  if (h.length < 6) return true;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 175;
}

// Every seam/outline needs to stay visible no matter how dark or light the
// garment color is — a black tee needs a light outline, a white tee needs a
// dark one. This picks that contrast color once, shared by every shape.
function outlineStroke(color) {
  return isLight(color) ? "rgba(0,0,0,0.22)" : "rgba(255,255,255,0.4)";
}

// A dashed print-placement box, styled to match the reference mockups
// (thin orange dashed square). Reused by every view.
function PrintAreaBox({ x, y, width, height }) {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill="none"
      stroke="#C98A2C"
      strokeWidth="1.5"
      strokeDasharray="4,3"
    />
  );
}

// Shared texture overlay: directional light gradient + ribbed trim +
// fold shadow + wrinkle strokes. `ribPaths` are the collar/cuff/hem/seam
// lines — these are drawn in whichever shade contrasts with the garment
// color, so they read clearly as stitching on both light and dark fabric.
// `foldPath` is the diagonal shoulder crease; `wrinklePaths` are a few
// soft highlight/shadow strokes.
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
  // seams/trim always use the contrasting shade so they stay visible
  const ribStroke = light ? shadeDark : shadeLight;

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

      {/* ribbed trim bands (collar / cuffs / hem / seams) */}
      {ribPaths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke={ribStroke}
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.7"
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

// ── FRONT / BACK ─────────────────────────────────────────────────────
// A smooth, rounded raglan-style sleeve cap (no boxy corner steps) that
// curves out from the shoulder to a cuff, stitched hems, a clean double
// -line collar rib, and a centered print-placement box.
function TeeFrontBack({ oversized, view, color, printArea = true }) {
  const o20 = oversized ? 20 : 0;
  const o10 = oversized ? 10 : 0;
  const isBack = view === "back";

  const bodyPath = `M 90,20
    Q 72,30 60,44
    Q 34,52 20,${60 + o20}
    Q 14,${85 + o20} 20,${118 + o10}
    Q 36,${112 + o10} 58,${104 + o10}
    L 58,260
    L 262,260
    L 262,${104 + o10}
    Q 284,${112 + o10} 300,${118 + o10}
    Q 306,${85 + o20} 300,${60 + o20}
    Q 286,52 260,44
    Q 248,30 230,20
    Q 160,${isBack ? 20 : 46} 90,20 Z`;

  return (
    <g>
      <path
        d={bodyPath}
        fill={color}
        stroke={outlineStroke(color)}
        strokeWidth="2"
      />

      <FabricTexture
        id={`tee-${view}-${oversized ? "os" : "std"}`}
        color={color}
        ribPaths={[
          // double-line collar rib
          `M 118,22 Q 160,${isBack ? 26 : 50} 202,22`,
          !isBack && `M 124,25 Q 160,44 196,25`,
          // sleeve cuff hems
          `M 20,${104 + (oversized ? 12 : 2)} L 58,${96 + (oversized ? 12 : 2)}`,
          `M 300,${104 + (oversized ? 12 : 2)} L 262,${96 + (oversized ? 12 : 2)}`,
          // bottom hem
          `M 58,254 L 262,254`,
        ].filter(Boolean)}
        foldPath={`M 70,40 L 140,${oversized ? 130 : 118} L 100,${oversized ? 150 : 138} L 40,52 Z`}
        wrinklePaths={[
          `M 110,90 Q 160,100 210,88`,
          `M 100,150 Q 160,162 220,148`,
          `M 120,200 Q 160,208 200,198`,
        ]}
      />

      {view === "front" && (
        <ellipse cx="160" cy="26" rx="26" ry="10" fill="rgba(0,0,0,0.14)" />
      )}

      {printArea && (
        <PrintAreaBox x={102} y={95} width={116} height={148} />
      )}
    </g>
  );
}

// ── SIDE (LEFT / RIGHT) ──────────────────────────────────────────────
// True side-profile silhouette: a big rounded sleeve "dome" up top (the
// sleeve is what you mostly see edge-on) with a nested raglan/armhole
// seam arc drawn just inside the outer edge, a stitched cuff-hem band
// where the sleeve ends, then a straight body down to the stitched
// bottom hem.
function TeeSideBody({ view, color, oversized, printArea = true }) {
  const cuffY = oversized ? 158 : 145;
  const apexY = oversized ? 8 : 14;
  const domeX0 = oversized ? 55 : 66; // sleeve/body width — no taper below the cuff
  const domeX1 = oversized ? 245 : 234;

  const bodyPath = `M ${domeX0},260
    L ${domeX0},${cuffY}
    Q ${domeX0 - 6},${apexY + 55} 130,${apexY}
    Q 205,${apexY + 14} ${domeX1},${cuffY}
    L ${domeX1},260 Z`;

  // raglan/armhole seam arc, nested a little inside the outer silhouette
  const seamPath = `M ${domeX0 + 30},${apexY + 30} Q 160,${apexY + 5} ${domeX1 - 22},${cuffY - 8}`;

  const stitchColor = isLight(color)
    ? "rgba(0,0,0,0.5)"
    : "rgba(255,255,255,0.55)";

  return (
    <g transform={view === "left" ? "scale(-1,1) translate(-320,0)" : ""}>
      <path
        d={bodyPath}
        fill={color}
        stroke={outlineStroke(color)}
        strokeWidth="2"
      />

      <FabricTexture
        id={`tee-side-${oversized ? "os" : "std"}`}
        color={color}
        ribPaths={[
          // small collar hint near the top of the dome
          `M 105,${apexY + 20} Q 130,${apexY + 6} 155,${apexY + 20}`,
          // the raglan / armhole seam
          seamPath,
        ]}
        foldPath={`M ${domeX0 + 10},${cuffY - 20} L 150,${apexY + 40} L 120,${apexY + 60} L ${domeX0 - 5},${cuffY} Z`}
        wrinklePaths={[
          `M ${domeX0 + 15},190 Q 150,198 ${domeX1 - 15},188`,
          `M ${domeX0 + 15},225 Q 150,232 ${domeX1 - 15},222`,
        ]}
      />

      {/* stitched cuff hem — where the sleeve ends (double dashed line) */}
      <line x1={domeX0} y1={cuffY} x2={domeX1} y2={cuffY} stroke={stitchColor} strokeWidth="1.5" strokeDasharray="3,3" />
      <line x1={domeX0} y1={cuffY + 5} x2={domeX1} y2={cuffY + 5} stroke={stitchColor} strokeWidth="1.5" strokeDasharray="3,3" opacity="0.6" />

      {/* stitched bottom hem (double dashed line) */}
      <line x1={domeX0} y1="254" x2={domeX1} y2="254" stroke={stitchColor} strokeWidth="1.5" strokeDasharray="3,3" />
      <line x1={domeX0} y1="259" x2={domeX1} y2="259" stroke={stitchColor} strokeWidth="1.5" strokeDasharray="3,3" opacity="0.6" />

      {printArea && (
        <PrintAreaBox x={112} y={cuffY - 78} width={76} height={76} />
      )}
    </g>
  );
}

function TeeBody({ oversized, view, color, printArea }) {
  if (view === "right" || view === "left") {
    return (
      <TeeSideBody view={view} color={color} oversized={oversized} printArea={printArea} />
    );
  }
  return (
    <TeeFrontBack view={view} color={color} oversized={oversized} printArea={printArea} />
  );
}

function VNeckBody({ view, color, printArea = true }) {
  const bodyPath = `M 90,20 Q 72,30 60,44 Q 34,52 20,60 Q 14,85 20,118
           Q 36,112 58,104 L 58,260 L 262,260
           L 262,104 Q 284,112 300,118 Q 306,85 300,60 Q 286,52 260,44 Q 248,30 230,20
           L 190,${view === "back" ? 20 : 60} L 160,${view === "back" ? 20 : 34} L 130,${view === "back" ? 20 : 60} Z`;
  return (
    <g>
      <path d={bodyPath} fill={color} stroke={outlineStroke(color)} strokeWidth="2" />
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
      {printArea && <PrintAreaBox x={102} y={95} width={116} height={148} />}
    </g>
  );
}

function PoloBody({ view, color, printArea = true }) {
  const bodyPath = `M 90,24 Q 72,34 60,46 Q 34,54 20,62 Q 14,86 20,120
           Q 36,114 58,106 L 58,260 L 262,260
           L 262,106 Q 284,114 300,120 Q 306,86 300,62 Q 286,54 260,46 Q 248,34 230,24
           L 230,50 L 205,64 L 190,44 L 160,52 L 130,44 L 115,64 L 90,50 Z`;
  return (
    <g>
      <path d={bodyPath} fill={color} stroke={outlineStroke(color)} strokeWidth="2" />
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
          <line x1="160" y1="60" x2="160" y2="96" stroke={outlineStroke(color)} strokeWidth="2" />
          <circle cx="160" cy="70" r="2.4" fill={outlineStroke(color)} />
          <circle cx="160" cy="86" r="2.4" fill={outlineStroke(color)} />
        </>
      )}
      {printArea && <PrintAreaBox x={100} y={100} width={120} height={140} />}
    </g>
  );
}

function HoodieBody({ view, color, printArea = true }) {
  const hoodPath = "M 110,34 Q 160,4 210,34 L 226,58 Q 160,40 94,58 Z";
  const bodyPath = `M 96,44 Q 76,54 58,64 Q 30,72 16,82 Q 10,112 16,142
           Q 36,134 56,128 L 56,264 L 264,264
           L 264,128 Q 284,134 304,142 Q 310,112 304,82 Q 290,72 262,64 Q 244,54 224,44
           L 224,58 Q 160,42 96,58 Z`;
  return (
    <g>
      <path d={hoodPath} fill={color} stroke={outlineStroke(color)} strokeWidth="2" />
      <path d={bodyPath} fill={color} stroke={outlineStroke(color)} strokeWidth="2" />
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
          <path d="M 96,150 Q 160,168 224,150 L 224,190 Q 160,206 96,190 Z" fill="rgba(0,0,0,0.1)" />
          <line x1="140" y1="66" x2="132" y2="110" stroke="rgba(255,255,255,0.5)" strokeWidth="3" strokeLinecap="round" />
          <line x1="180" y1="66" x2="188" y2="110" stroke="rgba(255,255,255,0.5)" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      {printArea && <PrintAreaBox x={100} y={100} width={120} height={140} />}
    </g>
  );
}

function SweatshirtBody({ view, color, printArea = true }) {
  const bodyPath = `M 92,26 Q 74,36 58,48 Q 32,56 18,66 Q 12,94 18,124
           Q 36,118 56,110 L 56,258 L 264,258
           L 264,110 Q 284,118 302,124 Q 308,94 302,66 Q 288,56 262,48 Q 244,36 228,26
           Q 160,44 92,26 Z`;
  return (
    <g>
      <path d={bodyPath} fill={color} stroke={outlineStroke(color)} strokeWidth="2" />
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
      {printArea && <PrintAreaBox x={100} y={90} width={120} height={140} />}
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
  printArea,
}) {
  const Body = SHAPE_MAP[shape] || TeeBody;
  return (
    <svg
      viewBox="0 0 320 280"
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      {/* soft drop shadow under the garment, like it's resting on a table */}
      <ellipse cx="160" cy="270" rx="130" ry="10" fill="rgba(0,0,0,0.08)" />
      <Body view={view} color={color} printArea={printArea} />
    </svg>
  );
}