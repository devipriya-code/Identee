import { forwardRef } from "react";
import logo from "../../assets/identee-logo.png";
import { THEME } from "../../theme/theme";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAddress(addr) {
  if (!addr) return "—";
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

function getImageUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${BACKEND_URL}/${path.replace(/^\/+/, "")}`;
}

// Wrapped in forwardRef so InvoicePreviewPage can hand this DOM node
// straight to html2pdf() / window.print() without any extra plumbing.
const InvoiceDocument = forwardRef(({ invoice }, ref) => {
  if (!invoice) return null;

  const { pricing = {} } = invoice;

  return (
    <div
      ref={ref}
      id="invoice-document"
      style={{
        width: "210mm",
        minHeight: "297mm",
        margin: "0 auto",
        background: "#FFFFFF",
        color: "#15130F",
        fontFamily: "'Inter', sans-serif",
        boxSizing: "border-box",
        padding: "0",
      }}
    >
      {/* ── Header band ── */}
      <div
        style={{
          background: "#2A2620",
          padding: "36px 48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: `3px solid ${THEME.gold}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img
            src={logo}
            alt="IDENTEE"
            style={{ height: 56, objectFit: "contain" }}
          />
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 10,
                letterSpacing: "0.14em",
                color: THEME.gold,
                fontWeight: 700,
              }}
            >
              YOUR STYLE. YOUR STORY. YOUR IDENTITY.
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 10.5, color: "#D8D2C4" }}>
              12/48, Lakshmi Nagar, 1st Street, Near Post Office, Tirupur -
              641602
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 10.5, color: "#D8D2C4" }}>
              identee.co.in &nbsp;·&nbsp; info@identee.co.in &nbsp;·&nbsp; +91
              88700 08311 &nbsp;·&nbsp; @identee.co.in
            </p>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <p
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: "#FFFFFF",
            }}
          >
            INVOICE
          </p>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 12,
              color: THEME.gold,
              fontWeight: 700,
            }}
          >
            {invoice.invoiceNumber}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 11, color: "#D8D2C4" }}>
            {formatDate(invoice.invoiceDate)}
          </p>
        </div>
      </div>

      <div style={{ padding: "32px 48px" }}>
        {/* ── Customer / Order meta ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 24,
            marginBottom: 32,
          }}
        >
          <div>
            <p style={labelStyle}>Billed To</p>
            <p style={{ margin: "6px 0 0", fontWeight: 700, fontSize: 13 }}>
              {invoice.customer?.name}
            </p>
            <p style={valueStyle}>{invoice.customer?.email}</p>
            <p style={valueStyle}>{invoice.customer?.phone}</p>
          </div>
          <div>
            <p style={labelStyle}>Ship To</p>
            <p style={{ ...valueStyle, marginTop: 6, maxWidth: 200 }}>
              {formatAddress(invoice.shippingAddress)}
            </p>
          </div>
          <div>
            <p style={labelStyle}>Order Reference</p>
            <p style={{ ...valueStyle, marginTop: 6 }}>{invoice.orderNumber}</p>
            <p style={labelStyle}>Payment Method</p>
            <p style={valueStyle}>{invoice.paymentMethod}</p>
            <span
              style={{
                display: "inline-block",
                marginTop: 4,
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 999,
                background:
                  invoice.paymentStatus === "Paid" ? "#10B98120" : "#EF444420",
                color: invoice.paymentStatus === "Paid" ? "#0E9F6E" : "#DC2626",
              }}
            >
              {invoice.paymentStatus?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* ── Product table ── */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: 24,
          }}
        >
          <thead>
            <tr style={{ background: "#0B0B0C", color: "#FFFFFF" }}>
              <th style={thStyle}>Item</th>
              <th style={thStyle}>Variant / Colour</th>
              <th style={thStyle}>Size</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Qty</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Unit Price</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Discount</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {(invoice.orderItems || []).map((item, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #ECE4D2" }}>
                <td style={tdStyle}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    {item.image && (
                      <img
                        src={getImageUrl(item.image)}
                        alt=""
                        style={{
                          width: 34,
                          height: 34,
                          objectFit: "cover",
                          borderRadius: 4,
                        }}
                      />
                    )}
                    <span>{item.name}</span>
                  </div>
                </td>
                <td style={tdStyle}>
                  {[item.variant, item.color].filter(Boolean).join(" · ") ||
                    "—"}
                </td>
                <td style={tdStyle}>{item.size}</td>
                <td style={{ ...tdStyle, textAlign: "center" }}>{item.qty}</td>
                <td style={{ ...tdStyle, textAlign: "right" }}>
                  ₹{item.unitPrice}
                </td>
                <td
                  style={{
                    ...tdStyle,
                    textAlign: "right",
                    color: THEME.goldDeep,
                  }}
                >
                  {item.discountAmount > 0 ? `− ₹${item.discountAmount}` : "—"}
                </td>
                <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700 }}>
                  ₹{item.lineTotal}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── Summary ── */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: 280 }}>
            <SummaryRow label="Subtotal" value={pricing.subtotal} />
            <SummaryRow label="CGST (2.5%)" value={pricing.cgstPrice} />
            <SummaryRow label="SGST (2.5%)" value={pricing.sgstPrice} />
            {pricing.discountAmount > 0 && (
              <SummaryRow
                label={`Coupon (${invoice.coupon?.code || ""})`}
                value={pricing.discountAmount}
                negative
              />
            )}
            <SummaryRow
              label="Shipping"
              value={
                pricing.shippingPrice === 0 ? "Free" : pricing.shippingPrice
              }
            />
            <div style={{ borderTop: `2px solid #0B0B0C`, margin: "8px 0" }} />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              <span>Grand Total</span>
              <span style={{ color: THEME.goldDeep }}>
                ₹{pricing.totalPrice}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          marginTop: 40,
          padding: "24px 48px",
          borderTop: `1px solid #ECE4D2`,
          textAlign: "center",
        }}
      >
        <p
          style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0B0B0C" }}
        >
          Thank you for shopping with IDENTEE.
        </p>
        <p
          style={{
            margin: "4px 0 0",
            fontSize: 11,
            color: THEME.gold,
            letterSpacing: "0.06em",
          }}
        >
          YOUR STYLE. YOUR STORY. YOUR IDENTITY.
        </p>
      </div>
    </div>
  );
});

function SummaryRow({ label, value, negative }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "4px 0",
        fontSize: 13,
      }}
    >
      <span style={{ color: "#71695B" }}>{label}</span>
      <span style={{ color: negative ? THEME.gold : "#15130F" }}>
        {negative ? "− " : ""}
        {typeof value === "number" ? `₹${value}` : value}
      </span>
    </div>
  );
}

const labelStyle = {
  margin: 0,
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#9C9890",
};
const valueStyle = { margin: "2px 0 0", fontSize: 12, color: "#15130F" };
const thStyle = {
  padding: "10px 12px",
  textAlign: "left",
  fontSize: 11,
  fontWeight: 700,
};
const tdStyle = { padding: "10px 12px", fontSize: 12, color: "#15130F" };

export default InvoiceDocument;
