import { Navigate } from "react-router-dom";

export default function RoleRoute({ children, allowedRoles }) {
  const role = localStorage.getItem("role");
  console.log("RoleRoute - User Role:", role);

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/not-authorized" replace />;
  }

  return children;
}
