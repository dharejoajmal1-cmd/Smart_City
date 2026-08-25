import { useState } from "react";
import useAuth from "../../hooks/useAuth";
import useToast from "../../hooks/useToast";
import useFetch from "../../hooks/useFetch";
import Loader from "../../components/common/Loader";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import propertyService from "../../api/propertyService";
import { formatPKR } from "../../utils/formatters";

// These options MUST match the backend Property model's enums exactly
// (backend/models/Property.js) — sending anything else fails the
// controller's validation with a 400 error.
const TYPE_OPTIONS = [
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "plot", label: "Plot" },
  { value: "commercial", label: "Commercial" },
  { value: "farmhouse", label: "Farmhouse" },
  { value: "office", label: "Office" },
];
const PURPOSE_OPTIONS = [
  { value: "sale", label: "For Sale" },
  { value: "rent", label: "For Rent" },
];
const STATUS_OPTIONS = ["available", "pending", "sold", "rented"];

const emptyForm = {
  title: "",
  description: "",
  city: "Jamshoro",
  location: "",
  price: "",
  purpose: "sale",
  type: "house",
  bedrooms: "",
  bathrooms: "",
  area: "",
  status: "available",
  featured: false,
  images: [], // File[] — new images to upload (field name must be "images" for Multer)
};

