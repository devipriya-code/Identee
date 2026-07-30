// components/Garment3DViewer.jsx
//
// Real 3D t-shirt viewer — loads the .glb model, paints your Front/Back
// design elements onto it as decals, and lets the user click+drag to
// rotate (with gentle auto-rotate when idle), like a car configurator.

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Decal } from "@react-three/drei";
import * as THREE from "three";

const CANVAS_SIZE = 1024;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Draws one side's text/image elements onto a square canvas, using the
// same x/y/width/height percentages as the flat 2D editor — so the
// design lines up the same way in 3D as it did while editing.
async function drawElementsToCanvas(elements, backendUrl) {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  for (const el of sorted) {
    const x = (el.x / 100) * CANVAS_SIZE;
    const y = (el.y / 100) * CANVAS_SIZE;
    const w = (el.width / 100) * CANVAS_SIZE;
    const h = el.type === "image" ? (el.height / 100) * CANVAS_SIZE : w * 0.3;

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(((el.rotation || 0) * Math.PI) / 180);

    if (el.type === "image") {
      try {
        const src = el.src.startsWith("http")
          ? el.src
          : `${backendUrl}/${el.src.replace(/^\//, "")}`;
        const img = await loadImage(src);
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
      } catch {
        // image failed to load — skip silently, don't break the whole render
      }
    } else {
      const fontSizePx = (el.fontSizePct / 100) * CANVAS_SIZE;
      ctx.font = `${el.bold ? "700" : "400"} ${el.italic ? "italic" : ""} ${fontSizePx}px "${el.fontFamily}", serif`;
      ctx.fillStyle = el.color || "#000";
      ctx.textAlign =
        el.align === "center" ? "center" : el.align === "right" ? "right" : "left";
      ctx.textBaseline = "middle";
      const textX =
        el.align === "center" ? 0 : el.align === "right" ? w / 2 : -w / 2;
      ctx.fillText(el.text, textX, 0);
    }
    ctx.restore();
  }

  return canvas;
}

function ShirtModel({ color, frontCanvas, backCanvas, modelPath }) {
  const { nodes } = useGLTF(modelPath);

  const frontTexture = useMemo(() => {
    if (!frontCanvas) return null;
    const tex = new THREE.CanvasTexture(frontCanvas);
    tex.needsUpdate = true;
    return tex;
  }, [frontCanvas]);

  const backTexture = useMemo(() => {
    if (!backCanvas) return null;
    const tex = new THREE.CanvasTexture(backCanvas);
    tex.needsUpdate = true;
    return tex;
  }, [backCanvas]);

  // Works regardless of the exact mesh node name inside the .glb —
  // just grabs the first mesh it finds.
  const meshNode = useMemo(() => {
    const key = Object.keys(nodes).find((k) => nodes[k].isMesh);
    return nodes[key];
  }, [nodes]);

  if (!meshNode) return null;

  return (
    <mesh geometry={meshNode.geometry} castShadow receiveShadow dispose={null}>
      <meshStandardMaterial color={color} roughness={1} metalness={0} />

      {frontTexture && (
        <Decal position={[0, 0.05, 0.15]} rotation={[0, 0, 0]} scale={0.35}>
          <meshStandardMaterial
            map={frontTexture}
            transparent
            polygonOffset
            polygonOffsetFactor={-1}
          />
        </Decal>
      )}

      {backTexture && (
        <Decal position={[0, 0.05, -0.15]} rotation={[0, Math.PI, 0]} scale={0.35}>
          <meshStandardMaterial
            map={backTexture}
            transparent
            polygonOffset
            polygonOffsetFactor={-1}
          />
        </Decal>
      )}
    </mesh>
  );
}

export default function Garment3DViewer({
  frontElements,
  backElements,
  color = "#1B1B1B",
  modelPath,
  backendUrl,
}) {
  const [frontCanvas, setFrontCanvas] = useState(null);
  const [backCanvas, setBackCanvas] = useState(null);

  useEffect(() => {
    let cancelled = false;
    drawElementsToCanvas(frontElements, backendUrl).then((c) => {
      if (!cancelled) setFrontCanvas(c);
    });
    return () => {
      cancelled = true;
    };
  }, [frontElements, backendUrl]);

  useEffect(() => {
    let cancelled = false;
    drawElementsToCanvas(backElements, backendUrl).then((c) => {
      if (!cancelled) setBackCanvas(c);
    });
    return () => {
      cancelled = true;
    };
  }, [backElements, backendUrl]);

  return (
    <Canvas camera={{ position: [0, 0, 2.4], fov: 30 }} shadows>
      <ambientLight intensity={0.7} />
      <directionalLight position={[2, 3, 3]} intensity={1} castShadow />
      <directionalLight position={[-2, -1, -3]} intensity={0.3} />
      <Suspense fallback={null}>
        <ShirtModel
          color={color}
          frontCanvas={frontCanvas}
          backCanvas={backCanvas}
          modelPath={modelPath}
        />
      </Suspense>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={2.5}
        minPolarAngle={Math.PI / 2.2}
        maxPolarAngle={Math.PI / 2.2}
      />
    </Canvas>
  );
}