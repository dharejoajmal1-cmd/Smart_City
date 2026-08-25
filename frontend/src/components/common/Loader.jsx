export default function Loader({ label = "Loading…", fullPage = false }) {
  return (
    <div
      className={`d-flex flex-column align-items-center justify-content-center gap-3 ${
        fullPage ? "" : "py-5"
      }`}
      style={fullPage ? { minHeight: "70vh" } : undefined}
      role="status"
      aria-live="polite"
    >
      <div className="spinner-border text-scj-primary" style={{ width: "3rem", height: "3rem" }} />
      <span className="text-muted small">{label}</span>
    </div>
  );
}
