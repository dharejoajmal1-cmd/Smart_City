import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PropertyCard from "../components/property/PropertyCard";
import SearchFilter from "../components/property/SearchFilter";
import Loader from "../components/common/Loader";
import useFetch from "../hooks/useFetch";
import propertyService from "../api/propertyService";
import { setSeo } from "../utils/seo";

// `query` values MUST match the backend Property model's `type` enum
// (backend/models/Property.js) — unknown query params are silently
// ignored by the API, so these category tiles used to link to an
// unfiltered property list.
const CATEGORIES = [
  { label: "Residential Plots", icon: "bi-signpost-split", query: "plot", image: "/assets/residential-plot.svg" },
  { label: "Commercial Plots", icon: "bi-shop", query: "commercial", image: "/assets/commercial-plot.svg" },
  { label: "Houses", icon: "bi-house-door", query: "house", image: "/assets/house-residential.svg" },
  { label: "Apartments", icon: "bi-building", query: "apartment", image: "/assets/apartment.svg" },
  { label: "Farmhouses", icon: "bi-tree", query: "farmhouse", image: "/assets/farmhouse.svg" },
];

const STATS = [
  { value: "5+", label: "Property Categories" },
  { value: "01", label: "Jamshoro-Focused Platform" },
  { value: "24/7", label: "Online Property Access" },
];

const WHY_US = [
  { icon: "bi-patch-check", title: "Verified Titles", text: "Every plot and unit comes with a clean, legally verified title." },
  { icon: "bi-shield-check", title: "Gated Security", text: "24/7 surveillance and secured boundary walls across the city." },
  { icon: "bi-tree", title: "Green Master Plan", text: "Parks, walkways and green belts woven into every sector." },
  { icon: "bi-credit-card", title: "Flexible Plans", text: "Easy installment plans tailored for families and investors." },
];

const TESTIMONIALS = [
  { name: "Residential Living", role: "For families", text: "Explore plot and home options with clear property details, location context and an easy inquiry path." },
  { name: "Investment", role: "For buyers & investors", text: "Compare residential and commercial opportunities from one Jamshoro-focused property catalogue." },
];

const FAQS = [
  { q: "Is Smart City Jamshoro NOC approved?", a: "Yes, the project holds the required regulatory approvals. Our sales team can share the latest documentation on request." },
  { q: "What payment plans are available?", a: "We offer both full-payment and easy installment plans spread across multiple years, depending on the plot category." },
  { q: "Can overseas Pakistanis book a plot?", a: "Yes, overseas clients can book remotely through our dedicated overseas desk and complete verification online." },
  { q: "How do I schedule a site visit?", a: "Use the contact form or call our office to arrange a guided visit at a time that suits you." },
];

