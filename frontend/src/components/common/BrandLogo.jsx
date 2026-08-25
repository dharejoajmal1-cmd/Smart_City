import { Link } from "react-router-dom";

export default function BrandLogo({ to = "/", light = false, compact = false, className = "" }) {
  return (
    <Link
      to={to}
      className={`scj-brand-logo ${light ? "scj-brand-logo--light" : ""} ${compact ? "scj-brand-logo--compact" : ""} ${className}`}
      aria-label="Smart City Jamshoro home"
    >
      <svg className="scj-brand-logo__mark" viewBox="0 0 96 96" role="img" aria-hidden="true">
        <defs>
          <linearGradient id="scjLogoGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#d9bd7a" />
            <stop offset="0.5" stopColor="#b08d3e" />
            <stop offset="1" stopColor="#7d5f22" />
          </linearGradient>
        </defs>
        <circle cx="48" cy="48" r="44" fill="currentColor" opacity="0.98" />
        <path d="M18 58 48 34l30 24-6 3-24-18-24 18z" fill="url(#scjLogoGold)" />
        <path d="M26 56V40h9v12h5V34h9v18h5V28h9v24h7v8H26z" fill="#fff" opacity="0.96" />
        <path d="M39 56h18v18H39z" fill="#fff" />
        <path d="M48 58v16" stroke="#b08d3e" strokeWidth="3" />
        <path d="M40 65h16" stroke="#b08d3e" strokeWidth="3" />
        <path d="M14 67c10 12 22 18 34 18s24-6 34-18" fill="none" stroke="url(#scjLogoGold)" strokeWidth="4" strokeLinecap="round" />
      </svg>
      {!compact && (
        <span className="scj-brand-logo__text">
          <span className="scj-brand-logo__name">SMART CITY</span>
          <span className="scj-brand-logo__city">JAMSHORO</span>
        </span>
      )}
    </Link>
  );
}
