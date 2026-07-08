// components/FontPicker.jsx


import { useState, useMemo, useEffect, useRef } from "react";
import {
  getAllFonts,
  loadGoogleFont,
  loadCustomFont,
  CUSTOM_FONTS,
} from "../data/fontCatalog";

const PAGE_SIZE = 16;

const C = {
  ink: "#1B1B1B",
  border: "#E3E1DA",
  selected: "#2A5CE8",
  muted: "#8A877F",
  cardBg: "#FFFFFF",
  panelBg: "#FAF9F6",
};

function FontCard({ font, selected, onClick, registerRef }) {
  const ref = useRef(null);

  useEffect(() => {
    registerRef(ref.current, font);
  }, [font, registerRef]);

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        padding: "14px 8px",
        borderRadius: 6,
        border: `1.5px solid ${selected ? C.selected : C.border}`,
        background: C.cardBg,
        cursor: "pointer",
        minHeight: 66,
        justifyContent: "center",
      }}
    >
      <span
        style={{
          fontFamily: `"${font.family}", serif`,
          fontSize: 20,
          color: C.ink,
          lineHeight: 1,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "100%",
        }}
      >
        EXAMPLE
      </span>
      <span
        style={{
          fontSize: 11,
          color: C.muted,
          fontFamily: "Inter, sans-serif",
        }}
      >
        {font.label}
      </span>
    </button>
  );
}

export default function FontPicker({ selectedFamily, onSelect, onBack }) {
  const allFonts = useMemo(() => getAllFonts(), []);
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allFonts;
    return allFonts.filter((f) => f.label.toLowerCase().includes(q));
  }, [allFonts, query]);

  // Reset pagination whenever the search term changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query]);

  const visibleFonts = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Lazy-load each font's stylesheet only once its card has actually
  // rendered into the grid (covers both Google Fonts and any custom
  // @font-face entries from CUSTOM_FONTS).
  const handleCardMount = (el, font) => {
    if (!el) return;
    const isCustom = CUSTOM_FONTS.some((c) => c.family === font.family);
    if (isCustom) {
      loadCustomFont(font);
    } else {
      loadGoogleFont(font.family);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: C.panelBg,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px 18px",
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          style={{
            border: "none",
            background: "none",
            cursor: "pointer",
            fontSize: 18,
            color: C.ink,
            padding: 4,
          }}
        >
          ←
        </button>
        <span
          style={{ fontWeight: 600, letterSpacing: "0.06em", fontSize: 14 }}
        >
          CHOOSE FONT
        </span>
      </div>

      <div style={{ padding: "14px 18px" }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Font"
          style={{
            width: "100%",
            padding: "9px 12px",
            borderRadius: 4,
            border: `1px solid ${C.border}`,
            fontSize: 13,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0 18px 18px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}
        >
          {visibleFonts.map((font) => (
            <FontCard
              key={font.family}
              font={font}
              selected={font.family === selectedFamily}
              onClick={() => onSelect(font.family)}
              registerRef={handleCardMount}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <p
            style={{
              textAlign: "center",
              color: C.muted,
              fontSize: 13,
              marginTop: 24,
            }}
          >
            No fonts match "{query}"
          </p>
        )}

        {hasMore && (
          <button
            type="button"
            onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
            style={{
              width: "100%",
              marginTop: 14,
              padding: "10px 0",
              background: "#EDEBE4",
              border: "none",
              borderRadius: 4,
              fontSize: 13,
              color: C.ink,
              cursor: "pointer",
            }}
          >
            Load More
          </button>
        )}
      </div>
    </div>
  );
}
