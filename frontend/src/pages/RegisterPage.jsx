import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: details, 2: otp + password
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, msg: "" });
  const cooldownRef = useRef(null);

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 3000);
  };

  const startCooldown = () => {
    setResendCooldown(30);
    clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) {
          clearInterval(cooldownRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateStep1 = () => {
    const errs = {};
    if (!name.trim()) errs.name = "Please enter your name.";
    if (!emailRx.test(email)) errs.email = "Please enter a valid email.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!otp.trim() || otp.trim().length < 4)
      errs.otp = "Enter the OTP sent to your email.";
    if (password.length < 6)
      errs.password = "Password must be at least 6 characters.";
    if (password !== confirmPassword)
      errs.confirmPassword = "Passwords do not match.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const sendOtp = async () => {
    if (!validateStep1()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/users/sendOtp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");
      showToast("OTP sent to your email");
      startCooldown();
      setStep(2);
    } catch (err) {
      showToast(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/users/sendOtp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to resend OTP");
      showToast("OTP resent");
      startCooldown();
    } catch (err) {
      showToast(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!validateStep2()) return;
    setLoading(true);
    try {
      // Step 1: verify the OTP first (registerUser requires isEmailVerified = true)
      const verifyRes = await fetch(`${API}/api/users/verifyOtp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok)
        throw new Error(verifyData.message || "OTP verification failed");

      // Step 2: register the user
      const res = await fetch(`${API}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          otp: otp.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      localStorage.removeItem("userInfo");
      localStorage.setItem("userInfo", JSON.stringify(data));
      showToast(`Welcome to IDENTEE, ${data.name}!`);

      setTimeout(() => {
        if (data.isAdmin) navigate("/admin/dashboard");
        else if (data.isSeller) navigate("/seller/dashboard");
        else navigate("/");
      }, 800);
    } catch (err) {
      showToast(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e, action) => {
    if (e.key === "Enter") action();
  };

  // ── IDENTEE gold/black tokens ─────────────────────────────────────────
  const gold = "#C9A24B";
  const goldBright = "#F0D585";

  return (
    <div
      className="min-h-screen flex font-sans"
      style={{ background: "#0B0B0C" }}
    >
      {/* Left Panel */}
      <div
        className="hidden md:flex w-5/12 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "#101012" }}
      >
        <div
          className="absolute -top-16 -right-16 w-56 h-56 rounded-full"
          style={{ border: `40px solid ${gold}0d` }}
        />
        <div
          className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full"
          style={{ border: `30px solid ${gold}0d` }}
        />

        <div className="flex items-center gap-3 z-10">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center font-serif font-bold"
            style={{
              background: `linear-gradient(135deg, ${gold}, ${goldBright})`,
              color: "#0B0B0C",
            }}
          >
            ID
          </div>
          <span
            className="text-xl font-semibold tracking-tight"
            style={{ color: "#F3EFE6" }}
          >
            IDENTEE
          </span>
        </div>

        <div className="z-10">
          <p
            className="text-3xl leading-snug font-light italic opacity-90"
            style={{
              color: "#F3EFE6",
              fontFamily: "'Cormorant Garamond', serif",
            }}
          >
            Your style,
            <br />
            your{" "}
            <span
              className="not-italic font-semibold"
              style={{ color: goldBright }}
            >
              story.
            </span>
          </p>
          <p
            className="text-sm mt-4 leading-relaxed"
            style={{ color: "#8A877F" }}
          >
            Create an account to track orders,
            <br />
            save favourites, and check out faster.
          </p>
        </div>

        <div className="flex gap-10 z-10">
          {[
            ["4-6 → XXL", "Sizes"],
            ["100%", "Cotton"],
            ["Pan India", "Shipping"],
          ].map(([val, label]) => (
            <div key={label}>
              <p className="text-xl font-semibold" style={{ color: "#F3EFE6" }}>
                {val}
              </p>
              <p
                className="text-xs uppercase tracking-wider mt-1"
                style={{ color: "#8A877F" }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 md:hidden">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{
                background: `linear-gradient(135deg, ${gold}, ${goldBright})`,
                color: "#0B0B0C",
              }}
            >
              ID
            </div>
            <span
              className="text-lg font-semibold tracking-tight"
              style={{ color: "#F3EFE6" }}
            >
              IDENTEE
            </span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div
              className="h-1 flex-1 rounded-full"
              style={{ background: step >= 1 ? gold : "#2B2B30" }}
            />
            <div
              className="h-1 flex-1 rounded-full"
              style={{ background: step >= 2 ? gold : "#2B2B30" }}
            />
          </div>

          {step === 1 ? (
            <>
              <h2
                className="text-2xl font-semibold mb-1"
                style={{
                  color: "#F3EFE6",
                  fontFamily: "'Cormorant Garamond', serif",
                }}
              >
                Create your account
              </h2>
              <p className="text-sm mb-8" style={{ color: "#8A877F" }}>
                Step 1 of 2 — tell us who you are
              </p>

              <div className="mb-5">
                <label
                  className="block text-xs font-medium uppercase tracking-wider mb-1.5"
                  style={{ color: "#8A877F" }}
                >
                  Full name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, sendOtp)}
                  placeholder="Your name"
                  className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all"
                  style={{
                    background: "#1F1F24",
                    color: "#F3EFE6",
                    borderColor: errors.name ? "#E2574C" : "#3A3A40",
                  }}
                />
                {errors.name && (
                  <p className="text-xs mt-1" style={{ color: "#E2574C" }}>
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label
                  className="block text-xs font-medium uppercase tracking-wider mb-1.5"
                  style={{ color: "#8A877F" }}
                >
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, sendOtp)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all"
                  style={{
                    background: "#1F1F24",
                    color: "#F3EFE6",
                    borderColor: errors.email ? "#E2574C" : "#3A3A40",
                  }}
                />
                {errors.email && (
                  <p className="text-xs mt-1" style={{ color: "#E2574C" }}>
                    {errors.email}
                  </p>
                )}
              </div>

              <button
                onClick={sendOtp}
                disabled={loading}
                className="w-full py-2.5 text-sm font-medium rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: `linear-gradient(135deg, ${gold}, ${goldBright})`,
                  color: "#0B0B0C",
                }}
              >
                {loading ? "Sending OTP…" : "Send OTP"}
              </button>
            </>
          ) : (
            <>
              <h2
                className="text-2xl font-semibold mb-1"
                style={{
                  color: "#F3EFE6",
                  fontFamily: "'Cormorant Garamond', serif",
                }}
              >
                Verify & set password
              </h2>
              <p className="text-sm mb-8" style={{ color: "#8A877F" }}>
                Step 2 of 2 — code sent to {email}
              </p>

              <div className="mb-5">
                <label
                  className="block text-xs font-medium uppercase tracking-wider mb-1.5"
                  style={{ color: "#8A877F" }}
                >
                  OTP
                </label>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, handleRegister)}
                  placeholder="6-digit code"
                  maxLength={6}
                  className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none tracking-[0.3em] text-center"
                  style={{
                    background: "#1F1F24",
                    color: "#F3EFE6",
                    borderColor: errors.otp ? "#E2574C" : "#3A3A40",
                  }}
                />
                {errors.otp && (
                  <p className="text-xs mt-1" style={{ color: "#E2574C" }}>
                    {errors.otp}
                  </p>
                )}
                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={resendCooldown > 0 || loading}
                  className="text-xs mt-1.5 disabled:opacity-50"
                  style={{ color: goldBright }}
                >
                  {resendCooldown > 0
                    ? `Resend OTP in ${resendCooldown}s`
                    : "Resend OTP"}
                </button>
              </div>

              <div className="mb-5">
                <label
                  className="block text-xs font-medium uppercase tracking-wider mb-1.5"
                  style={{ color: "#8A877F" }}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, handleRegister)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-lg border text-sm outline-none"
                    style={{
                      background: "#1F1F24",
                      color: "#F3EFE6",
                      borderColor: errors.password ? "#E2574C" : "#3A3A40",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "#8A877F" }}
                    aria-label="Toggle password"
                  >
                    {showPass ? "🙈" : "👁"}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs mt-1" style={{ color: "#E2574C" }}>
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label
                  className="block text-xs font-medium uppercase tracking-wider mb-1.5"
                  style={{ color: "#8A877F" }}
                >
                  Confirm password
                </label>
                <input
                  type={showPass ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, handleRegister)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none"
                  style={{
                    background: "#1F1F24",
                    color: "#F3EFE6",
                    borderColor: errors.confirmPassword ? "#E2574C" : "#3A3A40",
                  }}
                />
                {errors.confirmPassword && (
                  <p className="text-xs mt-1" style={{ color: "#E2574C" }}>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full py-2.5 text-sm font-medium rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: `linear-gradient(135deg, ${gold}, ${goldBright})`,
                  color: "#0B0B0C",
                }}
              >
                {loading ? "Creating account…" : "Create Account"}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-xs mt-3"
                style={{ color: "#8A877F" }}
              >
                ← Back to edit details
              </button>
            </>
          )}

          <div className="flex items-center gap-3 my-6">
            <hr style={{ flex: 1, borderColor: "#2B2B30" }} />
            <span className="text-xs" style={{ color: "#5A5852" }}>
              already a member?
            </span>
            <hr style={{ flex: 1, borderColor: "#2B2B30" }} />
          </div>

          <p className="text-center text-sm" style={{ color: "#8A877F" }}>
            Have an account?{" "}
            <Link
              to="/login"
              className="font-medium hover:underline"
              style={{ color: goldBright }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Toast */}
      <div
        className={`fixed top-5 right-5 text-sm px-4 py-3 rounded-xl shadow-lg transition-all duration-300 z-50 max-w-xs
          ${toast.show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}`}
        style={{
          background: "#16161A",
          border: `1px solid ${gold}44`,
          color: "#F3EFE6",
        }}
      >
        {toast.msg}
      </div>
    </div>
  );
}
