import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const C = {
  panel: "#151516",
  ink: "#F3EFE6",
  muted: "#8A877F",
  border: "#2B2B30",
  gold: "#C9A24B",
};

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function SubscribersPage() {
  const { user } = useSelector((state) => state.auth);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/subscriptions/subscribers`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      })
      .then(({ data }) => setSubscribers(data))
      .catch((err) => console.error("Failed to load subscribers:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      style={{ fontFamily: "'Inter', sans-serif", color: C.ink, padding: 24 }}
    >
      <h2 style={{ marginBottom: 20 }}>Subscribers</h2>

      {loading ? (
        <p style={{ color: C.muted }}>Loading...</p>
      ) : subscribers.length === 0 ? (
        <p style={{ color: C.muted }}>No subscribers yet.</p>
      ) : (
        <div
          style={{
            background: C.panel,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: `1px solid ${C.border}`,
                  textAlign: "left",
                }}
              >
                <th style={thStyle(C)}>Name</th>
                <th style={thStyle(C)}>Email</th>
                <th style={thStyle(C)}>Plan</th>
                <th style={thStyle(C)}>Discount</th>
                <th style={thStyle(C)}>Start</th>
                <th style={thStyle(C)}>End</th>
                <th style={thStyle(C)}>Status</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr
                  key={s._id}
                  style={{ borderBottom: `1px solid ${C.border}` }}
                >
                  <td style={tdStyle}>{s.name}</td>
                  <td style={tdStyle}>{s.email}</td>
                  <td style={tdStyle}>{s.planTitle}</td>
                  <td style={{ ...tdStyle, color: C.gold }}>
                    {s.discountPercent}%
                  </td>
                  <td style={tdStyle}>{fmtDate(s.startDate)}</td>
                  <td style={tdStyle}>{fmtDate(s.endDate)}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        color: s.isActive ? "#4B9E6E" : C.muted,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {s.isActive ? "● Active" : "○ Expired"}
                    </span>
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

function thStyle(C) {
  return {
    padding: "12px 16px",
    fontSize: 11,
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };
}
const tdStyle = { padding: "12px 16px" };
