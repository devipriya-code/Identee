// Route this at: <Route path="/buy-now/:id" element={<BuyNowPage />} />
//
// Requires: <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
// added in your index.html (before </body>), so window.Razorpay exists.

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
  navy: "#1A2A4A",
  danger: "#B3432B",
};

export default function BuyNowPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { placing } = useSelector((s) => s.orders);
  const [msg, setMsg] = useState(null);
  const [payingOnline, setPayingOnline] = useState(false);

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

  const getDefaultAddress = () =>
    user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0] || {};

  const buildOrderPayload = (paymentMethod, paymentResult, razorpayOrderId) => {
    const defaultAddress = getDefaultAddress();
    return {
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
      paymentMethod,
      taxPrice: 0, // ← replace with real tax calc if needed
      shippingPrice: 0, // ← replace with real shipping calc if needed
      totalPrice: total,
      paymentResult,
      razorpayOrderId,
    };
  };

  // ── COD flow (unchanged behavior) ─────────────────────────────
  const handleCODOrder = async () => {
    setMsg(null);
    try {
      await dispatch(createOrder(buildOrderPayload("COD"))).unwrap();
      setMsg({ type: "ok", text: "Order placed successfully!" });
      setTimeout(() => {
        dispatch(clearPlacedOrder());
        navigate("/");
      }, 1500);
    } catch (err) {
      setMsg({ type: "error", text: err || "Something went wrong." });
    }
  };

  // ── Razorpay flow ──────────────────────────────────────────────
  const handleRazorpayOrder = async () => {
    setMsg(null);

    if (!user) {
      setMsg({ type: "error", text: "Please log in to pay online." });
      return;
    }
    if (!window.Razorpay) {
      setMsg({
        type: "error",
        text: "Payment library failed to load. Refresh and try again.",
      });
      return;
    }

    setPayingOnline(true);
    try {
      const authToken = user?.token;

      // Step 1 — ask backend to create the Razorpay order.
      // Amount is computed server-side from buyNowProductId + qty,
      // never trusted from this client payload.
      const createRes = await fetch(`${BACKEND_URL}/api/orders/razorpay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          buyNowProductId: product._id,
          qty,
        }),
      });
      const rzpOrder = await createRes.json();
      if (!createRes.ok) {
        throw new Error(rzpOrder.message || "Could not start payment");
      }

      // Step 2 — open Razorpay checkout
      const options = {
        key: rzpOrder.keyId,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        order_id: rzpOrder.id,
        name: "Your Brand",
        description: product.brandname,
        prefill: { email: user?.email },
        theme: { color: C.gold },
        handler: async (response) => {
          try {
            // Step 3 — verify signature on backend before trusting "success"
            const verifyRes = await fetch(
              `${BACKEND_URL}/api/orders/razorpay/verify`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify(response),
              },
            );
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              setMsg({ type: "error", text: "Payment verification failed." });
              setPayingOnline(false);
              return;
            }

            // Step 4 — only now create the real order record
            const paymentResult = {
              id: response.razorpay_payment_id,
              status: "paid",
              update_time: new Date().toISOString(),
            };
            await dispatch(
              createOrder(
                buildOrderPayload(
                  "RAZORPAY",
                  paymentResult,
                  response.razorpay_order_id,
                ),
              ),
            ).unwrap();

            setMsg({ type: "ok", text: "Payment successful, order placed!" });
            setTimeout(() => {
              dispatch(clearPlacedOrder());
              navigate("/");
            }, 1500);
          } catch (err) {
            setMsg({
              type: "error",
              text: err || "Order creation failed after payment.",
            });
          } finally {
            setPayingOnline(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPayingOnline(false);
            setMsg({ type: "error", text: "Payment cancelled." });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp) => {
        setPayingOnline(false);
        setMsg({
          type: "error",
          text: resp.error?.description || "Payment failed.",
        });
      });
      rzp.open();
    } catch (err) {
      setPayingOnline(false);
      setMsg({ type: "error", text: err.message || "Something went wrong." });
    }
  };

  const busy = placing || payingOnline;

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

        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <button
            onClick={handleCODOrder}
            disabled={busy}
            style={{
              flex: 1,
              padding: "14px 0",
              borderRadius: 999,
              background: "#fff",
              color: C.navy,
              border: `2px solid ${C.navy}`,
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: "0.04em",
              cursor: busy ? "wait" : "pointer",
              opacity: busy ? 0.7 : 1,
            }}
          >
            {placing ? "PLACING…" : "PAY ON DELIVERY"}
          </button>

          <button
            onClick={handleRazorpayOrder}
            disabled={busy}
            style={{
              flex: 1,
              padding: "14px 0",
              borderRadius: 999,
              background: C.navy,
              color: "#fff",
              border: "none",
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: "0.04em",
              cursor: busy ? "wait" : "pointer",
              opacity: busy ? 0.7 : 1,
            }}
          >
            {payingOnline ? "OPENING…" : "PAY ONLINE"}
          </button>
        </div>

        <p style={{ fontSize: 12, color: C.muted, textAlign: "center" }}>
          Online payments are securely processed by Razorpay.
        </p>
      </div>
    </div>
  );
}