import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import useAuth from "../hooks/useAuth";
import useToast from "../hooks/useToast";
import { validateRegisterForm } from "../utils/validators";

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateRegisterForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    setSubmitting(true);
    try {
      const { confirmPassword: _confirmPassword, ...payload } = form;
      const result = await register(payload);
      toast.success("Account created successfully.");
      navigate(result ? "/dashboard" : "/login");
    } catch (err) {
      toast.error(err.friendlyMessage || "Could not create your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="scj-section" style={{ background: "var(--scj-bg)" }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="scj-card p-4 p-md-5">
              <div className="text-center mb-4">
                <span
                  className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                  style={{ width: 56, height: 56, background: "var(--scj-gradient-hero)" }}
                >
                  <i className="bi bi-person-plus text-white fs-4" />
                </span>
                <h1 className="h4 font-display fw-bold">Create Your Account</h1>
                <p className="text-muted small mb-0">Save properties, send inquiries, and track your journey.</p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="reg-name" className="form-label small fw-semibold">Full Name</label>
                    <input
                      id="reg-name"
                      name="name"
                      className={`form-control ${errors.name ? "is-invalid" : ""}`}
                      value={form.name}
                      onChange={handleChange}
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="reg-phone" className="form-label small fw-semibold">Phone Number</label>
                    <input
                      id="reg-phone"
                      name="phone"
                      className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                      value={form.phone}
                      onChange={handleChange}
                    />
                    {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                  </div>
                  <div className="col-12">
                    <label htmlFor="reg-email" className="form-label small fw-semibold">Email Address</label>
                    <input
                      id="reg-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className={`form-control ${errors.email ? "is-invalid" : ""}`}
                      value={form.email}
                      onChange={handleChange}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="reg-password" className="form-label small fw-semibold">Password</label>
                    <input
                      id="reg-password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      className={`form-control ${errors.password ? "is-invalid" : ""}`}
                      value={form.password}
                      onChange={handleChange}
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="reg-confirm" className="form-label small fw-semibold">Confirm Password</label>
                    <input
                      id="reg-confirm"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                      value={form.confirmPassword}
                      onChange={handleChange}
                    />
                    {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                  </div>
                </div>

                <Button type="submit" className="w-100 mt-4 mb-3" loading={submitting}>
                  Create Account
                </Button>

                <p className="text-center small text-muted mb-0">
                  Already have an account? <Link to="/login">Log in</Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
