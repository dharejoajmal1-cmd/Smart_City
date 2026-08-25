import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useFetch from "../../hooks/useFetch";
import Loader from "../../components/common/Loader";
import propertyService from "../../api/propertyService";
import inquiryService from "../../api/inquiryService";

export default function DashboardHome() {
  const { user, isAdmin } = useAuth();

  // Property creation/management is admin-only in this backend (see
  // backend/routes/propertyRoutes.js) — there's no per-user "owner" filter
  // on the API, so a normal user has no properties of their own to list
  // here. Only fetch/show the catalogue count for admins to avoid
  // presenting the whole site's listings as "my properties" for a buyer.
  const { data: myPropertiesData, loading: loadingProps } = useFetch(
    () => (isAdmin ? propertyService.getAll({ limit: 1, sort: "newest" }) : Promise.resolve({ data: { pagination: { total: 0 } } })),
    [isAdmin]
  );
  const { data: inquiriesData, loading: loadingInquiries } = useFetch(() => inquiryService.getAll(), []);

  const myPropertiesCount = myPropertiesData?.data?.pagination?.total ?? 0;
  const inquiries = inquiriesData?.data?.inquiries || inquiriesData?.inquiries || (Array.isArray(inquiriesData?.data) ? inquiriesData.data : []);

  const cards = [
    { label: isAdmin ? "Total Properties" : "My Properties", value: myPropertiesCount, icon: "bi-houses", to: "/dashboard/my-properties" },
    { label: "My Inquiries", value: inquiries.length, icon: "bi-chat-left-text", to: "/dashboard/inquiries" },
    { label: "Saved Properties", value: "—", icon: "bi-heart", to: "/dashboard/saved" },
  ];

  return (
    <div>
      <h1 className="h4 fw-bold mb-1">Welcome back, {user?.name?.split(" ")[0] || "there"} 👋</h1>
      <p className="text-muted mb-4">
        {isAdmin ? "Here's a quick overview of the platform." : "Here's a quick overview of your account."}
      </p>

      {loadingProps || loadingInquiries ? (
        <Loader label="Loading your dashboard…" />
      ) : (
        <div className="row g-4 mb-4">
          {cards.map((c) => (
            <div className="col-sm-6 col-lg-4" key={c.label}>
              <Link to={c.to} className="scj-card p-4 d-block text-decoration-none h-100">
                <i className={`bi ${c.icon} fs-2 text-scj-gold mb-2 d-block`} />
                <div className="fs-3 fw-bold text-scj-primary">{c.value}</div>
                <div className="text-muted small">{c.label}</div>
              </Link>
            </div>
          ))}
        </div>
      )}

      <div className="scj-card p-4">
        <h2 className="h6 fw-bold mb-3">Quick Actions</h2>
        <div className="d-flex flex-wrap gap-2">
          {isAdmin && (
            <Link to="/dashboard/my-properties" className="btn btn-scj-primary btn-sm">
              <i className="bi bi-plus-lg me-1" /> Add Property
            </Link>
          )}
          <Link to="/dashboard/settings" className="btn btn-scj-outline btn-sm">
            <i className="bi bi-gear me-1" /> Account Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
