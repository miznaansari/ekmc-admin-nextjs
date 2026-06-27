import React, { createContext, useState } from "react";
import { useMediaQuery } from "@mui/material";

export const DrawerContext = createContext({
  drawerOpenL: false,
  setDrawerOpenL: () => { },
});

export function DrawerProvider({ children }) {
  const isMobile = useMediaQuery("(max-width:600px)");

  const localOpen = localStorage.getItem("drawerOpen") === "true";

  // 👇 mobile → always false
  const [drawerOpenL, setDrawerOpenL] = useState(
    isMobile ? false : localOpen
  );

  const [action, setAction] = useState(false);

  return (
    <DrawerContext.Provider
      value={{ drawerOpenL, setDrawerOpenL, action, setAction }}
    >
      {children}
    </DrawerContext.Provider>
  );
}
