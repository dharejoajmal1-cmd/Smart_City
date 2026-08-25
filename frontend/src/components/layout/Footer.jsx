import { Link } from "react-router-dom";
import BrandLogo from "../common/BrandLogo";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: "var(--scj-gradient-hero)" }} className="text-white pt-5 pb-4 mt-auto">
      <div className="container">
        <div className="row g-4">
          <div className="col-12 col-md-4">
            <div className="mb-3">
              <BrandLogo light />
            </div>
            <p className="text-white-50 mb-0">
              A master-planned city offering premium residential and commercial plots, homes and
              farmhouses — built for a modern, sustainable lifestyle.
            </p>
          </div>

          <div className="col-6 col-md-2">
            <h4 className="fs-6 fw-bold text-scj-gold mb-3">Explore</h4>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li><Link to="/" className="text-white-50">Home</Link></li>
              <li><Link to="/properties" className="text-white-50">Properties</Link></li>
              <li><Link to="/about" className="text-white-50">About Us</Link></li>
              <li><Link to="/contact" className="text-white-50">Contact</Link></li>
            </ul>
          </div>

          <div className="col-6 col-md-3">
            <h4 className="fs-6 fw-bold text-scj-gold mb-3">Account</h4>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li><Link to="/login" className="text-white-50">Login</Link></li>
              <li><Link to="/register" className="text-white-50">Register</Link></li>
              <li><Link to="/dashboard" className="text-white-50">Dashboard</Link></li>
              <li><Link to="/dashboard/saved" className="text-white-50">Saved Properties</Link></li>
            </ul>
          </div>

          <div className="col-12 col-md-3">
            <h4 className="fs-6 fw-bold text-scj-gold mb-3">Contact</h4>
            <ul className="list-unstyled d-flex flex-column gap-2 text-white-50">
              <li className="d-flex gap-2"><i className="bi bi-geo-alt mt-1" /> F7VC+RXR, Jamshoro, Sindh, Pakistan</li>
              <li className="d-flex gap-2"><i className="bi bi-telephone mt-1" /> 0334 3238514 · 0341 2490832</li>
              <li className="d-flex gap-2"><i className="bi bi-envelope mt-1" /> smartcityjamshoro@gmail.com</li>
            </ul>
          </div>
        </div>

        <hr className="border-white border-opacity-25 my-4" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 small text-white-50">
          <span>© {year} Smart City Jamshoro. All rights reserved.</span>
          <span>Designed with a premium green &amp; gold identity.</span>
        </div>
      </div>
    </footer>
  );
}
