import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { initials } from "../../utils/formatters";

export default function Topbar({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <header
      className="bg-white border-bottom d-flex align-items-center justify-content-between px-3 px-lg-4 sticky-top"
      style={{ height: 64, zIndex: 1030 }}
    >
      <div className="d-flex align-items-center gap-3">
        <button className="btn d-lg-none" aria-label="Open menu" onClick={onMenuClick}>
          <i className="bi bi-list fs-3 text-scj-primary" />
        </button>
        <Link to="/" className="fw-bold text-scj-primary font-display d-none d-sm-inline">
          Smart City Jamshoro
        </Link>
      </div>

      <div className="d-flex align-items-center gap-3">
        <Link to="/" className="btn btn-sm btn-scj-outline d-none d-md-inline-flex">
          <i className="bi bi-house-door me-1" /> View Site
        </Link>
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user?.name || "Profile"}
            title={user?.name}
            className="rounded-circle object-fit-cover"
            style={{ width: 38, height: 38 }}
          />
        ) : (
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle fw-bold text-white"
            style={{ width: 38, height: 38, background: "var(--scj-gradient-hero)" }}
            title={user?.name}
          >
            {initials(user?.name || "U")}
          </div>
        )}
      </div>
    </header>
  );
}
