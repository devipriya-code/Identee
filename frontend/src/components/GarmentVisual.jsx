// components/GarmentVisual.jsx
//
// Wraps GarmentSilhouette + real product photography. Tries to load
// the photo at the conventional path (see getGarmentImagePath in
// data/garmentCatalog.js); if it 404s (i.e. you haven't shot/uploaded
// that garment+color+view yet), it silently falls back to the drawn
// silhouette instead of showing a broken image icon.
//
// Used anywhere a garment needs to be shown: ChooseProductPage,
// ChooseColorPage, and CustomizePage (main canvas, view-switcher
// thumbnails, Products panel thumbnails).

import { useState, useEffect } from "react";
import GarmentSilhouette from "./GarmentSilhouette";
import { getGarmentImagePath } from "../data/garmentCatalog";

export default function GarmentVisual({
  garmentKey,
  colorSlug,
  shape,
  view = "front",
  color = "#1B1B1B",
}) {
  const path = getGarmentImagePath(garmentKey, colorSlug, view);
  const [status, setStatus] = useState("loading"); // "loading" | "ok" | "error"

  // Reset + re-check whenever the garment/color/view combo changes
  useEffect(() => {
    setStatus("loading");
  }, [path]);

  if (status !== "error") {
    return (
      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        <img
          src={path}
          alt=""
          onLoad={() => setStatus("ok")}
          onError={() => setStatus("error")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: status === "ok" ? "block" : "none",
          }}
        />
        {/* Show the silhouette underneath while the photo is loading,
            so there's no blank flash on slower connections */}
        {status === "loading" && (
          <div style={{ position: "absolute", inset: 0 }}>
            <GarmentSilhouette shape={shape} view={view} color={color} />
          </div>
        )}
      </div>
    );
  }

  return <GarmentSilhouette shape={shape} view={view} color={color} />;
}
