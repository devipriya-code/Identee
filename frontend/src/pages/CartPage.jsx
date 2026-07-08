// Route this at: <Route path="/cart" element={<CartPage />} />

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart } from "../redux/slices/cartWishlistSlice";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const C = { bg: "#FFFFFF", ink: "#15130F", muted: "#71695B", border: "#ECE4D2", gold: "#C9A24B" };

const getUserInfo = () => {
  try {
    const raw = localStorage.getItem("userInfo");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export default function CartPage() {
  const dispatch = useDispatch();
  const { cartItems, loading } = useSelector((s) => s.cartWishlist);
  const user = getUserInfo();

  useEffect(() => {
    if (user?.token) dispatch(fetchCart(user.token));
  }, [dispatch]);

  if (!user) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: C.muted }}>
        Please log in to view your cart.
      </div>
    );
  }
  if (loading) {
    return <div style={{ padding: 40, textAlign: "center", color: C.muted }}>Loading…</div>;
  }
  if (cartItems.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: C.muted }}>
        Your cart is empty.
      </div>
    );
  }

  const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: "40px 24px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: C.ink, marginBottom: 24 }}>
          My Cart
        </h1>

        {cartItems.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 16,
              padding: "16px 0",
              borderBottom: `1px solid ${C.border}`,
              alignItems: "center",
            }}
          >
            {item.product?.images?.[0] && (
              <img
                src={`${BACKEND_URL}/${item.product.images[0]}`}
                alt={item.product.brandname}
                style={{ width: 72, height: 72, borderRadius: 8, objectFit: "cover" }}
              />
            )}
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 600, color: C.ink }}>
                {item.product?.brandname}
              </p>
              <p style={{ margin: "4px 0", color: C.muted, fontSize: 13 }}>
                Size: {item.size} &nbsp;•&nbsp; Qty: {item.qty}
              </p>
            </div>
            <p style={{ fontWeight: 700, color: C.ink }}>₹ {item.price * item.qty}</p>
          </div>
        ))}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "20px 0",
            fontWeight: 700,
            color: C.ink,
            fontSize: 18,
          }}
        >
          <span>Total</span>
          <span>₹ {total}</span>
        </div>

        <Link
          to="/"
          style={{
            display: "block",
            textAlign: "center",
            marginTop: 20,
            padding: "14px 0",
            borderRadius: 999,
            background: C.gold,
            color: C.ink,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          CONTINUE SHOPPING
        </Link>
      </div>
    </div>
  );
}