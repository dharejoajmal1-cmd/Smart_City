import { useState } from "react";
import Breadcrumb from "../components/common/Breadcrumb";
import Button from "../components/common/Button";
import useAuth from "../hooks/useAuth";
import useToast from "../hooks/useToast";
import contactService from "../api/contactService";
import propertyService from "../api/propertyService";
import useFetch from "../hooks/useFetch";
import { validateInquiryForm } from "../utils/validators";

export default function Contact() {
  const { user } = useAuth();
  const toast = useToast();
  const { data: propertiesData } = useFetch(() => propertyService.getAll({ limit: 100 }), []);
  const properties = propertiesData?.data?.properties || propertiesData?.properties || (Array.isArray(propertiesData?.data) ? propertiesData.data : []);

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    message: "",
    property: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateInquiryForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    setSubmitting(true);
    try {
      await contactService.create(form);
      toast.success("Thanks for reaching out — we'll get back to you shortly.");
      setForm({ name: user?.name || "", email: user?.email || "", phone: "", message: "", property: "" });
    } catch (err) {
      toast.error(err.friendlyMessage || "Could not send your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // WhatsApp click-to-chat: opens the user's WhatsApp with the form's
  // current contents pre-filled, addressed to the business number. This is
  // a client-side deep link (wa.me), NOT an automatic server-side send —
  // no WhatsApp Business API is configured in this project, so we don't
  // pretend messages are delivered without the user tapping "Send" in
  // WhatsApp themselves.
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER;
  const handleWhatsapp = () => {
    if (!whatsappNumber) {
      toast.error("WhatsApp contact is not configured for this site yet.");
      return;
    }
    const selectedProperty = properties.find((p) => (p._id || p.id) === form.property);
    const lines = [
      `Hi, my name is ${form.name || "[name]"}.`,
      selectedProperty ? `I'm interested in: ${selectedProperty.title}` : null,
      form.phone ? `My phone number: ${form.phone}` : null,
      form.message ? `Message: ${form.message}` : null,
    ].filter(Boolean);
    const text = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <section className="py-4 border-bottom bg-white">
        <div className="container">
          <Breadcrumb items={[{ label: "Contact" }]} />
        </div>
      </section>

      <section className="scj-section">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-5">
              <span className="scj-eyebrow">Get in touch</span>
              <h1 className="font-display fw-bold mt-2 mb-3">We'd Love to Hear From You</h1>
              <p className="text-muted mb-4">
                Whether you're booking a plot, planning a visit, or just have a question — our team
                is here to help.
              </p>

              <ul className="list-unstyled d-flex flex-column gap-3">
                <li className="d-flex gap-3">
                  <i className="bi bi-geo-alt fs-4 text-scj-gold" />
                  <div>
                    <div className="fw-semibold">Head Office</div>
                    <div className="text-muted small">F7VC+RXR, Jamshoro, Sindh, Pakistan</div>
                  </div>
                </li>
                <li className="d-flex gap-3">
                  <i className="bi bi-telephone fs-4 text-scj-gold" />
                  <div>
                    <div className="fw-semibold">Call Us</div>
                    <div className="text-muted small">0334 3238514</div><div className="text-muted small">0341 2490832</div>
                  </div>
                </li>
                <li className="d-flex gap-3">
                  <i className="bi bi-envelope fs-4 text-scj-gold" />
                  <div>
                    <div className="fw-semibold">Email Us</div>
                    <div className="text-muted small">smartcityjamshoro@gmail.com</div>
                  </div>
                </li>
                <li className="d-flex gap-3">
                  <i className="bi bi-clock fs-4 text-scj-gold" />
                  <div>
                    <div className="fw-semibold">Office Hours</div>
                    <div className="text-muted small">Mon – Sat, 9:00 AM – 6:00 PM</div>
                  </div>
                </li>
              </ul>
            </div>

            <div className="col-lg-7">
              <div className="scj-card p-4 p-md-5">
                <h2 className="h5 fw-bold mb-4">Send a Message</h2>
                <form onSubmit={handleSubmit} noValidate>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="c-name" className="form-label small fw-semibold">Full Name</label>
                      <input
                        id="c-name"
                        name="name"
                        className={`form-control ${errors.name ? "is-invalid" : ""}`}
                        value={form.name}
                        onChange={handleChange}
                      />
                      {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="c-email" className="form-label small fw-semibold">Email Address</label>
                      <input
                        id="c-email"
                        name="email"
                        type="email"
                        className={`form-control ${errors.email ? "is-invalid" : ""}`}
                        value={form.email}
                        onChange={handleChange}
                      />
                      {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>
                    <div className="col-12">
                      <label htmlFor="c-property" className="form-label small fw-semibold">Property of Interest (optional)</label>
                      <select id="c-property" name="property" className={`form-select ${errors.property ? "is-invalid" : ""}`} value={form.property} onChange={handleChange}>
                        <option value="">Select a property</option>
                        {properties.map((property) => <option key={property._id || property.id} value={property._id || property.id}>{property.title}</option>)}
                      </select>
                      {errors.property && <div className="invalid-feedback">{errors.property}</div>}
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="c-phone" className="form-label small fw-semibold">Phone Number</label>
                      <input
                        id="c-phone"
                        name="phone"
                        className="form-control"
                        value={form.phone}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-12">
                      <label htmlFor="c-message" className="form-label small fw-semibold">Message</label>
                      <textarea
                        id="c-message"
                        name="message"
                        rows={5}
                        className={`form-control ${errors.message ? "is-invalid" : ""}`}
                        value={form.message}
                        onChange={handleChange}
                      />
                      {errors.message && <div className="invalid-feedback">{errors.message}</div>}
                    </div>
                    <div className="col-12">
                      <Button type="submit" loading={submitting}>
                        Send Message
                      </Button>
                    </div>
                    <div className="col-12">
                      <button
                        type="button"
                        className="btn btn-outline-success w-100 d-flex align-items-center justify-content-center gap-2"
                        onClick={handleWhatsapp}
                      >
                        <i className="bi bi-whatsapp" />
                        Continue on WhatsApp instead
                      </button>
                      <p className="text-muted small mt-2 mb-0">
                        Opens WhatsApp with your details pre-filled so you can send it directly — this doesn't
                        replace the form above, it's just a faster way to reach us if you prefer chatting.
                      </p>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-5">
        <div className="container">
          <div className="ratio ratio-21x9 scj-card overflow-hidden">
            <iframe
              title="Smart City Jamshoro office location"
              src="https://www.google.com/maps?q=F7VC%2BRXR%2C%20Jamshoro%2C%20Sindh%2C%20Pakistan&output=embed&z=15&hl=en"
              loading="lazy"
              style={{ border: 0 }}
              allowFullScreen
            />
          </div>
        </div>
      </section>
    </>
  );
}
