// pages/ChooseProductPage.jsx
//
// Route: <Route path="/customize/choose-product" element={<ChooseProductPage />} />
//
// Step 1 of the customizer flow — restyled to match yourdesignstore.in's
// /products/chooseProduct screen exactly:
//   - Centered page title "CHOOSE PRODUCT" in deep indigo
//   - Left-aligned breadcrumb "APPAREL > MEN'S/UNISEX" below the title
//   - Borderless grid: just the garment image + name centered underneath,
//     no card background/border (the reference site has none)
//   - Subtle scale-up on hover instead of a border-color change

import { useNavigate } from "react-router-dom";
import { GARMENT_TYPES } from "../data/garmentCatalog";
import GarmentSilhouette from "../components/GarmentSilhouette";

const C = {
  bg: "#FFFFFF",
  title: "#2B2560", // deep indigo used for "CHOOSE PRODUCT" / "CHOOSE COLOR"
  ink: "#1A1A1A",
  muted: "#8C8C8C",
  black: "#0E0E0E",
};

const PARENT_CATEGORY = "APPAREL";

// Maps each garmentCatalog category to the sub-label shown in the
// breadcrumb, mirroring the reference site's "APPAREL > MEN'S/UNISEX".
// Add an entry here if you introduce a new category later.
const CATEGORY_LABELS = {
  Apparel: "MEN'S/UNISEX",
  "Jackets & Pullovers": "MEN'S/UNISEX",
};

export default function ChooseProductPage() {
  const navigate = useNavigate();

  const categories = [...new Set(GARMENT_TYPES.map((g) => g.category))];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        padding: "48px 24px 80px",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <h1
          style={{
            fontSize: 34,
            fontWeight: 800,
            color: C.title,
            textAlign: "center",
            margin: "0 0 40px",
            letterSpacing: "0.01em",
          }}
        >
          CHOOSE PRODUCT
        </h1>

        {categories.map((category) => (
          <div key={category} style={{ marginBottom: 48 }}>
            {/* Breadcrumb: APPAREL > MEN'S/UNISEX */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 28,
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  letterSpacing: "0.03em",
                  color: C.black,
                  textTransform: "uppercase",
                }}
              >
                {PARENT_CATEGORY}
              </span>
              <span style={{ fontSize: 16, color: C.muted }}>›</span>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  letterSpacing: "0.03em",
                  color: C.muted,
                  textTransform: "uppercase",
                }}
              >
                {CATEGORY_LABELS[category] || category}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                columnGap: 24,
                rowGap: 40,
              }}
            >
              {GARMENT_TYPES.filter((g) => g.category === category).map(
                (garment) => (
                  <button
                    key={garment.key}
                    onClick={() =>
                      navigate(`/customize/choose-color/${garment.key}`)
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
                          color={garment.previewColor || "#1B1B1B"}
                        />
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 500,
                        color: C.ink,
                        textAlign: "center",
                        lineHeight: 1.3,
                      }}
                    >
                      {garment.label}
                    </span>
                  </button>
                ),
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
