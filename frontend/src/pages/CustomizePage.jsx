// pages/CustomizePage.jsx
//
// Route: <Route path="/customize/:id" element={<CustomizePage />} />
//
// FIXES IN THIS VERSION:
//  1. Front/Back/Right/Left now all show the SAME garment image
//     (images[0]) instead of images[1]/[2]/[3] — those extra gallery
//     photos aren't real per-angle mockups, so mapping them by index was
//     showing mismatched/unrelated photos (worn shots, different
//     backgrounds) on the Back/Right/Left tabs. Once you have real
//     per-angle mockup photos, flip USE_PER_INDEX_FLAT_IMAGES below to
//     switch back to per-index mapping.
//  2. Elements are tagged with `side` ("front"/"back"/"right"/"left") the
//     moment they're created, and the canvas + Layers panel only show
//     elements whose `side` matches the active view — so a design placed
//     while on "Back" no longer bleeds into "Front".
//  3. 360° Spin mode still cycles through whatever real gallery images
//     exist (separate feature from the 4 flat views) — harmless either
//     way, even with only 1 image (it just won't visibly spin).

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getProductFull } from "../redux/slices/productSlice";
import {
  uploadDesignImage,
  saveCustomization,
  reset,
} from "../redux/slices/customizationSlice";

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

// Index-aligned: VIEW_KEYS[i] is stored on each element's `side` field.
const VIEW_KEYS = ["front", "back", "right", "left"];
const VIEW_LABELS = ["FRONT", "BACK", "RIGHT", "LEFT"];

// Set this to true once your products have 4 real dedicated per-angle
// mockup photos (in images[0..3], in this exact order). Until then, every
// flat view reuses images[0] so you never show a mismatched photo.
const USE_PER_INDEX_FLAT_IMAGES = false;

const PRINT_AREA = { left: 22, top: 27, width: 56, height: 58 };

