// pages/ChooseColorPage.jsx
//
// Route: <Route path="/customize/choose-color/:type" element={<ChooseColorPage />} />
//
// Step 2 — restyled to match yourdesignstore.in's /products/chooseColor/:type
// screen exactly:
//   - Centered page title "CHOOSE COLOR" in deep indigo
//   - Black pill "CHANGE PRODUCT" button floated top-right, independent
//     of the centered title (not the same flex row — the reference site
//     keeps the title centered on the page and the button pinned to the
//     top-right corner of the content area)
//   - Borderless swatch grid: garment image + lowercase color name
//     centered underneath, no card background/border

import { useNavigate, useParams, Link } from "react-router-dom";
import { getGarmentType } from "../data/garmentCatalog";
import GarmentSilhouette from "../components/GarmentSilhouette";

const C = {
  bg: "#FFFFFF",
  title: "#2B2560",
  ink: "#1A1A1A",
  muted: "#8C8C8C",
  black: "#0E0E0E",
};

export default function ChooseColorPage() {
  const { type } = useParams();
  const navigate = useNavigate();
  const garment = getGarmentType(type);

  if (!garment) {
    return (
      <div style={{ padding: 60, textAlign: "center", color: C.muted }}>
        We couldn't find that pattern.{" "}
        <Link to="/customize/choose-product" style={{ color: C.title }}>
          Choose a pattern
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        padding: "48px 24px 80px",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto", position: "relative" }}>
        <button
          onClick={() => navigate("/customize/choose-product")}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            padding: "14px 30px",
            borderRadius: 999,
            background: C.black,
            color: "#fff",
            border: "none",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.06em",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          CHANGE PRODUCT
        </button>

        <h1
          style={{
            fontSize: 34,
            fontWeight: 800,
            color: C.title,
            textAlign: "center",
            margin: "0 0 48px",
            letterSpacing: "0.01em",
          }}
        >
          CHOOSE COLOR
        </h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            columnGap: 24,
            rowGap: 40,
          }}
        >
          {garment.colors.map((color) => (
            <button
              key={color.slug}
              onClick={() =>
                navigate(`/customize/${garment.key}?color=${color.slug}`)
              }
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
                padding: 0,
                border: "none",
                background: "none",
                cursor: "pointer",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: "1/1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ width: "78%", height: "78%" }}>
                  <GarmentSilhouette
                    shape={garment.shape}
                    view="front"
                    color={color.hex}
                  />
                </div>
              </div>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 400,
                  color: C.ink,
                  textTransform: "lowercase",
                }}
              >
                {color.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
