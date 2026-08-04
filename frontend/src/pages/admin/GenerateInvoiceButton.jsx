import { useNavigate } from "react-router-dom";
import { THEME } from "../../theme/theme";

// Drop this into your existing admin Order Details page as:
//   <GenerateInvoiceButton orderId={order._id} />
// It always hits the same route — the backend returns the existing
// invoice if one exists, or creates a new one. Either way it never
// duplicates an invoice number.
export default function GenerateInvoiceButton({ orderId }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`/admin/invoices/${orderId}`)}
      style={{
        padding: "10px 20px",
        borderRadius: 8,
        border: "none",
        background: `linear-gradient(135deg, ${THEME.gold}, ${THEME.goldBright})`,
        color: "#0B0B0C",
        fontSize: 13,
        fontWeight: 700,
        cursor: "pointer",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      Generate Invoice
    </button>
  );
}
