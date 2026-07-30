import { useState } from "react";
import { useSelector } from "react-redux";
import { THEME, inputStyle } from "../../theme/theme";
import checkoutService from "../../services/checkoutService";

const EMPTY_CART_ITEMS = [];

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Product images are stored as relative paths (e.g. "uploads/xyz.jpg").
// This resolves them against the backend origin instead of the frontend's.
function getImageUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${BACKEND_URL}/${path.replace(/^\/+/, "")}`;
}

function formatAddress(addr) {
  return [
    addr.doorNo,
    addr.street,
    addr.nearestLandmark,
    addr.city,
    addr.state,
    addr.pin,
  ]
    .filter(Boolean)
    .join(", ");
}

// items: optional override — array of { _id, product, size, qty, price }
// If not passed, falls back to the redux cart (normal checkout flow).
export default function OrderSummaryStep({
  shippingAddress,
  onChangeAddress,
  coupon,
  setCoupon,
  onBack,
  onContinue,
  items: itemsProp,
}) {
  const cartItems = useSelector(
    (state) => state.cartWishlist?.cartItems || EMPTY_CART_ITEMS,
  );
  const { user } = useSelector((state) => state.auth);

  const items = itemsProp || cartItems;

  const [couponInput, setCouponInput] = useState(coupon?.code || "");
  const [couponError, setCouponError] = useState("");
  const [applying, setApplying] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const mrpTotal = items.reduce(
    (sum, item) => sum + (item.product?.oldPrice || item.price) * item.qty,
    0,
  );
  const mrpDiscount = Math.max(mrpTotal - subtotal, 0);
  const couponDiscount = coupon?.discountAmount || 0;
  const estimatedTotal = Math.max(subtotal - couponDiscount, 0);

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setApplying(true);
    setCouponError("");
    try {
      const result = await checkoutService.validateCoupon(
        couponInput.trim(),
        user.token,
      );
      const discountAmount = Math.round(
        (subtotal * result.offerPercentage) / 100,
      );
      setCoupon({
        code: result.code,
        percentage: result.offerPercentage,
        discountAmount,
      });
    } catch (error) {
      setCouponError(
        error.response?.data?.message || "Invalid or expired coupon",
      );
      setCoupon(null);
    } finally {
      setApplying(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 300px",
        gap: 20,
        alignItems: "start",
      }}
    >
      <div>
        <div
          style={{
            background: THEME.surface,
            border: `1px solid ${THEME.border}`,
            borderRadius: 12,
            padding: "16px 20px",
            boxShadow: THEME.shadow,
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                fontWeight: 700,
                color: THEME.gold,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Deliver to
            </p>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 13,
                fontWeight: 600,
                color: THEME.text,
                fontFamily: THEME.fontBody,
              }}
            >
              {user?.name} — {formatAddress(shippingAddress)}
            </p>
          </div>
          <button
            type="button"
            onClick={onChangeAddress}
            style={{
              background: "none",
              border: `1px solid ${THEME.gold}`,
              color: THEME.goldDeep,
              borderRadius: 6,
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: THEME.fontBody,
              whiteSpace: "nowrap",
            }}
          >
            Change
          </button>
        </div>

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
          <h2
            style={{
              margin: "0 0 18px",
              fontSize: 18,
              fontWeight: 600,
              fontFamily: THEME.fontDisplay,
              color: THEME.text,
            }}
          >
            Order Summary
          </h2>

          {items.length === 0 ? (
            <p style={{ color: THEME.textMuted, fontFamily: THEME.fontBody }}>
              No items to show.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {items.map((item, i) => (
                <div
                  key={item._id || i}
                  style={{
                    display: "flex",
                    gap: 14,
                    alignItems: "center",
                    paddingBottom: 14,
                    borderBottom:
                      i < items.length - 1
                        ? `1px solid ${THEME.border}`
                        : "none",
                  }}
                >
                  <img
                    src={getImageUrl(item.product?.images?.[0])}
                    alt={item.product?.brandname}
                    style={{
                      width: 64,
                      height: 64,
                      objectFit: "cover",
                      borderRadius: 8,
                      border: `1px solid ${THEME.border}`,
                      background: THEME.surface2,
                    }}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23f1ede2'/%3E%3C/svg%3E";
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
                      {item.product?.brandname}
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
                  <div style={{ textAlign: "right" }}>
                    {item.product?.oldPrice > item.price / item.qty && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: 11,
                          color: THEME.textMuted,
                          textDecoration: "line-through",
                        }}
                      >
                        ₹{item.product.oldPrice * item.qty}
                      </p>
                    )}
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
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            background: THEME.surface,
            border: `1px solid ${THEME.border}`,
            borderRadius: 12,
            padding: 24,
            boxShadow: THEME.shadow,
          }}
        >
          <h3
            style={{
              margin: "0 0 12px",
              fontSize: 14,
              fontWeight: 600,
              color: THEME.text,
              fontFamily: THEME.fontBody,
            }}
          >
            Have a discount code?
          </h3>

          {coupon ? (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: THEME.goldBg,
                border: `1px solid ${THEME.goldBorder}`,
                borderRadius: 8,
                padding: "10px 14px",
              }}
            >
              <span
                style={{ fontSize: 13, color: THEME.goldDeep, fontWeight: 600 }}
              >
                "{coupon.code}" applied — {coupon.percentage}% off
              </span>
              <button
                type="button"
                onClick={removeCoupon}
                style={{
                  background: "none",
                  border: "none",
                  color: THEME.danger,
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                Remove
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={applying}
                  style={{
                    padding: "0 22px",
                    borderRadius: 8,
                    border: `1px solid ${THEME.gold}`,
                    background: THEME.goldBg,
                    color: THEME.goldDeep,
                    cursor: applying ? "not-allowed" : "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: THEME.fontBody,
                  }}
                >
                  {applying ? "Checking…" : "Apply"}
                </button>
              </div>
              {couponError && (
                <p
                  style={{
                    color: THEME.danger,
                    fontSize: 12,
                    marginTop: 8,
                    fontFamily: THEME.fontBody,
                  }}
                >
                  {couponError}
                </p>
              )}
            </>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            marginTop: 20,
          }}
        >
          <button
            type="button"
            onClick={onBack}
            style={{
              padding: "11px 24px",
              borderRadius: 8,
              border: `1px solid ${THEME.border}`,
              background: THEME.surface,
              color: THEME.textMuted,
              cursor: "pointer",
              fontSize: 13,
              fontFamily: THEME.fontBody,
            }}
          >
            ← Back to Address
          </button>
        </div>
      </div>

      <div
        style={{
          position: "sticky",
          top: 20,
          background: THEME.surface,
          border: `1px solid ${THEME.border}`,
          borderRadius: 12,
          padding: 22,
          boxShadow: THEME.shadow,
        }}
      >
        <p
          style={{
            margin: "0 0 14px",
            fontSize: 12,
            fontWeight: 700,
            color: THEME.gold,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Price Details
        </p>

        <PriceRow label="MRP (incl. of all taxes)" value={mrpTotal} />
        {mrpDiscount > 0 && (
          <PriceRow label="Discount on MRP" value={mrpDiscount} negative />
        )}
        {couponDiscount > 0 && (
          <PriceRow
            label={`Coupon (${coupon?.code})`}
            value={couponDiscount}
            negative
          />
        )}

        <div
          style={{ borderTop: `1px solid ${THEME.border}`, margin: "10px 0" }}
        />
        <PriceRow label="Total Amount" value={estimatedTotal} bold />

        <p
          style={{
            margin: "6px 0 0",
            fontSize: 11,
            color: THEME.textMuted,
            fontFamily: THEME.fontBody,
          }}
        >
          Shipping calculated at next step
        </p>

        {mrpDiscount + couponDiscount > 0 && (
          <div
            style={{
              marginTop: 14,
              background: THEME.goldBg,
              border: `1px solid ${THEME.goldBorder}`,
              borderRadius: 8,
              padding: "10px 12px",
              fontSize: 12,
              fontWeight: 700,
              color: THEME.goldDeep,
              fontFamily: THEME.fontBody,
            }}
          >
            🎉 You'll save ₹{mrpDiscount + couponDiscount} on this order!
          </div>
        )}

        <button
          type="button"
          onClick={onContinue}
          disabled={items.length === 0}
          style={{
            width: "100%",
            marginTop: 18,
            padding: "12px 0",
            borderRadius: 8,
            border: "none",
            background: `linear-gradient(135deg, ${THEME.gold}, ${THEME.goldBright})`,
            color: "#0B0B0C",
            cursor: items.length === 0 ? "not-allowed" : "pointer",
            fontSize: 13,
            fontWeight: 700,
            fontFamily: THEME.fontBody,
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function PriceRow({ label, value, bold, negative }) {
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
          color: negative ? THEME.gold : bold ? THEME.goldDeep : THEME.text,
          fontWeight: bold ? 700 : 500,
          fontFamily: THEME.fontBody,
        }}
      >
        {negative ? "− " : ""}₹{value}
      </span>
    </div>
  );
}
