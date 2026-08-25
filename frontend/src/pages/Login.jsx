import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import useAuth from "../hooks/useAuth";
import useToast from "../hooks/useToast";
import { validateLoginForm } from "../utils/validators";

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateLoginForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    setSubmitting(true);
    try {
      await login(form);
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.friendlyMessage || "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="scj-section" style={{ background: "var(--scj-bg)" }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-5">
            <div className="scj-card p-4 p-md-5">
              <div className="text-center mb-4">
                <span
                  className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                  style={{ width: 56, height: 56, background: "var(--scj-gradient-hero)" }}
                >
                  <i className="bi bi-building text-white fs-4" />
                </span>
                <h1 className="h4 font-display fw-bold">Welcome Back</h1>
                <p className="text-muted small mb-0">Log in to manage your properties and inquiries.</p>
              </div>

              

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label htmlFor="login-email" className="form-label small fw-semibold">Email Address</label>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className={`form-control ${errors.email ? "is-invalid" : ""}`}
                    value={form.email}
                    onChange={handleChange}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="login-password" className="form-label small fw-semibold">Password</label>
                  <div className="input-group">
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      className={`form-control ${errors.password ? "is-invalid" : ""}`}
                      value={form.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
                    </button>
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                  </div>
                </div>

                <Button type="submit" className="w-100 mb-3" loading={submitting}>
                  Log In
                </Button>

                <div className="text-end mb-3"><Link to="/forgot-password" className="small">Forgot Password?</Link></div>

                <p className="text-center small text-muted mb-0">
                  Don't have an account? <Link to="/register">Create one</Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