export default function Home() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({});
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    setSeo({
      title: "Smart City Jamshoro | Premium Property & Plots",
      description: "Explore residential and commercial plots, houses, apartments and farmhouses in Smart City Jamshoro.",
    });
  }, []);

  const { data: featuredData, loading: loadingFeatured } = useFetch(
    () => propertyService.getAll({ featured: true, limit: 6 }),
    []
  );
  const { data: latestData, loading: loadingLatest } = useFetch(
    () => propertyService.getAll({ sort: "newest", limit: 6 }),
    []
  );

  const featured = featuredData?.data?.properties || featuredData?.properties || (Array.isArray(featuredData?.data) ? featuredData.data : []);
  const latest = latestData?.data?.properties || latestData?.properties || (Array.isArray(latestData?.data) ? latestData.data : []);

  const handleSearchSubmit = (values) => {
    const params = new URLSearchParams(
      Object.entries(values).filter(([, v]) => v !== undefined && v !== "")
    );
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <>
      {/* HERO ---------------------------------------------------------- */}
      <section className="scj-hero position-relative text-white overflow-hidden">
        <div className="container position-relative py-5 py-lg-0">
          <div className="row align-items-center g-5 scj-hero-row">
            <div className="col-lg-6 py-5">
              <span className="scj-eyebrow">Jamshoro's Premier Planned City</span>
              <h1 className="font-display fw-bold display-4 mt-3 mb-3">
                Own Your Future in <span className="text-scj-gold">Smart City Jamshoro</span>
              </h1>
              <p className="fs-5 text-white-50 mb-4" style={{ maxWidth: 640 }}>
                Premium residential and commercial plots, homes and farmhouses, set within a
                master-planned green community designed for modern Sindhi living.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/properties" className="btn btn-scj-gold btn-lg">Explore Properties</Link>
                <Link to="/contact" className="btn btn-outline-light btn-lg">Book a Site Visit</Link>
              </div>
              <div className="d-flex flex-wrap gap-4 mt-4 small text-white-50">
                <span><i className="bi bi-shield-check text-scj-gold me-2" />Verified listings</span>
                <span><i className="bi bi-tree text-scj-gold me-2" />Green master plan</span>
                              </div>
            </div>
            <div className="col-lg-6">
              <div className="scj-hero-visual">
                <img src="/assets/jamshoro-hero.svg" alt="Illustrated Smart City Jamshoro residential community" className="w-100" />
                <div className="scj-hero-badge"><strong>Smart Living</strong><span>Green • Connected • Secure</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH — floats over the hero's bottom edge on large screens only */}
      <div className="container scj-hero-search-wrap">
        <SearchFilter filters={filters} onChange={setFilters} onSubmit={handleSearchSubmit} />
      </div>

      {/* CATEGORIES ------------------------------------------------------ */}
      <section className="scj-section">
        <div className="container">
          <div className="text-center mb-5">
            <span className="scj-eyebrow">What are you looking for</span>
            <h2 className="font-display fw-bold mt-2">Property Categories</h2>
            <div className="scj-divider-gold mx-auto mt-3" />
          </div>
          <div className="row g-4">
            {CATEGORIES.map((cat) => (
              <div className="col-6 col-md-4 col-lg" key={cat.label}>
                <Link
                  to={`/properties?type=${encodeURIComponent(cat.query)}`}
                  className="scj-card d-flex flex-column align-items-center justify-content-center text-center p-4 h-100 text-decoration-none"
                >
                  <div className="scj-category-image mb-3">
                    <img src={cat.image} alt={cat.label} loading="lazy" />
                  </div>
                  <span className="fw-semibold text-dark">{cat.label}</span>
                  <span className="small text-muted mt-1">Explore {cat.query.toLowerCase()}s</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTIES --------------------------------------------- */}
      <section className="scj-section bg-white">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-5 flex-wrap gap-3">
            <div>
              <span className="scj-eyebrow">Handpicked for you</span>
              <h2 className="font-display fw-bold mt-2 mb-0">Featured Properties</h2>
            </div>
            <Link to="/properties" className="btn btn-scj-outline">
              View All <i className="bi bi-arrow-right ms-1" />
            </Link>
          </div>

          {loadingFeatured ? (
            <Loader label="Loading featured properties…" />
          ) : featured.length ? (
            <div className="row g-4">
              {featured.map((p) => (
                <div className="col-sm-6 col-lg-4" key={p._id || p.id}>
                  <PropertyCard property={p} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-center py-4">
              Featured listings will appear here once the backend returns properties marked as featured.
            </p>
          )}
        </div>
      </section>

      {/* LATEST PROPERTIES -------------------------------------------- */}
      <section className="scj-section">
        <div className="container">
          <div className="text-center mb-5">
            <span className="scj-eyebrow">Fresh on the market</span>
            <h2 className="font-display fw-bold mt-2">Latest Properties</h2>
            <div className="scj-divider-gold mx-auto mt-3" />
          </div>

          {loadingLatest ? (
            <Loader label="Loading latest properties…" />
          ) : latest.length ? (
            <div className="row g-4">
              {latest.map((p) => (
                <div className="col-sm-6 col-lg-4" key={p._id || p.id}>
                  <PropertyCard property={p} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-center py-4">
              New listings will appear here as they're added to the backend.
            </p>
          )}
        </div>
      </section>

      {/* STATISTICS ------------------------------------------------------ */}
      <section className="py-5" style={{ background: "var(--scj-gradient-hero)" }}>
        <div className="container">
          <div className="row text-center text-white g-4">
            {STATS.map((s) => (
              <div className="col-6 col-md-3" key={s.label}>
                <div className="font-display fw-bold display-6 text-scj-gold">{s.value}</div>
                <div className="text-white-50">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US ----------------------------------------------- */}
      <section className="scj-section bg-white">
        <div className="container">
          <div className="text-center mb-5">
            <span className="scj-eyebrow">Our promise</span>
            <h2 className="font-display fw-bold mt-2">Why Choose Us</h2>
            <div className="scj-divider-gold mx-auto mt-3" />
          </div>
          <div className="row g-4">
            {WHY_US.map((item) => (
              <div className="col-sm-6 col-lg-3" key={item.title}>
                <div className="scj-card p-4 h-100 text-center">
                  <i className={`bi ${item.icon} fs-1 text-scj-primary mb-3`} />
                  <h3 className="h6 fw-bold">{item.title}</h3>
                  <p className="text-muted small mb-0">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS -------------------------------------------------- */}
      <section className="scj-section">
        <div className="container">
          <div className="text-center mb-5">
            <span className="scj-eyebrow">Designed around your property journey</span>
            <h2 className="font-display fw-bold mt-2">What You Can Do</h2>
            <div className="scj-divider-gold mx-auto mt-3" />
          </div>
          <div className="row g-4">
            {TESTIMONIALS.map((t) => (
              <div className="col-md-4" key={t.name}>
                <div className="scj-card p-4 h-100">
                  <i className="bi bi-quote fs-2 text-scj-gold" />
                  <p className="text-muted">{t.text}</p>
                  <div className="fw-bold">{t.name}</div>
                  <div className="small text-muted">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ ------------------------------------------------------------ */}
      <section className="scj-section bg-white">
        <div className="container">
          <div className="text-center mb-5">
            <span className="scj-eyebrow">Good to know</span>
            <h2 className="font-display fw-bold mt-2">Frequently Asked Questions</h2>
            <div className="scj-divider-gold mx-auto mt-3" />
          </div>
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="accordion" id="faqAccordion">
                {FAQS.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div className="accordion-item mb-2 border-0 scj-card overflow-hidden" key={faq.q}>
                      <h3 className="accordion-header">
                        <button
                          className={`accordion-button fw-semibold ${isOpen ? "" : "collapsed"}`}
                          type="button"
                          aria-expanded={isOpen}
                          onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                        >
                          {faq.q}
                        </button>
                      </h3>
                      {isOpen && <div className="accordion-body text-muted">{faq.a}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAP -------------------------------------------------------------- */}
      <section className="scj-section">
        <div className="container">
          <div className="text-center mb-5">
            <span className="scj-eyebrow">Find us</span>
            <h2 className="font-display fw-bold mt-2">Location</h2>
            <div className="scj-divider-gold mx-auto mt-3" />
          </div>
          <div className="ratio ratio-21x9 scj-card overflow-hidden">
            <iframe
              title="Smart City Jamshoro location"
              src="https://www.google.com/maps?q=Jamshoro,Sindh,Pakistan&output=embed"
              loading="lazy"
              style={{ border: 0 }}
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* NEWSLETTER --------------------------------------------------- */}
      <section className="scj-section bg-white">
        <div className="container">
          <div className="scj-card p-4 p-md-5 text-center" style={{ background: "var(--scj-bg)" }}>
            <h2 className="font-display fw-bold mb-2">Stay in the loop</h2>
            <p className="text-muted mb-4">
              Get new launches, price updates and event invitations straight to your inbox.
            </p>
            <form
              className="d-flex flex-column flex-sm-row gap-2 justify-content-center"
              onSubmit={(e) => e.preventDefault()}
            >
              <label htmlFor="newsletter-email" className="visually-hidden">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="you@example.com"
                className="form-control"
                style={{ maxWidth: 320 }}
              />
              <button type="submit" className="btn btn-scj-primary">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION -------------------------------------------------- */}
      <section className="py-5 text-center text-white" style={{ background: "var(--scj-gradient-hero)" }}>
        <div className="container">
          <h2 className="font-display fw-bold mb-3">Ready to find your place in Smart City Jamshoro?</h2>
          <Link to="/properties" className="btn btn-scj-gold btn-lg">
            Browse Properties Now
          </Link>
        </div>
      </section>
    </>
  );
}
