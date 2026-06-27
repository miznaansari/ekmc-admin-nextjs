import {

    Stack,
    Box,
    Button,
    Grid
 
 } from "@mui/material";
 import { Route, Routes, useLocation, useNavigate, useParams } from "react-router";
 import { useState, useRef, useEffect } from "react";
 import EditRestaurant from "./EditResturant";
 import { useMediaQuery, useTheme } from "@mui/system";
 import GeneralInfo from "./GeneralInfo";
import TimeSetting from "./TimeSetting";
 import { useCafe } from "../../../context/cafeContext";
import AddressInfo from "./AddressInfo";
import SocialInfo from "./SocialInfo";
import ImageGallery from "./ImageGallery";
import { ArrowLeft24Regular  } from "@fluentui/react-icons";
import Document from "./Document";
import AdditionalInfo from "./AdditionalInfo";
import DeviceInfo from "./DeviceInfo";
 const EditRestaurantMain = ({cafeId}) => {
   const { setCafeIdContext, cafeIdContext } = useCafe();

   useEffect(() => {
     if (cafeId) {
       setCafeIdContext(cafeId);
     }
   }, [cafeId, setCafeIdContext]);
 
   console.log("cafe id context in edit restaurant main=", cafeIdContext);
   console.log("cafe id-", cafeId);
 
   // fallback to context if prop is not passed (like after route change)
   const resolvedCafeId = cafeId || cafeIdContext;
 
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md')); // Detect if screen size is md or smaller
 
    const navigate = useNavigate();
    const location = useLocation();
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef();
    const { menu } = useParams();
    const [restaurantMenu, setRestaurantMenu] = useState('')
 
    useEffect(() => {
      if (menu === undefined) {
        navigate("/list-restaurants/edit-restaurant/settings", { replace: true });
      }
    }, [menu, navigate]);
    
    return (
       <Box sx={{ p: 1 }}>
          <Stack direction={isSmallScreen ? "column" : "row"} spacing={2} alignItems={isSmallScreen ? "center" : "flex-start"}>
             {/* Sidebar Menu */}
             {/* <Button><ArrowLeft24Regular ></ArrowLeft24Regular></Button> */}
             {/* < >
              <Button sx={{vertical: "top", horizontal: "right" }} size="small"><ArrowLeft24Regular></ArrowLeft24Regular></Button>
             </> */}
             <EditRestaurant setRestaurantMenu={setRestaurantMenu} restaurantMenu={restaurantMenu} cafeId={resolvedCafeId}/>
 
             {/* Main Content */}
             {menu === undefined && <GeneralInfo cafeId={resolvedCafeId}/>}
             {menu === 'settings' && <GeneralInfo cafeId={resolvedCafeId} />}
             {menu === 'time' && <TimeSetting cafeId={resolvedCafeId}/>}
             {menu === 'address-info' && <AddressInfo cafeId={resolvedCafeId}/>}
             {menu === 'social-info' && <SocialInfo cafeId={resolvedCafeId}/>}
             {menu === 'imggallery' && <ImageGallery cafeId={resolvedCafeId}/>}
             {menu === 'DocumentInfo' && <Document cafeId={resolvedCafeId}/>} 
             {menu === 'AdditionalInfo' && <AdditionalInfo cafeId={resolvedCafeId}/>} 
             {menu === 'Device' && <DeviceInfo cafeId={resolvedCafeId}/>}
          </Stack>
       </Box >
    );
 };
 
 export default EditRestaurantMain;
 