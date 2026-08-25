import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Breadcrumb from "../components/common/Breadcrumb";
import Loader from "../components/common/Loader";
import Button from "../components/common/Button";
import useFetch from "../hooks/useFetch";
import useAuth from "../hooks/useAuth";
import useToast from "../hooks/useToast";
import propertyService from "../api/propertyService";
import inquiryService from "../api/inquiryService";
import { formatPKR, formatDate } from "../utils/formatters";
import { validateInquiryForm } from "../utils/validators";
import { setSeo } from "../utils/seo";

export default function PropertyDetails() {
  const { id, slug } = useParams();
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();

  const { data, loading, error } = useFetch(
    () => (slug ? propertyService.getBySlug(slug) : propertyService.getById(id)),
    [slug, id]
  );

  const property = data?.data?.property || data?.property || data?.data || data;

  useEffect(() => {
    if (property?.title) {
      setSeo({
        title: `${property.title} | Smart City Jamshoro`,
        description: property.description || "Property listing in Smart City Jamshoro.",
      });
    }
  }, [property?.title, property?.description]);

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  if (loading) return <Loader fullPage label="Loading property details…" />;

  if (error || !property) {
    return (
      <div className="container scj-section text-center">
        <i className="bi bi-house-x fs-1 text-scj-gold mb-3 d-block" />
        <h1 className="h4">Property not found</h1>
        <p className="text-muted">{error || "This listing may have been removed."}</p>
        <Link to="/properties" className="btn btn-scj-primary mt-3">
          Back to Properties
        </Link>
      </div>
    );
  }

  const {
    _id,
    title,
    description,
    price,
    location,
    type,
    bedrooms,
    bathrooms,
    area,
    images = [],
    createdAt,
    features: amenities = [],
  } = property;

  const TYPE_LABELS = {
    house: "House",
    apartment: "Apartment",
    plot: "Plot",
    commercial: "Commercial",
    farmhouse: "Farmhouse",
    office: "Office",
  };
  const category = type ? TYPE_LABELS[type] || type : "";

  const gallery = images.length ? images : ["/assets/house-residential.svg"];
  const activeSrc = typeof gallery[activeImage] === "string" ? gallery[activeImage] : gallery[activeImage]?.url || "/assets/house-residential.svg";

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateInquiryForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    setSubmitting(true);
    try {
      await inquiryService.create({ ...form, property: _id });
      toast.success("Your inquiry has been sent. Our team will reach out shortly.");
      setForm({ name: user?.name || "", email: user?.email || "", phone: "", message: "" });
    } catch (err) {
      toast.error(err.friendlyMessage || "Could not send your inquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="py-4 border-bottom bg-white">
        <div className="container">
          <Breadcrumb items={[{ label: "Properties", to: "/properties" }, { label: title }]} />
        </div>
      </section>

      <section className="scj-section">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-8">
              <div className="scj-card overflow-hidden mb-4">
                <img
                  src={activeSrc}
                  alt={title}
                  className="w-100 scj-property-image"
                  style={{ maxHeight: 480, objectFit: "cover" }}
                  onError={(e) => { e.currentTarget.src = "/assets/house-residential.svg"; }}
                />
                {gallery.length > 1 && (
                  <div className="d-flex gap-2 p-2 overflow-auto">
                    {gallery.map((img, idx) => {
                      const src = typeof img === "string" ? img : img.url;
                      return (
                        <button
                          key={src + idx}
                          type="button"
                          className="p-0 border-0 bg-transparent"
                          onClick={() => setActiveImage(idx)}
                        >
                          <img
                            src={src}
                            alt={`${title} thumbnail ${idx + 1}`}
                            onError={(e) => { e.currentTarget.src = "/assets/house-residential.svg"; }}
                            style={{
                              width: 80,
                              height: 60,
                              objectFit: "cover",
                              borderRadius: 8,
                              outline: idx === activeImage ? "2px solid var(--scj-gold)" : "none",
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <h1 className="font-display fw-bold mb-2">{title}</h1>
              <p className="text-muted d-flex align-items-center gap-1 mb-3">
                <i className="bi bi-geo-alt text-scj-gold" /> {location}
              </p>

              <div className="d-flex flex-wrap gap-4 border-top border-bottom py-3 mb-4">
                {category && (
                  <span className="d-flex align-items-center gap-2 small">
                    <i className="bi bi-tag text-scj-primary" /> {category}
                  </span>
                )}
                {Boolean(bedrooms) && (
                  <span className="d-flex align-items-center gap-2 small">
                    <i className="bi bi-door-closed text-scj-primary" /> {bedrooms} Bedrooms
                  </span>
                )}
                {Boolean(bathrooms) && (
                  <span className="d-flex align-items-center gap-2 small">
                    <i className="bi bi-droplet text-scj-primary" /> {bathrooms} Bathrooms
                  </span>
                )}
                {area && (
                  <span className="d-flex align-items-center gap-2 small">
                    <i className="bi bi-arrows-angle-expand text-scj-primary" /> {area}
                  </span>
                )}
                {createdAt && (
                  <span className="d-flex align-items-center gap-2 small">
                    <i className="bi bi-calendar text-scj-primary" /> Listed {formatDate(createdAt)}
                  </span>
                )}
              </div>

              <h2 className="h5 fw-bold mb-2">Description</h2>
              <p className="text-muted">{description || "No description provided for this property yet."}</p>

              {amenities.length > 0 && (
                <>
                  <h2 className="h5 fw-bold mt-4 mb-2">Amenities</h2>
                  <div className="row g-2">
                    {amenities.map((a) => (
                      <div className="col-6 col-md-4 d-flex align-items-center gap-2" key={a}>
                        <i className="bi bi-check-circle text-scj-gold" /> <span className="small">{a}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="col-lg-4">
              <div className="scj-card p-4 sticky-top" style={{ top: 90 }}>
                <div className="fs-3 fw-bold text-scj-primary mb-3">{formatPKR(price)}</div>

                <h3 className="h6 fw-bold mb-3">Interested in this property?</h3>
                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-2">
                    <label htmlFor="inq-name" className="visually-hidden">Full name</label>
                    <input
                      id="inq-name"
                      name="name"
                      className={`form-control ${errors.name ? "is-invalid" : ""}`}
                      placeholder="Full name"
                      value={form.name}
                      onChange={handleChange}
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </div>
                  <div className="mb-2">
                    <label htmlFor="inq-email" className="visually-hidden">Email</label>
                    <input
                      id="inq-email"
                      name="email"
                      type="email"
                      className={`form-control ${errors.email ? "is-invalid" : ""}`}
                      placeholder="Email address"
                      value={form.email}
                      onChange={handleChange}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>
                  <div className="mb-2">
                    <label htmlFor="inq-phone" className="visually-hidden">Phone</label>
                    <input
                      id="inq-phone"
                      name="phone"
                      className="form-control"
                      placeholder="Phone number"
                      value={form.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="inq-message" className="visually-hidden">Message</label>
                    <textarea
                      id="inq-message"
                      name="message"
                      rows={3}
                      className={`form-control ${errors.message ? "is-invalid" : ""}`}
                      placeholder="I'd like more information about this property…"
                      value={form.message}
                      onChange={handleChange}
                    />
                    {errors.message && <div className="invalid-feedback">{errors.message}</div>}
                  </div>
                  <Button type="submit" className="w-100" loading={submitting}>
                    Send Inquiry
                  </Button>
                  {!isAuthenticated && (
                    <p className="small text-muted mt-2 mb-0">
                      Tip: <Link to="/login">log in</Link> to track this inquiry from your dashboard.
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
