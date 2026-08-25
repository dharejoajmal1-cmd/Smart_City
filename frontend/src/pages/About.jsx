import Breadcrumb from "../components/common/Breadcrumb";

const VALUES = [
  { icon: "bi-bullseye", title: "Our Mission", text: "To build a sustainable, master-planned city that offers families and investors a trusted place to grow." },
  { icon: "bi-eye", title: "Our Vision", text: "To become the most livable planned city in Sindh, blending modern infrastructure with green living." },
  { icon: "bi-heart", title: "Our Values", text: "Transparency, quality construction and long-term relationships with every family we serve." },
];

const TEAM = [
  { name: "Sajid Ahmed Dehraj", role: "Project Team", phone: "0334 3238514" },
  { name: "Ahsan Ali Dehraj", role: "Project Team", phone: "0341 2490832" },
];

export default function About() {
  return (
    <>
      <section className="py-4 border-bottom bg-white">
        <div className="container">
          <Breadcrumb items={[{ label: "About" }]} />
        </div>
      </section>

      <section className="py-4 bg-white border-bottom"><div className="container"><div className="row g-3 text-center"><div className="col-6 col-md-3"><div className="scj-card p-3 h-100"><div className="h3 fw-bold text-scj-primary mb-1">14</div><div className="small text-muted">Acres</div></div></div><div className="col-6 col-md-3"><div className="scj-card p-3 h-100"><div className="h3 fw-bold text-scj-primary mb-1">180</div><div className="small text-muted">Plots</div></div></div><div className="col-6 col-md-3"><div className="scj-card p-3 h-100"><div className="h3 fw-bold text-scj-primary mb-1">150 Sq.Yds</div><div className="small text-muted">Residential minimum</div></div></div><div className="col-6 col-md-3"><div className="scj-card p-3 h-100"><div className="h3 fw-bold text-scj-primary mb-1">250 Sq.Yds</div><div className="small text-muted">Commercial maximum</div></div></div></div></div></section>

      <section className="scj-section text-white" style={{ background: "var(--scj-gradient-hero)" }}>
        <div className="container text-center">
          <span className="scj-eyebrow">About Us</span>
          <h1 className="font-display fw-bold display-5 mt-2">Building Jamshoro's Future, Together</h1>
          <p className="text-white-50 mx-auto" style={{ maxWidth: 640 }}>
            Smart City Jamshoro is a master-planned development combining premium plots, homes and
            commercial spaces with parks, schools and modern infrastructure.
          </p>
        </div>
      </section>

      <section className="scj-section bg-white">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <img
                src="/about-placeholder.svg"
                alt="Aerial view illustration of Smart City Jamshoro"
                className="img-fluid rounded-4 shadow"
              />
            </div>
            <div className="col-lg-6">
              <span className="scj-eyebrow">Our Story</span>
              <h2 className="font-display fw-bold mt-2 mb-3">A City Planned With Purpose</h2>
              <p className="text-muted">
                Smart City Jamshoro is presented through this digital property platform to make property discovery simple, visual and accessible. Buyers can browse categories, compare listings, save favourites, send inquiries and use the AI assistant for quick guidance.
              </p>
              <p className="text-muted mb-0">
                Project information, listing availability and final documentation should always be confirmed with the project team before a purchase decision.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="scj-section">
        <div className="container">
          <div className="row g-4">
            {VALUES.map((v) => (
              <div className="col-md-4" key={v.title}>
                <div className="scj-card p-4 h-100 text-center">
                  <i className={`bi ${v.icon} fs-1 text-scj-gold mb-3`} />
                  <h3 className="h5 fw-bold">{v.title}</h3>
                  <p className="text-muted small mb-0">{v.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="scj-section scj-team-section text-white">
        <div className="scj-team-overlay" />
        <div className="container position-relative">
          <div className="text-center mb-5">
            <span className="scj-eyebrow scj-eyebrow--light">Leadership</span>
            <h2 className="font-display fw-bold mt-2">Meet the Team</h2>
            <div className="scj-divider-gold mx-auto mt-3" />
          </div>
          <div className="row g-4 justify-content-center">
            {TEAM.map((member) => (
              <div className="col-sm-6 col-lg-4" key={member.name}>
                <div className="scj-card p-4 text-center h-100">
                  <div
                    className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center text-white fw-bold fs-4"
                    style={{ width: 72, height: 72, background: "var(--scj-gradient-hero)" }}
                  >
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <h3 className="h6 fw-bold mb-0">{member.name}</h3>
                  <p className="text-muted small mb-2">{member.role}</p>
                  <a href={`tel:${member.phone.replace(/\s/g, "")}`} className="small text-white fw-semibold"><i className="bi bi-telephone me-1" />{member.phone}</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="scj-section">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <span className="scj-eyebrow">Project location</span>
              <h2 className="font-display fw-bold mt-2 mb-3">Find Smart City Jamshoro</h2>
              <p className="text-muted mb-3">Plus Code: <strong>F7VC+RXR</strong>, Jamshoro, Sindh, Pakistan.</p>
              <a className="btn btn-scj-primary" href="https://www.google.com/maps/search/?api=1&query=F7VC%2BRXR%2C%20Jamshoro%2C%20Sindh%2C%20Pakistan" target="_blank" rel="noreferrer"><i className="bi bi-map me-2" />Open in Google Maps</a>
            </div>
            <div className="col-lg-5">
              <div className="scj-card overflow-hidden">
                <iframe title="Smart City Jamshoro project location" src="https://www.google.com/maps?q=F7VC%2BRXR%2C%20Jamshoro%2C%20Sindh%2C%20Pakistan&output=embed&z=15&hl=en" loading="lazy" style={{ border: 0, width: "100%", minHeight: 280 }} allowFullScreen />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
