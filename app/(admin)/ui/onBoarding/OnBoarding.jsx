// created by Mohd Mizna Ansari
import { Stack, Box, Typography } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router";
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
import Survey from "./Survey/Survey";

const OnBoarding = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const { menu } = useParams();
  const [action, setAction] = useState(false)
  const [actionIdChanged, setActionIdChanged] = useState(false)

  const [completedFields, setCompletedFields] = useState([]);
  useEffect(()=>{
    // ...
  },[completedFields])
  const [restaurantMenu, setRestaurantMenu] = useState("");
  const [menuData, setMenuData] = useState({});
  useEffect(() => {
    // ...
    // setAction(()=>!action)
  }, [menuData])
  // const cafeListId = localStorage.getItem("cafeListId");
  const [cafeListId, setCafeListId] = useState(localStorage.getItem("cafeListId"))
  const [cafeName, setCafeName] = useState(localStorage.getItem("cafeName"))
  useEffect(() => {
    // ...
    localStorage.setItem("cafeName", cafeName)
  }, [cafeName])

  useEffect(() => {
    const storedCafeListId = localStorage.getItem("cafeListId");
    const storedCafeName = localStorage.getItem("cafeName");
    if (storedCafeListId) {
      setCafeListId(storedCafeListId)
      setCafeName(storedCafeName)
    }
  }, [actionIdChanged])
  const token = localStorage.getItem("authToken");
  const api = instanceV1(token);

  // Example: set environment based on domain (or any condition)
  const environment = "Production";
  // ...
  const storedCafeListId = localStorage.getItem("cafeListId");

  const apiMap = {
    settings: `/api/admin/onboard/v1/cafe/${storedCafeListId}`,
    "time-price": `/api/admin/onboard/v1/cafe/schedule/${storedCafeListId}`,
    "address-info": `/api/admin/onboard/v1/cafe/address/${storedCafeListId}`,
    "imggallery": `/api/admin/onboard/v1/cafe/gallery/${storedCafeListId}`,
  };

  // const hasValidData = (data) => {
  //   if (data === null || data === undefined) return false;
  //   if (Array.isArray(data)) return data.length > 0 && data.every((item) => hasValidData(item));
  //   if (typeof data === "object") {
  //     const keysToIgnore = ["cafe_list_id", "uid", "id"];
  //     const meaningfulKeys = Object.keys(data).filter((key) => !keysToIgnore.includes(key));
  //     return meaningfulKeys.length > 0 && meaningfulKeys.every((key) => hasValidData(data[key]));
  //   }
  //   return data !== null && data !== "";
  // };

  // Skip static null fields for gallery images
  const skipKeys = [
     "gallery_auzre_240px_image_url",
    "gallery_auzre_360px_image_url",
    "gallery_auzre_480px_image_url",
    "gallery_auzre_720px_image_url",
    "gallery_auzre_1080px_image_url",
    "gallery_auzre_original_image_url",
    "gallery_auzre_placeholder_image_url",
    "gallery_cf_240px_image_url",
    "gallery_cf_360px_image_url",
    "gallery_cf_480px_image_url",
    "gallery_cf_720px_image_url",
    "gallery_cf_1080px_image_url", 
    'google_image_id', 
    'gallery_cf_placeholder_image_url',
    'gst_number', 
    'pan_number', 
    'fssai_certificate_url', 
    'business_name', 
    'server_image_id',
    'temp_image_url',
    'address_2',
    'is_processing',
    'is_temp_migrated','is_non_veg','is_veg','is_egg'
  ];

  // console.log(); 
  // ✅ Will return true if other fields (like gallery_cf_original_image_url) exist


  const hasValidData = (data, skipKeys = [], menuKey) => {
    if (data === null || data === undefined) return false;
    // ...
    if (Array.isArray(data)) {
      return data.length > 0 && data.every((item) => hasValidData(item, skipKeys));
    }

    if (typeof data === "object") {
      const defaultIgnoreKeys = ["cafe_list_id", "uid", "id"];
      const keysToIgnore = [...defaultIgnoreKeys, ...skipKeys];

      const meaningfulKeys = Object.keys(data).filter((key) => !keysToIgnore.includes(key));

      // Special case for schedules
      if ("is_holiday" in data && "slots" in data && Array.isArray(data.slots)) {
        if (data.is_holiday === 1) {
          return true; // valid even if slots is empty
        }
      }

      return meaningfulKeys.length > 0 && meaningfulKeys.every((key) => hasValidData(data[key], skipKeys));
    }

    return data !== null && data !== "";
  };


  const fetchMenuData = async (menuKey) => {
    // if (!apiMap[menuKey] || completedFields.includes(menuKey)) return;

    try {
      const res = await api.get(apiMap[menuKey]);
      const resData = {
        ...res.data?.data?.cafe,
        ...res.data?.data?.kyc,
        ...res.data?.data?.additional_info,
        ...(res.data?.data || {}),
        ...(res.data?.get_data || {}),
        ...(res.data?.data?.schedules ? { schedules: res.data.data.schedules } : {}),
      };

// ...
      if (hasValidData(resData, skipKeys,menuKey)) {
        // ...
        setCompletedFields((prev) => [...prev, menuKey]);
      }

      setMenuData((prev) => ({ ...prev, [menuKey]: resData }));
    } catch (error) {
      // ...
    }
  };

  useEffect(() => {
    if (!cafeListId) return;
    Object.keys(apiMap).forEach((key) => fetchMenuData(key));
  }, [cafeListId, action, cafeName]);

  useEffect(() => {
    if (menu && menu !== "completion") {
      fetchMenuData(menu);
    }
  }, [menu, action]);

  useEffect(() => {
    // ...
  }, [action])

  useEffect(() => {
    setCompletedFields((prev) => {
      const unique = [...new Set(prev)]; // remove duplicates
      // Only update state if it changed
      if (unique.length !== prev.length) return unique;
      return prev; // no change → prevents re-render loop
    });
  }, [completedFields,menuData]); // run once on mount, or trigger via some controlled dependency

