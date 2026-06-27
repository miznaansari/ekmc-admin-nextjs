//created by Mohd Mizna Ansari
import {

   Stack,
   Box,

} from "@mui/material";
import { Route, Routes, useLocation, useNavigate, useParams } from "@/ui/utils/nextRouting";
import { useState, useRef } from "react";


import { Description } from "@mui/icons-material";
import { TimePrice } from "../restaurant/TimePrice";
import SocialInfo from "../restaurant/SocialInfo";
import SocialLink from "./SocialLink";
import AddressInfo from "./AddressInfo";
import ImageGallery from "./ImageGallery";
import GeneralInfo from "./GenenralInfo/GeneralInfo";
import { TimeTable } from "./TimeTable";
import { useMediaQuery, useTheme } from "@mui/system";
import AdditionalInfo from "./AdditionalInfo";
import DocumentInfo from "./DocumentInfo";
import MenuOnBoarding from "./MenuOnBoarding";
import FoodMenu from "./FoodMenu/FoodMenu";
import AssignQr from "./AssignQr/AssignQr";
import HelpDocumentation from "./HelpDocumentation/HelpDocumentation";
import FoodMenuBulk from "./FoodMenuBulk/FoodMenuBulk";
import AddBulkItems from "./FoodMenuBulk/AddBulkItems";
import TimeManagement from "./Time/TimeManagement";

const OnBoarding = () => {
   const theme = useTheme();

   const { menu } = useParams();
   const [restaurantMenu, setRestaurantMenu] = useState('')

  

   return (
      <Box sx={{ p: 0, mt: 1 }}>
         <Stack
            direction={{ xs: "column", sm: "column", md: "row" }}
            spacing={2}
         >
            {/* Sidebar Menu */}
            <Box

            >
               {/* <MenuOnBoarding  /> */}
               <MenuOnBoarding completedFields={['settings']} setRestaurantMenu={setRestaurantMenu} restaurantMenu={restaurantMenu} />
            </Box>
            {/* Main Content */}
            {menu === undefined && <GeneralInfo />}
            {menu === 'settings' && <GeneralInfo />}
            {menu === "social-info" && <SocialLink />}
            {/* {menu === "time-price" && <TimeTable />} */}
            {menu === "time-price" && <TimeManagement />}

            {menu === "address-info" && <AddressInfo />}
            {menu === "imggallery" && <ImageGallery />}
            {menu === "AdditionalInfo" && <AdditionalInfo />}
            {menu === "DocumentInfo" && <DocumentInfo />}
            {/* single-food-menu */}
            {menu === "single-food-menu" && <FoodMenu />}
            {/* assign-qr */}
            {menu === "assign-qr" && <AssignQr />}
            {/* completion */}
            {menu === "completion" && <HelpDocumentation />}
            {/* food-menu-bulk */}

            {/* {menu === "food-menu-bulk" && <FoodMenuBulk />} */}
            {menu === "food-menu-bulk" && <AddBulkItems />}

            {/* {menu === "Device" && <RestaurantDevices />} */}
         </Stack>
      </Box >
   );
};

export default OnBoarding;
