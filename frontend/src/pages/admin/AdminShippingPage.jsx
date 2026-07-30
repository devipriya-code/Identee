import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  getShippingCost,
  addState,
  updateState,
  deleteState,
  updateFreeShipping,
  resetShippingError,
} from "../../redux/slices/shippingSlice";
import { fetchAllOrders } from "../../redux/slices/orderSlice";
import { THEME, labelStyle, inputStyle } from "../../theme/theme";

const STATE_SUGGESTIONS = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const STATUS_COLORS = {
  CREATED: { bg: "#2B2B3020", text: "#8A877F" },
  CONFIRMED: { bg: "#C9A24B20", text: "#F0D585" },
  PACKED: { bg: "#3B82F620", text: "#93C5FD" },
  OUT_FOR_DELIVERY: { bg: "#8B5CF620", text: "#C4B5FD" },
  DELIVERED: { bg: "#10B98120", text: "#6EE7B7" },
  RETURN_APPROVED: { bg: "#F5970020", text: "#FCD34D" },
  RETURN_COMPLETED: { bg: "#EF444420", text: "#FCA5A5" },
};

function EditableCostCell({ rule, onSave, disabled }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(rule.cost);

  useEffect(() => {
    setValue(rule.cost);
  }, [rule.cost]);

  if (!editing) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontWeight: 700,
            color: THEME.goldDeep,
            fontFamily: THEME.fontBody,
          }}
        >
          ₹{rule.cost}
        </span>
        <button
          type="button"
          onClick={() => setEditing(true)}
          style={{
            background: "none",
            border: "none",
            color: THEME.gold,
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
            textDecoration: "underline",
            padding: 0,
          }}
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
      }}
    >
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ ...inputStyle, width: 90, padding: "6px 10px" }}
        autoFocus
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (value === "" || Number(value) < 0) {
            toast.error("Enter a valid cost");
            return;
          }
          onSave(rule._id, Number(value));
          setEditing(false);
        }}
        style={{
          background: THEME.gold,
          border: "none",
          borderRadius: 6,
          padding: "6px 10px",
          fontSize: 12,
          fontWeight: 700,
          color: "#0B0B0C",
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        Save
      </button>
      <button
        type="button"
        onClick={() => {
          setValue(rule.cost);
          setEditing(false);
        }}
        style={{
          background: "none",
          border: `1px solid ${THEME.border}`,
          borderRadius: 6,
          padding: "6px 10px",
          fontSize: 12,
          color: THEME.textMuted,
          cursor: "pointer",
        }}
      >
        Cancel
      </button>
    </div>
  );
}

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
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

