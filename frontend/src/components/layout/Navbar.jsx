import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import BrandLogo from "../common/BrandLogo";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/properties", label: "Properties" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/buy-plot", label: "Buy Plot" },
];

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setAccountOpen(false);
    navigate("/");
  };

  return (
    <>
      <div className="scj-nav-topline d-none d-md-block">
        <div className="container py-2 d-flex justify-content-between align-items-center">
          <span><i className="bi bi-geo-alt me-1 text-scj-gold" />F7VC+RXR, Jamshoro, Sindh</span>
          <span className="d-flex gap-3"><a className="text-white text-opacity-75" href="tel:03343238514"><i className="bi bi-telephone me-1 text-scj-gold" />0334 3238514</a><a className="text-white text-opacity-75" href="tel:03412490832">0341 2490832</a></span>
        </div>
      </div>
      <nav className="navbar navbar-expand-lg sticky-top bg-white shadow-sm py-2">
        <div className="container">
          <BrandLogo />

          <button
            className="navbar-toggler border-0"
            type="button"
            aria-expanded={expanded}
            aria-label="Toggle navigation"
            onClick={() => setExpanded((v) => !v)}
          >
            <i className="bi bi-list fs-2 text-scj-primary" />
          </button>

          <div className={`collapse navbar-collapse ${expanded ? "show" : ""}`}>
            <ul className="navbar-nav mx-auto gap-lg-2">
              {LINKS.map((link) => (
                <li className="nav-item" key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === "/"}
                    className={({ isActive }) => `nav-link fw-semibold ${isActive ? "text-scj-primary" : "text-dark"}`}
                    onClick={() => setExpanded(false)}
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0">
              {isAuthenticated ? (
                <div className="position-relative">
                  <button className="btn btn-scj-outline d-flex align-items-center gap-2" type="button" aria-expanded={accountOpen} onClick={() => setAccountOpen((v) => !v)}>
                    <i className="bi bi-person-circle" />
                    {user?.name?.split(" ")[0] || "Account"}
                    <i className={`bi ${accountOpen ? "bi-chevron-up" : "bi-chevron-down"} small`} />
                  </button>
                  {accountOpen && (
                    <div className="dropdown-menu show dropdown-menu-end shadow-lg border-0 position-absolute end-0 mt-2" style={{ minWidth: 190 }}>
                      <Link className="dropdown-item" to="/dashboard" onClick={() => setAccountOpen(false)}>Dashboard</Link>
                      <Link className="dropdown-item" to="/dashboard/profile" onClick={() => setAccountOpen(false)}>Profile</Link>
                      
                      <div className="dropdown-divider" />
                      <button className="dropdown-item text-danger" onClick={handleLogout}>Logout</button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/login" className="btn btn-scj-outline">Login</Link>
                  <Link to="/register" className="btn btn-scj-primary">Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
