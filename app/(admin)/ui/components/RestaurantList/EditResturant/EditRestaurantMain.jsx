import {
  Stack,
  Box,
  Typography,
  IconButton,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState, useRef, useEffect } from "react";
import { useMediaQuery, useTheme } from "@mui/system";

import EditRestaurant from "./EditResturant";
import GeneralInfo from "./GeneralInfo";
import TimeSetting from "./TimeSetting";
import AddressInfo from "./AddressInfo";
import SocialInfo from "./SocialInfo";
import ImageGallery from "./ImageGallery";
import Document from "./Document";
import AdditionalInfo from "./AdditionalInfo";
import DeviceInfo from "./DeviceInfo";

import { useCafe } from "../../../context/cafeContext";
import { Close } from "@mui/icons-material";

const EditRestaurantMain = ({ cafeId, onClose }) => {
  const { setCafeIdContext, cafeIdContext } = useCafe();

  const resolvedCafeId = cafeId || cafeIdContext;

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const [menu, setMenu] = useState("settings");

  /* =========================
     SET CAFE ID IN CONTEXT
  ========================= */
  useEffect(() => {
    if (cafeId) {
      setCafeIdContext(cafeId);
    }
  }, [cafeId, setCafeIdContext]);

  return (
    <Box sx={{ p: 1, width: { sm: "100%", md: 1200 } }}>
      <Box sx={{ position: 'sticky', top: 10, zIndex: 999, pb: 1, bgcolor: "#F7F7F7" }}>
        <Paper sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: "relative" }}>
          <Typography variant="h5" fontWeight="600">
            {"Edit Restaurant"}
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{ p: 0.5 }}

          >
            <Close />
          </IconButton>
        </Paper>
      </Box>
      <Stack
        direction={isSmallScreen ? "column" : "row"}
        spacing={2}
        alignItems={isSmallScreen ? "top" : "flex-start"}
      >


        {/* Sidebar */}
        <EditRestaurant
          menu={menu}
          setMenu={setMenu}
          cafeId={resolvedCafeId}
        />

        {/* Main Content */}
        {menu === "settings" && <GeneralInfo cafeId={resolvedCafeId} />}
        {menu === "time" && <TimeSetting cafeId={resolvedCafeId} />}
        {menu === "address-info" && <AddressInfo cafeId={resolvedCafeId} />}
        {menu === "social-info" && <SocialInfo cafeId={resolvedCafeId} />}
        {menu === "imggallery" && <ImageGallery cafeId={resolvedCafeId} />}
        {menu === "DocumentInfo" && <Document cafeId={resolvedCafeId} />}
        {menu === "AdditionalInfo" && <AdditionalInfo cafeId={resolvedCafeId} />}
        {menu === "Device" && <DeviceInfo cafeId={resolvedCafeId} />}
      </Stack>
    </Box>
  );
};

export default EditRestaurantMain;
