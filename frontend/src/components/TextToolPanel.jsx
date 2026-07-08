// components/TextToolPanel.jsx
//
// The "Text" tab panel — matches the reference screenshot:
//   Your text here [input]
//   FONT SIZE [dropdown]   COLOR [swatch]
//   FONT STYLE  [B] [U] [I]
//   FONT [dropdown -> opens FontPicker]
//   TEXT ALIGNMENT [left] [center] [right] [justify]
//   TEXT EFFECT (STRAIGHT) [live preview box]
//   ADD NOTE [input]
//   [ Add Text ] button
//
// Internally swaps between the form and the FontPicker grid (the
// reference site does this as a sub-view of the same panel, not a
// separate route) — so from the parent's point of view this is a
// single "Text" tab, same as Products/Image/Art/Name/Order.
//
// onAddText receives a payload shaped to slot straight into your
// existing customizationModel.js element schema:
//   { type: "text", text, fontFamily, fontSizePct, color, x, y, width,
//     height, rotation, zIndex, side, bold, underline, italic, align }
//
// NOTE: your current elementSchema (models/customizationModel.js)
// doesn't have bold/underline/italic/align fields yet — only
// fontFamily/fontSizePct/color. If you want those styles to persist
// on reload, add them to the schema, e.g.:
//   bold: { type: Boolean, default: false },
//   italic: { type: Boolean, default: false },
//   underline: { type: Boolean, default: false },
//   align: { type: String, enum: ["left","center","right","justify"], default: "left" },
// Until then this panel still works for placing/styling text live on
// the canvas — it just won't round-trip those 4 style flags through a
// save/reload.

import { useState } from "react";
import FontPicker from "./FontPicker";
import TextEffectsPanel from "./TextEffectsPanel";
import WarpedText from "./WarpedText";
import { getTextEffect } from "../data/textEffects";

const C = {
  ink: "#1B1B1B",
  border: "#E3E1DA",
  muted: "#8A877F",
  active: "#1B1B1B",
  panelBg: "#FAF9F6",
};

const FONT_SIZES = [16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72];

const ALIGN_OPTIONS = [
  { key: "left", icon: "\u2630" },
  { key: "center", icon: "\u2261" },
  { key: "right", icon: "\u2637" },
  { key: "justify", icon: "\u2263" },
];

