// components/ColorPickerPanel.jsx
//
// Matches the reference "CHOOSE COLOR" screen:
//   ← back arrow, centered "CHOOSE COLOR" title
//   Premium Colors (Additional Charges) — Gold / Silver metallic swatches
//   Basic Colors — a hue x lightness grid
//   Custom Colors — colors the user has picked via the HSV tool, with
//                   a "Remove" link that clears the saved list
//   Full HSV picker: saturation/value canvas square, hue slider,
//   eyedropper (browser EyeDropper API where supported), and RGB
//   number inputs that stay in sync with the square/slider.
//
// Usage: <ColorPickerPanel value={hex} onChange={(hex) => ...} onBack={...} />
// Drop-in replacement anywhere you currently have <input type="color">.

import { useRef, useEffect, useState, useCallback } from "react";

const C = {
  ink: "#1C1A14",
  muted: "#7A7160",
  border: "#E6DCC4",
  panelBg: "#fff",
  gold: "#C9A24B",
};

// 8 hue columns x 6 lightness rows — reads as the same light->dark
// swatch wall as the reference, without hand-listing 48 hex values.
const HUE_COLUMNS = [
  { hue: 340, sat: 68 }, // pink/red
  { hue: 280, sat: 50 }, // purple
  { hue: 250, sat: 55 }, // blue-violet
  { hue: 200, sat: 70 }, // sky blue
  { hue: 130, sat: 42 }, // green
  { hue: 35, sat: 88 }, // orange/yellow
  { hue: 25, sat: 22 }, // brown/tan
  { hue: 210, sat: 12 }, // blue-grey / neutral
];
const LIGHTNESS_ROWS = [90, 74, 58, 45, 32, 18];

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x) =>
    Math.round(255 * x)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  if (h.length !== 6) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHex(r, g, b) {
  const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
  const toHex = (x) => clamp(x).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  const v = max;
  return { h, s, v };
}

function hsvToRgb(h, s, v) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

const SQUARE_SIZE = 260;

