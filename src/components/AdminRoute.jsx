import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, profile, loading } = useAuth();
  if (loading || (user && !profile)) return <div className="p-4 pt-6 text-muted">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!profile.isAdmin) return <Navigate to="/" replace />;
  return children;
}