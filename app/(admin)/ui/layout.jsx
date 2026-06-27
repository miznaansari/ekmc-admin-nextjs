import { Outlet } from "react-router-dom";
import MainNav from "./components/mainNav/MainNav";
import { Box, CssBaseline, Grid } from "@mui/material";
import { useContext } from "react";
import { DrawerContext } from "./context/DrawerContext";

export default function Layout() {
  const { drawerOpenL, setDrawerOpenL } = useContext(DrawerContext);

  return (
    <>
      <CssBaseline />
      <MainNav open={drawerOpenL} setOpen={setDrawerOpenL} />
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
            <Outlet />
          </Box>
        </Grid>
      </Box>
    </>
  );
}
