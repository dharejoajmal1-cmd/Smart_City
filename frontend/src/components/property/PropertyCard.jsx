import { Link } from "react-router-dom";
import { formatPKR } from "../../utils/formatters";

// Display labels for the backend Property model's `type` enum
// (backend/models/Property.js: house, apartment, plot, commercial,
// farmhouse, office).
const TYPE_LABELS = {
  house: "House",
  apartment: "Apartment",
  plot: "Plot",
  commercial: "Commercial",
  farmhouse: "Farmhouse",
  office: "Office",
};


const SEED_IMAGE_BY_TITLE = {
  "Sector A Corner Residential Plot": "images (1).png",
  "Green Belt View 10 Marla Plot": "images (2).png",
  "Modern 5 Marla Single-Story House": "images (3).png",
  "Family Home Near Community Park": "images (4).png",
  "Budget-Friendly 3 Marla House": "images (5).png",
  "Skyline Residency 2-Bed Apartment": "images (6).png",
  "Riverside Towers 3-Bed Apartment": "images (7).png",
  "Main Boulevard Commercial Shop": "images (8).png",
  "Commercial Plaza Office Space": "images (9).png",
  "Executive Office Suite": "images (10).png",
  "Tech Park Co-Working Office": "images (11).png",
  "Orchard View Farmhouse Plot": "images (12).png",
  "Countryside Weekend Farmhouse": "images (13).png",
  "Lakeview Residential Plot": "images (14).png",
  "Twin Villas Duplex House": "images (15).png",
  "Grand Avenue Show Room": "images (16).png",
};

const FALLBACK_BY_TYPE = {
  plot: "/assets/residential-plot.svg",
  commercial: "/assets/commercial-plot.svg",
  house: "/assets/house-residential.svg",
  apartment: "/assets/apartment.svg",
  farmhouse: "/assets/farmhouse.svg",
  office: "/assets/commercial-plot.svg",
};

export default function PropertyCard({ property, onToggleSave, saved = false }) {
  const {
    _id,
    slug,
    title,
    price,
    location,
    type,
    bedrooms,
    bathrooms,
    area,
    images,
    status,
    featured,
    seedImage,
  } = property || {};

  const localFile = seedImage || SEED_IMAGE_BY_TITLE[title];
  const localSeed = localFile ? `/property-images/${encodeURIComponent(localFile)}` : null;
  const cover = images?.[0]?.url || images?.[0] || localSeed || FALLBACK_BY_TYPE[type] || "/assets/house-residential.svg";
  const link = slug ? `/properties/${slug}` : `/properties/${_id}`;

  return (
    <div className="scj-card h-100 overflow-hidden position-relative">
      <div className="position-relative">
        <Link to={link}>
          <img
            src={cover}
            alt={title}
            className="w-100"
            style={{ height: 210, objectFit: "cover" }}
            loading="lazy"
            onError={(e) => { const fallback = localSeed || FALLBACK_BY_TYPE[type] || "/assets/house-residential.svg"; if (e.currentTarget.src.endsWith(fallback)) return; e.currentTarget.src = fallback; }}
          />
        </Link>
        {type && (
          <span
            className="position-absolute top-0 start-0 m-2 badge"
            style={{ backgroundColor: "var(--scj-primary)" }}
          >
            {TYPE_LABELS[type] || type}
          </span>
        )}
        {featured && (
          <span
            className="position-absolute top-0 end-0 m-2 badge"
            style={{ background: "var(--scj-gradient-gold)", color: "var(--scj-primary-dark)" }}
          >
            <i className="bi bi-star-fill me-1" />Featured
          </span>
        )}
        {!featured && status && (
          <span
            className="position-absolute top-0 end-0 m-2 badge text-scj-primary"
            style={{ background: "var(--scj-gradient-gold)" }}
          >
            {status}
          </span>
        )}
        {onToggleSave && (
          <button
            type="button"
            onClick={() => onToggleSave(property)}
            aria-label={saved ? "Remove from saved properties" : "Save property"}
            className="btn btn-light btn-sm rounded-circle position-absolute bottom-0 end-0 m-2 shadow-sm"
          >
            <i className={`bi ${saved ? "bi-heart-fill text-danger" : "bi-heart"}`} />
          </button>
        )}
      </div>

      <div className="p-3">
        <h3 className="h6 fw-bold mb-1">
          <Link to={link} className="text-decoration-none text-dark stretched-link-none">
            {title}
          </Link>
        </h3>
        <p className="text-muted small mb-2 d-flex align-items-center gap-1">
          <i className="bi bi-geo-alt text-scj-gold" /> {location}
        </p>
        <p className="fw-bold text-scj-primary mb-2">{formatPKR(price)}</p>
        <Link to="/buy-plot" className="btn btn-sm btn-scj-primary w-100 mt-2 position-relative" style={{zIndex:2}}>Buy / Request Plot</Link>

        {(Boolean(bedrooms) || Boolean(bathrooms) || area) && (
          <div className="d-flex gap-3 small text-muted border-top pt-2">
            {Boolean(bedrooms) && (
              <span>
                <i className="bi bi-door-closed me-1" />
                {bedrooms} Bed
              </span>
            )}
            {Boolean(bathrooms) && (
              <span>
                <i className="bi bi-droplet me-1" />
                {bathrooms} Bath
              </span>
            )}
            {area && (
              <span>
                <i className="bi bi-arrows-angle-expand me-1" />
                {area}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
