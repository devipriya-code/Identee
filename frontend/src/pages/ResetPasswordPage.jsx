import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const gold = "#C9A24B";
const goldBright = "#F0D585";

export default function ResetPasswordPage() {
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const email = params.get("email") || "";

  useEffect(() => {
    if (!email) setError("Email is missing. Please restart the process.");
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email) return setError("Email missing.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/users/resetPassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed");
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0B0B0C", color: "#F3EFE6", padding: "20px" }}>
      <div style={{ maxWidth: 400, width: "100%", background: "#16161A", padding: "32px 28px", borderRadius: 12, border: "1px solid #2B2B30" }}>
        <h2 className="text-2xl font-serif" style={{ fontFamily: "'Cormorant Garamond', serif", marginBottom: 4 }}>Reset Password</h2>
        <p style={{ color: "#8A877F", fontSize: 14, marginBottom: 24 }}>Enter the OTP and set a new password.</p>

        {error && <div style={{ background: "#2A1515", padding: 10, borderRadius: 6, marginBottom: 16, color: "#E2574C", fontSize: 14 }}>{error}</div>}
        {success && <div style={{ background: "#152A15", padding: 10, borderRadius: 6, marginBottom: 16, color: "#7BC47B", fontSize: 14 }}>Password reset! Redirecting to login...</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "#8A877F", marginBottom: 6 }}>OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              placeholder="6-digit code"
              maxLength={6}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #3A3A40", background: "#1F1F24", color: "#F3EFE6", outline: "none", textAlign: "center", letterSpacing: "0.3em" }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "#8A877F", marginBottom: 6 }}>New Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                style={{ width: "100%", padding: "10px 14px", paddingRight: 40, borderRadius: 8, border: "1px solid #3A3A40", background: "#1F1F24", color: "#F3EFE6", outline: "none" }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#8A877F" }}>
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "#8A877F", marginBottom: 6 }}>Confirm Password</label>
            <input
              type={showPass ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #3A3A40", background: "#1F1F24", color: "#F3EFE6", outline: "none" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            style={{ width: "100%", padding: "10px", borderRadius: 8, fontWeight: 600, background: `linear-gradient(135deg, ${gold}, ${goldBright})`, color: "#0B0B0C", border: "none", opacity: (loading || !email) ? 0.6 : 1 }}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: 14, color: "#8A877F", textAlign: "center" }}>
          <Link to="/login" style={{ color: goldBright }}>Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}