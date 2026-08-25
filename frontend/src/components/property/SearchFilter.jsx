import { useState } from "react";

// Values MUST match the backend Property model's `type` enum exactly
// (backend/models/Property.js) — the API silently ignores unknown query
// params, so a mismatched value here used to make the category filter a
// no-op instead of narrowing results.
const CATEGORIES = [
  { value: "plot", label: "Plot" },
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "commercial", label: "Commercial" },
  { value: "farmhouse", label: "Farmhouse" },
  { value: "office", label: "Office" },
];
// Values MUST match the keys backend propertyController.js's `sortOptions`
// map recognizes ("newest" | "oldest" | "price_asc" | "price_desc") — any
// other value silently falls back to the default (newest) sort.
// Property prices across the catalogue run from Rs. 1,500,000 to
// Rs. 7,500,000 (see backend/scripts/seedProperties.js) — used as the
// min/max bounds and placeholders on the price inputs below so the
// filter reflects the actual listing range instead of an arbitrary 0+.
const PRICE_FLOOR = 1725000;
const PRICE_CEILING = 7500000;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export default function SearchFilter({ filters, onChange, onSubmit, compact = false }) {
  const [local, setLocal] = useState(filters);

  const update = (key, value) => {
    const next = { ...local, [key]: value };
    setLocal(next);
    onChange?.(next);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(local);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`scj-card p-3 p-md-4 ${compact ? "" : "shadow-lg"}`}
      role="search"
      aria-label="Search properties"
    >
      <div className="row g-2 align-items-end">
        <div className="col-12 col-md-4">
          <label htmlFor="search-keyword" className="form-label small fw-semibold mb-1">
            Keyword or location
          </label>
          <input
            id="search-keyword"
            type="text"
            className="form-control"
            placeholder="e.g. Sector A, 5 Marla"
            value={local.search || ""}
            onChange={(e) => update("search", e.target.value)}
          />
        </div>
        <div className="col-6 col-md-2">
          <label htmlFor="search-category" className="form-label small fw-semibold mb-1">
            Category
          </label>
          <select
            id="search-category"
            className="form-select"
            value={local.type || ""}
            onChange={(e) => update("type", e.target.value)}
          >
            <option value="">All types</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="col-6 col-md-2">
          <label htmlFor="search-min" className="form-label small fw-semibold mb-1">
            Min price
          </label>
          <input
            id="search-min"
            type="number"
            min={PRICE_FLOOR}
            max={PRICE_CEILING}
            step="50000"
            placeholder={PRICE_FLOOR.toLocaleString("en-PK")}
            className="form-control"
            value={local.minPrice || ""}
            onChange={(e) => update("minPrice", e.target.value)}
          />
        </div>
        <div className="col-6 col-md-2">
          <label htmlFor="search-max" className="form-label small fw-semibold mb-1">
            Max price
          </label>
          <input
            id="search-max"
            type="number"
            min={PRICE_FLOOR}
            max={PRICE_CEILING}
            step="50000"
            placeholder={PRICE_CEILING.toLocaleString("en-PK")}
            className="form-control"
            value={local.maxPrice || ""}
            onChange={(e) => update("maxPrice", e.target.value)}
          />
        </div>
        <div className="col-6 col-md-2">
          <label htmlFor="search-sort" className="form-label small fw-semibold mb-1">
            Sort by
          </label>
          <select
            id="search-sort"
            className="form-select"
            value={local.sort || "newest"}
            onChange={(e) => update("sort", e.target.value)}
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 mt-3">
          <button type="submit" className="btn btn-scj-primary scj-search-button">
            <i className="bi bi-search me-2" />
            Search Properties
          </button>
        </div>
      </div>
    </form>
  );
}
