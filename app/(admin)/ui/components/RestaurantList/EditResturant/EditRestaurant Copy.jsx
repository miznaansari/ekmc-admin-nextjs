import { Grid, Typography } from "@mui/material"
import { useLocation, useNavigate } from "react-router"
// import RestaurantSetting from "./RestaurantSetting"
// import RestaurantDocuments from "./RestaurantDocuments"
import { useSelector } from "react-redux"
// import RestaurantDevices from "./restaurantDevices"
// import MenuRestaurantSetting from "./MenuRestaurantSetting"
import EditRestaurant from "./EditResturant"
const MyRestaurant = () => {

   const navigate = useNavigate()
   const location = useLocation()


   return (
      <div>
         <Grid
         >
            <EditRestaurant />
            <Typography fontSize="1.285rem" fontWeight="600" marginBottom={1}>
               Restaurant Settings
            </Typography>
            <Grid container sx={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
               <Typography
                  onClick={() => navigate("/list-restaurants/edit-restaurant")}
                  sx={{
                     cursor: "pointer",
                     borderBottom: location.pathname === "/list-restaurants/edit-restaurant" ? "2px solid #00CF63" : "none",
                     color: location.pathname === "/list-restaurants/edit-restaurant" ? "#00CF63" : "black",
                     paddingBottom: "10px"
                  }}
               >
                  General
               </Typography>
               <Typography
                  onClick={() => navigate("/onboarding/documents")}
                  sx={{
                     cursor: "pointer",
                     borderBottom: location.pathname === "/onboarding/documents" ? "2px solid #00CF63" : "none",
                     color: location.pathname === "/onboarding/documents" ? "#00CF63" : "black",
                     paddingBottom: "10px"
                  }}
               >
                  Documents
               </Typography>
               <Typography
                  onClick={() => navigate("/onboarding/devices")}
                  sx={{
                     cursor: "pointer",
                     borderBottom: location.pathname === "/onboarding/devices" ? "2px solid #00CF63" : "none",
                     color: location.pathname === "/onboarding/devices" ? "#00CF63" : "black",
                     paddingBottom: "10px"
                  }}
               >
                  Devices
               </Typography>
            </Grid>

            {/* {location.pathname === "/list-restaurants/edit-restaurant" && <RestaurantSetting />}
            {location.pathname === "/onboarding/documents" && <RestaurantDocuments />}
            {location.pathname === "/onboarding/devices" && <RestaurantDevices />} */}
         </Grid>
      </div>
   )
}

export default MyRestaurant
