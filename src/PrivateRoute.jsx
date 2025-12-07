import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children, role }) {
  const storedRole = localStorage.getItem("role");  // admin / instructor / student

  if (!storedRole) {
    return <Navigate to="/login" replace />;
  }

  if (role && role !== storedRole) {
    return <Navigate to="/" replace />; 
  }

  return children;
}
