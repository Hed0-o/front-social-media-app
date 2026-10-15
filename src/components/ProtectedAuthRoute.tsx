import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedAuthRoute() {
  const { isLoggedIn } = useContext(AuthContext)!;

  if (isLoggedIn) {
    return <Navigate to="/social/feed" replace />;
  }

  return <Outlet />;
}
