import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchGarmentTypes } from "../redux/slices/garmentTypeSlice";
import { getShowcase } from "../redux/slices/categoryBannerSlice";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const C = {
  bg: "#FFFFFF",
  title: "#2B2560",
  ink: "#1A1A1A",
  muted: "#8C8C8C",
  border: "#ECE4D2",
};

export default function ChooseProductPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: garmentTypes } = useSelector((s) => s.garmentType);
  const { showcase: banners, isLoading } = useSelector((s) => s.categoryBanner);

  useEffect(() => {
    dispatch(fetchGarmentTypes());
    dispatch(getShowcase());
  }, [dispatch]);

  const availableGarments = banners
    .map((b) => {
      const g = garmentTypes.find((g) => g.category === b.category);
      return g ? { ...g, bannerImage: b.image } : null;
    })
    .filter(Boolean);

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
            margin: "0 0 48px",
          }}
        >
          CHOOSE A PRODUCT
        </h1>

        {isLoading && (
          <p style={{ textAlign: "center", color: C.muted }}>
            Loading products…
          </p>
        )}
        {!isLoading && availableGarments.length === 0 && (
          <p style={{ textAlign: "center", color: C.muted }}>
            No products available yet.
          </p>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            columnGap: 24,
            rowGap: 40,
          }}
        >
          {availableGarments.map((g) => (
            <button
              key={g.key}
              onClick={() => navigate(`/customize/choose-color/${g.key}`)}
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
                  borderRadius: 12,
                  overflow: "hidden",
                  border: `1px solid ${C.border}`,
                  background: "#F7F5F0",
                }}
              >
                <img
                  src={`${BACKEND_URL}${g.bannerImage}`}
                  alt={g.label}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: C.ink,
                  textAlign: "center",
                }}
              >
                {g.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
