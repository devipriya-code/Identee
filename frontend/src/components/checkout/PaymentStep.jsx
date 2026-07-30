import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { THEME } from "../../theme/theme";
import checkoutService from "../../services/checkoutService";
import orderService from "../../services/orderService";

const EMPTY_CART_ITEMS = [];

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const PAYMENT_METHODS = [
  { key: "UPI", label: "UPI", desc: "Pay by any UPI app", icon: "📱" },
  {
    key: "CARD",
    label: "Credit / Debit / ATM Card",
    desc: "Add and secure cards as per RBI guidelines",
    icon: "💳",
  },
  {
    key: "COD",
    label: "Cash on Delivery",
    desc: "Pay when your order arrives",
    icon: "💵",
  },
];

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

// items: optional override — array of { product: {_id, brandname, images}, size, qty, price }
// buyNow: optional { productId, qty } — when set, tells the backend to price
// a single product directly instead of pulling the user's cart.
export default function PaymentStep({
  shippingAddress,
  coupon,
  onBack,
  items: itemsProp,
  buyNow,
}) {
  const cartItems = useSelector(
    (state) => state.cartWishlist?.cartItems || EMPTY_CART_ITEMS,
  );
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const items = itemsProp || cartItems;

  const [quote, setQuote] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(true);
  const [quoteError, setQuoteError] = useState("");
  const [method, setMethod] = useState("UPI");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    const fetchQuote = async () => {
      setLoadingQuote(true);
      setQuoteError("");
      try {
        const result = await checkoutService.createRazorpayOrder(
          {
            shippingAddress,
            couponCode: coupon?.code || null,
            buyNowProductId: buyNow?.productId || null,
            qty: buyNow?.qty || null,
          },
          user.token,
        );
        setQuote(result);
      } catch (error) {
        setQuoteError(
          error.response?.data?.message || "Couldn't calculate order total",
        );
      } finally {
        setLoadingQuote(false);
      }
    };
    fetchQuote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildOrderItems = () =>
    items.map((item) => ({
      product: item.product._id,
      name: item.product.brandname,
      image: item.product.images?.[0],
      size: item.size,
      qty: item.qty,
      price: item.price,
    }));

  const placeCodOrder = async () => {
    setPlacing(true);
    try {
      const orderPayload = {
        orderItems: buildOrderItems(),
        shippingAddress,
        paymentMethod: "COD",
        cgstPrice: quote.priceBreakdown.cgstAmount,
        sgstPrice: quote.priceBreakdown.sgstAmount,
        taxPrice: quote.priceBreakdown.taxAmount,
        shippingPrice: quote.priceBreakdown.shippingAmount,
        totalPrice: quote.priceBreakdown.total,
        coupon: quote.coupon,
      };
      const createdOrder = await orderService.createOrder(
        orderPayload,
        user.token,
      );
      toast.success("Order placed successfully!");
      navigate(`/order-success/${createdOrder._id}`);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Couldn't place order. Please try again.",
      );
    } finally {
      setPlacing(false);
    }
  };

  const placeOnlineOrder = async () => {
    setPlacing(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway. Check your connection.");
        setPlacing(false);
        return;
      }

      const options = {
        key: quote.keyId,
        amount: quote.amount,
        currency: quote.currency,
        name: "IDENTEE",
        description: "Order Payment",
        order_id: quote.id,
        handler: async (response) => {
          try {
            const verification = await checkoutService.verifyRazorpayPayment(
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              user.token,
            );

            if (!verification.success) {
              toast.error("Payment verification failed");
              setPlacing(false);
              return;
            }

            const orderPayload = {
              orderItems: buildOrderItems(),
              shippingAddress,
              paymentMethod: "RAZORPAY",
              cgstPrice: quote.priceBreakdown.cgstAmount,
              sgstPrice: quote.priceBreakdown.sgstAmount,
              taxPrice: quote.priceBreakdown.taxAmount,
              shippingPrice: quote.priceBreakdown.shippingAmount,
              totalPrice: quote.priceBreakdown.total,
              coupon: quote.coupon,
              razorpayOrderId: quote.id,
              paymentResult: {
                id: verification.paymentId,
                status: "success",
                update_time: new Date().toISOString(),
                email_adress: user.email || "",
              },
            };

            const createdOrder = await orderService.createOrder(
              orderPayload,
              user.token,
            );
            toast.success("Order placed successfully!");
            navigate(`/order-success/${createdOrder._id}`);
          } catch (err) {
            toast.error(
              "Payment verified but order creation failed. Contact support.",
            );
          } finally {
            setPlacing(false);
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: shippingAddress?.phoneNumber,
        },
        theme: { color: "#C9A24B" },
        modal: { ondismiss: () => setPlacing(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error("Couldn't initiate payment. Please try again.");
      setPlacing(false);
    }
  };

  const handlePlaceOrder = () => {
    if (!quote) return;
    if (method === "COD") placeCodOrder();
    else placeOnlineOrder();
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
      <div
        style={{
          background: THEME.surface,
          border: `1px solid ${THEME.border}`,
          borderRadius: 12,
          padding: 24,
          boxShadow: THEME.shadow,
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
          Payment Method
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {PAYMENT_METHODS.map((pm) => (
            <label
              key={pm.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                border: `1.5px solid ${method === pm.key ? THEME.gold : THEME.border}`,
                background: method === pm.key ? THEME.goldBg : THEME.surface2,
                borderRadius: 10,
                padding: "14px 16px",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={method === pm.key}
                onChange={() => setMethod(pm.key)}
                style={{ accentColor: THEME.gold }}
              />
              <span style={{ fontSize: 18 }}>{pm.icon}</span>
              <div>
                <p
                  style={{
                    margin: 0,
                    fontWeight: 600,
                    fontSize: 14,
                    color: THEME.text,
                    fontFamily: THEME.fontBody,
                  }}
                >
                  {pm.label}
                </p>
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: 12,
                    color: THEME.textMuted,
                    fontFamily: THEME.fontBody,
                  }}
                >
                  {pm.desc}
                </p>
              </div>
            </label>
          ))}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              border: `1.5px solid ${THEME.border}`,
              borderRadius: 10,
              padding: "14px 16px",
              opacity: 0.5,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 18 }}>🗓️</span>
              <p
                style={{
                  margin: 0,
                  fontWeight: 600,
                  fontSize: 14,
                  color: THEME.text,
                  fontFamily: THEME.fontBody,
                }}
              >
                EMI
              </p>
            </div>
            <span
              style={{
                fontSize: 12,
                color: THEME.textMuted,
                fontFamily: THEME.fontBody,
              }}
            >
              Unavailable
            </span>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
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
            ← Back to Order Summary
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

        {loadingQuote && (
          <p
            style={{
              color: THEME.textMuted,
              fontFamily: THEME.fontBody,
              fontSize: 13,
            }}
          >
            Calculating total…
          </p>
        )}
        {quoteError && (
          <p
            style={{
              color: THEME.danger,
              fontSize: 13,
              fontFamily: THEME.fontBody,
            }}
          >
            {quoteError}
          </p>
        )}

        {quote && (
          <>
            <PriceRow label="Subtotal" value={quote.priceBreakdown.subtotal} />
            <PriceRow
              label="CGST (2.5%)"
              value={quote.priceBreakdown.cgstAmount}
            />
            <PriceRow
              label="SGST (2.5%)"
              value={quote.priceBreakdown.sgstAmount}
            />
            {quote.priceBreakdown.discountAmount > 0 && (
              <PriceRow
                label={`Discount (${quote.coupon?.code})`}
                value={quote.priceBreakdown.discountAmount}
                negative
              />
            )}
            <PriceRow
              label="Shipping Fee"
              value={quote.priceBreakdown.shippingAmount}
            />
            <div
              style={{
                borderTop: `1px solid ${THEME.border}`,
                margin: "10px 0",
              }}
            />
            <PriceRow
              label="Total Amount"
              value={quote.priceBreakdown.total}
              bold
            />
          </>
        )}

        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={placing || loadingQuote || !quote}
          style={{
            width: "100%",
            marginTop: 18,
            padding: "13px 0",
            borderRadius: 8,
            border: "none",
            background: placing
              ? "#8A6F2E"
              : `linear-gradient(135deg, ${THEME.gold}, ${THEME.goldBright})`,
            color: "#0B0B0C",
            cursor:
              placing || loadingQuote || !quote ? "not-allowed" : "pointer",
            fontSize: 14,
            fontWeight: 700,
            fontFamily: THEME.fontBody,
          }}
        >
          {placing ? "Processing…" : "Place Order"}
        </button>
      </div>
    </div>
  );
}