function ToggleButton({ active, onClick, children, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{
        width: 34,
        height: 34,
        border: `1px solid ${C.border}`,
        borderRadius: 4,
        background: active ? C.active : "#fff",
        color: active ? "#fff" : C.ink,
        fontSize: 14,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

export default function TextToolPanel({ defaultSide = "front", onAddText }) {
  const [view, setView] = useState("form"); // "form" | "font" | "effects"

  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(40);
  const [color, setColor] = useState("#000000");
  const [bold, setBold] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [italic, setItalic] = useState(false);
  const [fontFamily, setFontFamily] = useState("Tinos");
  const [align, setAlign] = useState("left");
  const [note, setNote] = useState("");
  const [textEffect, setTextEffect] = useState("straight");

  if (view === "font") {
    return (
      <FontPicker
        selectedFamily={fontFamily}
        onSelect={(family) => {
          setFontFamily(family);
          setView("form");
        }}
        onBack={() => setView("form")}
      />
    );
  }

  if (view === "effects") {
    return (
      <TextEffectsPanel
        text={text}
        fontFamily={fontFamily}
        color={color}
        bold={bold}
        italic={italic}
        underline={underline}
        selected={textEffect}
        onSelect={(key) => {
          setTextEffect(key);
          setView("form");
        }}
        onBack={() => setView("form")}
      />
    );
  }

  const canAdd = text.trim().length > 0;

  const handleAddText = () => {
    if (!canAdd) return;
    onAddText?.({
      type: "text",
      text,
      fontFamily,
      fontSizePct: Math.round((fontSize / 400) * 100 * 10) / 10, // rough px -> % of canvas height
      color,
      bold,
      underline,
      italic,
      align,
      textEffect,
      side: defaultSide,
      x: 30,
      y: 40,
      width: 40,
      rotation: 0,
      zIndex: 1,
    });
    setText("");
    setNote("");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: 18,
        background: C.panelBg,
        fontFamily: "Inter, sans-serif",
        fontSize: 13,
        color: C.ink,
      }}
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Your text here"
        style={{
          padding: "10px 12px",
          border: `1px solid ${C.border}`,
          borderRadius: 4,
          fontSize: 14,
          outline: "none",
        }}
      />

      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ flex: 1 }}>
          <label
            style={{
              display: "block",
              fontSize: 11,
              letterSpacing: "0.06em",
              marginBottom: 6,
              color: C.muted,
            }}
          >
            FONT SIZE
          </label>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            style={{
              width: "100%",
              padding: "8px 10px",
              border: `1px solid ${C.border}`,
              borderRadius: 4,
              fontSize: 13,
            }}
          >
            {FONT_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: 11,
              letterSpacing: "0.06em",
              marginBottom: 6,
              color: C.muted,
            }}
          >
            COLOR
          </label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{
              width: 34,
              height: 34,
              border: `1px solid ${C.border}`,
              borderRadius: 4,
              padding: 2,
              cursor: "pointer",
            }}
          />
        </div>
      </div>

      <div>
        <label
          style={{
            display: "block",
            fontSize: 11,
            letterSpacing: "0.06em",
            marginBottom: 6,
            color: C.muted,
          }}
        >
          FONT STYLE
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <ToggleButton
            active={bold}
            onClick={() => setBold((v) => !v)}
            label="Bold"
          >
            <b>B</b>
          </ToggleButton>
          <ToggleButton
            active={underline}
            onClick={() => setUnderline((v) => !v)}
            label="Underline"
          >
            <u>U</u>
          </ToggleButton>
          <ToggleButton
            active={italic}
            onClick={() => setItalic((v) => !v)}
            label="Italic"
          >
            <i>I</i>
          </ToggleButton>
        </div>
      </div>

      <div>
        <label
          style={{
            display: "block",
            fontSize: 11,
            letterSpacing: "0.06em",
            marginBottom: 6,
            color: C.muted,
          }}
        >
          FONT
        </label>
        <button
          type="button"
          onClick={() => setView("font")}
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "9px 12px",
            border: `1px solid ${C.border}`,
            borderRadius: 4,
            background: "#fff",
            fontFamily: `"${fontFamily}", serif`,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          <span>{fontFamily}</span>
          <span
            style={{
              color: C.muted,
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
            }}
          >
            ▾
          </span>
        </button>
      </div>

      <div>
        <label
          style={{
            display: "block",
            fontSize: 11,
            letterSpacing: "0.06em",
            marginBottom: 6,
            color: C.muted,
          }}
        >
          TEXT ALIGNMENT
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          {ALIGN_OPTIONS.map((opt) => (
            <ToggleButton
              key={opt.key}
              active={align === opt.key}
              onClick={() => setAlign(opt.key)}
              label={opt.key}
            >
              {opt.icon}
            </ToggleButton>
          ))}
        </div>
      </div>

      <div>
        <label
          style={{
            display: "block",
            fontSize: 11,
            letterSpacing: "0.06em",
            marginBottom: 6,
            color: C.muted,
          }}
        >
          TEXT EFFECT&nbsp;&nbsp;(
          {getTextEffect(textEffect).label.toUpperCase()})
        </label>
        <button
          type="button"
          onClick={() => setView("effects")}
          style={{
            width: "100%",
            height: 64,
            border: `1px solid ${C.border}`,
            borderRadius: 4,
            padding: 0,
            background: "#fff",
            cursor: "pointer",
          }}
        >
          <WarpedText
            text={text || "YOUR DESIGN"}
            effect={textEffect}
            fontFamily={fontFamily}
            fontSize={22}
            color={color}
            bold={bold}
            italic={italic}
            underline={underline}
            idSuffix="active-preview"
          />
        </button>
      </div>

      <div>
        <label
          style={{
            display: "block",
            fontSize: 11,
            letterSpacing: "0.06em",
            marginBottom: 6,
            color: C.muted,
          }}
        >
          ADD NOTE
        </label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Any instructions for this text (optional)"
          style={{
            width: "100%",
            padding: "9px 12px",
            border: `1px solid ${C.border}`,
            borderRadius: 4,
            fontSize: 13,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      <button
        type="button"
        onClick={handleAddText}
        disabled={!canAdd}
        style={{
          padding: "12px 0",
          border: "none",
          borderRadius: 999,
          background: canAdd ? C.active : C.border,
          color: canAdd ? "#fff" : C.muted,
          fontSize: 14,
          fontWeight: 600,
          cursor: canAdd ? "pointer" : "not-allowed",
        }}
      >
        Add Text
      </button>
    </div>
  );
}
