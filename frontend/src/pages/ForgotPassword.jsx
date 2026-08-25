import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import authService from '../api/authService';
import useToast from '../hooks/useToast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState('');
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await authService.forgotPassword(email);
      const l = r.data?.data?.resetLink;
      if (l) setDevLink(l);
      setSent(true);
      toast.success('If an account exists for that email, a reset link has been sent.');
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not process the request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="scj-section">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5">
            <div className="scj-card p-4 p-md-5">
              <h1 className="h3 fw-bold mb-2">Forgot Password</h1>
              <p className="text-muted">
                Enter your account email to request a password reset.
              </p>

              {!sent ? (
                <form onSubmit={submit}>
                  <input
                    className="form-control mb-3"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    autoFocus
                  />
                  <Button className="w-100" type="submit" loading={loading}>
                    Send Reset Link
                  </Button>
                </form>
              ) : (
                <div className="alert alert-success small mb-0">
                  <i className="bi bi-envelope-check me-2" />
                  If an account exists for <strong>{email}</strong>, we've sent a
                  password reset link to that inbox. The link expires in 15
                  minutes. Please check your spam folder if you don't see it.
                </div>
              )}

              {devLink && (
                <div className="alert alert-warning mt-3 small">
                  <strong>Development mode reset link:</strong>
                  <br />
                  <a href={devLink}>{devLink}</a>
                </div>
              )}

              <p className="text-center mt-3 mb-0">
                <Link to="/login">Back to Login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
