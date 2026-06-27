// created by Mohd Mizna Ansari
import { Stack, Box } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router";
import { useState, useEffect } from "react";
import { useMediaQuery, useTheme } from "@mui/system";

// Components
import MenuOnBoarding from "./MenuOnBoarding";
import GeneralInfo from "./GenenralInfo/GeneralInfo";
import SocialLink from "./SocialLink";
import AddressInfo from "./AddressInfo";
import ImageGallery from "./ImageGallery";
import AdditionalInfo from "./AdditionalInfo";
import DocumentInfo from "./DocumentInfo";
import FoodMenu from "./FoodMenu/FoodMenu";
import AssignQr from "./AssignQr/AssignQr";
import HelpDocumentation from "./HelpDocumentation/HelpDocumentation";
import AddBulkItems from "./FoodMenuBulk/AddBulkItems";
import TimeManagement from "./Time/TimeManagement";
import instanceV1 from "../restaurant/authaxios";

const OnBoarding = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const { menu } = useParams();

  const [completedFields, setCompletedFields] = useState([]);
  const [restaurantMenu, setRestaurantMenu] = useState("");

  const cafeListId = localStorage.getItem("cafeListId");
  const token = localStorage.getItem("authToken");
  const api = instanceV1(token);

  // Map each menu key to API endpoint
  const apiMap = {
    settings: `/api/admin/onboard/v1/cafe/${cafeListId}`,
    "time-price": `/api/admin/onboard/v1/cafe/schedule/${cafeListId}`,
    "address-info": `/api/admin/onboard/v1/cafe/address/${cafeListId}`,
    imggallery: `/api/admin/onboard/v1/cafe/gallery/${cafeListId}`,
    // extend if needed
  };

  // Function to check if API response contains useful data
  const hasValidData = (data) => {
    if (data === null || data === undefined) return false;

    if (Array.isArray(data)) {
      if (data.length === 0) return false;
      return data.every((item) => hasValidData(item));
    }

    if (typeof data === "object") {
      const keysToIgnore = ["cafe_list_id", "uid", "id"];
      const meaningfulKeys = Object.keys(data).filter(
        (key) => !keysToIgnore.includes(key)
      );
      if (meaningfulKeys.length === 0) return false;
      return meaningfulKeys.every((key) => hasValidData(data[key]));
    }

    return data !== null && data !== "";
  };

  // Fetch data for a specific menu
  const fetchMenuData = async (menuKey) => {
    if (!apiMap[menuKey] || completedFields.includes(menuKey)) return;
    try {
      const res = await api.get(apiMap[menuKey]);
      const resData =
        res.data?.data?.cafe ||
        res.data?.data?.kyc ||
        res.data?.data?.additional_info ||
        res.data?.data ||
        res.data?.get_data ||
        res.data?.data?.schedules;

      if (hasValidData(resData)) {
        setCompletedFields((prev) => [...prev, menuKey]);
      }
    } catch (error) {
      console.error(`API error for ${menuKey}:`, error);
    }
  };

  // Initial fetch for all menus
  useEffect(() => {
    if (!cafeListId) return;

    Object.keys(apiMap).forEach((key) => fetchMenuData(key));
  }, [cafeListId]);

  // Fetch for current menu if not completed
  useEffect(() => {
    if (menu && menu !== "completion") {
      fetchMenuData(menu);
    }
  }, [menu]);

  return (
    <Box sx={{ p: 0, mt: 1 }}>
      <Stack direction={{ xs: "column", sm: "row", md: "row" }} spacing={2}>
        {/* Sidebar Menu */}
        <Box>
          <MenuOnBoarding
            completedFields={completedFields}
            setRestaurantMenu={setRestaurantMenu}
            restaurantMenu={restaurantMenu}
          />
        </Box>

        {/* Main Content */}
        {menu === undefined && <GeneralInfo />}
        {menu === "settings" && <GeneralInfo />}
        {menu === "social-info" && <SocialLink />}
        {menu === "time-price" && <TimeManagement />}
        {menu === "address-info" && <AddressInfo />}
        {menu === "imggallery" && <ImageGallery />}
        {menu === "AdditionalInfo" && <AdditionalInfo />}
        {menu === "DocumentInfo" && <DocumentInfo />}
        {menu === "single-food-menu" && <FoodMenu />}
        {menu === "assign-qr" && <AssignQr />}
        {menu === "completion" && <HelpDocumentation />}
        {menu === "food-menu-bulk" && <AddBulkItems />}
      </Stack>
    </Box>
  );
};

export default OnBoarding;
