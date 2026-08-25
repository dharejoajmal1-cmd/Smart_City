import useToast from "../../hooks/useToast";
import useFetch from "../../hooks/useFetch";
import Loader from "../../components/common/Loader";
import userService from "../../api/userService";
import { formatDate, initials } from "../../utils/formatters";

const ROLES = ["user", "agent"];

export default function Users() {
  const toast = useToast();
  const { data, loading, refetch } = useFetch(() => userService.getAll(), []);
  const users = data?.data?.users || data?.users || (Array.isArray(data?.data) ? data.data : []);

  const handleRoleChange = async (id, role) => {
    try {
      await userService.updateRole(id, role);
      toast.success("User role updated.");
      refetch();
    } catch (err) {
      toast.error(err.friendlyMessage || "Could not update this user's role.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this user? This cannot be undone.")) return;
    try {
      await userService.remove(id);
      toast.success("User removed.");
      refetch();
    } catch (err) {
      toast.error(err.friendlyMessage || "Could not remove this user.");
    }
  };

  return (
    <div>
      <h1 className="h4 fw-bold mb-4">Manage Users</h1>

      {loading ? (
        <Loader label="Loading users…" />
      ) : users.length === 0 ? (
        <div className="scj-card p-5 text-center">
          <i className="bi bi-people fs-1 text-scj-gold mb-3 d-block" />
          <p className="text-muted mb-0">No users found.</p>
        </div>
      ) : (
        <div className="scj-card p-0 overflow-hidden">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Role</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id || u.id}>
                    <td className="d-flex align-items-center gap-2">
                      <span
                        className="rounded-circle d-inline-flex align-items-center justify-content-center text-white fw-bold small"
                        style={{ width: 32, height: 32, background: "var(--scj-gradient-hero)" }}
                      >
                        {initials(u.name)}
                      </span>
                      {u.name}
                    </td>
                    <td>{u.email}</td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={u.role || "user"}
                        onChange={(e) => handleRoleChange(u._id || u.id, e.target.value)}
                        style={{ width: 120 }}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(u._id || u.id)}
                      >
                        <i className="bi bi-trash" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
