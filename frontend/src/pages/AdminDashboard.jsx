// pages/admin/AdminDashboard.jsx
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getProducts } from "../redux/slices/productSlice";
import { THEME } from "../theme/theme";

const QUICK_LINKS = [
  {
    to: "/admin/upload-product",
    title: "Upload Product",
    desc: "Add a new product with colour variants",
    icon: "+",
  },
  {
    to: "/admin/products",
    title: "Product List",
    desc: "View, edit, and manage your catalogue",
    icon: "▤",
  },
  {
    to: "/admin/orders",
    title: "Orders",
    desc: "Track and fulfil customer orders",
    icon: "▭",
  },
  {
    to: "/admin/transactions",
    title: "Transactions",
    desc: "Payment history and settlements",
    icon: "₹",
  },
  {
    to: "/admin/users",
    title: "All Users",
    desc: "Manage customer accounts",
    icon: "◎",
  },
  {
    to: "/admin/sellers",
    title: "Sellers",
    desc: "Manage seller accounts and approvals",
    icon: "◆",
  },
];

function StatCard({ label, value, sub }) {
  return (
    <div
      style={{
        background: THEME.surface,
        border: `1px solid ${THEME.border}`,
        borderRadius: 12,
        padding: "18px 20px",
        flex: 1,
        minWidth: 160,
        boxShadow: THEME.shadow,
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: THEME.textMuted,
          fontFamily: THEME.fontBody,
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: "8px 0 0",
          fontSize: 28,
          fontWeight: 600,
          color: THEME.goldDeep,
          fontFamily: THEME.fontDisplay,
        }}
      >
        {value}
      </p>
      {sub && (
        <p
          style={{
            margin: "4px 0 0",
            fontSize: 11,
            color: THEME.textMuted,
            fontFamily: THEME.fontBody,
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { products, isLoading } = useSelector((state) => state.product);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  const productCount = Array.isArray(products) ? products.length : 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: THEME.bg,
        color: THEME.text,
        fontFamily: THEME.fontBody,
        padding: "32px 40px",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p
          style={{
            margin: 0,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: THEME.gold,
          }}
        >
          Admin
        </p>
        <h1
          style={{
            margin: "4px 0 0",
            fontSize: 28,
            fontWeight: 600,
            color: THEME.text,
            fontFamily: THEME.fontDisplay,
          }}
        >
          Welcome back{userInfo?.name ? `, ${userInfo.name}` : ""}
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 14, color: THEME.textMuted }}>
          Here's what's happening across IDENTEE today.
        </p>
      </div>

      {/* Stats */}
      <div
        style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 36 }}
      >
        <StatCard
          label="Products"
          value={isLoading ? "…" : productCount}
          sub="Live in catalogue"
        />
        <StatCard label="Orders" value="—" sub="Wire orders API to populate" />
        <StatCard
          label="Sellers"
          value="—"
          sub="Wire sellers API to populate"
        />
        <StatCard
          label="Revenue"
          value="—"
          sub="Wire transactions API to populate"
        />
      </div>

      {/* Quick links */}
      <p
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: THEME.goldDeep,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          margin: "0 0 14px",
          paddingBottom: 8,
          borderBottom: `1px solid ${THEME.border}`,
        }}
      >
        Quick Actions
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
          gap: 16,
        }}
      >
        {QUICK_LINKS.map((q) => (
          <Link
            key={q.to}
            to={q.to}
            style={{
              textDecoration: "none",
              background: THEME.surface,
              border: `1px solid ${THEME.border}`,
              borderRadius: 12,
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              transition:
                "border-color 0.15s, transform 0.15s, box-shadow 0.15s",
              boxShadow: THEME.shadow,
            }}
            className="dash-card"
          >
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: THEME.goldBg,
                border: `1px solid ${THEME.goldBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: THEME.goldDeep,
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              {q.icon}
            </span>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 600,
                  color: THEME.text,
                }}
              >
                {q.title}
              </p>
              <p
                style={{
                  margin: "3px 0 0",
                  fontSize: 12,
                  color: THEME.textMuted,
                  lineHeight: 1.4,
                }}
              >
                {q.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        .dash-card:hover {
          border-color: ${THEME.gold} !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(201,162,75,0.18) !important;
        }
      `}</style>
    </div>
  );
}
