import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Loader from "../components/common/Loader";

export default function AdminRoute() {
  const { isAdmin, loading, isAuthenticated } = useAuth();

  if (loading) return <Loader fullPage label="Checking permissions…" />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
