// components/EditableElementBox.jsx
//
// Wraps ANY placed element (a WarpedText, an uploaded image, etc.) with
// the interaction chrome your screenshot is missing:
//   - a dashed selection outline
//   - a delete "×" button (top-right corner)
//   - a rotate handle (small circle above the box, connected by a line)
//   - a resize handle (bottom-right corner — this is the orange dot you
//     already have, now it actually works)
//   - drag-to-move by grabbing the body
//
// This is a generic wrapper — it doesn't know if its child is text or
// an image. Position/size are stored as PERCENTAGES of the parent
// canvas (matching your customizationModel.js schema: x, y, width,
// height, rotation), so it maps straight onto what you already save.
//
// USAGE in your CustomizePage canvas (canvasRef = the ref on the div
// that represents the garment print area):
//
//   const canvasRef = useRef(null);
//   <div ref={canvasRef} style={{ position: "relative", width: "100%", height: "100%" }}>
//     <GarmentPhotoTint ... />
//     {elements.map((el) => (
//       <EditableElementBox
//         key={el._localId}
//         canvasRef={canvasRef}
//         x={el.x} y={el.y} width={el.width} height={el.height ?? 15}
//         rotation={el.rotation}
//         selected={selectedId === el._localId}
//         onSelect={() => setSelectedId(el._localId)}
//         onChange={(patch) => updateElement(el._localId, patch)}
//         onDelete={() => deleteElement(el._localId)}
//       >
//         {el.type === "text"
//           ? <WarpedText text={el.text} effect={el.textEffect} fontFamily={el.fontFamily} color={el.color} bold={el.bold} italic={el.italic} underline={el.underline} />
//           : <img src={el.src} style={{ width: "100%", height: "100%", objectFit: "contain" }} />}
//       </EditableElementBox>
//     ))}
//   </div>

import { useRef, useCallback } from "react";

const HANDLE_SIZE = 22;
const ACCENT = "#F2A33C"; // matches the orange dashed box / dot in your screenshot

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

export default function EditableElementBox({
  canvasRef,
  x,
  y,
  width,
  height = 15,
  rotation = 0,
  selected = false,
  onSelect,
  onChange,
  onDelete,
  children,
}) {
  const dragState = useRef(null);

  const getCanvasRect = useCallback(() => {
    return canvasRef?.current?.getBoundingClientRect();
  }, [canvasRef]);

  // ---- move ---------------------------------------------------------
  const handleBodyPointerDown = (e) => {
    e.stopPropagation();
    onSelect?.();
    const rect = getCanvasRect();
    if (!rect) return;
    dragState.current = {
      mode: "move",
      startX: e.clientX,
      startY: e.clientY,
      origX: x,
      origY: y,
      rect,
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  // ---- resize (bottom-right handle) ----------------------------------
  const handleResizePointerDown = (e) => {
    e.stopPropagation();
    const rect = getCanvasRect();
    if (!rect) return;
    dragState.current = {
      mode: "resize",
      startX: e.clientX,
      startY: e.clientY,
      origWidth: width,
      origHeight: height,
      rect,
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  // ---- rotate (top handle) --------------------------------------------
  const handleRotatePointerDown = (e) => {
    e.stopPropagation();
    const rect = getCanvasRect();
    if (!rect) return;
    const centerX = rect.left + (rect.width * (x + width / 2)) / 100;
    const centerY = rect.top + (rect.height * (y + height / 2)) / 100;
    dragState.current = { mode: "rotate", centerX, centerY };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handlePointerMove = (e) => {
    const state = dragState.current;
    if (!state) return;

    if (state.mode === "move") {
      const dxPct = ((e.clientX - state.startX) / state.rect.width) * 100;
      const dyPct = ((e.clientY - state.startY) / state.rect.height) * 100;
      onChange?.({
        x: clamp(state.origX + dxPct, 0, 100 - width),
        y: clamp(state.origY + dyPct, 0, 100 - height),
      });
    }

    if (state.mode === "resize") {
      const dxPct = ((e.clientX - state.startX) / state.rect.width) * 100;
      const dyPct = ((e.clientY - state.startY) / state.rect.height) * 100;
      onChange?.({
        width: clamp(state.origWidth + dxPct, 4, 100 - x),
        height: clamp(state.origHeight + dyPct, 4, 100 - y),
      });
    }

    if (state.mode === "rotate") {
      const angle =
        (Math.atan2(e.clientY - state.centerY, e.clientX - state.centerX) *
          180) /
        Math.PI;
      // +90 so "straight up" from center reads as 0 degrees
      onChange?.({ rotation: Math.round(angle + 90) });
    }
  };

  const handlePointerUp = () => {
    dragState.current = null;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  };

  return (
    <div
      onPointerDown={handleBodyPointerDown}
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        height: `${height}%`,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "center center",
        cursor: "move",
        outline: selected ? `2px dashed ${ACCENT}` : "none",
        outlineOffset: 2,
        userSelect: "none",
        touchAction: "none",
      }}
    >
      <div style={{ width: "100%", height: "100%", pointerEvents: "none" }}>
        {children}
      </div>

      {selected && (
        <>
          {/* delete — top-right corner */}
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            aria-label="Delete"
            style={{
              position: "absolute",
              top: -12,
              right: -12,
              width: HANDLE_SIZE,
              height: HANDLE_SIZE,
              borderRadius: "50%",
              background: "#1B1B1B",
              color: "#fff",
              border: "2px solid #fff",
              boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
              fontSize: 13,
              lineHeight: 1,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>

          {/* rotate — floating above the box, connected by a thin line */}
          <div
            style={{
              position: "absolute",
              top: -40,
              left: "50%",
              width: 1,
              height: 28,
              background: ACCENT,
              transform: "translateX(-50%)",
            }}
          />
          <div
            onPointerDown={handleRotatePointerDown}
            style={{
              position: "absolute",
              top: -50,
              left: "50%",
              width: HANDLE_SIZE,
              height: HANDLE_SIZE,
              borderRadius: "50%",
              background: "#fff",
              border: `2px solid ${ACCENT}`,
              transform: "translateX(-50%)",
              cursor: "grab",
            }}
          />

          {/* resize — bottom-right corner (the orange dot from your screenshot) */}
          <div
            onPointerDown={handleResizePointerDown}
            style={{
              position: "absolute",
              bottom: -11,
              right: -11,
              width: HANDLE_SIZE,
              height: HANDLE_SIZE,
              borderRadius: "50%",
              background: ACCENT,
              border: "2px solid #fff",
              boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
              cursor: "nwse-resize",
            }}
          />
        </>
      )}
    </div>
  );
}
