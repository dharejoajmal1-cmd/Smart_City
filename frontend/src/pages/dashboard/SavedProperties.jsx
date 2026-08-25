import { useState } from "react";
import PropertyCard from "../../components/property/PropertyCard";
import Loader from "../../components/common/Loader";
import useFetch from "../../hooks/useFetch";
import propertyService from "../../api/propertyService";

// Saved properties are tracked client-side by id in localStorage, since the
// documented API does not expose a dedicated saved-properties endpoint.
// If the backend adds one (e.g. GET /users/saved), swap this hook's source.
function useSavedIds() {
  const [ids, setIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("scj_saved") || "[]");
    } catch {
      return [];
    }
  });

  const toggle = (id) => {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem("scj_saved", JSON.stringify(next));
      return next;
    });
  };

  return { ids, toggle };
}

export default function SavedProperties() {
  const { ids, toggle } = useSavedIds();
  const { data, loading } = useFetch(() => propertyService.getAll({ limit: 100 }), []);

  const all = data?.data?.properties || data?.properties || (Array.isArray(data?.data) ? data.data : []);
  const saved = all.filter((p) => ids.includes(p._id || p.id));

  return (
    <div>
      <h1 className="h4 fw-bold mb-4">Saved Properties</h1>

      {loading ? (
        <Loader label="Loading saved properties…" />
      ) : saved.length === 0 ? (
        <div className="scj-card p-5 text-center">
          <i className="bi bi-heart fs-1 text-scj-gold mb-3 d-block" />
          <p className="text-muted mb-0">
            You haven't saved any properties yet. Tap the heart icon on a listing to save it here.
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {saved.map((p) => (
            <div className="col-sm-6 col-lg-4" key={p._id || p.id}>
              <PropertyCard property={p} saved onToggleSave={(prop) => toggle(prop._id || prop.id)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
