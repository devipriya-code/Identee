// Route this at: <Route path="/buy-now/:id" element={<BuyNowPage />} />
import { useLocation } from "react-router-dom";
import CheckoutFlow from "../components/checkout/CheckoutFlow";
import { THEME } from "../theme/theme";

export default function BuyNowPage() {
  const { state } = useLocation();

  if (!state?.product) {
    return (
      <div
        style={{
          minHeight: "100vh",
          padding: 40,
          textAlign: "center",
          color: THEME.textMuted,
        }}
      >
        No order details found. Please go back and try again.
      </div>
    );
  }

  const { product, size, qty } = state;

  // Shaped to match what OrderSummaryStep / PaymentStep expect:
  // { _id, product, size, qty, price } — price is the line total.
  const items = [
    {
      _id: `buynow-${product._id}`,
      product,
      size,
      qty,
      price: product.price * qty,
    },
  ];

  return (
    <CheckoutFlow items={items} buyNow={{ productId: product._id, qty }} />
  );
}
