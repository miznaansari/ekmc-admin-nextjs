"use client";

if (typeof window === 'undefined') {
  global.localStorage = {
    getItem: () => null,
    setItem: () => { },
    removeItem: () => { },
    clear: () => { },
  };
}

import React, { useEffect, useState, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import MainNav from "@/components/mainNav/MainNav";
import { Box, CssBaseline, Grid, CircularProgress } from "@mui/material";
import { DrawerContext } from "@/context/DrawerContext";
import mapAdminAccess from "./ui/mapAdminAccess.json";

// Utility function to check token validity
const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch (err) {
    return false;
  }
};

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { drawerOpenL, setDrawerOpenL } = useContext(DrawerContext);
  const [authorized, setAuthorized] = useState(false);

  // Scroll to top on pathname change (route transition)
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userRole = localStorage.getItem("userRole");

    // 1. Auth check
    if (!token) {
      router.replace("/login");
      return;
    }

    if (!isTokenValid(token)) {
      localStorage.clear();
      router.replace("/login");
      return;
    }

    if (!userRole) {
      alert("Sorry, login again. Cannot find user role.");
      localStorage.clear();
      router.replace("/login");
      return;
    }

    // 2. Role based permission check
    if (Number(userRole) !== 1) {
      const actualPermissions = JSON.parse(
        localStorage.getItem("user_permission")
      ) || [];

      const allowedPermissionSet = new Set(
        actualPermissions
          .filter(p => p.status === 1)
          .map(p => p.permission_name)
      );

      const allowedRoutes = [
        "/notfound", "/ai-image-gen", "/accountsetting", "/verifyqr",
        ...mapAdminAccess
          .filter(item => allowedPermissionSet.has(item.permission))
          .map(item => item.path)
      ];

      // Check if current URL pathname is allowed
      const isAllowed = allowedRoutes.some((path) =>
        pathname.toLowerCase().includes(path.toLowerCase())
      );

      if (!isAllowed && pathname !== "/notfound") {
        router.replace("/notfound");
        return;
      }
    }

    setAuthorized(true);
  }, [pathname, router]);

  // Auth checking interval (like AuthWatcher)
  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("authToken");
      if (token && !isTokenValid(token)) {
        console.log("🔒 Token expired");
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
        router.replace("/login");
      }
    };

    const interval = setInterval(checkToken, 5000);
    return () => clearInterval(interval);
  }, [router]);

  if (!authorized) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <CssBaseline />
      <Box sx={{ m: 2, mb: 0, position: "sticky", top: "16px", zIndex: 1100 }}>
        <MainNav open={drawerOpenL} setOpen={setDrawerOpenL} />
      </Box>
      <Box sx={{ display: "flex", justifyContent: "end" }}>
        <Grid
          display={'flex'}
          justifyContent={'space-between'}
          sx={{
            paddingLeft: 0,
            width: { xs: "100%", lg: drawerOpenL ? "calc(100vw - 285px)" : "100%" },
            transition: "width 0.2s ease",
          }}
        >
          <Box sx={{ width: "100%" }}>
            {children}
          </Box>
        </Grid>
      </Box>
    </>
  );
}
