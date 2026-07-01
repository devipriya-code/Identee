import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/identee-logo.png"; // adjust path
import { THEME } from "../theme/theme";

const NAV_LINKS = [
  { to: "/men", label: "Men" },
  { to: "/women", label: "Women" },
  { to: "/kids", label: "Kids" },
  { to: "/patch-tees", label: "Patch Tees" },
  { to: "/customise", label: "Customise Your Tee" },
];

// ── helpers ──────────────────────────────────────────────────────
const getUserInfo = () => {
  try {
    const raw = localStorage.getItem("userInfo");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed._id && parsed.email) return parsed;
    return null;
  } catch {
    return null;
  }
};

const getInitial = (user) => {
  if (!user) return "?";
  if (user.name) return user.name.charAt(0).toUpperCase();
  if (user.email) return user.email.charAt(0).toUpperCase();
  return "?";
};

// ── Icon button helper ────────────────────────────────────────────
const IconBtn = ({ children, label, badge }) => (
  <button
    aria-label={label}
    style={{
      position: "relative",
      background: "none",
      border: "none",
      cursor: "pointer",
      color: THEME.ink,
      padding: 6,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {children}
    {badge > 0 && (
      <span
        style={{
          position: "absolute",
          top: -2,
          right: -2,
          background: THEME.goldBright,
          color: THEME.ink,
          fontSize: 9,
          fontWeight: 700,
          width: 15,
          height: 15,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {badge}
      </span>
    )}
  </button>
);

// ── Main Navbar ──────────────────────────────────────────────────
export default function Navbar({ cartCount = 0, wishlistCount = 0 }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(getUserInfo());
  const navigate = useNavigate();

  // Update user when localStorage changes (login/logout in other tabs)
  useEffect(() => {
    const handleStorage = () => setUser(getUserInfo());
    window.addEventListener("storage", handleStorage);
    setUser(getUserInfo());
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
    navigate("/");
    window.dispatchEvent(new Event("storage"));
  };

  const initial = getInitial(user);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: scrolled ? "#FFFFFFF2" : THEME.bg,
        backdropFilter: scrolled ? "blur(10px)" : "none",
        borderBottom: `1px solid ${scrolled ? THEME.border : "transparent"}`,
        transition: "background 0.25s ease, border-color 0.25s ease",
        fontFamily: THEME.fontBody,
      }}
    >
      <div
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          padding: "14px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="navbar-burger"
          style={{
            display: "none",
            background: "none",
            border: "none",
            color: THEME.ink,
            cursor: "pointer",
          }}
          aria-label="Menu"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" width={22} height={22}>
            {mobileOpen ? (
              <path
                fillRule="evenodd"
                d="M5.293 5.293a1 1 0 011.414 0L10 8.586l3.293-3.293a1 1 0 111.414 1.414L11.414 10l3.293 3.293a1 1 0 01-1.414 1.414L10 11.414l-3.293 3.293a1 1 0 01-1.414-1.414L8.586 10 5.293 6.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            ) : (
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            )}
          </svg>
        </button>

        {/* Logo */}
        <Link
          to="/"
          style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
        >
          <img
            src={logo}
            alt="IDENTEE"
            style={{ height: 64, width: "auto", objectFit: "contain" }}
          />
        </Link>

        {/* Desktop nav links */}
        <nav
          className="nav-desktop"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 30,
            flex: 1,
            justifyContent: "center",
          }}
        >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right side: icons + auth */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            flexShrink: 0,
          }}
        >
          <IconBtn label="Search">
            <svg viewBox="0 0 20 20" fill="none" width={18} height={18}>
              <circle
                cx="9"
                cy="9"
                r="6"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <line
                x1="13.5"
                y1="13.5"
                x2="18"
                y2="18"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </IconBtn>
          <IconBtn label="Wishlist" badge={wishlistCount}>
            <svg viewBox="0 0 20 20" fill="none" width={18} height={18}>
              <path
                d="M10 17s-6.5-4.06-8.4-8.06C.6 6.3 1.9 3.5 4.7 3.1c1.6-.2 3.1.6 3.9 2 .8-1.4 2.3-2.2 3.9-2 2.8.4 4.1 3.2 3.1 5.84C16.5 12.94 10 17 10 17z"
                stroke="currentColor"
                strokeWidth="1.4"
              />
            </svg>
          </IconBtn>
          <IconBtn label="Cart" badge={cartCount}>
            <svg viewBox="0 0 20 20" fill="none" width={18} height={18}>
              <path
                d="M3 5h2l1.2 9.6A1.5 1.5 0 007.68 16h7.64a1.5 1.5 0 001.48-1.27L18 7H5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="8" cy="18.5" r="1.1" fill="currentColor" />
              <circle cx="15" cy="18.5" r="1.1" fill="currentColor" />
            </svg>
          </IconBtn>

          {/* ── Auth section ── */}
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div className="avatar-initial" title={user.email}>
                {initial}
              </div>
              <button
                onClick={handleLogout}
                style={{
                  background: "none",
                  border: "none",
                  color: THEME.ink,
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "4px 8px",
                  borderRadius: 4,
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = THEME.surface2)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Link
                to="/login"
                style={{
                  color: THEME.ink,
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                style={{
                  textDecoration: "none",
                  background: THEME.ink,
                  color: "#FFFFFF",
                  fontSize: 13,
                  fontWeight: 700,
                  padding: "8px 18px",
                  borderRadius: 999,
                }}
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          className="nav-mobile-menu"
          style={{
            borderTop: `1px solid ${THEME.border}`,
            padding: "8px 28px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            background: THEME.bg,
          }}
        >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
              style={{
                display: "block",
                padding: "10px 0",
                borderBottom: `1px solid ${THEME.border}`,
              }}
            >
              {link.label}
            </NavLink>
          ))}
          {!user && (
            <>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                style={{
                  padding: "10px 0",
                  color: THEME.ink,
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: "none",
                  borderBottom: `1px solid ${THEME.border}`,
                }}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                style={{
                  padding: "10px 0",
                  color: THEME.goldDeep,
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: "none",
                  borderBottom: `1px solid ${THEME.border}`,
                }}
              >
                Create Account
              </Link>
            </>
          )}
          {user && (
            <button
              onClick={() => {
                handleLogout();
                setMobileOpen(false);
              }}
              style={{
                background: "none",
                border: "none",
                color: THEME.ink,
                padding: "10px 0",
                textAlign: "left",
                fontSize: 13,
                borderBottom: `1px solid ${THEME.border}`,
              }}
            >
              Logout
            </button>
          )}
        </div>
      )}

      <style>{`
        .nav-link {
          position: relative;
          text-decoration: none;
          font-size: 12.5px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: ${THEME.ink};
          padding: 6px 0;
          white-space: nowrap;
          transition: color 0.2s;
        }
        .nav-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          width: 0%;
          height: 3px;
          background: ${THEME.goldBright};
          transition: width 0.25s ease;
        }
        .nav-link:hover::after { width: 100%; }
        .nav-link:hover { color: ${THEME.goldDeep} !important; }
        .nav-link.active { color: ${THEME.goldDeep} !important; }
        .nav-link.active::after { width: 100%; }

        .avatar-initial {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          text-transform: uppercase;
          background: linear-gradient(135deg, ${THEME.gold}, ${THEME.goldBright});
          color: ${THEME.ink};
          flex-shrink: 0;
          user-select: none;
        }

        @media (max-width: 860px) {
          .nav-desktop { display: none !important; }
          .navbar-burger { display: flex !important; }
        }
        @media (min-width: 861px) {
          .nav-mobile-menu { display: none !important; }
          .navbar-burger { display: none !important; }
        }
      `}</style>
    </header>
  );
}