export default function MyProperties() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  // The backend has no "owner"-scoped filter — property listing/creation is
  // admin-only, and admins manage the full catalogue, so this fetches
  // everything rather than filtering by an `owner` param the API doesn't
  // support (that used to silently return the FULL unfiltered list anyway,
  // since unknown query params are ignored).
  const { data, loading, refetch } = useFetch(
    () => propertyService.getAll({ limit: 50, sort: "newest" }),
    []
  );
  const properties = data?.data?.properties || data?.properties || (Array.isArray(data?.data) ? data.data : []);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (property) => {
    setEditing(property);
    setForm({
      title: property.title || "",
      description: property.description || "",
      city: property.city || "Jamshoro",
      location: property.location || "",
      price: property.price ?? "",
      purpose: property.purpose || "sale",
      type: property.type || "house",
      bedrooms: property.bedrooms ?? "",
      bathrooms: property.bathrooms ?? "",
      area: property.area || "",
      status: property.status || "available",
      featured: Boolean(property.featured),
      images: [],
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      setForm((f) => ({ ...f, images: Array.from(files || []) }));
    } else if (type === "checkbox") {
      setForm((f) => ({ ...f, [name]: checked }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.description || !form.location || !form.price || !form.area) {
      toast.error("Please fill in title, description, location, price, and area.");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("city", form.city || "Jamshoro");
      formData.append("location", form.location);
      formData.append("price", form.price);
      formData.append("purpose", form.purpose);
      formData.append("type", form.type);
      formData.append("bedrooms", form.bedrooms || 0);
      formData.append("bathrooms", form.bathrooms || 0);
      formData.append("area", form.area);
      formData.append("status", form.status);
      formData.append("featured", form.featured ? "true" : "false");
      // Multer is configured as upload.array('images', 10) on the backend
      // (backend/routes/propertyRoutes.js) — the field name below must be
      // exactly "images" (plural) or the upload middleware rejects the
      // request before it ever reaches the controller.
      form.images.forEach((file) => formData.append("images", file));

      if (editing) {
        await propertyService.update(editing._id || editing.id, formData);
        toast.success("Property updated successfully.");
      } else {
        await propertyService.create(formData);
        toast.success("Property listed successfully.");
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.friendlyMessage || "Could not save this property.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this property listing? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await propertyService.remove(id);
      toast.success("Property removed.");
      refetch();
    } catch (err) {
      toast.error(err.friendlyMessage || "Could not remove this property.");
    } finally {
      setDeletingId(null);
    }
  };

  const typeLabel = (value) => TYPE_OPTIONS.find((t) => t.value === value)?.label || value;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h1 className="h4 fw-bold mb-0">{isAdmin ? "Manage Properties" : "My Properties"}</h1>
        {isAdmin && (
          <Button icon="bi bi-plus-lg" onClick={openCreate}>
            Add Property
          </Button>
        )}
      </div>

      {loading ? (
        <Loader label="Loading listings…" />
      ) : properties.length === 0 ? (
        <div className="scj-card p-5 text-center">
          <i className="bi bi-houses fs-1 text-scj-gold mb-3 d-block" />
          <p className="text-muted mb-3">No properties listed yet.</p>
          {isAdmin && <Button onClick={openCreate}>List Your First Property</Button>}
        </div>
      ) : (
        <div className="scj-card p-0 overflow-hidden">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p) => (
                  <tr key={p._id || p.id}>
                    <td>
                      <img
                        src={p.images?.[0]?.url || "/property-placeholder.svg"}
                        alt={p.title}
                        style={{ width: 56, height: 40, objectFit: "cover", borderRadius: 6 }}
                        onError={(e) => { e.currentTarget.src = "/property-placeholder.svg"; }}
                      />
                    </td>
                    <td className="fw-semibold">{p.title}</td>
                    <td>{typeLabel(p.type)}</td>
                    <td>{formatPKR(p.price)}</td>
                    <td>
                      <span className="badge bg-secondary text-capitalize">{p.status || "available"}</span>
                    </td>
                    <td>
                      {p.featured ? (
                        <span className="badge" style={{ background: "var(--scj-gradient-gold)", color: "var(--scj-primary-dark)" }}>
                          <i className="bi bi-star-fill me-1" />Featured
                        </span>
                      ) : (
                        <span className="text-muted small">—</span>
                      )}
                    </td>
                    <td className="text-end">
                      {isAdmin && (
                        <>
                          <button className="btn btn-sm btn-scj-outline me-2" onClick={() => openEdit(p)}>
                            <i className="bi bi-pencil" />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(p._id || p.id)}
                            disabled={deletingId === (p._id || p.id)}
                          >
                            <i className="bi bi-trash" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editing ? "Edit Property" : "Add Property"}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label small fw-semibold">Title</label>
              <input name="title" className="form-control" value={form.title} onChange={handleChange} required />
            </div>
            <div className="col-12">
              <label className="form-label small fw-semibold">Description</label>
              <textarea name="description" rows={3} className="form-control" value={form.description} onChange={handleChange} required />
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Type</label>
              <select name="type" className="form-select" value={form.type} onChange={handleChange}>
                {TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Purpose</label>
              <select name="purpose" className="form-select" value={form.purpose} onChange={handleChange}>
                {PURPOSE_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Status</label>
              <select name="status" className="form-select" value={form.status} onChange={handleChange}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s} className="text-capitalize">{s}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Price (PKR)</label>
              <input name="price" type="number" min="0" className="form-control" value={form.price} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">City</label>
              <input name="city" className="form-control" value={form.city} onChange={handleChange} />
            </div>
            <div className="col-12">
              <label className="form-label small fw-semibold">Location / Address</label>
              <input name="location" className="form-control" value={form.location} onChange={handleChange} required />
            </div>
            <div className="col-4">
              <label className="form-label small fw-semibold">Bedrooms</label>
              <input name="bedrooms" type="number" min="0" className="form-control" value={form.bedrooms} onChange={handleChange} />
            </div>
            <div className="col-4">
              <label className="form-label small fw-semibold">Bathrooms</label>
              <input name="bathrooms" type="number" min="0" className="form-control" value={form.bathrooms} onChange={handleChange} />
            </div>
            <div className="col-4">
              <label className="form-label small fw-semibold">Area</label>
              <input name="area" placeholder="e.g. 5 Marla" className="form-control" value={form.area} onChange={handleChange} required />
            </div>
            <div className="col-12">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="featured-check"
                  name="featured"
                  checked={form.featured}
                  onChange={handleChange}
                />
                <label className="form-check-label small fw-semibold" htmlFor="featured-check">
                  Show in "Featured Properties" on the home page
                </label>
              </div>
            </div>
            <div className="col-12">
              <label className="form-label small fw-semibold">Images</label>
              <input name="images" type="file" accept="image/*" multiple className="form-control" onChange={handleChange} />
              <div className="form-text">
                Uploaded to Cloudinary. {editing ? "New images are added to the existing gallery." : "You can select multiple images."}
              </div>
              {editing && editing.images?.length > 0 && (
                <div className="d-flex gap-2 mt-2 flex-wrap">
                  {editing.images.map((img) => (
                    <img key={img.publicId || img.url} src={img.url} alt="" style={{ width: 56, height: 44, objectFit: "cover", borderRadius: 6 }} />
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editing ? "Save Changes" : "Publish Listing"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
