export default function Spinner({ size = "sm", className = "" }) {
  const dimension = size === "lg" ? "2rem" : size === "md" ? "1.4rem" : "1rem";
  return (
    <span
      className={`spinner-border text-scj-primary ${className}`}
      style={{ width: dimension, height: dimension, borderWidth: "2px" }}
      role="status"
      aria-hidden="true"
    />
  );
}
