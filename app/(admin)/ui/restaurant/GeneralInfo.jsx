import { Styletypo } from "../../../styles/Restaurant/EditRestaurant";
import {
  Typography,
  InputLabel,
  Grid,
  Box,
  Checkbox,
  TextField,
} from "@mui/material";
import Primary from "./Primary";
import EditOptions from "./EditOptions";
import Icon from "../../../assets/Icon";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import instanceV1 from "../../../api/axiosInstance";
import Toast from "../../../Components/Toast";
import Spinner from "../../../Components/Progress/Spinner";
import { validatePhoneNumber } from "../../../auth/RegexValidation/validate";
import ErrorText from "../../../Components/ErrorText";
import Demo from "../../../Components/ImageCropper/Demo";
import cafe_profile from "./cafe_profile.json";
import { lastUpdatedAtDateToUTC } from "./ConvertTime";
import { PlaceholderImage } from "../../../Components/place-holder-image";
import { db } from "../../../db/schema";

const GeneralInfo = () => {
  const token = useSelector((state) => state.tokenSlice.currentuser.token);
  const [succ, setSucc] = useState();
  const [isSave, setIsSave] = useState(false);
  const [loading, setLoading] = useState(false);
  const [thumbnail, setThumbnail] = useState(""); // State to hold the thumbnail image
  const [intialLoadingSpinner, setInitialLoadingSpinner] = useState(true);
  const [formChanged, setFormChanged] = useState(false); // State to track form changes
  const [, setAvtar] = useState();
  const [newImgId, setImgId] = useState();
  const [errors, setErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [disableUploadButton, setDisableUploadButton] = useState(true); // State to disable the upload button
  const [, setDisableInputButton] = useState(false); // State to disable the upload button

  const [selectedImage, setSelectedImage] = useState(null);

  const [data, setData] = useState({
    cafe_about: "",
    cafe_list_id: 0,
    cafe_long_url: "",
    cafe_name: "",
    cafe_price_range: 2,
    cafe_short_url: "",
    cafe_slogan: "",
    city: "",
    closing_time: "",
    country: "",
    created_at: "",
    currency: "",
    cafe_email: "",
    fssai_certificate_url: "",
    id: 0,
    is_featured: 0,
    is_most_visited: 0,
    is_new_opening: 0,
    is_non_veg: 0,
    is_veg: 0,
    latitude: 0,
    logo_image_id: "",
    longitude: 0,
    cafe_phone: "",
    most_ordered_menu_item_price_id: 1,
    most_used_payment_mode: "",
    opening_time: "00:00:00",
    pin_code: null,
    social_facebook_url: "",
    social_instagram_url: null,
    social_linkedin_url: "",
    social_twitter_url: "",
    social_whatsapp_no: null,
    starting_price: null,
    state: "",
    status: 0,
    total_item: null,
    total_order: null,
    total_review: 0,
    uid: null,
    user_admin_id: null,
    website_url: "",
  });

  const [openCropDialog, setOpenCropDialog] = useState(false);

  const handleChooseImage = (event) => {
    const file = event.target.files[0];
    setSelectedImage(URL.createObjectURL(file));
    setOpenCropDialog(true);
  };

  const handleCloseModal = () => {
    setOpenCropDialog(false);
    setSelectedImage(null);
  };

  useEffect(() => {
    const getCafeList = async () => {
      try {
        const cafeList = await db.database.cafe_profile.toArray();

        if (cafeList.length === 0) {
          const initialData = cafe_profile;
          await db.database.cafe_profile.add({
            ...initialData,
            is_dirty: false,
            is_modified: false,
          });
          setData(initialData);
          // Set the thumbnail if logo_image_id exists in initialData
          if (initialData.logo_image_id) {
            setThumbnail(initialData.logo_image_id);
            setImgId(initialData.logo_image_id);
          }
        } else {
          setData(cafeList[0]);
          // Set the thumbnail if logo_image_id exists in the retrieved data
          if (cafeList[0].logo_image_id) {
            setThumbnail(cafeList[0].logo_image_id);
            setImgId(cafeList[0].logo_image_id);
          }
        }
      } catch (error) {
        console.error("Error fetching cafe profile:", error);
      } finally {
        setInitialLoadingSpinner(false);
      }
    };

    getCafeList();
  }, []);

  // for veg and non veg
  const handleNonVegChange = (e) => {
    setErrors({
      ...errors,
      food_type: "",
    });
    const newValue = e.target.checked ? 1 : 0;
    setData({ ...data, is_non_veg: newValue });
    setFormChanged(true);
  };

  const handleVegChange = (e) => {
    setErrors({
      ...errors,
      food_type: "",
    });
    const newValue = e.target.checked ? 1 : 0;
    setData({ ...data, is_veg: newValue });
    setFormChanged(true);
  };
  const handleChange = (e) => {
    if (e.target.name == "cafe_phone") {
      setErrors({
        ...errors,
        phoneNumber: "",
      });
    }
    setData({ ...data, [e.target.name]: e.target.value });
    setFormChanged(true);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormSubmitted(true);
      setIsSave(true);
      setSucc(null);
      const newErrors = {};

      // Validate phone number
      if (!validatePhoneNumber(data.cafe_phone)) {
        newErrors.phoneNumber = "Invalid phone number!";
      }
      if (data.is_veg == 0 && data.is_non_veg == 0) {
        newErrors.food_type = "Choose Food Type";
      }
      setErrors(newErrors);

      // If there are errors, return early
      if (Object.keys(newErrors).length > 0) {
        setIsSave(false);
        return;
      }

      const updatedData = {
        ...data,
        is_dirty: false,
        is_modified: true,
        last_updated_at: lastUpdatedAtDateToUTC(),
      };

      // Clear existing data and add updated data
      await db.database.cafe_profile.clear();
      await db.database.cafe_profile.add({
        ...updatedData,
        // Make sure to include logo_image_id explicitly
        logo_image_id: updatedData.logo_image_id,
      });

      setSucc("Updated Successfully!!!");
      setIsSave(false);
      setFormChanged(false);
    } catch (err) {
      setIsSave(false);
      console.log(err);
      setSucc(err);
    } finally {
      setFormChanged(false);
    }
  };

  const uploadImage = async (croppedFile) => {
    // setLoading(true);
    const newInstance = instanceV1(token);
    try {
      const response = await newInstance.post(
        "/api/user/uploadImage",
        { file: croppedFile, uploadType: "cafe_logo" },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update the data object with the new image URL
      const updatedData = {
        ...data,
        logo_image_id: response.data.imageUrl,
      };

      // Update the state
      setData(updatedData);
      setAvtar(response.data.imageUrl);
      setImgId(response.data.imageUrl);
      setThumbnail(response.data.imageUrl); // Set the thumbnail to display the image

      // Save to IndexedDB
      await db.database.cafe_profile.clear();
      await db.database.cafe_profile.add({
        ...updatedData,
        is_dirty: false,
        is_modified: true,
        last_updated_at: lastUpdatedAtDateToUTC(),
      });

      setLoading(false);
      setFormChanged(true);
      setDisableUploadButton(true);
      setDisableInputButton(true);
    } catch (error) {
      setDisableUploadButton(false);
      setLoading(false);
      console.error("Upload Error:", error);
    }
  };

  const drawer = useSelector((state) => state.drawerSlice.currentDrawer);
  return (
    <>
      {intialLoadingSpinner ? (
        <Box
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Spinner />
        </Box>
      ) : (
        <>
          <Box

          >
            {succ && <Toast err={succ} type={"success"} />}
            <Styletypo
              textAlign="center"
              fontSize="1.285rem"
              fontWeight="600"
              marginBottom={1}
            >
              Restaurant Menu
            </Styletypo>

            <Box>
              <Box>
                <EditOptions />
              </Box>

              <Grid container spacing={3} alignItems="center" marginTop={4}>
                <Grid>
                  <Box
                    color="none"
                    style={{ background: "transparent", paddingLeft: "0" }}
                    size="sm"
                  >
                    <label
                      htmlFor="file-upload"
                      style={{ display: "block", cursor: "pointer" }}
                    >
                      <div
                        style={{
                          width: "100px",
                          height: "100px",
                          background: "#E7ECF0",
                          borderRadius: "8px",
                          overflow: "hidden",
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt="Thumbnail"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <PlaceholderImage
                            src={newImgId}
                            placeholder={""}
                            style={{ width: "100%", height: "100%" }}
                          />
                        )}

                        <input
                          id="file-upload"
                          type="file"
                          onChange={(e) => handleChooseImage(e)}
                          hidden
                          accept="image/png, image/jpg, image/jpeg"
                        />
                      </div>
                    </label>
                    <Demo
                      uploadImage={uploadImage}
                      aspect={1}
                      selectedImage={selectedImage}
                      setSelectedImage={setSelectedImage}
                      onClose={handleCloseModal}
                      open={openCropDialog}
                      setOpenCropDialog={setOpenCropDialog}
                    />
                  </Box>
                </Grid>
                <Grid>
                  <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                    <Grid>
                      <Primary
                        value={
                          <Box sx={{ display: "flex", gap: 1 }}>
                            upload
                            {loading ? (
                              <Spinner
                                size={20}
                                thickness={5}
                                color={"white"}
                              />
                            ) : null}
                          </Box>
                        }
                        disabled={disableUploadButton}
                        handleClick={uploadImage}
                      />
                    </Grid>
                  </Box>
                  <Box>Allowed file types: png, jpg, jpeg.</Box>
                </Grid>
              </Grid>

              {/* <form style={{ height: "100%" }}> */}
              <Grid container spacing={3} marginTop={5}>
                <Grid size={{ xs: 12, sm: 8, md: 6, lg: 4 }}>
                  <TextField
                    label="Restaurant Name"
                    variant="outlined"
                    fullWidth
                    size="small"
                    margin="dense"
                    name="cafe_name"
                    disabled={true}
                    onChange={handleChange}
                    value={data.cafe_name || ""}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 8, md: 6, lg: 4 }}>
                  <TextField
                    label="Slogan"
                    variant="outlined"
                    fullWidth
                    size="small"
                    margin="dense"
                    name="cafe_slogan"
                    onChange={handleChange}
                    placeholder="Slogan/Tagline"
                    value={data.cafe_slogan || ""}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={3} marginTop={1}>
                <Grid size={{ xs: 12, sm: 8, md: 6, lg: 4 }}>
                  <TextField
                    label="Email"
                    variant="outlined"
                    fullWidth
                    size="small"
                    margin="dense"
                    name="cafe_email"
                    disabled={true}
                    onChange={handleChange}
                    value={data.cafe_email || ""}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 8, md: 6, lg: 4 }}>
                  <TextField
                    label="Mobile Number"
                    variant="outlined"
                    fullWidth
                    size="small"
                    margin="dense"
                    name="cafe_phone"
                    InputProps={{
                      inputProps: {
                        maxLength: 10,
                        type: "Number",
                      },
                    }}
                    maxLength="10"
                    pattern="[6-9][0-9]{9}"
                    onChange={handleChange}
                    value={data.cafe_phone || ""}
                  />
                  {formSubmitted && errors?.phoneNumber && (
                    <ErrorText value={errors.phoneNumber} />
                  )}
                </Grid>
              </Grid>

              <Grid container spacing={3} marginTop={2}>
                <Grid size={{ xs: 12, sm: 8, md: 12, lg: 8 }}>
                  <Box>
                    <TextField
                      variant="outlined"
                      fullWidth
                      size="small"
                      id="cafe_about"
                      name="cafe_about"
                      label="Description"
                      multiline
                   
                      onChange={handleChange}
                      minRows={7}
                      value={data.cafe_about}
                      placeholder="Here are some tips to help you create an effective restaurant description:
1. Begin with a strong opening statement that captures the essence of the restaurant.
2. Describe the type of cuisine the restaurant serves, and highlight any signature dishes or specialties.
3. Talk about the ambiance and decor of the restaurant. Is it casual or upscale? Modern or traditional?
4. Highlight any unique features or amenities the restaurant offers, such as outdoor seating, a full bar, live music, or private event spaces.
5. Finally, encourage readers to come visit the restaurant and experience it for themselves."
                    />
                  </Box>
                </Grid>
              </Grid>

              <Grid container alignItems="center" marginTop={2}>
                <Grid size={{ xs: 12 }}>
                  <InputLabel>
                    Veg/Nonveg{" "}
                    <Box color={"red"} sx={{ display: "inline-block" }}>
                      *
                    </Box>
                  </InputLabel>
                </Grid>
                <Grid container spacing={2} marginTop="5px">
                  <Grid display={"flex"} alignItems="center" ml={"-12px"}>
                    <Checkbox
                      name="is_non_veg"
                      checked={data.is_non_veg === 1}
                      sx={{
                        color: "#E7ECF0",
                        "&.Mui-checked": {
                          color: "#F2473F",
                        },
                      }}
                      onChange={handleNonVegChange}
                    />
                    <Icon condition="nonveg" />
                    <Typography>Non-Veg</Typography>
                  </Grid>
                  <Grid display={"flex"} alignItems="center">
                    <Checkbox
                      name="is_veg"
                      sx={{
                        color: "#E7ECF0",
                        "&.Mui-checked": {
                          color: "#F2473F",
                        },
                      }}
                      checked={data.is_veg === 1}
                      onChange={handleVegChange}
                    />
                    <Icon condition="veg" />
                    <Typography>Veg</Typography>
                  </Grid>
                </Grid>
                {formSubmitted && errors?.food_type && (
                  <ErrorText value={errors.food_type} />
                )}
              </Grid>
              {/* </form> */}
            </Box>
            <Grid size={{ xs: 12 }} marginTop={2} marginBottom={3}>
              <Primary
                disabled={!formChanged}
                value={
                  <Box sx={{ display: "flex", gap: 1 }}>
                    Save
                    {isSave ? (
                      <Spinner size={20} thickness={5} color={"white"} />
                    ) : null}
                  </Box>
                }
                handleClick={handleSubmit}
              />
            </Grid>
          </Box>
        </>
      )}
    </>
  );
};

export default GeneralInfo;
