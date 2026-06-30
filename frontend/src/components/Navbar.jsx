// components/Navbar.jsx
import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/identee-logo.png";

const NAV_LINKS = [
  { to: "/men", label: "Men" },
  { to: "/women", label: "Women" },
  { to: "/kids", label: "Kids" },
  { to: "/patch-tees", label: "Patch Tees" },
  { to: "/customise", label: "Customise Your Tee" },
];

const T = {
  bg: "#0B0B0C",
  bgScrolled: "#0B0B0Cf2",
  border: "#2B2B30",
  text: "#F3EFE6",
  muted: "#8A877F",
  gold: "#C9A24B",
  goldBright: "#F0D585",
};

const IconBtn = ({ children, label, badge }) => (
  <button
    aria-label={label}
    style={{
      position: "relative",
      background: "none",
      border: "none",
      cursor: "pointer",
      color: T.text,
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
          background: T.gold,
          color: "#0B0B0C",
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

export default function Navbar({ cartCount = 0, wishlistCount = 0 }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: scrolled ? T.bgScrolled : T.bg,
        backdropFilter: scrolled ? "blur(10px)" : "none",
        borderBottom: `1px solid ${scrolled ? T.border : "transparent"}`,
        transition: "background 0.25s ease, border-color 0.25s ease",
        fontFamily: "'Inter', sans-serif",
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
          style={{
            display: "none",
            background: "none",
            border: "none",
            color: T.text,
            cursor: "pointer",
          }}
          className="navbar-burger"
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
          className="navbar-links"
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
              style={({ isActive }) => ({
                position: "relative",
                textDecoration: "none",
                fontSize: 12.5,
                fontWeight: 500,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: isActive ? T.goldBright : T.text,
                padding: "6px 0",
                whiteSpace: "nowrap",
              })}
              className="navbar-link"
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Icons */}
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
          <IconBtn label="Account">
            <svg viewBox="0 0 20 20" fill="none" width={18} height={18}>
              <circle
                cx="10"
                cy="6.5"
                r="3.3"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <path
                d="M3 17c0-3.4 3.1-5.5 7-5.5s7 2.1 7 5.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </IconBtn>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          style={{
            borderTop: `1px solid ${T.border}`,
            padding: "8px 28px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
          className="navbar-mobile-menu"
        >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                textDecoration: "none",
                fontSize: 13,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: isActive ? T.goldBright : T.text,
                padding: "10px 0",
                borderBottom: `1px solid ${T.border}`,
              })}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}

      <style>{`
        .navbar-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          width: 0%;
          height: 1px;
          background: ${T.gold};
          transition: width 0.25s ease;
        }
        .navbar-link:hover::after { width: 100%; }
        .navbar-link:hover { color: ${T.goldBright} !important; }

        @media (max-width: 860px) {
          .navbar-links { display: none !important; }
          .navbar-burger { display: flex !important; }
        }
        @media (min-width: 861px) {
          .navbar-mobile-menu { display: none !important; }
        }
      `}</style>
    </header>
  );
}
