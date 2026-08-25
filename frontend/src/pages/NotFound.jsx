import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="scj-section text-center" style={{ minHeight: "70vh" }}>
      <div className="container">
        <div className="font-display fw-bold text-scj-gold" style={{ fontSize: "6rem", lineHeight: 1 }}>
          404
        </div>
        <h1 className="h3 fw-bold mt-3">This page doesn't exist</h1>
        <p className="text-muted mb-4">
          The page you're looking for may have been moved or the link is incorrect.
        </p>
        <Link to="/" className="btn btn-scj-primary">
          <i className="bi bi-house-door me-2" />
          Back to Home
        </Link>
      </div>
    </section>
  );
}
