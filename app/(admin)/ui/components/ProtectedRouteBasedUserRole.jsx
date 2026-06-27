// src/components/ProtectedRouteBasedUserRole.jsx
import React from "react";
import { Navigate, Outlet } from "@/ui/utils/nextRouting";

const ProtectedRouteBasedUserRole = ({ allowedRoles, userRole }) => {
  console.log('allowedRoles', allowedRoles)
  // Super admin always has access
  if (Number(userRole) === 1) {
    return <Outlet />;
  }
  if (!allowedRoles.includes(userRole) && !allowedRoles.includes(Number(userRole))) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <Outlet />;
};

export default ProtectedRouteBasedUserRole;
