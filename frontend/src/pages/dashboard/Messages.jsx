import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useToast from "../../hooks/useToast";
import useFetch from "../../hooks/useFetch";
import Loader from "../../components/common/Loader";
import contactService from "../../api/contactService";
import inquiryService from "../../api/inquiryService";
import { formatDate, formatPKR, truncate } from "../../utils/formatters";

const CONTACT_STATUS_OPTIONS = ["new", "contacted", "closed"];

const FILTERS = [
  { value: "all", label: "All Messages" },
  { value: "contact", label: "Contact Form" },
  { value: "inquiry", label: "Property Buy Requests" },
];

export default function Messages() {
  const toast = useToast();
  const {
    data: contactData,
    loading: contactLoading,
    refetch: refetchContacts,
  } = useFetch(() => contactService.getAll(), []);
  const { data: inquiryData, loading: inquiryLoading } = useFetch(
    () => inquiryService.getAll(),
    []
  );

  const [filter, setFilter] = useState("all");

  const contactMessages = contactData?.data?.messages || [];
  const inquiries = inquiryData?.data?.inquiries || [];

  // Merge both sources into one inbox, newest first, each item tagged
  // with where it came from so the admin can tell contact-form
  // messages apart from property-buy requests at a glance.
  const combined = useMemo(() => {
    const fromContact = contactMessages.map((m) => ({
      id: m._id,
      source: "contact",
      name: m.name,
      email: m.email,
      phone: m.phone,
      property: m.property?.title || null,
      message: m.message,
      status: m.status || "new",
      createdAt: m.createdAt,
      raw: m,
    }));
    const fromInquiry = inquiries.map((i) => ({
      id: i._id,
      source: "inquiry",
      name: i.name,
      email: i.email,
      phone: i.phone,
      property: i.property?.title || `${i.plotSizeSqYds || "Custom"} Sq.Yds ${i.plotType || ""}`.trim(),
      message: i.message,
      status: i.status || "pending",
      createdAt: i.createdAt,
      raw: i,
    }));
    return [...fromContact, ...fromInquiry].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [contactMessages, inquiries]);

  const filtered = combined.filter((item) => filter === "all" || item.source === filter);
  const loading = contactLoading || inquiryLoading;

  const handleStatusChange = async (item, status) => {
    try {
      await contactService.updateStatus(item.id, status);
      toast.success("Message status updated.");
      refetchContacts();
    } catch (err) {
      toast.error(err.friendlyMessage || "Could not update message status.");
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm("Delete this message? This cannot be undone.")) return;
    try {
      await contactService.remove(item.id);
      toast.success("Message deleted.");
      refetchContacts();
    } catch (err) {
      toast.error(err.friendlyMessage || "Could not delete this message.");
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <h1 className="h4 fw-bold mb-0">Contact Messages</h1>
        <div className="btn-group">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              className={`btn btn-sm ${filter === f.value ? "btn-scj-primary" : "btn-outline-secondary"}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loader label="Loading messages…" />
      ) : filtered.length === 0 ? (
        <div className="scj-card p-5 text-center">
          <i className="bi bi-envelope fs-1 text-scj-gold d-block mb-3" />
          <p className="text-muted mb-0">No messages yet.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filtered.map((item) => (
            <div className="scj-card p-4" key={`${item.source}-${item.id}`}>
              <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                <div>
                  <span
                    className={`badge me-2 ${item.source === "contact" ? "bg-info text-dark" : "bg-scj-gold text-dark"}`}
                  >
                    {item.source === "contact" ? "Contact Form" : "Property Buy Request"}
                  </span>
                  <h2 className="h6 fw-bold d-inline-block mb-0">{item.name}</h2>
                  <div className="small text-muted mt-1">
                    {item.email} {item.phone && `· ${item.phone}`}
                  </div>
                  {item.property && (
                    <div className="small text-muted">
                      Property: <strong>{item.property}</strong>
                    </div>
                  )}
                </div>
                <div className="text-end">
                  <span className="badge text-capitalize bg-secondary d-block mb-1">
                    {item.status}
                  </span>
                  <small className="text-muted">{formatDate(item.createdAt)}</small>
                </div>
              </div>

              <p className="mt-3 mb-3">{truncate(item.message, 400)}</p>

              {item.source === "inquiry" && item.raw.budget !== undefined && (
                <div className="small text-muted mb-3">
                  Budget: {formatPKR(item.raw.budget)}
                </div>
              )}

              <div className="d-flex flex-wrap gap-2 align-items-center">
                {item.source === "contact" ? (
                  <select
                    className="form-select form-select-sm"
                    style={{ maxWidth: 160 }}
                    value={item.status}
                    onChange={(e) => handleStatusChange(item, e.target.value)}
                  >
                    {CONTACT_STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Link to="/dashboard/inquiries" className="btn btn-sm btn-outline-primary">
                    Manage in Plot Requests
                  </Link>
                )}
                {item.source === "contact" && (
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(item)}
                  >
                    <i className="bi bi-trash" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
