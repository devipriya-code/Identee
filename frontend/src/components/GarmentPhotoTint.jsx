

import { useRef, useEffect, useState } from "react";
import GarmentSilhouette from "./GarmentSilhouette";

const BG_THRESHOLD = 235; // pixels lighter than this (background) are left transparent

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function tintImageToCanvas(img, canvas, hex) {
  const ctx = canvas.getContext("2d");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  ctx.drawImage(img, 0, 0);

  const { r: tr, g: tg, b: tb } = hexToRgb(hex);
  const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = frame.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // treat near-white as background -> transparent
    if (r > BG_THRESHOLD && g > BG_THRESHOLD && b > BG_THRESHOLD) {
      data[i + 3] = 0;
      continue;
    }

    // luminance of the original pixel (keeps fold/wrinkle/shadow detail)
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // scale target color by luminance, with a slight lift so shadows
    // don't crush to pure black
    const shade = 0.15 + lum * 0.85;
    data[i] = Math.min(255, tr * shade);
    data[i + 1] = Math.min(255, tg * shade);
    data[i + 2] = Math.min(255, tb * shade);
  }

  ctx.putImageData(frame, 0, 0);
}

export default function GarmentPhotoTint({
  shape,
  view = "front",
  color = "#1B1B1B",
}) {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("loading"); // loading | ok | error

  useEffect(() => {
    setStatus("loading");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = `/garments/base/${shape}-${view}.jpg`;

    img.onload = () => {
      if (canvasRef.current) {
        tintImageToCanvas(img, canvasRef.current, color);
        setStatus("ok");
      }
    };
    img.onerror = () => setStatus("error");
  }, [shape, view, color]);

  if (status === "error") {
    // haven't shot/uploaded a base photo for this shape+view yet
    return <GarmentSilhouette shape={shape} view={view} color={color} />;
  }

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {status === "loading" && (
        <div style={{ position: "absolute", inset: 0 }}>
          <GarmentSilhouette shape={shape} view={view} color={color} />
        </div>
      )}
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: status === "ok" ? "block" : "none",
        }}
      />
    </div>
  );
}
