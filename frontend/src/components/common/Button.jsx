/**
 * Reusable button. variant: "primary" | "gold" | "outline" | "link"
 */
export default function Button({
  children,
  variant = "primary",
  type = "button",
  loading = false,
  disabled = false,
  className = "",
  icon = null,
  ...rest
}) {
  const variantClass =
    variant === "gold"
      ? "btn-scj-gold"
      : variant === "outline"
      ? "btn-scj-outline"
      : variant === "link"
      ? "btn btn-link text-scj-primary p-0"
      : "btn-scj-primary";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`btn ${variantClass} d-inline-flex align-items-center justify-content-center gap-2 ${className}`}
      {...rest}
    >
      {loading && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />}
      {!loading && icon && <i className={icon} aria-hidden="true" />}
      {children}
    </button>
  );
}