export default function ColorPickerPanel({
  value = "#C93FB0",
  onChange,
  onBack,
  customColors = [],
  onAddCustomColor,
  onRemoveCustomColors,
  premiumEnabled = true,
}) {
  const startRgb = hexToRgb(value);
  const startHsv = rgbToHsv(startRgb.r, startRgb.g, startRgb.b);

  const [hue, setHue] = useState(startHsv.h);
  const [sat, setSat] = useState(startHsv.s);
  const [val, setVal] = useState(startHsv.v);
  const [rgbText, setRgbText] = useState({
    r: startRgb.r,
    g: startRgb.g,
    b: startRgb.b,
  });

  const squareRef = useRef(null);
  const draggingSquare = useRef(false);
  const draggingHue = useRef(false);

  const currentHex = (() => {
    const { r, g, b } = hsvToRgb(hue, sat, val);
    return rgbToHex(r, g, b);
  })();

  useEffect(() => {
    const { r, g, b } = hsvToRgb(hue, sat, val);
    setRgbText({ r: Math.round(r), g: Math.round(g), b: Math.round(b) });
    onChange?.(rgbToHex(r, g, b));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hue, sat, val]);

  const updateFromSquarePos = useCallback((clientX, clientY) => {
    const el = squareRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(clientY - rect.top, rect.height));
    setSat(x / rect.width);
    setVal(1 - y / rect.height);
  }, []);

  useEffect(() => {
    const handleMove = (e) => {
      if (draggingSquare.current) updateFromSquarePos(e.clientX, e.clientY);
    };
    const handleUp = () => {
      draggingSquare.current = false;
      draggingHue.current = false;
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [updateFromSquarePos]);

  const handleRgbInput = (channel, raw) => {
    const n = Math.max(0, Math.min(255, Number(raw) || 0));
    const next = { ...rgbText, [channel]: n };
    setRgbText(next);
    const hsv = rgbToHsv(next.r, next.g, next.b);
    setHue(hsv.h);
    setSat(hsv.s);
    setVal(hsv.v);
  };

  const handleEyedropper = async () => {
    if (!window.EyeDropper) return;
    try {
      const dropper = new window.EyeDropper();
      const result = await dropper.open();
      const rgb = hexToRgb(result.sRGBHex);
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      setHue(hsv.h);
      setSat(hsv.s);
      setVal(hsv.v);
    } catch {
      // user cancelled the eyedropper — no-op
    }
  };

  const commitCustomColor = () => onAddCustomColor?.(currentHex);

  return (
    <div
      style={{
        width: 340,
        maxWidth: "100%",
        flexShrink: 0,
        background: C.panelBg,
        borderRight: `1px solid ${C.border}`,
        padding: "20px 24px 28px",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          marginBottom: 20,
        }}
      >
        <button
          onClick={onBack}
          aria-label="Back"
          style={{
            position: "absolute",
            left: 0,
            border: "none",
            background: "none",
            fontSize: 20,
            color: C.ink,
            cursor: "pointer",
            padding: 4,
          }}
        >
          ←
        </button>
        <p
          style={{
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: C.ink,
            margin: 0,
          }}
        >
          CHOOSE COLOR
        </p>
      </div>

      {premiumEnabled && (
        <div style={{ marginBottom: 22 }}>
          <p style={sectionTitleStyle}>
            Premium Colors{" "}
            <span style={{ fontWeight: 400, color: C.muted, fontSize: 11 }}>
              (Additional Charges)
            </span>
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => onChange?.("__premium_gold")}
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: 8,
                border: "none",
                background: "linear-gradient(135deg,#F5D68A,#C9A24B)",
                color: "#2A1E00",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Gold
            </button>
            <button
              onClick={() => onChange?.("__premium_silver")}
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: 8,
                border: "none",
                background: "linear-gradient(135deg,#E8E8E8,#9B9B9B)",
                color: "#1C1A14",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Silver
            </button>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 22 }}>
        <p style={sectionTitleStyle}>Basic Colors</p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${HUE_COLUMNS.length}, 1fr)`,
            gap: 6,
          }}
        >
          {LIGHTNESS_ROWS.map((l, rowI) =>
            HUE_COLUMNS.map((col, colI) => {
              const hex = hslToHex(col.hue, col.sat, l);
              return (
                <button
                  key={`${rowI}-${colI}`}
                  onClick={() => {
                    const rgb = hexToRgb(hex);
                    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
                    setHue(hsv.h);
                    setSat(hsv.s);
                    setVal(hsv.v);
                  }}
                  style={{
                    width: "100%",
                    aspectRatio: "1/1",
                    borderRadius: 6,
                    border: `1px solid ${C.border}`,
                    background: hex,
                    cursor: "pointer",
                    padding: 0,
                  }}
                />
              );
            }),
          )}
        </div>
      </div>

      <div style={{ marginBottom: 22 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <p style={{ ...sectionTitleStyle, marginBottom: 0 }}>
            Custom Colors
          </p>
          {customColors.length > 0 && (
            <button
              onClick={onRemoveCustomColors}
              style={{
                border: "none",
                background: "none",
                color: C.gold,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Remove
            </button>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {customColors.map((hex, i) => (
            <button
              key={hex + i}
              onClick={() => {
                const rgb = hexToRgb(hex);
                const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
                setHue(hsv.h);
                setSat(hsv.s);
                setVal(hsv.v);
              }}
              style={{
                width: 30,
                height: 30,
                borderRadius: 6,
                border: `1px solid ${C.border}`,
                background: hex,
                cursor: "pointer",
                padding: 0,
              }}
            />
          ))}
          <button
            onClick={commitCustomColor}
            title="Save current color"
            style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              border: `1px dashed ${C.border}`,
              background: "#fff",
              color: C.muted,
              cursor: "pointer",
              fontSize: 16,
              lineHeight: 1,
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Saturation/Value square */}
      <div
        ref={squareRef}
        onMouseDown={(e) => {
          draggingSquare.current = true;
          updateFromSquarePos(e.clientX, e.clientY);
        }}
        style={{
          position: "relative",
          width: "100%",
          height: SQUARE_SIZE,
          borderRadius: 12,
          overflow: "hidden",
          cursor: "crosshair",
          background: `hsl(${hue}, 100%, 50%)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to right, #fff, rgba(255,255,255,0))",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, #000, rgba(0,0,0,0))",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: `calc(${sat * 100}% - 8px)`,
            top: `calc(${(1 - val) * 100}% - 8px)`,
            width: 16,
            height: 16,
            borderRadius: "50%",
            border: "2px solid #fff",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.4)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Hue slider */}
      <div
        style={{
          position: "relative",
          height: 14,
          borderRadius: 999,
          marginTop: 14,
          background:
            "linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)",
          cursor: "pointer",
        }}
        onMouseDown={(e) => {
          draggingHue.current = true;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
          setHue((x / rect.width) * 360);
        }}
        onMouseMove={(e) => {
          if (!draggingHue.current) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
          setHue((x / rect.width) * 360);
        }}
      >
        <div
          style={{
            position: "absolute",
            left: `calc(${(hue / 360) * 100}% - 7px)`,
            top: -2,
            width: 18,
            height: 18,
            borderRadius: "50%",
            border: "2px solid #fff",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.4)",
            background: currentHex,
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Eyedropper + swatch + RGB inputs */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginTop: 16,
        }}
      >
        {window.EyeDropper && (
          <button
            onClick={handleEyedropper}
            title="Pick color from screen"
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              background: "#fff",
              cursor: "pointer",
              fontSize: 15,
            }}
          >
            🖊️
          </button>
        )}
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: currentHex,
            border: `1px solid ${C.border}`,
            flexShrink: 0,
          }}
        />
        {["r", "g", "b"].map((ch) => (
          <input
            key={ch}
            type="number"
            min={0}
            max={255}
            value={rgbText[ch]}
            onChange={(e) => handleRgbInput(ch, e.target.value)}
            style={{
              width: 52,
              padding: "8px 6px",
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              fontSize: 13,
              textAlign: "center",
            }}
          />
        ))}
      </div>
      <div
        style={{
          display: "flex",
          gap: 10,
          marginTop: 4,
          paddingLeft: window.EyeDropper ? 44 : 0,
        }}
      >
        {["R", "G", "B"].map((label) => (
          <span
            key={label}
            style={{
              width: 52,
              textAlign: "center",
              fontSize: 10,
              color: C.muted,
              letterSpacing: "0.05em",
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

const sectionTitleStyle = {
  fontSize: 12,
  fontWeight: 700,
  color: "#1C1A14",
  marginBottom: 10,
};