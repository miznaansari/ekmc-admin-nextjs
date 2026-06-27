import {
  Stack,
  Box,
} from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router";
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

const EditRestaurantMain = () => {
  const { cafeId, menu } = useParams(); // ✅ get cafeId from URL
  const { setCafeIdContext, cafeIdContext } = useCafe();

  const resolvedCafeId = cafeId || cafeIdContext;

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const navigate = useNavigate();
  const location = useLocation();

  const [restaurantMenu, setRestaurantMenu] = useState("");

  /* =========================
     SET CAFE ID IN CONTEXT
  ========================= */
  useEffect(() => {
    if (cafeId) {
      setCafeIdContext(cafeId);
    }
  }, [cafeId, setCafeIdContext]);

  /* =========================
     DEFAULT MENU REDIRECT
  ========================= */
  useEffect(() => {
    if (!menu) {
      navigate(
        `/list-restaurants/edit-restaurant/${resolvedCafeId}/settings`,
        { replace: true }
      );
    }
  }, [menu, navigate, resolvedCafeId]);

  return (
    <Box sx={{ p: 1 }}>
      <Stack
        direction={isSmallScreen ? "column" : "row"}
        spacing={2}
        alignItems={isSmallScreen ? "center" : "flex-start"}
      >
        {/* Sidebar */}
        <EditRestaurant
          setRestaurantMenu={setRestaurantMenu}
          restaurantMenu={restaurantMenu}
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
