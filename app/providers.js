"use client";

if (typeof window === 'undefined') {
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
  };
}

import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/theme/v1/theme";
import { CafeProvider } from "@/context/cafeContext";
import { DrawerProvider } from "@/context/DrawerContext";

export default function Providers({ children }) {
  return (
    <CafeProvider>
      <DrawerProvider>
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      </DrawerProvider>
    </CafeProvider>
  );
}
