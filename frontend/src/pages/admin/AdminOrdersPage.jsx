import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllOrders } from "../../redux/slices/orderSlice";
import { THEME, labelStyle } from "../../theme/theme";

const STATUS_COLORS = {
  CREATED: { bg: "#2B2B3020", text: "#8A877F" },
  CONFIRMED: { bg: "#C9A24B20", text: "#F0D585" },
  PACKED: { bg: "#3B82F620", text: "#93C5FD" },
  OUT_FOR_DELIVERY: { bg: "#8B5CF620", text: "#C4B5FD" },
  DELIVERED: { bg: "#10B98120", text: "#6EE7B7" },
  RETURN_APPROVED: { bg: "#F5970020", text: "#FCD34D" },
  RETURN_COMPLETED: { bg: "#EF444420", text: "#FCA5A5" },
};

function StatusPill({ status }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.CREATED;
  return (
    <span
      style={{
        background: colors.bg,
        color: colors.text,
        fontSize: 11,
        fontWeight: 700,
        padding: "3px 9px",
        borderRadius: 999,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

export default function AdminOrdersPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { allOrders, allOrdersLoading, allOrdersError } = useSelector(
    (s) => s.orders,
  );
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  const sorted = [...(allOrders || [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
  const filtered = statusFilter
    ? sorted.filter((o) => o.orderStatus === statusFilter)
    : sorted;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: THEME.bg,
        color: THEME.text,
        padding: "32px 40px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <p style={{ ...labelStyle, margin: 0, color: THEME.gold }}>
        Admin · Commerce
      </p>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <h1
          style={{
            margin: "4px 0 20px",
            fontSize: 26,
            fontWeight: 600,
            fontFamily: "'Cormorant Garamond', serif",
          }}
        >
          Orders
        </h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: `1px solid ${THEME.border}`,
            background: THEME.surface2,
            color: THEME.text,
            fontSize: 12,
          }}
        >
          <option value="">All statuses</option>
          {Object.keys(STATUS_COLORS).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {allOrdersLoading ? (
        <p style={{ color: THEME.textMuted }}>Loading orders…</p>
      ) : allOrdersError ? (
        <p style={{ color: THEME.danger }}>
          Couldn't load orders: {allOrdersError}
        </p>
      ) : filtered.length === 0 ? (
        <p style={{ color: THEME.textMuted }}>
          No orders {statusFilter ? `with status ${statusFilter}` : "yet"}.
        </p>
      ) : (
        <div
          style={{
            border: `1px solid ${THEME.border}`,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead>
              <tr style={{ background: THEME.surface2, textAlign: "left" }}>
                {[
                  "Order",
                  "Customer",
                  "Items",
                  "Total",
                  "Payment",
                  "Status",
                  "Placed",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 16px",
                      color: THEME.textMuted,
                      fontWeight: 600,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr
                  key={order._id}
                  style={{ borderTop: `1px solid ${THEME.border}` }}
                >
                  <td
                    style={{
                      padding: "12px 16px",
                      fontFamily: "monospace",
                      fontSize: 11,
                      color: THEME.textMuted,
                    }}
                  >
                    {order.invoiceNumber || order._id.slice(-8)}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {order.user?.name || "—"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {(order.orderItems || []).length} item
                    {(order.orderItems || []).length === 1 ? "" : "s"}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontWeight: 700,
                      color: THEME.goldDeep,
                    }}
                  >
                    ₹{order.totalPrice}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {order.paymentMethod}
                    {" · "}
                    {order.isPaid ? "Paid" : "Unpaid"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <StatusPill status={order.orderStatus} />
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 12,
                      color: THEME.textMuted,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <button
                      onClick={() => navigate(`/admin/invoices/${order._id}`)}
                      style={{
                        background: "none",
                        border: `1px solid ${THEME.gold}`,
                        color: THEME.goldDeep,
                        borderRadius: 6,
                        padding: "5px 12px",
                        cursor: "pointer",
                        fontSize: 12,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Generate / View Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
