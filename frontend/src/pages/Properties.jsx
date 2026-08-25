import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Breadcrumb from "../components/common/Breadcrumb";
import SearchFilter from "../components/property/SearchFilter";
import PropertyCard from "../components/property/PropertyCard";
import Pagination from "../components/common/Pagination";
import Loader from "../components/common/Loader";
import useFetch from "../hooks/useFetch";
import propertyService from "../api/propertyService";
import { setSeo } from "../utils/seo";

const PAGE_SIZE = 9;

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);

  useEffect(() => {
    setSeo({ title: "Properties | Smart City Jamshoro", description: "Browse available plots, houses, apartments and farmhouses in Smart City Jamshoro." });
  }, []);

  const filters = useMemo(
    () => ({
      search: searchParams.get("search") || "",
      // Read both `type` (current param name) and the legacy `category`
      // param so old bookmarked/shared links with ?category= still work.
      type: searchParams.get("type") || searchParams.get("category") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      sort: searchParams.get("sort") || "newest",
    }),
    [searchParams]
  );

  const { data, loading, error } = useFetch(
    () =>
      propertyService.getAll({
        // Strip out empty-string filters (e.g. unset minPrice/maxPrice)
        // instead of forwarding them as "" — the backend treats an
        // explicit empty string differently from an omitted param, and
        // sending "" caused price filtering to break.
        ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== "")),
        page,
        limit: PAGE_SIZE,
      }),
    [JSON.stringify(filters), page]
  );

  const properties = data?.data?.properties || data?.properties || (Array.isArray(data?.data) ? data.data : []);
  const pagination = data?.data?.pagination || data?.pagination || {};
  const totalPages = pagination.totalPages || 1;
  const totalCount = pagination.total ?? properties.length;

  const handleSubmit = (values) => {
    const params = new URLSearchParams(
      Object.entries(values).filter(([, v]) => v !== undefined && v !== "")
    );
    setSearchParams(params);
    setPage(1);
  };

  return (
    <>
      <section className="py-4 border-bottom bg-white">
        <div className="container">
          <Breadcrumb items={[{ label: "Properties" }]} />
        </div>
      </section>

      <section className="py-4 bg-white border-bottom">
        <div className="container">
          <SearchFilter filters={filters} onSubmit={handleSubmit} compact />
        </div>
      </section>

      <section className="scj-section">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <h1 className="h4 fw-bold mb-0">
              {loading ? "Searching…" : `${totalCount} Properties Found`}
            </h1>
          </div>

          {loading && <Loader label="Loading properties…" />}

          {!loading && error && <div className="alert alert-danger">{error}</div>}

          {!loading && !error && properties.length === 0 && (
            <div className="text-center py-5">
              <i className="bi bi-house-x fs-1 text-scj-gold mb-3 d-block" />
              <p className="text-muted">No properties match your search yet. Try adjusting the filters.</p>
            </div>
          )}

          {!loading && !error && properties.length > 0 && (
            <>
              <div className="row g-4">
                {properties.map((p) => (
                  <div className="col-sm-6 col-lg-4" key={p._id || p.id}>
                    <PropertyCard property={p} />
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
