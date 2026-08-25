const ICONS = {
  success: "bi-check-circle-fill",
  danger: "bi-exclamation-triangle-fill",
  info: "bi-info-circle-fill",
};

export default function Toast({ message, variant = "success", onClose }) {
  return (
    <div
      className={`toast show align-items-center border-0 mb-2 shadow-lg text-white bg-${
        variant === "success" ? "success" : variant === "danger" ? "danger" : "primary"
      }`}
      role="alert"
    >
      <div className="d-flex">
        <div className="toast-body d-flex align-items-center gap-2">
          <i className={`bi ${ICONS[variant] || ICONS.success}`} aria-hidden="true" />
          {message}
        </div>
        <button
          type="button"
          className="btn-close btn-close-white me-2 m-auto"
          aria-label="Close notification"
          onClick={onClose}
        />
      </div>
    </div>
  );
}
