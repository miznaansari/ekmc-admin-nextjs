import { useLocation } from "react-router-dom";
import mapAdminAccess from "../mapAdminAccess.json";

export default function useWriteAccess() {
  const { pathname } = useLocation();

  const userRole = localStorage.getItem("userRole");
  const permissions = JSON.parse(
    localStorage.getItem("user_permission")
  ) || [];

  // Admin = always allowed
  if (Number(userRole) === 1) return true;

  const basePermission =
    mapAdminAccess.find((a) => a.path === pathname)?.permission || "";

  if (!basePermission) return false;

  const writePermission = basePermission.replace(/-read$/, "-write");

  return permissions.some(
    (p) => p.permission_name === writePermission && p.status === 1
  );
}
