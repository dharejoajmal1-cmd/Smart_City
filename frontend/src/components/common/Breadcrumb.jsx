import { Link } from "react-router-dom";

export default function Breadcrumb({ items = [] }) {
  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb mb-0">
        <li className="breadcrumb-item">
          <Link to="/" className="text-scj-primary">
            Home
          </Link>
        </li>
        {items.map((item, idx) => (
          <li
            key={item.label}
            className={`breadcrumb-item ${idx === items.length - 1 ? "active text-muted" : ""}`}
            aria-current={idx === items.length - 1 ? "page" : undefined}
          >
            {item.to && idx !== items.length - 1 ? (
              <Link to={item.to} className="text-scj-primary">
                {item.label}
              </Link>
            ) : (
              item.label
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
