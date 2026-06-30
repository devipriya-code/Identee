import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const gold = "#C9A24B";
const goldBright = "#F0D585";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, msg: "" });

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 3000);
  };

  const validate = () => {
    const errs = {};
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(email)) errs.email = "Please enter a valid email.";
    if (password.length < 6)
      errs.password = "Password must be at least 6 characters.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("userInfo", JSON.stringify(data));
      showToast(`Welcome back, ${data.name}!`);

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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

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
            Your style, your story,
            <br />
            your{" "}
            <span
              className="not-italic font-semibold"
              style={{ color: goldBright }}
            >
              identity.
            </span>
          </p>
          <p
            className="text-sm mt-4 leading-relaxed"
            style={{ color: "#8A877F" }}
          >
            Sign in to manage orders, designs,
            <br />
            and your custom collection.
          </p>
        </div>

        <div className="flex gap-10 z-10">
          {[
            ["24k+", "Orders"],
            ["1.2k", "Sellers"],
            ["98%", "Uptime"],
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

          <h2
            className="text-2xl font-semibold mb-1"
            style={{
              color: "#F3EFE6",
              fontFamily: "'Cormorant Garamond', serif",
            }}
          >
            Welcome back
          </h2>
          <p className="text-sm mb-8" style={{ color: "#8A877F" }}>
            Sign in to your account to continue
          </p>

          {/* Email */}
          <div className="mb-5">
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
              onKeyDown={handleKeyDown}
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

          {/* Password */}
          <div className="mb-6">
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
                onKeyDown={handleKeyDown}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full px-3.5 py-2.5 pr-10 rounded-lg border text-sm outline-none transition-all"
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
            <div className="flex justify-end mt-1.5">
              <Link
                to="/forgot-password"
                className="text-xs hover:underline"
                style={{ color: goldBright }}
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-2.5 text-sm font-medium rounded-lg transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(135deg, ${gold}, ${goldBright})`,
              color: "#0B0B0C",
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Signing in…
              </span>
            ) : (
              "Sign in"
            )}
          </button>

          <div className="flex items-center gap-3 my-6">
            <hr style={{ flex: 1, borderColor: "#2B2B30" }} />
            <span className="text-xs" style={{ color: "#5A5852" }}>
              new here?
            </span>
            <hr style={{ flex: 1, borderColor: "#2B2B30" }} />
          </div>

          <p className="text-center text-sm" style={{ color: "#8A877F" }}>
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium hover:underline"
              style={{ color: goldBright }}
            >
              Create one
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
