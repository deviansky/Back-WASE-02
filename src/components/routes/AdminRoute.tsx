// src/components/routes/AdminRoute.tsx
import React, { JSX } from "react";
import { Navigate } from "react-router-dom";

interface AdminRouteProps {
  children: JSX.Element;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user || user.role !== "admin") {
    // Jika bukan admin, arahkan ke halaman dashboard atau login
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
