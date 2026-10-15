import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { isLoggedIn } = useContext(AuthContext)!;

  if (!isLoggedIn) {
    return <Navigate to="/auth/signin" replace />;
  }

  return <Outlet />;
}
