// pages/CustomizePage.jsx
//
// Route this at:   <Route path="/customize/:id" element={<CustomizePage />} />
//
// Data source: GET /api/products/:id/full → { product, variants, group }
//
// Backend needed (unchanged from before):
//   POST /api/customizations/upload-design   (multipart, field name "design") → { path }
//   POST /api/customizations                 → creates a saved customization
//   GET  /api/customizations/:id             → fetch one back later
//
// WHAT CHANGED FROM THE PREVIOUS VERSION:
//  - Studio-style shell: top action bar (Undo/Redo/Save/Share/Contact),
//    left icon sidebar (Products/Text/Image/Art/Name/Order), right-side
//    Front/Back/Right/Left view switcher, dashed "print safe area" guide.
//  - Simple undo/redo history stack.
//  - Same drag/resize/upload/text logic underneath — nothing about how
//    elements are stored or saved has changed.
//
// ASSUMPTIONS (change if wrong):
//  1. Front/Back/Right/Left views map to product.images[0..3] in that
//     order. If your product only has 1–2 images, the extra view buttons
//     still show but just reuse the last available image — swap in real
//     per-angle images once you have them.
//  2. The dashed rectangle is a visual "keep your design inside here"
//     guide only — it doesn't clip or constrain dragging. Adjust
//     PRINT_AREA below to match your actual print dimensions.
//  3. Share = copies the page URL to the clipboard. Contact/Tutorials are
//     left as plain links — point them at real routes when you have them.

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const C = {
  bg: "#FFFFFF",
  panel: "#FAF8F3",
  ink: "#15130F",
  muted: "#71695B",
  border: "#ECE4D2",
  gold: "#C9A24B",
  goldSoft: "#C9A24B14",
  navy: "#1A2A4A",
  danger: "#B3432B",
};

const FONT_OPTIONS = [
  "Arial",
  "Georgia",
  "Poppins",
  "Bebas Neue",
  "Courier New",
];
const VIEW_LABELS = ["FRONT", "BACK", "RIGHT", "LEFT"];

// Visual print-safe-area guide, as % of canvas (left, top, width, height).
// Purely a guide overlay — doesn't affect where elements can actually go.
const PRINT_AREA = { left: 22, top: 27, width: 56, height: 58 };

function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

