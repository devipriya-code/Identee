// components/FeaturedReviews.jsx
// Drop into src/pages/Home.jsx. Public endpoint, no auth needed.

import { useEffect, useState } from "react";
import { THEME } from "../theme/theme";
import reviewService from "../services/reviewService";

export default function FeaturedReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reviewService
      .getFeaturedReviews()
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading || reviews.length === 0) return null;

  return (
    <section style={{ padding: "48px 40px", fontFamily: THEME.fontBody }}>
      <h2
        style={{
          fontFamily: THEME.fontDisplay,
          fontSize: 26,
          textAlign: "center",
          color: THEME.text,
          marginBottom: 28,
        }}
      >
        Customer Love
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
        }}
      >
        {reviews.map((r) => (
          <div
            key={r._id}
            style={{
              background: THEME.surface,
              border: `1px solid ${THEME.border}`,
              borderRadius: 12,
              padding: 20,
              boxShadow: THEME.shadow,
            }}
          >
            <div style={{ color: THEME.gold, fontSize: 16, marginBottom: 8 }}>
              {"★".repeat(r.rating)}
              <span style={{ color: THEME.border }}>
                {"★".repeat(5 - r.rating)}
              </span>
            </div>
            <p style={{ fontSize: 14, color: THEME.text, margin: "0 0 12px" }}>
              "{r.comment}"
            </p>
            <p style={{ fontSize: 12, color: THEME.textMuted, margin: 0 }}>
              {r.user?.name} · {r.product?.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