useEffect(() => {
  window.scrollTo({
    top: 0,
    behavior: "smooth", // remove if you want instant jump
  });
}, [menu]);
  return (
    <Box >
      {/* ===== Environment Banner ===== */}


      <Box sx={{ p: 0, mt: 1 }}>
        <Stack direction={{ xs: "column", sm: "column", md: "row" }} spacing={2}>
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
            {cafeName != 'null' && cafeName && (
              <>
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
                    minWidth: { xs: '90%', sm: '200px' },
                    left: "50%",
                    transform: "translateX(-50%)",
                    bgcolor: environment === "Production" ? "green" : "darkgreen",
                    color: "white",
                    px: 2,
                    py: 0.5,
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8,
                    // zIndex: 2000,
                  }}
                >
                  <Typography variant="subtitle2" fontSize={'13px'} align="center">
                    Cafe Name : {cafeName}
                  </Typography>
                </Box>

              </>
            )

            }
            <>


            </>
            <Box sx={{ mt: { xs: 3, sm: 1 } }}>
              {/* Main Content */}
              {menu === undefined && <GeneralInfo actionIdChanged={actionIdChanged} setActionIdChanged={setActionIdChanged} setMenuData={setMenuData} action={action} setAction={setAction} datas={menuData["settings"]} setCafeName={setCafeName} setCompletedFields={setCompletedFields} />}
              {menu === "settings" && <GeneralInfo actionIdChanged={actionIdChanged} setActionIdChanged={setActionIdChanged} setMenuData={setMenuData} action={action} setAction={setAction} datas={menuData["settings"]} setCafeName={setCafeName} setCompletedFields={setCompletedFields} />}
              {menu === "social-info" && <SocialLink datas={menuData["social-info"]} />}
              {menu === "time-price" && <TimeManagement action={action} setAction={setAction} datas={menuData["time-price"]} />}
              {menu === "address-info" && <AddressInfo action={action} setAction={setAction} datas={menuData["address-info"]} />}
              {menu === "imggallery" && <ImageGallery action={action} setAction={setAction} datas={menuData["imggallery"]} />}
              {menu === "AdditionalInfo" && <AdditionalInfo datas={menuData["AdditionalInfo"]} />}
              {menu === "DocumentInfo" && <DocumentInfo datas={menuData["DocumentInfo"]} />}

              {menu === "single-food-menu" && <FoodMenu primaryInfo={menuData["settings"]} setCompletedFields={setCompletedFields} datas={menuData["single-food-menu"]} />}
              {menu === "assign-qr" && <AssignQr setCompletedFields={setCompletedFields} datas={menuData["assign-qr"]} />}
              {menu === "completion" && <HelpDocumentation setCafeListId={setCafeListId} setCafeName={setCafeName} setMenuData={setMenuData} completedFields={completedFields} setCompletedFields={setCompletedFields} />}
              {menu === "food-menu-bulk" && <AddBulkItems datas={menuData["food-menu-bulk"]} />}
              {menu === "survey" && <Survey  />}
            </Box>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default OnBoarding;