function makeId() {
  return `el-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function useProduct(id) {
  const [state, setState] = useState({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setState({ data: null, isLoading: true, error: null });

    fetch(`${BACKEND_URL}/api/products/${id}/full`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setState({ data: json, isLoading: false, error: null });
      })
      .catch((err) => {
        if (!cancelled) setState({ data: null, isLoading: false, error: err });
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return state;
}

export default function CustomizePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useProduct(id);

  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [dragState, setDragState] = useState(null);
  const [resizeState, setResizeState] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [activeView, setActiveView] = useState(0);

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const images = data?.product?.images || [];
  const garmentImage = images[activeView] || images[0];
  const selectedEl = elements.find((el) => el.id === selectedId);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setCanvasSize({ width, height });
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  // Push the current elements onto the undo stack before any discrete
  // mutating action (add / delete / edit / drag-start / resize-start).
  const pushHistory = () => {
    setHistory((h) => [...h, elements]);
    setFuture([]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setFuture((f) => [elements, ...f]);
    setHistory((h) => h.slice(0, -1));
    setElements(prev);
    setSelectedId(null);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setHistory((h) => [...h, elements]);
    setFuture((f) => f.slice(1));
    setElements(next);
    setSelectedId(null);
  };

  useEffect(() => {
    if (!dragState && !resizeState) return;

    const handleMove = (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();

      if (dragState) {
        const dxPct = ((e.clientX - dragState.startX) / rect.width) * 100;
        const dyPct = ((e.clientY - dragState.startY) / rect.height) * 100;
        setElements((prev) =>
          prev.map((el) =>
            el.id === dragState.id
              ? {
                  ...el,
                  x: clamp(dragState.startElX + dxPct, 0, 100 - el.width),
                  y: clamp(
                    dragState.startElY + dyPct,
                    0,
                    100 - (el.height || 10),
                  ),
                }
              : el,
          ),
        );
      }

      if (resizeState) {
        const dxPct = ((e.clientX - resizeState.startX) / rect.width) * 100;
        const dyPct = ((e.clientY - resizeState.startY) / rect.height) * 100;
        setElements((prev) =>
          prev.map((el) => {
            if (el.id !== resizeState.id) return el;
            if (el.type === "text") {
              return {
                ...el,
                fontSizePct: clamp(resizeState.startFontSizePct + dyPct, 2, 30),
              };
            }
            return {
              ...el,
              width: clamp(resizeState.startW + dxPct, 8, 90),
              height: clamp(resizeState.startH + dyPct, 8, 90),
            };
          }),
        );
      }
    };

    const handleUp = () => {
      setDragState(null);
      setResizeState(null);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [dragState, resizeState]);

  if (isLoading) {
    return (
      <StudioShell>
        <CenterMessage color={C.muted}>Loading garment…</CenterMessage>
      </StudioShell>
    );
  }
  if (error || !data?.product) {
    return (
      <StudioShell>
        <CenterMessage color={C.danger}>
          Couldn't load this product to customize.
        </CenterMessage>
      </StudioShell>
    );
  }

  const addTextElement = () => {
    pushHistory();
    const newEl = {
      id: makeId(),
      type: "text",
      text: "Your Text",
      fontFamily: "Arial",
      fontSizePct: 6,
      color: C.ink,
      x: 30,
      y: 40,
      width: 40,
      height: 10,
      rotation: 0,
      zIndex: elements.length,
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
  };

  const addNameElement = () => {
    pushHistory();
    const newEl = {
      id: makeId(),
      type: "text",
      text: "NAME",
      fontFamily: "Bebas Neue",
      fontSizePct: 8,
      color: C.ink,
      x: 32,
      y: 55,
      width: 36,
      height: 12,
      rotation: 0,
      zIndex: elements.length,
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
  };

  const handleDesignUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setSaveMsg(null);
    try {
      const formData = new FormData();
      formData.append("design", file);
      const res = await fetch(
        `${BACKEND_URL}/api/customizations/upload-design`,
        {
          method: "POST",
          body: formData,
        },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Upload failed");

      pushHistory();
      const newEl = {
        id: makeId(),
        type: "image",
        src: json.path,
        x: 30,
        y: 30,
        width: 35,
        height: 35,
        rotation: 0,
        zIndex: elements.length,
      };
      setElements((prev) => [...prev, newEl]);
      setSelectedId(newEl.id);
    } catch (err) {
      setSaveMsg({
        type: "error",
        text: err.message || "Could not upload design",
      });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleElementMouseDown = (el, e) => {
    e.stopPropagation();
    pushHistory();
    setSelectedId(el.id);
    setDragState({
      id: el.id,
      startX: e.clientX,
      startY: e.clientY,
      startElX: el.x,
      startElY: el.y,
    });
  };

  const handleResizeMouseDown = (el, e) => {
    e.stopPropagation();
    pushHistory();
    setResizeState({
      id: el.id,
      startX: e.clientX,
      startY: e.clientY,
      startW: el.width,
      startH: el.height,
      startFontSizePct: el.fontSizePct,
    });
  };

  const updateSelected = (patch) => {
    setElements((prev) =>
      prev.map((el) => (el.id === selectedId ? { ...el, ...patch } : el)),
    );
  };

  const rotateSelected = (deg) => {
    pushHistory();
    setElements((prev) =>
      prev.map((el) =>
        el.id === selectedId
          ? { ...el, rotation: (el.rotation + deg) % 360 }
          : el,
      ),
    );
  };

  const bringToFront = () => {
    pushHistory();
    setElements((prev) => {
      const maxZ = Math.max(0, ...prev.map((e) => e.zIndex));
      return prev.map((el) =>
        el.id === selectedId ? { ...el, zIndex: maxZ + 1 } : el,
      );
    });
  };

  const sendToBack = () => {
    pushHistory();
    setElements((prev) => {
      const minZ = Math.min(0, ...prev.map((e) => e.zIndex));
      return prev.map((el) =>
        el.id === selectedId ? { ...el, zIndex: minZ - 1 } : el,
      );
    });
  };

  const deleteSelected = () => {
    pushHistory();
    setElements((prev) => prev.filter((el) => el.id !== selectedId));
    setSelectedId(null);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setSaveMsg({ type: "ok", text: "Link copied to clipboard." });
    } catch {
      setSaveMsg({ type: "error", text: "Could not copy link." });
    }
  };

  const handleSave = async () => {
    if (elements.length === 0) {
      setSaveMsg({
        type: "error",
        text: "Add at least one design or text before saving.",
      });
      return;
    }
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/customizations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id, elements }),
      });
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.message || "Could not save customization");
      setSaveMsg({ type: "ok", text: "Design saved! Redirecting…" });
      setTimeout(() => navigate(`/product/${id}`), 1200);
    } catch (err) {
      setSaveMsg({
        type: "error",
        text: err.message || "Something went wrong.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <StudioShell>
      {/* ── Top action bar ─────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: `1px solid ${C.border}`,
          background: C.bg,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <Link
          to={`/product/${id}`}
          style={{ fontSize: 13, color: C.muted, textDecoration: "underline" }}
        >
          ← Back to product
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          <ToolbarButton
            label="Undo"
            icon="↩"
            onClick={handleUndo}
            disabled={history.length === 0}
          />
          <ToolbarButton
            label="Redo"
            icon="↪"
            onClick={handleRedo}
            disabled={future.length === 0}
          />
          <ToolbarButton
            label="Save"
            icon="💾"
            onClick={handleSave}
            disabled={saving}
          />
          <ToolbarButton label="Share" icon="🔗" onClick={handleShare} />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "12px 26px",
            borderRadius: 999,
            background: C.navy,
            color: "#fff",
            border: "none",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.06em",
            cursor: saving ? "wait" : "pointer",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? "SAVING…" : "SAVE DESIGN"}
        </button>
      </div>

      {saveMsg && (
        <p
          style={{
            textAlign: "center",
            fontSize: 13,
            fontWeight: 600,
            color: saveMsg.type === "ok" ? "#3E7C4A" : C.danger,
            margin: "12px 0 0",
          }}
        >
          {saveMsg.text}
        </p>
      )}

      {/* ── Main workspace ──────────────────────────────────────── */}
      <div
        style={{ display: "flex", flex: 1, minHeight: 0 }}
        className="cust-workspace"
      >
        {/* Left icon sidebar */}
        <div
          style={{
            width: 104,
            flexShrink: 0,
            background: C.panel,
            borderRight: `1px solid ${C.border}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            paddingTop: 20,
          }}
          className="cust-sidebar"
        >
          <SidebarIcon
            icon="👕"
            label="Products"
            onClick={() => navigate(`/product/${id}`)}
          />
          <SidebarIcon icon="🅰️" label="Text" onClick={addTextElement} />
          <SidebarIcon
            icon="🖼️"
            label="Image"
            onClick={() => fileInputRef.current?.click()}
          />
          <SidebarIcon
            icon="🎨"
            label="Art"
            onClick={() =>
              setSaveMsg({
                type: "error",
                text: "Clip-art library coming soon.",
              })
            }
          />
          <SidebarIcon icon="🔤" label="Name" onClick={addNameElement} />
          <SidebarIcon icon="🛒" label="Order" onClick={handleSave} />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleDesignUpload}
            style={{ display: "none" }}
          />
        </div>

        {/* Canvas */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
            position: "relative",
          }}
        >
          <div
            ref={canvasRef}
            onMouseDown={() => setSelectedId(null)}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 520,
              aspectRatio: "4/5",
              background: "#F3F1EC",
              borderRadius: 16,
              overflow: "hidden",
              backgroundImage: garmentImage
                ? `url(${BACKEND_URL}/${garmentImage})`
                : undefined,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          >
            {/* Print-safe-area guide */}
            <div
              style={{
                position: "absolute",
                left: `${PRINT_AREA.left}%`,
                top: `${PRINT_AREA.top}%`,
                width: `${PRINT_AREA.width}%`,
                height: `${PRINT_AREA.height}%`,
                border: `1.5px dashed ${C.gold}`,
                borderRadius: 6,
                pointerEvents: "none",
              }}
            />

            {elements
              .slice()
              .sort((a, b) => a.zIndex - b.zIndex)
              .map((el) => (
                <div
                  key={el.id}
                  onMouseDown={(e) => handleElementMouseDown(el, e)}
                  style={{
                    position: "absolute",
                    left: `${el.x}%`,
                    top: `${el.y}%`,
                    width: `${el.width}%`,
                    height: el.type === "image" ? `${el.height}%` : "auto",
                    transform: `rotate(${el.rotation}deg)`,
                    transformOrigin: "center",
                    cursor: "move",
                    outline:
                      selectedId === el.id ? `2px dashed ${C.gold}` : "none",
                    outlineOffset: 2,
                    userSelect: "none",
                  }}
                >
                  {el.type === "image" ? (
                    <img
                      src={`${BACKEND_URL}/${el.src}`}
                      alt=""
                      draggable={false}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        pointerEvents: "none",
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        display: "block",
                        fontFamily: el.fontFamily,
                        fontSize: `${(el.fontSizePct / 100) * canvasSize.height}px`,
                        color: el.color,
                        whiteSpace: "nowrap",
                        pointerEvents: "none",
                      }}
                    >
                      {el.text}
                    </span>
                  )}

                  {selectedId === el.id && (
                    <div
                      onMouseDown={(e) => handleResizeMouseDown(el, e)}
                      style={{
                        position: "absolute",
                        right: -7,
                        bottom: -7,
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        background: C.gold,
                        border: "2px solid #fff",
                        cursor: "nwse-resize",
                      }}
                    />
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Right view switcher + property panel */}
        <div
          style={{
            width: 240,
            flexShrink: 0,
            borderLeft: `1px solid ${C.border}`,
            background: C.bg,
            padding: 20,
            overflowY: "auto",
          }}
          className="cust-rightpanel"
        >
          <p style={sectionLabelStyle}>VIEW</p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginBottom: 24,
            }}
          >
            {VIEW_LABELS.map((label, i) => (
              <button
                key={label}
                onClick={() => setActiveView(Math.min(i, images.length - 1))}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  background: "none",
                  border: "none",
                  cursor: images.length ? "pointer" : "default",
                  padding: 4,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    overflow: "hidden",
                    background: "#F3F1EC",
                    border:
                      activeView === i
                        ? `2px solid ${C.gold}`
                        : `1px solid ${C.border}`,
                  }}
                >
                  {images[i] || images[0] ? (
                    <img
                      src={`${BACKEND_URL}/${images[i] || images[0]}`}
                      alt={label}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : null}
                </div>
                <span
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.08em",
                    fontWeight: activeView === i ? 700 : 500,
                    color: activeView === i ? C.ink : C.muted,
                  }}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>

          <p style={sectionLabelStyle}>LAYERS</p>
          {elements.length === 0 && (
            <p style={{ fontSize: 13, color: C.muted }}>
              No elements yet — use Text or Image on the left.
            </p>
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginBottom: 20,
            }}
          >
            {elements
              .slice()
              .sort((a, b) => b.zIndex - a.zIndex)
              .map((el) => (
                <div
                  key={el.id}
                  onClick={() => setSelectedId(el.id)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: `1px solid ${selectedId === el.id ? C.gold : C.border}`,
                    background: selectedId === el.id ? C.goldSoft : "#fff",
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  <span>
                    {el.type === "text"
                      ? `"${el.text.slice(0, 16)}"`
                      : "Uploaded design"}
                  </span>
                </div>
              ))}
          </div>

          {selectedEl && (
            <div style={{ paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
              <p style={sectionLabelStyle}>EDIT SELECTED</p>

              {selectedEl.type === "text" && (
                <>
                  <input
                    value={selectedEl.text}
                    onChange={(e) => updateSelected({ text: e.target.value })}
                    style={inputStyle}
                  />
                  <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                    <select
                      value={selectedEl.fontFamily}
                      onChange={(e) =>
                        updateSelected({ fontFamily: e.target.value })
                      }
                      style={{ ...inputStyle, flex: 1 }}
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                    <input
                      type="color"
                      value={selectedEl.color}
                      onChange={(e) =>
                        updateSelected({ color: e.target.value })
                      }
                      style={{
                        width: 44,
                        height: 38,
                        border: `1px solid ${C.border}`,
                        borderRadius: 8,
                        padding: 2,
                      }}
                    />
                  </div>
                </>
              )}

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 12,
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => rotateSelected(-15)}
                  style={miniBtnStyle}
                >
                  ⟲
                </button>
                <button onClick={() => rotateSelected(15)} style={miniBtnStyle}>
                  ⟳
                </button>
                <button onClick={bringToFront} style={miniBtnStyle}>
                  Front
                </button>
                <button onClick={sendToBack} style={miniBtnStyle}>
                  Back
                </button>
                <button
                  onClick={deleteSelected}
                  style={{
                    ...miniBtnStyle,
                    color: C.danger,
                    borderColor: C.danger,
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .cust-workspace { flex-direction: column; }
          .cust-sidebar { width: 100% !important; flex-direction: row !important; justify-content: space-around; padding: 12px 0 !important; }
          .cust-rightpanel { width: 100% !important; border-left: none !important; border-top: 1px solid ${C.border}; }
        }
      `}</style>
    </StudioShell>
  );
}

function StudioShell({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
    </div>
  );
}

function CenterMessage({ children, color }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <p style={{ color }}>{children}</p>
    </div>
  );
}

function ToolbarButton({ label, icon, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        padding: "8px 12px",
        borderRadius: 10,
        border: "none",
        background: "none",
        fontSize: 16,
        color: disabled ? "#C9C4B6" : C.ink,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <span>{icon}</span>
      <span style={{ fontSize: 10, color: disabled ? "#C9C4B6" : C.muted }}>
        {label}
      </span>
    </button>
  );
}

function SidebarIcon({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        padding: "12px 8px",
        width: "100%",
        border: "none",
        background: "none",
        cursor: "pointer",
      }}
    >
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: C.ink }}>
        {label}
      </span>
    </button>
  );
}

const sectionLabelStyle = {
  fontSize: 12,
  letterSpacing: "0.12em",
  color: "#15130F",
  textTransform: "uppercase",
  fontWeight: 700,
  marginBottom: 12,
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: `1px solid ${C.border}`,
  fontSize: 13,
  color: C.ink,
  boxSizing: "border-box",
};

const miniBtnStyle = {
  padding: "6px 12px",
  borderRadius: 8,
  border: `1px solid ${C.border}`,
  background: "#fff",
  color: C.ink,
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};
