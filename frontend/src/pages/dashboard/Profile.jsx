import { useState } from "react";
import useAuth from "../../hooks/useAuth";
import useToast from "../../hooks/useToast";
import Button from "../../components/common/Button";
import authService from "../../api/authService";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authService.updateProfile(form);
      const updated = res.data?.data?.user || res.data?.user || res.data?.data;
      updateUser(updated || form);
      toast.success("Profile updated successfully.");
    } catch (err) {
      toast.error(err.friendlyMessage || "Could not update your profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="h4 fw-bold mb-4">My Profile</h1>
      <div className="scj-card p-4 p-md-5" style={{ maxWidth: 640 }}>
        <div className="d-flex align-items-center gap-3 mb-4">
          {user?.avatar ? <img src={user.avatar} alt="Profile" className="rounded-circle object-fit-cover" style={{width:72,height:72}} /> : <div className="rounded-circle d-flex align-items-center justify-content-center bg-light" style={{width:72,height:72}}><i className="bi bi-person fs-2" /></div>}
          <div><div className="fw-bold">Profile Picture</div><input type="file" accept="image/png,image/jpeg,image/webp" className="form-control form-control-sm mt-2" disabled={avatarUploading} onChange={async e=>{const file=e.target.files?.[0];if(!file)return;const fd=new FormData();fd.append("avatar",file);setAvatarUploading(true);try{const r=await authService.uploadAvatar(fd);const u=r.data?.data?.user||r.data?.user;updateUser(u);toast.success("Profile picture updated.");}catch(err){toast.error(err.friendlyMessage||"Could not upload profile picture.");}finally{setAvatarUploading(false);}}} /></div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="p-name" className="form-label small fw-semibold">Full Name</label>
            <input id="p-name" name="name" className="form-control" value={form.name} onChange={handleChange} />
          </div>
          <div className="mb-3">
            <label htmlFor="p-email" className="form-label small fw-semibold">Email Address</label>
            <input id="p-email" name="email" type="email" className="form-control" value={form.email} onChange={handleChange} />
          </div>
          <div className="mb-4">
            <label htmlFor="p-phone" className="form-label small fw-semibold">Phone Number</label>
            <input id="p-phone" name="phone" className="form-control" value={form.phone} onChange={handleChange} />
          </div>
          <Button type="submit" loading={saving}>
            Save Changes
          </Button>
        </form>
      </div>
    </div>
  );
}
