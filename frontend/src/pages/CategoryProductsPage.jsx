import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getProductsByGarmentStyle } from "../redux/slices/productSlice";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const C = {
  bg: "#FFFFFF",
  ink: "#15130F",
  muted: "#71695B",
  border: "#ECE4D2",
  gold: "#C9A24B",
};

export default function CategoryProductsPage() {
  const { categoryName } = useParams();
  const decoded = decodeURIComponent(categoryName);
  const dispatch = useDispatch();
  const { categoryProducts, isCategoryLoading } = useSelector((s) => s.product);

  useEffect(() => {
    dispatch(getProductsByGarmentStyle(decoded));
  }, [dispatch, decoded]);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: "40px 24px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <p style={{ fontSize: 12, letterSpacing: "0.2em", color: C.muted, textTransform: "uppercase", fontWeight: 700, margin: 0 }}>
          Shop
        </p>
        <h1 style={{ margin: "6px 0 28px", fontSize: 32, fontWeight: 800, color: C.ink }}>
          {decoded}
        </h1>

        {isCategoryLoading && <p style={{ color: C.muted }}>Loading products…</p>}

        {!isCategoryLoading && categoryProducts.length === 0 && (
          <p style={{ color: C.muted }}>No products found in this category yet.</p>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 20,
          }}
        >
          {categoryProducts.map((p) => (
            <Link
              key={p._id}
              to={`/product/${p._id}`}
              style={{
                textDecoration: "none",
                color: C.ink,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                overflow: "hidden",
                display: "block",
              }}
            >
              <div style={{ aspectRatio: "4/5", background: "#F3F1EC", overflow: "hidden" }}>
                {p.images?.[0] && (
                  <img
                    src={`${BACKEND_URL}/${p.images[0]}`}
                    alt={p.brandname}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                )}
              </div>
              <div style={{ padding: "12px 14px" }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{p.brandname}</p>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>
                  {p.productdetails?.color}
                </p>
                <p style={{ margin: "6px 0 0", fontSize: 15, fontWeight: 700, color: C.gold }}>
                  ₹{p.price}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}