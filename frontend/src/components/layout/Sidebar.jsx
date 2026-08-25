import { NavLink } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const USER_LINKS = [
  { to: "/dashboard", label: "Overview", icon: "bi-grid-1x2", end: true },
  { to: "/dashboard/profile", label: "Profile", icon: "bi-person" },
  { to: "/dashboard/saved", label: "Saved Properties", icon: "bi-heart" },
  { to: "/dashboard/my-properties", label: "My Properties", icon: "bi-houses" },
  { to: "/dashboard/inquiries", label: "My Inquiries", icon: "bi-chat-left-text" },
  { to: "/dashboard/settings", label: "Settings", icon: "bi-gear" },
];

const ADMIN_LINKS = [
  { to: "/dashboard/users", label: "Manage Users", icon: "bi-people" },
  { to: "/dashboard/messages", label: "Contact Messages", icon: "bi-envelope" },
  { to: "/dashboard/inquiries", label: "Plot Requests", icon: "bi-chat-left-text" },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { isAdmin } = useAuth();
  const links = isAdmin ? [...USER_LINKS.slice(0, 1), ...ADMIN_LINKS, ...USER_LINKS.slice(1)] : USER_LINKS;

  return (
    <>
      <aside
        className={`bg-white border-end shadow-sm ${mobileOpen ? "d-block" : "d-none"} d-lg-block`}
        style={{
          width: 260,
          minHeight: "calc(100vh - 64px)",
          position: mobileOpen ? "fixed" : "sticky",
          top: mobileOpen ? 0 : 64,
          left: 0,
          zIndex: 1050,
          height: mobileOpen ? "100vh" : undefined,
        }}
      >
        <div className="p-3 d-flex d-lg-none justify-content-between align-items-center border-bottom">
          <span className="fw-bold text-scj-primary">Menu</span>
          <button className="btn-close" aria-label="Close menu" onClick={onClose} />
        </div>
        <nav className="p-3 d-flex flex-column gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onClose}
              className={({ isActive }) =>
                `d-flex align-items-center gap-2 px-3 py-2 rounded-2 text-decoration-none fw-semibold ${
                  isActive ? "text-white" : "text-dark"
                }`
              }
              style={({ isActive }) => ({
                backgroundColor: isActive ? "var(--scj-primary)" : "transparent",
              })}
            >
              <i className={`bi ${link.icon}`} />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      {mobileOpen && (
        <div
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={onClose}
        />
      )}
    </>
  );
}
