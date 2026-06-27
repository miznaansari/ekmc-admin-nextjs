// created by Mohd Mizna Ansari
import { Stack, Box, Typography } from "@mui/material";
import { useLocation, useNavigate, useParams } from "@/ui/utils/nextRouting";
import { useState, useEffect } from "react";
import { useMediaQuery, useTheme } from "@mui/system";

// Components
import MenuOnBoarding from "./MenuOnBoarding";
import GeneralInfo from "./GenenralInfo/GeneralInfo";
import SocialLink from "./SocialLink";
import AddressInfo from "./Address/AddressInfo";
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
  const [action, setAction] = useState(false)

  const [completedFields, setCompletedFields] = useState([]);
  const [restaurantMenu, setRestaurantMenu] = useState("");
  const [menuData, setMenuData] = useState({});
  useEffect(() => {
    console.log('menuData', menuData)
  }, [menuData])
  // const cafeListId = localStorage.getItem("cafeListId");
  const [cafeListId, setCafeListId] = useState(localStorage.getItem("cafeListId"))
  useEffect(() => {
    const storedCafeListId = localStorage.getItem("cafeListId");
    if (storedCafeListId) {
      setCafeListId(storedCafeListId)
    }
  }, [action])
  const token = localStorage.getItem("authToken");
  const api = instanceV1(token);

  // Example: set environment based on domain (or any condition)
  const environment = "Production";

  const apiMap = {
    settings: `/api/admin/onboard/v1/cafe/${cafeListId}`,
    "time-price": `/api/admin/onboard/v1/cafe/schedule/${cafeListId}`,
    "address-info": `/api/admin/onboard/v1/cafe/address/${cafeListId}`,
    imggallery: `/api/admin/onboard/v1/cafe/gallery/${cafeListId}`,
  };

  const hasValidData = (data) => {
    if (data === null || data === undefined) return false;
    if (Array.isArray(data)) return data.length > 0 && data.every((item) => hasValidData(item));
    if (typeof data === "object") {
      const keysToIgnore = ["cafe_list_id", "uid", "id"];
      const meaningfulKeys = Object.keys(data).filter((key) => !keysToIgnore.includes(key));
      return meaningfulKeys.length > 0 && meaningfulKeys.every((key) => hasValidData(data[key]));
    }
    return data !== null && data !== "";
  };

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

      setMenuData((prev) => ({ ...prev, [menuKey]: resData }));
    } catch (error) {
      console.error(`API error for ${menuKey}:`, error);
    }
  };

  useEffect(() => {
    if (!cafeListId) return;
    Object.keys(apiMap).forEach((key) => fetchMenuData(key));
  }, [cafeListId,action]);

  useEffect(() => {
    if (menu && menu !== "completion") {
      fetchMenuData(menu);
    }
  }, [menu, action]);

  useEffect(() => {
    console.log('ACTION', action)
  }, [action])

  return (
    <Box >
      {/* ===== Environment Banner ===== */}


      <Box sx={{ p: 0, mt: 1 }}>
        <Stack direction={{ xs: "column", sm: "row", md: "row" }} spacing={2}>
          {/* Sidebar Menu */}
          <Box>
            <MenuOnBoarding
              menuData={menuData}
              action={action} setAction={setAction}
              completedFields={completedFields}
              setRestaurantMenu={setRestaurantMenu}
              restaurantMenu={restaurantMenu}
            />
          </Box>
          <Box sx={{ position: "relative", width: '100%' }}>
            {/* <>
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    border: "3px solid darkgreen",
                    borderRadius: 1,
                    width: 1,
                  }}
                ></Box>
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: "50%",                
                    transform: "translateX(-50%)",
                    bgcolor: environment === "Production" ? "green" : "darkgreen",
                    color: "white",
                    px: 2,
                    py: 0.5,
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8,
                    zIndex: 2000,
                    fontSize: "0.85rem",
                    fontWeight: "bold",
                  }}
                >
                  Cafe List Id: {cafeListId}
                </Box>
                

              </> */}
            {/* Main Content */}
            {menu === undefined && <GeneralInfo action={action} setAction={setAction} datas={menuData["settings"]} />}
            {menu === "settings" && <GeneralInfo action={action} setAction={setAction} datas={menuData["settings"]} />}
            {menu === "social-info" && <SocialLink datas={menuData["social-info"]} />}
            {menu === "time-price" && <TimeManagement action={action} setAction={setAction} datas={menuData["time-price"]} />}
            {menu === "address-info" && <AddressInfo action={action} setAction={setAction} datas={menuData["address-info"]} />}
            {menu === "imggallery" && <ImageGallery datas={menuData["imggallery"]} />}
            {menu === "AdditionalInfo" && <AdditionalInfo datas={menuData["AdditionalInfo"]} />}
            {menu === "DocumentInfo" && <DocumentInfo datas={menuData["DocumentInfo"]} />}

            {menu === "single-food-menu" && <FoodMenu setCompletedFields={setCompletedFields} datas={menuData["single-food-menu"]} />}
            {menu === "assign-qr" && <AssignQr datas={menuData["assign-qr"]} />}
            {menu === "completion" && <HelpDocumentation />}
            {menu === "food-menu-bulk" && <AddBulkItems datas={menuData["food-menu-bulk"]} />}
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default OnBoarding;
