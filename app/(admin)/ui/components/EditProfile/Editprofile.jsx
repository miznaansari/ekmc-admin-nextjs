import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Checkbox,
  FormControlLabel,
  Switch,
  Snackbar,
  Alert,
  IconButton,
  Divider,
  Avatar,
  Card,
  CardMedia,
  MenuItem,
   CardContent,
   TableHead,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import { useForm, Controller } from "react-hook-form";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDropzone } from "react-dropzone";
import DocumentsComponent from "./DocumentsTab"; // Adjust the import path as needed
import DevicesComponent from "./DevicesTab"; // Adjust the import path as needed
import DocumentsTab from "./DocumentsTab";
import DevicesTab from "./DevicesTab";
import SettingsTab from "./SettingsTab";
import CustomDropdown from "../custom dropdown/CustomDropdown";
import {useTheme} from "@mui/material/styles";
import { DrawerContext } from "../../context/DrawerContext";
//import { Autocomplete } from "@react-google-maps/api";
import Autocomplete from "@mui/material/Autocomplete";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import ImagesTab from "./ImagesTab";

// Styled Save button
const SaveButton = styled(Button)({
  marginTop: "20px",
});

const countries = [
  { value: "101", label: "India" }
];

// Tab panel component
const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

// Main EditProfile Component
const EditProfile = ({ cafeId, onClose, onSuccess }) => {
   const [indianStates, setIndianStates] = useState()
    const [indianCities, setIndianCities] = useState()
  const { control, handleSubmit, reset, setValue, getValues } = useForm({
    defaultValues: {
      generalInfo: {
        cafe_name: "",
        cafe_email: "",
        cafe_mobile_number: "",
        cafe_slogan: "",
        description: "",
        is_featured: false,
        is_most_visited: false,
        is_new_opening: false,
        is_veg: false,
        is_non_veg: false,
        status: false,
        logo_image_id: "",
        is_published: false,
        show_res_menu: false,
        allow_order: false,
        allow_login: false,
        allow_qr_edit: false,
        allow_profile_edit: false,
        allow_menu_edit: false,
        is_user_location_required: false,
      },
      timePriceInfo: {
        monday_opening_time: "",
        monday_closing_time: "",
        tuesday_opening_time: "",
        tuesday_closing_time: "",
        wednesday_opening_time: "",
        wednesday_closing_time: "",
        thursday_opening_time: "",
        thursday_closing_time: "",
        friday_opening_time: "",
        friday_closing_time: "",
        saturday_opening_time: "",
        saturday_closing_time: "",
        sunday_opening_time: "",
        sunday_closing_time: "",
        cafe_price_range: "Low",
      },
      addressInfo: {
        address_1: "",
        address_2: "",
        city_id: null,
        pin_code: "",
        latitude: "",
        longitude: ""
      },
      socialInfo: {
        website_url: "",
        social_twitter_url: "",
        social_facebook_url: "",
        social_instagram_url: "",
        social_linkedin_url: "",
        zomato_url: "",
        swiggy_url: "",
        google_map_url: "",
        dineout_url: "",
      },
      documents: {
        fssai_certificate_url: "",
        fssai_licence_number: "",
        gst_certificate_url: "",
        gst_number: "",
      },
      gallery:{
        id:'',
        gallery_cf_original_image_url:''
      }
    },
  });
  const {drawerOpenL}=useContext(DrawerContext);
  const theme= useTheme();
  const [value, setTabValue] = useState(0);
  const [logoPreview, setLogoPreview] = useState(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState(null);
  const [featuredImageId, setFeaturedImageId] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  // Environment variables
  const baseUrl = process.env.VITE_REACT_APP_BACKEND_URL; // Base URL for API
  const imageDeliveryUrl = process.env.VITE_REACT_APP_IMAGE_DELIVERY_URL;
  const authToken = localStorage.getItem("authToken"); // Fetching the token from localStorage
  const token= localStorage.getItem('authToken')
  const [citySearchQuery, setCitySearchQuery]=useState("");
  const [citiesOption, setCitiesOption]=useState([])
  const [position, setPosition] = useState(null);



  console.log(galleryImages,"KJH")
  const fetchState=async()=>{
    try {
      const response = await axios.get(
        `${baseUrl}/api/v1/state-list`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const formattedCities = response.data.get_list.map((state) => ({
        value: state.state_id,
        label: state.state_name
      }));
      setIndianStates(formattedCities)
    } catch (error) {
    } finally {
    }
  }
  const fetchCity =async(stateId)=>{
    try {
      const response = await axios.get(
        `${baseUrl}/api/v1/city-list?state_id=${stateId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const formattedStates = response.data.data.map((city) => ({
        value: city.city_id,
        label: city.city_name,
        state: city.state_name
      }));
      setIndianCities(formattedStates)
    } catch (error) {
    } finally {
    }
  }
  const [selectedCity, setSelectedCity] = useState(null);

  const [preCity, setPrecity]=useState("");
  // Fetch data from API and populate form fields
  useEffect(() => {
    const fetchCafeData = async () => {
      console.log("cafe id in resutrant list -",cafeId)
      try {
        const response = await axios.get(
          `${baseUrl}/api/user/admin/restaurant-all-info/${cafeId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              Accept: "*/*",
            },
          }
        );
        const cafeData = response.data.data?.[0] || {};
        const weekdaysData = response.data.activeWeekdays || [];

        // Default structure for weekdays
        const defaultWeekdays = [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ].reduce((acc, day) => {
          acc[`${day}_opening_time`] = "";
          acc[`${day}_closing_time`] = "";
          return acc;
        }, {});

        // Populate weekdaysData or fallback to defaults
        const timePriceInfo = weekdaysData.reduce(
          (acc, day) => {
            if (day?.weekday) {
              acc[`${day.weekday.toLowerCase()}_opening_time`] =
                day.opening_time || "";
              acc[`${day.weekday.toLowerCase()}_closing_time`] =
                day.closing_time || "";
            }
            return acc;
          },
          {
            ...defaultWeekdays,
            cafe_price_range: cafeData.cafe_price_range || "1",
          }
        );

        // Update the form with fetched data
        reset({
          ...getValues(), // Preserve existing form values
          timePriceInfo,
          generalInfo: {
            ...getValues("generalInfo"),
            cafe_name: cafeData.cafe_name || "",
            cafe_email: cafeData.cafe_email || "",
            cafe_mobile_number: cafeData.cafe_mobile_number || "",
            cafe_slogan: cafeData.cafe_slogan || "",
            description: cafeData.cafe_about || "",
            is_featured: cafeData.is_featured || false,
            is_most_visited: cafeData.is_most_visited || false,
            is_new_opening: cafeData.is_new_opening || false,
            is_veg: cafeData.is_veg || false,
            is_non_veg: cafeData.is_non_veg || false,
            status: cafeData.status || false,
            logo_image_id: cafeData.logo_image_id || "",
            is_published: cafeData.is_published || false,
            show_res_menu: cafeData.show_res_menu || false,
            allow_order: cafeData.allow_order || false,
            allow_login: cafeData.allow_login || false,
            allow_qr_edit: cafeData.allow_qr_edit || false,
            allow_profile_edit: cafeData.allow_profile_edit || false,
            allow_menu_edit: cafeData.allow_menu_edit || false,
            is_daily_report: cafeData.is_daily_report || false,
            is_hot_today: cafeData.is_hot_today || false,
            is_limelight: cafeData.is_limelight || false,
            is_user_location_required:
              cafeData.is_user_location_required || false,
              city_id:cafeData.city_id || "", 
              cafe_logo_azure_placeholder_image_url:logoPreview || ""
          },
          // addressInfo: {
          //   address_1: cafeData.address_1 || "",
          //   address_2: cafeData.address_2 || "",
          //   city: cafeData.city_id || "",
          //   state: cafeData.state_id || "",
          //   // country: cafeData.country_id || "",
          //   pin_code: cafeData.pin_code || "",
          //   latitude: cafeData.latitude || "",
          //   longitude: cafeData.longitude || "",
          //   google_location_id: cafeData.google_location_id || "",
          // },
          socialInfo: {
            website_url: cafeData.website_url || "",
            social_twitter_url: cafeData.social_twitter_url || "",
            social_facebook_url: cafeData.social_facebook_url || "",
            social_instagram_url: cafeData.social_instagram_url || "",
            social_linkedin_url: cafeData.social_linkedin_url || "",
            zomato_url:  cafeData.zomato_url || "",
            swiggy_url:  cafeData.swiggy_url  || "",
            google_map_url:  cafeData.google_map_url || "",
            dineout_url:  cafeData.dineout_url  || ""
          },
          documents: {
            fssai_certificate_url: cafeData.fssai_certificate_url || "",
            fssai_licence_number: cafeData.fssai_licence_number || "",
            gst_certificate_url: cafeData.gst_certificate_url || "",
            gst_number: cafeData.gst_number || "",
          },
          addressInfo: {
            address_1:cafeData.address_1,
            address_2: cafeData.address_2,
            //city_id: cafeData.city_id,
            pin_code: cafeData.pin_code,
            latitude: cafeData.latitude,
            longitude: cafeData.longitude
          },
        });

        setPrecity(cafeData.city_name)
        setSelectedCity({ label: cafeData.city_name, value: cafeData.city_id });
        console.log("city name and value-",cafeData.city_name,cafeData.city_id )
        // Set previews

        if (cafeData.latitude && cafeData.longitude) {
          setPosition({
            lat: parseFloat(cafeData.latitude),
            lng: parseFloat(cafeData.longitude),
          });
        }
        setLogoPreview(
          cafeData.cafe_logo_azure_original_image_url
        );
        setFeaturedImagePreview(
          cafeData.featured_image_id
            ? `${imageDeliveryUrl}/${cafeData.featured_image_id}/eats540x540`
            : null
        );

        // Set gallery images
        setGalleryImages(response.data.gallery || []);
        const featuredImage = response.data.gallery.find(
          (image) => image.is_featured === 1
        );
        if (featuredImage) {
          setActiveImageId(featuredImage.id);
        }
      } catch (error) {
        console.error("Error fetching cafe data:", error);
      }
    };
    console.log("city fetched from cafe -",selectedCity)
fetchState()
    if (cafeId) {
      fetchCafeData();
    }
  }, []);

  // Handle Tab Change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // File Upload Handler
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadType", "cafe_gallery");

    try {
      const response = await axios.post(
        `${baseUrl}/api/admin/cf/v1/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setNotification({
        open: true,
        message: response.data.message,
        severity: "success",
      });
      return response.data.imageUrl; // Return the ID of the uploaded image
    } catch (error) {
      console.error("Error uploading image:", error);
      setNotification({
        open: true,
        message: "Error uploading image. Please try again.",
        severity: "error",
      });
      return null;
    }
  };
  // Function to handle saving time for a specific day
  const handleDaySave = async (day) => {
    const openingTime = getValues(
      `timePriceInfo.${day.toLowerCase()}_opening_time`
    );
    const closingTime = getValues(
      `timePriceInfo.${day.toLowerCase()}_closing_time`
    );
    const isHoliday = !openingTime && !closingTime ? 1 : 0; // Mark as holiday if both times are empty

    // Prepare request body
    const requestData = {
      cafe_list_id: cafeId, // Ensure cafeId is used correctly
      opening_time: openingTime,
      closing_time: closingTime,
      weekday: day,
      is_holiday: isHoliday,
    };

    // Define the endpoint
    const endpoint = `${baseUrl}/api/v2/schedule`;

    // Make the POST request
    try {
      const response = await axios.post(endpoint, requestData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      // Check if the response is successful
      if (response.status === 200) {
        setNotification({
          open: true,
          message: `${day} Time & Price Info saved successfully!`,
          severity: "success",
        });
      } else {
        setNotification({
          open: true,
          message: `Failed to save ${day} info. Try again!`,
          severity: "error",
        });
      }
    } catch (error) {
      console.error(`Error saving ${day} time info:`, error);
      setNotification({
        open: true,
        message: `Error saving ${day} info. Please try again.`,
        severity: "error",
      });
    }
  };

  // Handle file change
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const uploadedImageId = await uploadImage(file);

      if (uploadedImageId) {
        reset((prevState) => ({
          ...prevState,
          generalInfo: {
            ...prevState.generalInfo,
            logo_image_id: uploadedImageId,
          },
        }));
        setLogoPreview(URL.createObjectURL(file));
        setNotification({
          open: true,
          message: "Logo image uploaded successfully!",
          severity: "success",
        });
      }
    }
  };

  // Handle Featured Image Upload
  const handleFeaturedImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const uploadedImageId = await uploadImage(file);
      if (uploadedImageId) {
        setFeaturedImageId(uploadedImageId);
        setFeaturedImagePreview(URL.createObjectURL(file));
        setNotification({
          open: true,
          message: "Featured image uploaded successfully!",
          severity: "success",
        });
      }
    }
  };

  // Save Featured Image
  const handleSaveFeaturedImage = async () => {
    const data = {
      cafe_image_name: "Featured Image",
      image_position: 0,
      server_image_id: featuredImageId,
      is_featured: true,
    };

    try {
      await axios.post(
        `${baseUrl}/api/user/admin/restaurant/featured-image/${cafeId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      setNotification({
        open: true,
        message: "Featured image saved successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error saving featured image:", error);
      setNotification({
        open: true,
        message: "Error saving featured image. Please try again.",
        severity: "error",
      });
    }
  };

  // Handle Featured Image Deletion
  const handleDeleteFeaturedImage = async () => {
    try {
      await axios.delete(
        `${baseUrl}/api/user/admin/restaurant/featured-image/${featuredImageId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      setFeaturedImagePreview(null);
      setFeaturedImageId(null);
      setNotification({
        open: true,
        message: "Featured image deleted successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error deleting featured image:", error);
      setNotification({
        open: true,
        message: "Error deleting featured image. Please try again.",
        severity: "error",
      });
    }
  };

  // Handle Gallery Image Deletion
  const handleDeleteImage = async (imageId) => {
    try {
      await axios.delete(
        `${baseUrl}/api/user/admin/restaurant/featured-image/${imageId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      setNotification({
        open: true,
        message: "Image deleted successfully!",
        severity: "success",
      });
      fetchGalleryImages(); // Refresh gallery
    } catch (error) {
      console.error("Error deleting image:", error);
      setNotification({
        open: true,
        message: "Error deleting image. Please try again.",
        severity: "error",
      });
    }
  };

  // Fetch Gallery Images
  const fetchGalleryImages = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/user/admin/restaurant-all-info/${cafeId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      setGalleryImages(response.data.gallery || []);
    } catch (error) {
      console.error("Error fetching gallery images:", error);
      setNotification({
        open: true,
        message: "Error fetching images. Please try again.",
        severity: "error",
      });
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        const uploadedImageId = await uploadImage(file);
        if (uploadedImageId) {
          const data = {
            cafe_image_name: file.name,
            image_position: galleryImages.length + 1,
            server_image_id: uploadedImageId,
            is_featured: false,
          };

          try {
            await axios.post(
              `${baseUrl}/api/user/admin/restaurant/featured-image/${cafeId}`,
              data,
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  "Content-Type": "application/json",
                },
              }
            );
            setNotification({
              open: true,
              message: "Image uploaded successfully!",
              severity: "success",
            });
            fetchGalleryImages(); // Refresh gallery
          } catch (error) {
            console.error("Error uploading image:", error);
            setNotification({
              open: true,
              message: "Error uploading image. Please try again.",
              severity: "error",
            });
          }
        }
      }
    },
  });
  const makePostRequest = async (url, data, successMessage) => {
    try {
      const response= await axios.post(url, data, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });
      setNotification({
        open: true,
        message: successMessage,
        severity: "success",
      });
      console.log("response after make post request-",response)
      if(response.status ===200){
        onSuccess();
      }
      // onSuccess();
      // if (onSuccess) {
      //   onSuccess();  // <-- Add this to call it!
      // }
    } catch (error) {
      console.error(`Error saving data to ${url}:`, error);
      setNotification({
        open: true,
        message: "Error saving data. Please try again.",
        severity: "error",
      });
    }
  };

  // Example submission handlers
  const onSubmitGeneralInfo = (data) => {
    const endpoint = `${baseUrl}/api/user/admin/restaurant-edit-general-information/${cafeId}`;
    makePostRequest(
      endpoint,
      data.generalInfo,
      "General Info saved successfully!",
      onSuccess
    );
  };

  const onSubmitAddressInfo = (data) => {
    console.log("data before onsubmit address info",data)
    console.log("city_id- ",data.addressInfo.city_id)
    const endpoint = `${baseUrl}/api/user/admin/restaurant-edit-address-information/${cafeId}`;
    const requestData = {
      ...data.addressInfo,
      city_id: data.addressInfo.city_id?.value || selectedCity.value,
      latitude: position.lat,
      longitude: position.lng,
    };
    makePostRequest(
      endpoint, 
      requestData, 
      "Address Info saved successfully!",
      () => {
        console.log("Success callback after Address Info submit");
        // Example: refetch, navigate, etc.
      }
    );
  };

  const onSubmitSocialInfo = (data) => {
    const endpoint = `${baseUrl}/api/user/admin/restaurant-edit-socialinfo/${cafeId}`;
    makePostRequest(
      endpoint,
      data.socialInfo,
      "Social Info saved successfully!"
    );
  };

  const onSubmitTimePriceInfo = (data) => {
    const cafe_list_id = cafeId;
    const weekdays = [
      {
        weekday: "Monday",
        opening_time: data.timePriceInfo.monday_opening_time,
        closing_time: data.timePriceInfo.monday_closing_time,
        is_holiday:
          !data.timePriceInfo.monday_opening_time &&
          !data.timePriceInfo.monday_closing_time,
      },
      {
        weekday: "Tuesday",
        opening_time: data.timePriceInfo.tuesday_opening_time,
        closing_time: data.timePriceInfo.tuesday_closing_time,
        is_holiday:
          !data.timePriceInfo.tuesday_opening_time &&
          !data.timePriceInfo.tuesday_closing_time,
      },
      {
        weekday: "Wednesday",
        opening_time: data.timePriceInfo.wednesday_opening_time,
        closing_time: data.timePriceInfo.wednesday_closing_time,
        is_holiday:
          !data.timePriceInfo.wednesday_opening_time &&
          !data.timePriceInfo.wednesday_closing_time,
      },
      {
        weekday: "Thursday",
        opening_time: data.timePriceInfo.thursday_opening_time,
        closing_time: data.timePriceInfo.thursday_closing_time,
        is_holiday:
          !data.timePriceInfo.thursday_opening_time &&
          !data.timePriceInfo.thursday_closing_time,
      },
      {
        weekday: "Friday",
        opening_time: data.timePriceInfo.friday_opening_time,
        closing_time: data.timePriceInfo.friday_closing_time,
        is_holiday:
          !data.timePriceInfo.friday_opening_time &&
          !data.timePriceInfo.friday_closing_time,
      },
      {
        weekday: "Saturday",
        opening_time: data.timePriceInfo.saturday_opening_time,
        closing_time: data.timePriceInfo.saturday_closing_time,
        is_holiday:
          !data.timePriceInfo.saturday_opening_time &&
          !data.timePriceInfo.saturday_closing_time,
      },
      {
        weekday: "Sunday",
        opening_time: data.timePriceInfo.sunday_opening_time,
        closing_time: data.timePriceInfo.sunday_closing_time,
        is_holiday:
          !data.timePriceInfo.sunday_opening_time &&
          !data.timePriceInfo.sunday_closing_time,
      },
    ];

    // Update schedule
    updateSchedule(cafe_list_id, weekdays);
    updateCafePriceRange(cafe_list_id, data.timePriceInfo.cafe_price_range);
  };

  // Function to update schedule for each day
  const updateSchedule = async (cafe_list_id, weekdays) => {
    try {
      await axios.post(
        `${baseUrl}/api/user/admin/restaurant-edit-time&price-information/${cafe_list_id}`,
        weekdays,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      setNotification({
        open: true,
        message: "Operating hours saved successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error updating schedule:", error);
      setNotification({
        open: true,
        message: "Error updating schedule. Please try again.",
        severity: "error",
      });
    }
  };

  // Function to update price range
  // Function to update cafe price range
  const updateCafePriceRange = async (cafeId, priceRange) => {
    try {
      const url = `${baseUrl}/api/v2/cafe-price/${cafeId}`;
      const data = { cafe_price_range: priceRange };

      // Make the PUT request to update price range
      const response = await axios.put(url, data, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      // Show success notification
      if (response.status === 200) {
        setNotification({
          open: true,
          message: "Price range updated successfully!",
          severity: "success",
        });
      }
    } catch (error) {
      console.error("Error updating cafe price range:", error);
      setNotification({
        open: true,
        message: "Error updating price range. Please try again.",
        severity: "error",
      });
    }
  };
  const handleDropdownChangeCity = (selectedValue) => {
    setValue("addressInfo.city", selectedValue.value);
  };
  const handleDropdownChangeState = (selectedValue) => {
    setValue("addressInfo.state", selectedValue.value);
    fetchCity(selectedValue.value)
  };
  const handleDropdownChangeCountry = (selectedValue) => {
    setValue("addressInfo.country", selectedValue.value);
  };
  const [activeImageId, setActiveImageId] = useState(null);
  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${baseUrl}/api/user/admin/restaurant/featured-image/${id}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      setGallery((prevGallery) => prevGallery.filter((img) => img.id !== id));
    } catch (error) {
      console.error("Error deleting featured image:", error);
    }
  };
  const handleSwitchChange = async (image) => {
    try {
      const data = {
        cafe_image_name: image.cafe_image_name,
        image_position: 1,
        is_featured: true,
      };
      const response = await axios.put(
        `${baseUrl}/api/user/admin/restaurant/featured-image/${cafeId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response) {
        setActiveImageId((prevId) => (prevId === image.id ? null : image.id));
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };



console.log("auth token-",token)
//fetch cities
  const fetchCities= async()=>{
    try{
        const response= await axios.get(`${baseUrl}/api/v1/city-list`,{
        headers:{
          Authorization: `Bearer ${token}`

        },
        params:{
          search:citySearchQuery
        }
        })
        console.log("city response- ",response.data.data)    
        const cityOption= response.data.data.map((city)=>(
          {
            label:city.city_name,
            value:city.city_id,
            state:city.state_name
          }
        ))
        console.log("city options- ",cityOption)
        setCitiesOption(cityOption)
    }catch(e){
    console.log("error during fetch city= ",e)
  }
  }

  useEffect(()=>{
    const delayDebounce= setTimeout(()=>{
      if(citySearchQuery.trim().length>=2){
          fetchCities();
      }
    },300)
    return ()=> clearTimeout(delayDebounce)
  },[citySearchQuery])

  function LocationMarker({ setPosition }) {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        console.log("address clicked on map-", e.latlng)
      },
    });
    return null;
  }
  
  // Render
  return (
    <Box  sx={{
      backgroundColor: theme.palette.background.paper,
      display: "flex",
      flexDirection: "column",
      flexGrow: 1,
      overflow: "auto",
      height: "calc(98vh - 91px)",
      width: drawerOpenL ? "calc(100% - 200px)" : "100%", // Adjust width based on drawer
      boxShadow: "none",
      transition: 'width 0.3s ease',
    }}>
      <Paper
        //elevation={3}
        //sx={{   borderRadius: "12px" }}
        sx={{
         // width: drawerOpenL ? "80vh":"100%"
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 21, left: 14 }}
        >
          <CloseIcon />
        </IconButton>
        <Typography
          variant="h5"
          sx={{ mb: 3, fontWeight: "bold", textAlign: "center" }}
        >
          Edit Restaurant Profile
        </Typography>
        <Tabs
          value={value}
          onChange={handleTabChange}
          aria-label="edit profile tabs"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: "divider", width: "auto" ,position:"sticky"}}
        >
          <Tab label="General Info" id="tab-0" aria-controls="tabpanel-0" />
          <Tab label="Time & Price" id="tab-1" aria-controls="tabpanel-1" />
          <Tab label="Address Info" id="tab-2" aria-controls="tabpanel-2" />
          <Tab label="Social Info" id="tab-3" aria-controls="tabpanel-3" />
          <Tab label="Featured Image" id="tab-4" aria-controls="tabpanel-4" />
          <Tab label="Image Gallery" id="tab-5" aria-controls="tabpanel-5" />
          <Tab label="Documents" id="tab-6" aria-controls="tabpanel-6" />
          <Tab label="Devices" id="tab-7" aria-controls="tabpanel-7" />
          <Tab label="Settings" id="tab-8" aria-controls="tabpanel-8" />
          <Tab label="Images" id="tab-9" aria-controls="tabpanel-9" />
        </Tabs>

        <TabPanel value={value} index={0}>
          <form onSubmit={handleSubmit(onSubmitGeneralInfo)}>
            <Grid container spacing={3}>
              {/* Logo Upload */}

              <Grid size={12}>
                <Grid container spacing={2} alignItems="center">
                  <Grid
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                    size={{
                      xs: 12,
                      sm: 2
                    }}>
                    <Avatar
                      alt="Logo Preview"
                      sx={{ width: 100, height: 100, borderRadius: "8px" }}
                      src={logoPreview}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 3
                    }}>
                    <Button variant="outlined" component="label" fullWidth>
                      Upload New Logo
                      <input type="file" hidden onChange={handleFileChange} />
                    </Button>
                  </Grid>
                </Grid>
              </Grid>

              {/* General Info Fields */}
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                <Controller
                  name="generalInfo.cafe_name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Restaurant Name"
                      fullWidth
                      variant="outlined"
                      required
                    />
                  )}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                <Controller
                  name="generalInfo.cafe_slogan"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Slogan/Tagline"
                      fullWidth
                      variant="outlined"
                    />
                  )}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                <Controller
                  name="generalInfo.cafe_email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Restaurant Email"
                      fullWidth
                      variant="outlined"
                      required
                    />
                  )}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                <Controller
                  name="generalInfo.cafe_mobile_number"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Restaurant Phone"
                      fullWidth
                      variant="outlined"
                      required
                    />
                  )}
                />
              </Grid>
              <Grid size={12}>
                <Controller
                  name="generalInfo.description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Restaurant Description"
                      fullWidth
                      multiline
                      rows={4}
                      variant="outlined"
                    />
                  )}
                />
              </Grid>

              {/* Feature Tags Section */}
              <Grid size={12}>
                <Typography variant="h6" gutterBottom>
                  Feature Tags
                </Typography>
                <Divider />
              </Grid>
              {["is_featured", "is_most_visited", "is_new_opening"].map(
                (tag, index) => (
                  <Grid
                    key={index}
                    size={{
                      xs: 4,
                      sm: 2
                    }}>
                    <FormControlLabel
                      control={
                        <Controller
                          name={`generalInfo.${tag}`}
                          control={control}
                          render={({ field }) => (
                            <Checkbox {...field} checked={!!field.value} />
                          )}
                        />
                      }
                      label={tag
                        .replace("is_", "")
                        .replace("_", " ")
                        .toUpperCase()}
                    />
                  </Grid>
                )
              )}

              {/* Food Type Section */}
              <Grid size={12}>
                <Typography variant="h6" gutterBottom>
                  Food Type
                </Typography>
                <Divider />
              </Grid>
              {["is_veg", "is_non_veg"].map((type, index) => (
                <Grid
                  key={index}
                  size={{
                    xs: 4,
                    sm: 2
                  }}>
                  <FormControlLabel
                    control={
                      <Controller
                        name={`generalInfo.${type}`}
                        control={control}
                        render={({ field }) => (
                          <Switch {...field} checked={!!field.value} />
                        )}
                      />
                    }
                    label={type
                      .replace("is_", "")
                      .replace("_", " ")
                      .toUpperCase()}
                  />
                </Grid>
              ))}

              {/* Menu Options Section */}
              <Grid size={12}>
                <Typography variant="h6" gutterBottom>
                  Menu Options
                </Typography>
                <Divider />
              </Grid>
              {[
                "allow_order",
                "allow_qr_edit",
                "allow_login",
                "allow_menu_edit",
              ].map((option, index) => (
                <Grid
                  key={index}
                  size={{
                    xs: 4,
                    sm: 3
                  }}>
                  <FormControlLabel
                    control={
                      <Controller
                        name={`generalInfo.${option}`}
                        control={control}
                        render={({ field }) => (
                          <Switch {...field} checked={!!field.value} />
                        )}
                      />
                    }
                    label={option
                      .replace("allow_", "")
                      .replace("_", " ")
                      .toUpperCase()}
                  />
                </Grid>
              ))}

              {/* Status Section */}
              <Grid size={12}>
                <Typography variant="h6" gutterBottom>
                  Status
                </Typography>
                <Divider />
              </Grid>
              {[
                "is_user_location_required",
                "status",
                "is_published",
                "is_limelight",
                "is_hot_today",
                "is_featured",
                "is_daily_report",
              ].map((option, index) => (
                <Grid
                  key={index}
                  size={{
                    xs: 4,
                    sm: 3
                  }}>
                  <FormControlLabel
                    control={
                      <Controller
                        name={`generalInfo.${option}`}
                        control={control}
                        render={({ field }) => (
                          <Switch {...field} checked={!!field.value} />
                        )}
                      />
                    }
                    label={option
                      .replace("is_", "")
                      .replace("_", " ")
                      .toUpperCase()}
                  />
                </Grid>
              ))}

              {/* Save Button */}
              <Grid size={12}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  fullWidth
                >
                  Save Changes
                </Button>
              </Grid>
            </Grid>
          </form>
        </TabPanel>

        {/* Time & Price Tab */}
        <TabPanel value={value} index={1}>
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", textAlign: "center", mb: 2 }}
          >
            Operating Hours
          </Typography>
          {/* Copy Monday's Times to All */}
          <Grid container sx={{ textAlign: "center", mb: 4 }}>
            <FormControlLabel
              control={
                <Checkbox
                  onChange={(event) => {
                    if (event.target.checked) {
                      const mondayOpeningTime = getValues(
                        "timePriceInfo.monday_opening_time"
                      );
                      const mondayClosingTime = getValues(
                        "timePriceInfo.monday_closing_time"
                      );

                      [
                        "tuesday",
                        "wednesday",
                        "thursday",
                        "friday",
                        "saturday",
                        "sunday",
                      ].forEach((day) => {
                        setValue(
                          `timePriceInfo.${day}_opening_time`,
                          mondayOpeningTime
                        );
                        setValue(
                          `timePriceInfo.${day}_closing_time`,
                          mondayClosingTime
                        );
                      });
                    }
                  }}
                />
              }
              label="Copy Monday's times to all days"
            />
          </Grid>
          {/* Operating Hours Fields with Save Button for Each Day */}
          {[
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ].map((day) => (
            <Grid container spacing={3} alignItems="center" key={day}>
              <Grid
                size={{
                  xs: 12,
                  sm: 2
                }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                  {day}
                </Typography>
              </Grid>
              <Grid
                sx={{ mt: 2 }}
                size={{
                  xs: 12,
                  sm: 3
                }}>
                <Controller
                  name={`timePriceInfo.${day.toLowerCase()}_opening_time`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Opening Time"
                      type="time"
                      fullWidth
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>
              <Grid
                sx={{ mt: 2 }}
                size={{
                  xs: 12,
                  sm: 3
                }}>
                <Controller
                  name={`timePriceInfo.${day.toLowerCase()}_closing_time`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Closing Time"
                      type="time"
                      fullWidth
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 2
                }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      onChange={(event) => {
                        if (event.target.checked) {
                          setValue(
                            `timePriceInfo.${day.toLowerCase()}_opening_time`,
                            ""
                          );
                          setValue(
                            `timePriceInfo.${day.toLowerCase()}_closing_time`,
                            ""
                          );
                        }
                      }}
                    />
                  }
                  label="Closed"
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 2
                }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleDaySave(day)}
                  fullWidth
                >
                  Save {day}
                </Button>
              </Grid>
            </Grid>
          ))}
          // Save Button for Price Range
          <Grid sx={{ mt: 4 }} size={12}>
            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", textAlign: "center", mb: 2 }}
            >
              Price Range
            </Typography>
            <Controller
              name="timePriceInfo.cafe_price_range"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Price Range"
                  select
                  fullWidth
                  variant="outlined"
                  required
                >
                  <MenuItem value="1">Most Expensive</MenuItem>
                  <MenuItem value="2">Expensive</MenuItem>
                  <MenuItem value="3">Normal</MenuItem>
                  <MenuItem value="4">Economy</MenuItem>
                  <MenuItem value="5">Most Economy</MenuItem>
                </TextField>
              )}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                const priceRange = getValues("timePriceInfo.cafe_price_range");
                updateCafePriceRange(cafeId, priceRange);
              }}
              fullWidth
              sx={{ mt: 2 }}
            >
              Save Price Range
            </Button>
          </Grid>
        </TabPanel>

        {/* Address Info Tab */}
        <TabPanel value={value} index={2}>
          <form onSubmit={handleSubmit(onSubmitAddressInfo)}>
            <Grid container spacing={3}>
              {/* Address Fields */}
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                <Controller
                  name="addressInfo.address_1"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Address 1"
                      fullWidth
                      variant="outlined"
                      required
                    />
                  )}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                <Controller
                  name="addressInfo.address_2"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Address 2"
                      fullWidth
                      variant="outlined"
                    />
                  )}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                <Controller
                  name="addressInfo.city_id"
                  control={control}
                  render={({field:{onChange,value}})=>(
                   <Autocomplete
    options={citiesOption}
    getOptionLabel={(option) =>
      option ? `${option.label}, ${option.state}` : ""
    }
    isOptionEqualToValue={(option, value) =>
      option?.value === value?.value
    }
    value={value || selectedCity}
    onChange={(_, newValue) => {
      onChange(newValue);
      setSelectedCity(newValue);
    }}
    onInputChange={(_, inputValue) => {
      setCitiesOption([]);
      setCitySearchQuery(inputValue);
    }}
    filterOptions={(options, { inputValue }) => {
      const v = inputValue.toLowerCase();
      return options.filter(
        (option) =>
          option.label.toLowerCase().includes(v) ||
          option.state.toLowerCase().includes(v)
      );
    }}
    renderOption={(props, option) => (
      <li {...props} key={option.value}>
        <span className="font-medium">{option.label}</span>
        <span className="text-gray-500">, {option.state}</span>
      </li>
    )}
    renderInput={(params) => (
      <TextField {...params} label="Select city" />
    )}
  />

                  )}
                />
              </Grid>
              {/* <Grid item xs={12} sm={6}>
              <CustomDropdown
                  name="state"
                  control={control}
                  options={indianStates}
                  label="State*"
                  value={getValues("addressInfo.state")}
                  onChange={handleDropdownChangeState}
                  loading={false}
                />
              </Grid> */}
              {/* <Grid item xs={12} sm={6}>
              <CustomDropdown
                  name="country"
                  control={control}
                  options={countries}
                  label="Country*"
                  value={getValues("addressInfo.country")}
                  onChange={handleDropdownChangeCountry}
                  loading={false}
                />
              </Grid> */}
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                <Controller
                  name="addressInfo.pin_code"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Postal Code"
                      fullWidth
                      variant="outlined"
                      required
                    />
                  )}
                />
              </Grid>

              {/* Google Location ID Display */}
              {/* <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Google Location ID
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <TextField
                    value={getValues("addressInfo.google_location_id")}
                    variant="outlined"
                    fullWidth
                    disabled
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ ml: 2 }}
                    onClick={() => {
                      const googleLocationId = getValues(
                        "addressInfo.google_location_id"
                      );
                      console.log(googleLocationId);
                      if (googleLocationId) {
                        const googleMapsUrl = `https://www.google.com/maps/place/?q=place_id:${googleLocationId}`;
                        window.open(googleMapsUrl, "_blank"); // Open in new tab
                      } else {
                        setNotification({
                          open: true,
                          message: "Google Location ID not available.",
                          severity: "error",
                        });
                      }
                    }}
                  >
                    View on Map
                  </Button>
                </Box>
              </Grid> */}

              {/* Save Button */}
              <Grid size={12}>
              <Box sx={{ height: "400px", width: "100%", mb: 2 }}>
                <MapContainer
                  center={[20.5937, 78.9629]} // Center on India
                  zoom={5}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                    {position && <Marker position={position} />}
                  <LocationMarker setPosition={setPosition} />
                </MapContainer>
            </Box>
            </Grid>
              <Grid size={12}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  fullWidth
                >
                  Save Changes
                </Button>
              </Grid>
            </Grid>
          </form>
        </TabPanel>

        {/* Social Info Tab */}
        <TabPanel value={value} index={3}>
          <form onSubmit={handleSubmit(onSubmitSocialInfo)}>
            <Grid container spacing={3}>
              {/* Social Media Links */}
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                <Controller
                  name="socialInfo.website_url"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Website URL"
                      fullWidth
                      variant="outlined"
                    />
                  )}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                <Controller
                  name="socialInfo.social_twitter_url"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Twitter URL"
                      fullWidth
                      variant="outlined"
                    />
                  )}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                <Controller
                  name="socialInfo.social_facebook_url"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Facebook URL"
                      fullWidth
                      variant="outlined"
                    />
                  )}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                <Controller
                  name="socialInfo.social_instagram_url"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Instagram URL"
                      fullWidth
                      variant="outlined"
                    />
                  )}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                <Controller
                  name="socialInfo.zomato_url"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Zomato URL"
                      fullWidth
                      variant="outlined"
                    />
                  )}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                <Controller
                  name="socialInfo.swiggy_url"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Swiggy URL"
                      fullWidth
                      variant="outlined"
                    />
                  )}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                <Controller
                  name="socialInfo.google_map_url"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Google Map URL"
                      fullWidth
                      variant="outlined"
                    />
                  )}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                <Controller
                  name="socialInfo.dineout_url"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Dineout URL"
                      fullWidth
                      variant="outlined"
                    />
                  )}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                <Controller
                  name="socialInfo.social_linkedin_url"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="LinkedIn URL"
                      fullWidth
                      variant="outlined"
                    />
                  )}
                />
              </Grid>

              {/* Save Button */}
              <Grid size={12}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  fullWidth
                >
                  Save Changes
                </Button>
              </Grid>
            </Grid>
          </form>
        </TabPanel>
        {/* Featured Image Tab */}
        <TabPanel value={value} index={4}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <Typography variant="h6" gutterBottom>
                Featured Image
              </Typography>
              <Box
                {...getRootProps()}
                sx={{
                  border: "2px dashed #ccc",
                  padding: "40px",
                  textAlign: "center",
                  borderRadius: "8px",
                  backgroundColor: "#fafafa",
                  cursor: "pointer",
                }}
              >
                <input {...getInputProps()} />
                {featuredImagePreview ? (
                  <Avatar
                    src={featuredImagePreview}
                    alt="Featured Image Preview"
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: "8px",
                      marginBottom: "16px",
                    }}
                  />
                ) : (
                  <>
                    <Typography
                      variant="body1"
                      color="textSecondary"
                      gutterBottom
                    >
                      Drag & drop or click to upload
                    </Typography>
                  </>
                )}
              </Box>

              <Button
                variant="text"
                color="secondary"
                fullWidth
                onClick={() => setFeaturedImagePreview(null)}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleSaveFeaturedImage}
                sx={{ mt: 2 }}
              >
                Save Featured Image
              </Button>
              <Button
                variant="contained"
                color="error"
                fullWidth
                onClick={handleDeleteFeaturedImage}
                sx={{ mt: 2 }}
              >
                Delete Featured Image
              </Button>
            </Grid>
            <Grid container spacing={3} sx={{ mt: 3 }}>
              {galleryImages.length > 0 && (
                <Grid
                  key={galleryImages[0].id}
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4
                  }}>
                  <Card sx={{ position: "relative" }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={`${galleryImages[0].gallery_cf_original_image_url}`}
                      alt={galleryImages[0].cafe_image_name}
                      sx={{ borderRadius: "8px", objectFit: "cover" }}
                    />
                    <IconButton
                      aria-label="delete"
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        backgroundColor: "rgba(255, 255, 255, 0.7)",
                        "&:hover": { backgroundColor: "rgba(255, 0, 0, 0.7)" },
                      }}
                      onClick={() => handleDeleteImage(galleryImages[0].id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        {/* Image Gallery Tab */}
        <TabPanel value={value} index={5}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Image Gallery
          </Typography>
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 4
            }}>
            <Box
              {...getRootProps()}
              sx={{
                border: "2px dashed #ccc",
                padding: "60px",
                margin: "70px",
                textAlign: "center",
                cursor: "pointer",
                borderRadius: "8px",
                backgroundColor: "#fafafa",
              }}
            >
              <input {...getInputProps()} />
              <Typography variant="body1">
                Drag & drop an image here, or click to select a file11
              </Typography>
            </Box>
          </Grid>
          <Grid container spacing={3}>
            {galleryImages.map((image,index) => (
               <Grid
                 key={index}
                 size={{
                   xs: 6,
                   sm: 4,
                   md: 3,
                   lg: 2
                 }}>
               <Card
                 sx={{
                   position: "relative",
                   borderRadius: "8px",
                   overflow: "hidden",
                 }}
               >
                 {/* Delete Button */}
                 <IconButton
                   onClick={() =>
                     handleDelete(image.id)
                   }
                   sx={{
                     position: "absolute",
                     top: 10,
                     right: 10,
                     backgroundColor:
                       "rgba(0,0,0,0.5)",
                     color: "white",
                     padding: "4px",
                     fontSize: "0.8rem",
                     "&:hover": {
                       backgroundColor:
                         "rgba(0,0,0,0.7)",
                     },
                   }}
                   size="small"
                 >
                   <DeleteIcon fontSize="small" />
                 </IconButton>

                 {/* Image */}
                 <Box
                   sx={{
                     width: "100%",
                     height: "150px",
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "center",
                     overflow: "hidden",
                     borderTopLeftRadius: "8px",
                     borderTopRightRadius: "8px",
                   }}
                 >
                   <img
                     src={
                       image.gallery_cf_original_image_url
                     }
                     alt={`Gallery Image ${index}`}
                     style={{
                       maxWidth: "100%",
                       maxHeight: "100%",
                       objectFit: "contain",
                     }}
                   />
                 </Box>

                 {/* Switch Button Below Image */}
                 <CardContent
                   sx={{
                     display: "flex",
                     justifyContent: "space-between",
                     alignItems: "center",
                     padding: "8px",
                   }}
                 >
                   {/* Switch Button */}
                   <Switch
                     checked={
                       activeImageId === image.id
                     }
                     onChange={(e) => {
                       e.preventDefault();
                       handleSwitchChange(image);
                     }}
                     color="primary"
                   />
                 </CardContent>
               </Card>
             </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Images */}
        <TabPanel value={value} index={5}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Image Gallery
          </Typography>
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 4
            }}>
            <Box
              {...getRootProps()}
              sx={{
                border: "2px dashed #ccc",
                padding: "60px",
                margin: "70px",
                textAlign: "center",
                cursor: "pointer",
                borderRadius: "8px",
                backgroundColor: "#fafafa",
              }}
            >
              <input {...getInputProps()} />
              <Typography variant="body1">
                Drag & drop an image here, or click to select a file11
              </Typography>
            </Box>
          </Grid>
          <Grid container spacing={3}>
            {galleryImages.map((image) => (
              <Grid
                key={image.id}
                size={{
                  xs: 12,
                  sm: 6,
                  md: 4
                }}>
                <Card sx={{ position: "relative" }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={image.gallery_cf_original_image_url}
                    alt={image.cafe_image_name}
                    sx={{ borderRadius: "8px", objectFit: "cover" }}
                  />
                  <IconButton
                    aria-label="delete"
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      backgroundColor: "rgba(255, 255, 255, 0.7)",
                      "&:hover": { backgroundColor: "rgba(255, 0, 0, 0.7)" },
                    }}
                    onClick={() => handleDeleteImage(image.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel> 
        {/* Documents Tab */}
        <TabPanel value={value} index={6}>
          {/* Render Documents Component here */}
          <DocumentsTab /> {/* Replace with your actual Documents component */}
        </TabPanel>

        {/* Devices Tab */}
        <TabPanel value={value} index={7}>
          {/* Render Devices Component here */}
          <DevicesTab /> {/* Replace with your actual Devices component */}
        </TabPanel>
        <TabPanel value={value} index={8}>
          {/* Render Devices Component here */}
          <SettingsTab /> {/* Replace with your actual Devices component */}
        </TabPanel>
        <TabPanel value={value} index={9}>
        <Box sx={{ mt: 4 }}>
    <Typography variant="h6" sx={{ mb: 2 }}>Gallery Images</Typography>
    <Grid container spacing={2}>
      {galleryImages
        .filter((item) => item.gallery_cf_original_image_url?.startsWith("https://"))
        .map((item) => (
          <Grid
            key={item.id}
            size={{
              xs: 12,
              sm: 6,
              md: 3
            }}>
            <img
              src={item.gallery_cf_original_image_url}
              alt={item.cafe_image_name || "Gallery Image"}
              style={{
                width: "100%",
                height: "200px",
                objectFit: "cover",
                borderRadius: "8px",
                border: "1px solid #ccc"
              }}
            />
          </Grid>
        ))}
    </Grid>
  </Box>
        </TabPanel>

        {/* Notification Snackbar */}
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={notification.open}
          autoHideDuration={6000}
          onClose={() =>
            setNotification({ open: false, message: "", severity: "success" })
          }
        >
          <Alert severity={notification.severity}>{notification.message}</Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default EditProfile;
