import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const token = localStorage.getItem("userToken"); // ✅ consistent key

  // agar login nahi hai → redirect to /login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // agar login hai → page dikhne do
  return <Outlet />;
}
