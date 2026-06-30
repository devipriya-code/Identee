import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const gold = "#C9A24B";
const goldBright = "#F0D585";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/users/forgotPassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");
      // Redirect to reset page with email param
      navigate(`/reset-password?email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0B0B0C", color: "#F3EFE6", padding: "20px" }}>
      <div style={{ maxWidth: 400, width: "100%", background: "#16161A", padding: "32px 28px", borderRadius: 12, border: "1px solid #2B2B30" }}>
        <h2 className="text-2xl font-serif" style={{ fontFamily: "'Cormorant Garamond', serif", marginBottom: 4 }}>Forgot Password</h2>
        <p style={{ color: "#8A877F", fontSize: 14, marginBottom: 24 }}>Enter your email to receive an OTP.</p>

        {error && <div style={{ background: "#2A1515", padding: 10, borderRadius: 6, marginBottom: 16, color: "#E2574C", fontSize: 14 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "#8A877F", marginBottom: 6 }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #3A3A40", background: "#1F1F24", color: "#F3EFE6", outline: "none" }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "10px", borderRadius: 8, fontWeight: 600, background: `linear-gradient(135deg, ${gold}, ${goldBright})`, color: "#0B0B0C", border: "none", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: 14, color: "#8A877F", textAlign: "center" }}>
          Remember your password? <Link to="/login" style={{ color: goldBright }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}