function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}
function makeId() {
  return `el-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function imgUrl(path) {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  return `${BACKEND_URL}/${path.replace(/^\//, "")}`;
}

export default function CustomizePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    fullProduct,
    isFullLoading,
    isError: productError,
  } = useSelector((s) => s.product);
  const { isUploading, isSaving, isSuccess, isError, message } = useSelector(
    (s) => s.customization,
  );

  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [dragState, setDragState] = useState(null);
  const [resizeState, setResizeState] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const [viewMode, setViewMode] = useState("flat"); // "flat" | "3d"
  const [activeView, setActiveView] = useState(0);
  const spinDrag = useRef(null);

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (id) dispatch(getProductFull(id));
    return () => dispatch(reset());
  }, [dispatch, id]);

  const images = fullProduct?.product?.images || [];

  // Front/Back/Right/Left all show images[0] unless you've flipped the
  // flag above to say you have real per-angle photos.
  const flatViewImage = USE_PER_INDEX_FLAT_IMAGES
    ? images[activeView] || images[0]
    : images[0];
  // 3D spin still cycles through whatever real photos exist.
  const spinViewImage = images[activeView] || images[0];
  const garmentImage = viewMode === "3d" ? spinViewImage : flatViewImage;

  const currentSide = VIEW_KEYS[Math.min(activeView, VIEW_KEYS.length - 1)];
  const visibleElements = elements.filter((el) => el.side === currentSide);
  const selectedEl = visibleElements.find((el) => el.id === selectedId);

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

  const switchView = (i) => {
    setViewMode("flat");
    setActiveView(i);
    setSelectedId(null); // a selection from another side shouldn't linger
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

  const handleSpinMouseDown = (e) => {
    if (viewMode !== "3d") return;
    spinDrag.current = { startX: e.clientX, startView: activeView };
  };

  const handleSpinMouseMove = useCallback(
    (e) => {
      if (viewMode !== "3d" || !spinDrag.current || images.length === 0) return;
      const dx = e.clientX - spinDrag.current.startX;
      const step = Math.round(dx / 60);
      let next = (spinDrag.current.startView + step) % images.length;
      if (next < 0) next += images.length;
      setActiveView(next);
    },
    [viewMode, images.length],
  );

  useEffect(() => {
    const handleUp = () => {
      spinDrag.current = null;
    };
    window.addEventListener("mousemove", handleSpinMouseMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleSpinMouseMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [handleSpinMouseMove]);

  if (isFullLoading) {
    return (
      <StudioShell>
        <CenterMessage color={C.muted}>Loading garment…</CenterMessage>
      </StudioShell>
    );
  }
  if (productError || !fullProduct?.product) {
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
      side: currentSide,
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
      side: currentSide,
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
    e.target.value = "";

    const result = await dispatch(uploadDesignImage(file));
    if (uploadDesignImage.fulfilled.match(result)) {
      pushHistory();
      const newEl = {
        id: makeId(),
        type: "image",
        side: currentSide,
        src: result.payload.path,
        x: 30,
        y: 30,
        width: 35,
        height: 35,
        rotation: 0,
        zIndex: elements.length,
      };
      setElements((prev) => [...prev, newEl]);
      setSelectedId(newEl.id);
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
      const maxZ = Math.max(
        0,
        ...prev.filter((e) => e.side === currentSide).map((e) => e.zIndex),
      );
      return prev.map((el) =>
        el.id === selectedId ? { ...el, zIndex: maxZ + 1 } : el,
      );
    });
  };

  const sendToBack = () => {
    pushHistory();
    setElements((prev) => {
      const minZ = Math.min(
        0,
        ...prev.filter((e) => e.side === currentSide).map((e) => e.zIndex),
      );
      return prev.map((el) =>
        el.id === selectedId ? { ...el, zIndex: minZ - 1 } : el,
      );
    });
  };

  const duplicateSelected = () => {
    if (!selectedEl) return;
    pushHistory();
    const copy = {
      ...selectedEl,
      id: makeId(),
      x: clamp(selectedEl.x + 4, 0, 100 - selectedEl.width),
      y: clamp(selectedEl.y + 4, 0, 100 - (selectedEl.height || 10)),
      zIndex: elements.length,
    };
    setElements((prev) => [...prev, copy]);
    setSelectedId(copy.id);
  };

  const deleteSelected = () => {
    pushHistory();
    setElements((prev) => prev.filter((el) => el.id !== selectedId));
    setSelectedId(null);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // clipboard permission denied — silently ignore, non-critical
    }
  };

  const handleSave = async () => {
    if (elements.length === 0) return;
    const result = await dispatch(
      saveCustomization({ productId: id, elements }),
    );
    if (saveCustomization.fulfilled.match(result)) {
      setTimeout(() => navigate(`/product/${id}`), 1200);
    }
  };

  return (
    <StudioShell>
      {/* ── Top action bar ── */}
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
            disabled={isSaving}
          />
          <ToolbarButton label="Share" icon="🔗" onClick={handleShare} />
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            padding: "12px 26px",
            borderRadius: 999,
            background: C.navy,
            color: "#fff",
            border: "none",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.06em",
            cursor: isSaving ? "wait" : "pointer",
            opacity: isSaving ? 0.7 : 1,
          }}
        >
          {isSaving ? "SAVING…" : "SAVE DESIGN"}
        </button>
      </div>

      {isUploading && (
        <p
          style={{
            textAlign: "center",
            fontSize: 13,
            color: C.muted,
            margin: "12px 0 0",
          }}
        >
          Uploading design…
        </p>
      )}
      {isSuccess && (
        <p
          style={{
            textAlign: "center",
            fontSize: 13,
            fontWeight: 600,
            color: "#3E7C4A",
            margin: "12px 0 0",
          }}
        >
          Design saved! Redirecting…
        </p>
      )}
      {isError && (
        <p
          style={{
            textAlign: "center",
            fontSize: 13,
            fontWeight: 600,
            color: C.danger,
            margin: "12px 0 0",
          }}
        >
          {message}
        </p>
      )}

      {/* ── Main workspace ── */}
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
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
          }}
        >
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <ModeButton
              active={viewMode === "flat"}
              onClick={() => setViewMode("flat")}
            >
              Flat Views
            </ModeButton>
            <ModeButton
              active={viewMode === "3d"}
              onClick={() => setViewMode("3d")}
            >
              🔄 360° Spin
            </ModeButton>
          </div>

          <div
            ref={canvasRef}
            onMouseDown={(e) => {
              setSelectedId(null);
              handleSpinMouseDown(e);
            }}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 520,
              aspectRatio: "4/5",
              background: "#F3F1EC",
              borderRadius: 16,
              overflow: "hidden",
              backgroundImage: garmentImage
                ? `url(${imgUrl(garmentImage)})`
                : undefined,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              cursor: viewMode === "3d" ? "grab" : "default",
            }}
          >
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

            {visibleElements
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
                      src={imgUrl(el.src)}
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

          {viewMode === "3d" && (
            <p style={{ fontSize: 12, color: C.muted, marginTop: 10 }}>
              Click and drag left/right to spin the garment
            </p>
          )}
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
            {VIEW_LABELS.map((label, i) => {
              const count = elements.filter(
                (el) => el.side === VIEW_KEYS[i],
              ).length;
              return (
                <button
                  key={label}
                  onClick={() => switchView(i)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    background: "none",
                    border: "none",
                    cursor: images.length ? "pointer" : "default",
                    padding: 4,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      overflow: "hidden",
                      background: "#F3F1EC",
                      border:
                        viewMode === "flat" && activeView === i
                          ? `2px solid ${C.gold}`
                          : `1px solid ${C.border}`,
                    }}
                  >
                    {/* Always images[0] — same reasoning as flatViewImage above */}
                    {images[0] ? (
                      <img
                        src={imgUrl(images[0])}
                        alt={label}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : null}
                  </div>
                  {count > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: -2,
                        right: -2,
                        minWidth: 16,
                        height: 16,
                        borderRadius: 999,
                        background: C.gold,
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 3px",
                      }}
                    >
                      {count}
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.08em",
                      fontWeight:
                        viewMode === "flat" && activeView === i ? 700 : 500,
                      color:
                        viewMode === "flat" && activeView === i
                          ? C.ink
                          : C.muted,
                    }}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>

          <p style={sectionLabelStyle}>LAYERS · {VIEW_LABELS[activeView]}</p>
          {visibleElements.length === 0 && (
            <p style={{ fontSize: 13, color: C.muted }}>
              Nothing on this side yet — use Text or Image on the left.
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
            {visibleElements
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
                <button onClick={duplicateSelected} style={miniBtnStyle}>
                  Duplicate
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

function ModeButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 16px",
        borderRadius: 999,
        border: `1px solid ${active ? C.gold : C.border}`,
        background: active ? C.goldSoft : "#fff",
        color: active ? C.ink : C.muted,
        fontSize: 12,
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {children}
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
