// Route this at: <Route path="/buy-now/:id" element={<BuyNowPage />} />
//
// ASSUMPTION: order creation endpoint is POST /api/orders with body
// { orderItems: [{ product, size, qty, price }], shippingAddress }.
// Swap the fetch URL/body below to match your real orderController if different —
// I haven't seen that file yet.

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createOrder, clearPlacedOrder } from "../redux/slices/orderSlice";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const C = {
  bg: "#FFFFFF",
  ink: "#15130F",
  muted: "#71695B",
  border: "#ECE4D2",
  gold: "#C9A24B",
  danger: "#B3432B",
};

export default function BuyNowPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { placing } = useSelector((s) => s.orders);
  const [msg, setMsg] = useState(null);

  if (!state?.product) {
    return (
      <div
        style={{
          minHeight: "100vh",
          padding: 40,
          textAlign: "center",
          color: C.muted,
        }}
      >
        No order details found. Please go back and try again.
      </div>
    );
  }

  const { product, size, qty } = state;
  const total = product.price * qty;

  const handlePlaceOrder = async () => {
    setMsg(null);

    const defaultAddress =
      user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0] || {};

    const orderPayload = {
      orderItems: [
        {
          name: product.brandname,
          qty,
          image: product.images?.[0] || "",
          price: product.price,
          size,
          product: product._id,
        },
      ],
      shippingAddress: {
        doorNo: defaultAddress.doorNo || "",
        street: defaultAddress.street || "",
        nearestLandmark: defaultAddress.nearestLandmark || "",
        city: defaultAddress.city || "",
        state: defaultAddress.state || "",
        pin: defaultAddress.pin || null,
        country: defaultAddress.country || "India",
        phoneNumber: defaultAddress.phoneNumber || null,
      },
      paymentMethod: "COD", // ← swap once a real payment step exists for Buy Now
      taxPrice: 0, // ← replace with real tax calc if needed
      shippingPrice: 0, // ← replace with real shipping calc if needed
      totalPrice: total,
    };

    try {
      await dispatch(createOrder(orderPayload)).unwrap();
      setMsg({ type: "ok", text: "Order placed successfully!" });
      setTimeout(() => {
        dispatch(clearPlacedOrder());
        navigate("/");
      }, 1500);
    } catch (err) {
      setMsg({ type: "error", text: err || "Something went wrong." });
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: "40px 24px" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: C.ink,
            marginBottom: 24,
          }}
        >
          Order Summary
        </h1>

        <div
          style={{
            display: "flex",
            gap: 16,
            padding: 16,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            marginBottom: 20,
          }}
        >
          {product.images?.[0] && (
            <img
              src={`${BACKEND_URL}/${product.images[0]}`}
              alt={product.brandname}
              style={{
                width: 80,
                height: 80,
                borderRadius: 8,
                objectFit: "cover",
              }}
            />
          )}
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: C.ink }}>
              {product.brandname}
            </p>
            <p style={{ margin: "4px 0", color: C.muted, fontSize: 13 }}>
              Size: {size} &nbsp;•&nbsp; Qty: {qty}
            </p>
            <p style={{ margin: 0, fontWeight: 700, color: C.ink }}>
              ₹ {product.price}
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "12px 0",
            borderTop: `1px solid ${C.border}`,
            borderBottom: `1px solid ${C.border}`,
            marginBottom: 24,
            fontWeight: 700,
            color: C.ink,
          }}
        >
          <span>Total</span>
          <span>₹ {total}</span>
        </div>

        {msg && (
          <p
            style={{
              color: msg.type === "ok" ? "#3E7C4A" : C.danger,
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            {msg.text}
          </p>
        )}

        <button
          onClick={handlePlaceOrder}
          disabled={placing}
          style={{
            width: "100%",
            padding: "14px 0",
            borderRadius: 999,
            background: C.gold,
            color: C.ink,
            border: "none",
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: "0.04em",
            cursor: placing ? "wait" : "pointer",
          }}
        >
          {placing ? "PLACING ORDER…" : "PLACE ORDER"}
        </button>
      </div>
    </div>
  );
}