export default function AdminShippingPage() {
  const dispatch = useDispatch();
  const { freeShippingAbove, shippingRules, isLoading, isError, message } =
    useSelector((state) => state.shipping);
  const { allOrders, allOrdersLoading } = useSelector((state) => state.orders);

  const [newState, setNewState] = useState("");
  const [newCost, setNewCost] = useState("");
  const [adding, setAdding] = useState(false);

  const [freeShipInput, setFreeShipInput] = useState("");
  const [savingFreeShip, setSavingFreeShip] = useState(false);

  const [stateFilter, setStateFilter] = useState("");

  useEffect(() => {
    dispatch(getShippingCost());
    dispatch(fetchAllOrders());
    return () => dispatch(resetShippingError());
  }, [dispatch]);

  useEffect(() => {
    setFreeShipInput(freeShippingAbove ?? 0);
  }, [freeShippingAbove]);

  const handleAddState = async (e) => {
    e.preventDefault();
    const stateName = newState.trim();
    if (!stateName) {
      toast.error("Enter a state name");
      return;
    }
    if (newCost === "" || Number(newCost) < 0) {
      toast.error("Enter a valid shipping cost");
      return;
    }
    const alreadyExists = shippingRules.some(
      (r) => r.state.trim().toLowerCase() === stateName.toLowerCase(),
    );
    if (alreadyExists) {
      toast.error(`${stateName} already has a shipping rule`);
      return;
    }

    setAdding(true);
    try {
      await dispatch(
        addState({ state: stateName, cost: Number(newCost) }),
      ).unwrap();
      toast.success(`Added shipping rule for ${stateName}`);
      setNewState("");
      setNewCost("");
    } catch (err) {
      toast.error(err || "Failed to add state");
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateCost = async (id, cost) => {
    try {
      await dispatch(updateState({ id, cost })).unwrap();
      toast.success("Shipping cost updated");
    } catch (err) {
      toast.error(err || "Failed to update cost");
    }
  };

  const handleDelete = async (id, stateName) => {
    if (!window.confirm(`Remove shipping rule for ${stateName}?`)) return;
    try {
      await dispatch(deleteState(id)).unwrap();
      toast.success(`Removed ${stateName}`);
    } catch (err) {
      toast.error(err || "Failed to delete state");
    }
  };

  const handleSaveFreeShip = async () => {
    if (freeShipInput === "" || Number(freeShipInput) < 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setSavingFreeShip(true);
    try {
      await dispatch(updateFreeShipping(Number(freeShipInput))).unwrap();
      toast.success("Free shipping threshold updated");
    } catch (err) {
      toast.error(err || "Failed to update threshold");
    } finally {
      setSavingFreeShip(false);
    }
  };

  const sortedOrders = [...(allOrders || [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
  const filteredOrders = stateFilter
    ? sortedOrders.filter(
        (o) =>
          (o.shippingAddress?.state || "").trim().toLowerCase() ===
          stateFilter.trim().toLowerCase(),
      )
    : sortedOrders;

  const shippingTotalsByState = sortedOrders.reduce((acc, o) => {
    const state = o.shippingAddress?.state || "Unknown";
    acc[state] = (acc[state] || 0) + (o.shippingPrice || 0);
    return acc;
  }, {});

  return (
    <div
      style={{
        minHeight: "100vh",
        background: THEME.bg,
        color: THEME.text,
        padding: "32px 40px",
        fontFamily: "'Inter', sans-serif",
      }}
      className="shipping-page"
    >
      <p style={{ ...labelStyle, margin: 0, color: THEME.gold }}>
        Admin · Logistics
      </p>
      <h1
        style={{
          margin: "4px 0 4px",
          fontSize: 26,
          fontWeight: 600,
          fontFamily: "'Cormorant Garamond', serif",
        }}
      >
        Shipping
      </h1>
      <p
        style={{
          margin: "0 0 28px",
          fontSize: 14,
          color: THEME.textMuted,
          maxWidth: 720,
        }}
      >
        Set a delivery cost per state. Checkout automatically charges whatever
        rate matches the customer's shipping address — orders above the free
        shipping threshold ship for free regardless of state.
      </p>

      {isError && (
        <div
          style={{
            background: THEME.dangerBg,
            border: `1px solid ${THEME.dangerBorder}`,
            borderRadius: 8,
            padding: "10px 14px",
            marginBottom: 20,
            fontSize: 13,
            color: THEME.danger,
          }}
        >
          {message}
        </div>
      )}

      {/* ── Top row: Free shipping threshold + Add state, side by side on
           wide screens, stacked on narrow ones. Uses a responsive grid
           instead of a fixed maxWidth so it fills the available space
           without leaving a huge blank gutter on wide monitors. ── */}
      <div className="shipping-top-grid">
        <div
          style={{
            border: `1px solid ${THEME.border}`,
            borderRadius: 12,
            padding: 20,
            background: THEME.surface,
            boxShadow: THEME.shadow,
          }}
        >
          <p
            style={{
              margin: "0 0 4px",
              fontSize: 14,
              fontWeight: 700,
              color: THEME.text,
            }}
          >
            Free Shipping Threshold
          </p>
          <p
            style={{ margin: "0 0 14px", fontSize: 12, color: THEME.textMuted }}
          >
            Orders with a subtotal at or above this amount ship free, regardless
            of state. Set to 0 to disable.
          </p>
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 600, color: THEME.text }}>
              ₹
            </span>
            <input
              type="number"
              min={0}
              value={freeShipInput}
              onChange={(e) => setFreeShipInput(e.target.value)}
              style={{ ...inputStyle, width: 140, flex: "0 1 140px" }}
            />
            <button
              type="button"
              onClick={handleSaveFreeShip}
              disabled={savingFreeShip}
              style={{
                background: savingFreeShip
                  ? "#8A6F2E"
                  : `linear-gradient(135deg, ${THEME.gold}, ${THEME.goldBright})`,
                border: "none",
                borderRadius: 8,
                padding: "9px 18px",
                fontSize: 13,
                fontWeight: 700,
                color: "#0B0B0C",
                cursor: savingFreeShip ? "not-allowed" : "pointer",
              }}
            >
              {savingFreeShip ? "Saving…" : "Save"}
            </button>
          </div>
        </div>

        <div
          style={{
            border: `1px solid ${THEME.border}`,
            borderRadius: 12,
            padding: 20,
            background: THEME.surface,
            boxShadow: THEME.shadow,
          }}
        >
          <p
            style={{
              margin: "0 0 4px",
              fontSize: 14,
              fontWeight: 700,
              color: THEME.text,
            }}
          >
            Add a State
          </p>
          <p
            style={{ margin: "0 0 14px", fontSize: 12, color: THEME.textMuted }}
          >
            Only states listed below are deliverable — checkout rejects any
            other state.
          </p>
          <form onSubmit={handleAddState} className="add-state-form">
            <div style={{ flex: "1 1 160px", minWidth: 140 }}>
              <label style={labelStyle}>State</label>
              <input
                list="state-suggestions"
                value={newState}
                onChange={(e) => setNewState(e.target.value)}
                placeholder="e.g. Tamil Nadu"
                style={{ ...inputStyle, marginTop: 5, width: "100%" }}
              />
              <datalist id="state-suggestions">
                {STATE_SUGGESTIONS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
            <div style={{ flex: "0 1 110px", minWidth: 90 }}>
              <label style={labelStyle}>Cost (₹)</label>
              <input
                type="number"
                min={0}
                value={newCost}
                onChange={(e) => setNewCost(e.target.value)}
                placeholder="49"
                style={{ ...inputStyle, marginTop: 5, width: "100%" }}
              />
            </div>
            <button
              type="submit"
              disabled={adding}
              style={{
                padding: "0 18px",
                height: 38,
                marginTop: 21,
                borderRadius: 8,
                border: `1px dashed ${THEME.gold}`,
                background: "transparent",
                color: THEME.goldBright,
                fontWeight: 600,
                cursor: adding ? "not-allowed" : "pointer",
                fontSize: 13,
                whiteSpace: "nowrap",
              }}
            >
              {adding ? "Adding…" : "+ Add"}
            </button>
          </form>
        </div>
      </div>

      {/* ── States table + revenue side panel, side by side on wide screens ── */}
      <div className="shipping-mid-grid">
        <div
          style={{
            border: `1px solid ${THEME.border}`,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {isLoading ? (
            <p style={{ color: THEME.textMuted, padding: 20 }}>
              Loading shipping rules…
            </p>
          ) : shippingRules.length === 0 ? (
            <p style={{ color: THEME.textMuted, padding: 20 }}>
              No states configured yet — add one above. Checkout will reject
              orders for any state without a rule here.
            </p>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr style={{ background: THEME.surface2, textAlign: "left" }}>
                  <th style={thStyle}>State</th>
                  <th style={thStyle}>Shipping Cost</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {shippingRules.map((rule) => (
                  <tr
                    key={rule._id}
                    style={{ borderTop: `1px solid ${THEME.border}` }}
                  >
                    <td style={tdStyle}>{rule.state}</td>
                    <td style={tdStyle}>
                      <EditableCostCell
                        rule={rule}
                        onSave={handleUpdateCost}
                        disabled={isLoading}
                      />
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <button
                        onClick={() => handleDelete(rule._id, rule.state)}
                        style={{
                          background: THEME.dangerBg,
                          border: `1px solid ${THEME.dangerBorder}`,
                          color: THEME.danger,
                          borderRadius: 6,
                          padding: "5px 12px",
                          cursor: "pointer",
                          fontSize: 12,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {Object.keys(shippingTotalsByState).length > 0 && (
          <div>
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: THEME.goldDeep,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                margin: "0 0 12px",
              }}
            >
              Shipping Revenue by State
            </p>
            <div className="revenue-grid">
              {Object.entries(shippingTotalsByState)
                .sort((a, b) => b[1] - a[1])
                .map(([state, total]) => (
                  <div
                    key={state}
                    style={{
                      border: `1px solid ${THEME.border}`,
                      borderRadius: 10,
                      padding: "10px 16px",
                      background: THEME.surface,
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: 12,
                        color: THEME.textMuted,
                      }}
                    >
                      {state}
                    </p>
                    <p
                      style={{
                        margin: "2px 0 0",
                        fontSize: 16,
                        fontWeight: 700,
                        color: THEME.goldDeep,
                      }}
                    >
                      ₹{total}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Orders & shipping details ── */}
      <div style={{ marginTop: 40 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: THEME.goldDeep,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              margin: 0,
            }}
          >
            Order Shipping Details
          </p>
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            style={{
              ...inputStyle,
              width: 220,
              padding: "7px 10px",
              fontSize: 12,
            }}
          >
            <option value="">All states</option>
            {shippingRules.map((rule) => (
              <option key={rule._id} value={rule.state}>
                {rule.state}
              </option>
            ))}
          </select>
        </div>

        {allOrdersLoading ? (
          <p style={{ color: THEME.textMuted }}>Loading orders…</p>
        ) : filteredOrders.length === 0 ? (
          <p style={{ color: THEME.textMuted }}>
            {stateFilter
              ? `No orders yet for ${stateFilter}.`
              : "No orders yet."}
          </p>
        ) : (
          <div
            style={{
              border: `1px solid ${THEME.border}`,
              borderRadius: 12,
              overflow: "auto",
              maxHeight: 480,
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr style={{ background: THEME.surface2, textAlign: "left" }}>
                  <th style={thStyle}>Order</th>
                  <th style={thStyle}>Customer</th>
                  <th style={thStyle}>Ship To (State)</th>
                  <th style={thStyle}>City / Pin</th>
                  <th style={thStyle}>Shipping Fee</th>
                  <th style={thStyle}>Order Total</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Placed</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    style={{ borderTop: `1px solid ${THEME.border}` }}
                  >
                    <td
                      style={{
                        ...tdStyle,
                        fontFamily: "monospace",
                        fontSize: 11,
                        color: THEME.textMuted,
                      }}
                    >
                      {order.invoiceNumber || order._id.slice(-8)}
                    </td>
                    <td style={tdStyle}>{order.user?.name || "—"}</td>
                    <td style={tdStyle}>
                      {order.shippingAddress?.state || "—"}
                    </td>
                    <td style={tdStyle}>
                      {[order.shippingAddress?.city, order.shippingAddress?.pin]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </td>
                    <td
                      style={{
                        ...tdStyle,
                        fontWeight: 700,
                        color: THEME.goldDeep,
                      }}
                    >
                      {order.shippingPrice === 0
                        ? "Free"
                        : `₹${order.shippingPrice}`}
                    </td>
                    <td style={tdStyle}>₹{order.totalPrice}</td>
                    <td style={tdStyle}>
                      <StatusPill status={order.orderStatus} />
                    </td>
                    <td
                      style={{
                        ...tdStyle,
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .shipping-top-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 20px;
          margin-bottom: 28px;
        }
        .shipping-mid-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
          gap: 24px;
          align-items: start;
        }
        .add-state-form {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .revenue-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 10px;
        }
        @media (max-width: 1000px) {
          .shipping-mid-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 720px) {
          .shipping-top-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

const thStyle = {
  padding: "10px 16px",
  color: THEME.textMuted,
  fontWeight: 600,
  fontSize: 12,
};

const tdStyle = {
  padding: "12px 16px",
  color: THEME.text,
};
