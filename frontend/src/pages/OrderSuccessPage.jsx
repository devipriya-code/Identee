import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { THEME } from "../theme/theme";
import orderService from "../services/orderService";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Product/order images are stored as relative paths (e.g. "uploads/xyz.jpg").
// This resolves them against the backend origin instead of the frontend's.
function getImageUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${BACKEND_URL}/${path.replace(/^\/+/, "")}`;
}

export default function OrderSuccessPage() {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await orderService.getOrderById(id, user.token);
        setOrder(data);
      } catch (err) {
        setError(err.response?.data?.message || "Couldn't load order details");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, user.token]);

  if (loading) {
    return (
      <Centered>
        <p style={{ color: THEME.textMuted, fontFamily: THEME.fontBody }}>
          Loading your order…
        </p>
      </Centered>
    );
  }

  if (error || !order) {
    return (
      <Centered>
        <p
          style={{
            color: THEME.danger,
            fontFamily: THEME.fontBody,
            marginBottom: 16,
          }}
        >
          {error || "Order not found"}
        </p>
        <Link to="/" style={linkBtnStyle}>
          Back to Home
        </Link>
      </Centered>
    );
  }

  const addr = order.shippingAddress;
  const fullName = [addr?.firstName, addr?.lastName].filter(Boolean).join(" ");
  const addressLine = [
    addr?.doorNo,
    addr?.street,
    addr?.nearestLandmark,
    addr?.city,
    addr?.state,
    addr?.pin,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      style={{ minHeight: "100vh", background: THEME.bg, padding: "48px 20px" }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* Success banner */}
        {/* Success banner */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <svg
            width="72"
            height="72"
            viewBox="0 0 72 72"
            style={{ margin: "0 auto 16px", display: "block" }}
          >
            <circle
              cx="36"
              cy="36"
              r="33"
              fill="none"
              stroke="#2E7D32"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="207"
              strokeDashoffset="207"
              style={{
                animation: "successCircle 0.6s ease-out forwards",
                transformOrigin: "center",
              }}
            />
            <path
              d="M22 37 L32 47 L50 27"
              fill="none"
              stroke="#2E7D32"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="40"
              strokeDashoffset="40"
              style={{
                animation: "successCheck 0.35s 0.5s ease-out forwards",
              }}
            />
          </svg>
          <style>{`
            @keyframes successCircle {
              from { stroke-dashoffset: 207; }
              to { stroke-dashoffset: 0; }
            }
            @keyframes successCheck {
              from { stroke-dashoffset: 40; }
              to { stroke-dashoffset: 0; }
            }
          `}</style>
          <h1
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 600,
              fontFamily: THEME.fontDisplay,
              color: THEME.text,
            }}
          >
            Order Placed Successfully!
          </h1>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 14,
              color: THEME.textMuted,
              fontFamily: THEME.fontBody,
            }}
          >
            {order.invoiceNumber ? `Invoice ${order.invoiceNumber} · ` : ""}
            Order ID: {order._id}
          </p>
        </div>

        {/* Order items */}
        <Section title="Order Items">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {order.orderItems.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "center",
                  paddingBottom: 14,
                  borderBottom:
                    i < order.orderItems.length - 1
                      ? `1px solid ${THEME.border}`
                      : "none",
                }}
              >
                <img
                  src={getImageUrl(item.image || item.product?.images?.[0])}
                  alt={item.name}
                  style={{
                    width: 60,
                    height: 60,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: `1px solid ${THEME.border}`,
                    background: THEME.surface2,
                  }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect width='60' height='60' fill='%23f1ede2'/%3E%3C/svg%3E";
                  }}
                />
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 600,
                      fontSize: 14,
                      color: THEME.text,
                      fontFamily: THEME.fontBody,
                    }}
                  >
                    {item.name}
                  </p>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: 12,
                      color: THEME.textMuted,
                    }}
                  >
                    Size: {item.size} · Qty: {item.qty}
                  </p>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontWeight: 700,
                    color: THEME.goldDeep,
                    fontFamily: THEME.fontBody,
                  }}
                >
                  ₹{item.price}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* Shipping address */}
        <Section title="Shipping To">
          <p
            style={{
              margin: 0,
              fontWeight: 600,
              fontSize: 14,
              color: THEME.text,
              fontFamily: THEME.fontBody,
            }}
          >
            {fullName || "—"}
          </p>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 13,
              color: THEME.textMuted,
              fontFamily: THEME.fontBody,
            }}
          >
            {addressLine || "—"}
          </p>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 13,
              color: THEME.textMuted,
              fontFamily: THEME.fontBody,
            }}
          >
            {addr?.phoneNumber}
            {addr?.secondaryPhone ? ` · ${addr.secondaryPhone}` : ""}
          </p>
        </Section>

        {/* Price breakdown */}
        <Section title="Payment Summary">
          <Row label="CGST" value={order.cgstPrice} />
          <Row label="SGST" value={order.sgstPrice} />
          {order.coupon?.code && (
            <Row
              label={`Discount (${order.coupon.code})`}
              value={order.coupon.discountAmount}
              negative
            />
          )}
          <Row label="Shipping" value={order.shippingPrice} />
          <div
            style={{ borderTop: `1px solid ${THEME.border}`, margin: "10px 0" }}
          />
          <Row label="Grand Total" value={order.totalPrice} bold />

          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <StatusPill
              label={order.isPaid ? "Paid" : "Payment Pending"}
              tone={order.isPaid ? "gold" : "danger"}
            />
            <StatusPill label={order.orderStatus} tone="neutral" />
          </div>
        </Section>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            marginTop: 28,
          }}
        >
          <Link to="/orders" style={linkBtnStyle}>
            View My Orders
          </Link>
          <Link
            to="/"
            style={{
              ...linkBtnStyle,
              background: "transparent",
              border: `1px solid ${THEME.border}`,
              color: THEME.textMuted,
            }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── small local helpers ──────────────────────────────────────────────────

function Centered({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: THEME.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      {children}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div
      style={{
        background: THEME.surface,
        border: `1px solid ${THEME.border}`,
        borderRadius: 12,
        padding: 24,
        boxShadow: THEME.shadow,
        marginBottom: 16,
      }}
    >
      <p
        style={{
          margin: "0 0 14px",
          fontSize: 12,
          fontWeight: 700,
          color: THEME.gold,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontFamily: THEME.fontBody,
        }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

function Row({ label, value, bold, negative }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "6px 0",
      }}
    >
      <span
        style={{
          fontSize: 13,
          color: bold ? THEME.text : THEME.textMuted,
          fontWeight: bold ? 700 : 400,
          fontFamily: THEME.fontBody,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: bold ? 16 : 13,
          color: negative ? THEME.danger : bold ? THEME.goldDeep : THEME.text,
          fontWeight: bold ? 700 : 500,
          fontFamily: THEME.fontBody,
        }}
      >
        {negative ? "− " : ""}₹{value}
      </span>
    </div>
  );
}

function StatusPill({ label, tone }) {
  const colors = {
    gold: { bg: THEME.goldBg, border: THEME.goldBorder, text: THEME.goldDeep },
    danger: {
      bg: THEME.dangerBg,
      border: THEME.dangerBorder,
      text: THEME.danger,
    },
    neutral: {
      bg: THEME.surface2,
      border: THEME.border,
      text: THEME.textMuted,
    },
  }[tone];

  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: "4px 10px",
        borderRadius: 999,
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
        fontFamily: THEME.fontBody,
        textTransform: "capitalize",
      }}
    >
      {label}
    </span>
  );
}

const linkBtnStyle = {
  padding: "10px 24px",
  borderRadius: 8,
  border: "none",
  background: `linear-gradient(135deg, ${THEME.gold}, ${THEME.goldBright})`,
  color: "#0B0B0C",
  fontSize: 13,
  fontWeight: 700,
  fontFamily: THEME.fontBody,
  textDecoration: "none",
};
