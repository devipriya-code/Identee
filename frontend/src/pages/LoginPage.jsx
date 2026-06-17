import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
    <div className="min-h-screen flex font-sans bg-gray-50">
      {/* ── Left Panel ── */}
      <div
        className="hidden md:flex w-5/12 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0F172A 0%, #EADBC8 100%)" }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full border-[40px] border-white/5" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full border-[30px] border-white/5" />

        {/* Logo */}
        <div className="flex items-center z-10">
          <img
            src="/assets/logo.png"
            alt="Ecom"
            style={{ height: 36, width: "auto", objectFit: "contain" }}
          />
        </div>

        {/* Tagline */}
        <div className="z-10">
          <p
            className="text-3xl leading-snug font-light italic"
            style={{ color: "#FFFFFF" }}
          >
            Your marketplace,
            <br />
            your{" "}
            <span
              className="not-italic font-semibold"
              style={{ color: "#7ED957" }}
            >
              rules.
            </span>
          </p>
          <p
            className="text-sm mt-4 leading-relaxed"
            style={{ color: "#F8FAFC", opacity: 0.65 }}
          >
            Manage products, orders, and customers
            <br />
            all in one place.
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-10 z-10">
          {[
            ["24k+", "Orders"],
            ["1.2k", "Sellers"],
            ["98%", "Uptime"],
          ].map(([val, label]) => (
            <div key={label}>
              <p className="text-white text-xl font-semibold">{val}</p>
              <p
                className="text-xs uppercase tracking-wider mt-1"
                style={{ color: "#F8FAFC", opacity: 0.45 }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 md:hidden">
            <img
              src="/assets/logo.png"
              alt="Ecom"
              style={{ height: 30, width: "auto", objectFit: "contain" }}
            />
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-1">
            Welcome back
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            Sign in to your account to continue
          </p>

          {/* Email */}
          <div className="mb-5">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="you@example.com"
              autoComplete="email"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white text-gray-900 outline-none transition-all
                ${errors.email ? "border-red-400" : "border-gray-200"}`}
              style={{ "--tw-ring-color": "#7ED957" }}
              onFocus={(e) => (e.target.style.borderColor = "#7ED957")}
              onBlur={(e) =>
                (e.target.style.borderColor = errors.email ? "#f87171" : "#e5e7eb")
              }
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
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
                className={`w-full px-3.5 py-2.5 pr-10 rounded-lg border text-sm bg-white text-gray-900 outline-none transition-all
                  ${errors.password ? "border-red-400" : "border-gray-200"}`}
                onFocus={(e) => (e.target.style.borderColor = "#7ED957")}
                onBlur={(e) =>
                  (e.target.style.borderColor = errors.password
                    ? "#f87171"
                    : "#e5e7eb")
                }
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Toggle password"
              >
                {showPass ? (
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password}</p>
            )}
            <div className="flex justify-end mt-1.5">
              <Link
                to="/forgot-password"
                className="text-xs hover:underline"
                style={{ color: "#7ED957" }}
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-2.5 active:scale-[0.98] text-sm font-semibold rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: "#7ED957", color: "#0F172A" }}
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
            <hr className="flex-1 border-gray-200" />
            <span className="text-xs text-gray-400">new here?</span>
            <hr className="flex-1 border-gray-200" />
          </div>

          <p className="text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium hover:underline"
              style={{ color: "#7ED957" }}
            >
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Toast */}
      <div
        className={`fixed top-5 right-5 text-white text-sm px-4 py-3 rounded-xl shadow-lg transition-all duration-300 z-50 max-w-xs
          ${toast.show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}`}
        style={{ background: "#0F172A" }}
      >
        {toast.msg}
      </div>
    </div>
  );
}