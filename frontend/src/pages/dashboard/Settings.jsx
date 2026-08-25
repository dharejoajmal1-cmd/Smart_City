import { useState } from "react";
import Button from "../../components/common/Button";
import useToast from "../../hooks/useToast";
import authService from "../../api/authService";

export default function Settings() {
  const toast = useToast();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      await authService.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success("Password updated successfully.");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.friendlyMessage || "Could not update your password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="h4 fw-bold mb-4">Settings</h1>
      <div className="scj-card p-4 p-md-5" style={{ maxWidth: 560 }}>
        <h2 className="h6 fw-bold mb-3">Change Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="s-current" className="form-label small fw-semibold">Current Password</label>
            <input
              id="s-current"
              name="currentPassword"
              type="password"
              className="form-control"
              value={form.currentPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="s-new" className="form-label small fw-semibold">New Password</label>
            <input
              id="s-new"
              name="newPassword"
              type="password"
              className="form-control"
              value={form.newPassword}
              onChange={handleChange}
              required
              minLength={8}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="s-confirm" className="form-label small fw-semibold">Confirm New Password</label>
            <input
              id="s-confirm"
              name="confirmPassword"
              type="password"
              className="form-control"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <Button type="submit" loading={saving}>
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
}
