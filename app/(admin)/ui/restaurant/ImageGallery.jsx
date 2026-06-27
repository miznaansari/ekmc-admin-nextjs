import { useEffect, useState } from "react";
import { Typography, Grid, Paper } from "@mui/material";
import EditOptions from "./EditOptions";
import Icon from "../../../assets/Icon";
import { Box } from "@mui/system";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import instanceV1 from "../../../api/axiosInstance";
import { useSelector } from "react-redux";
import Spinner from "../../../Components/Progress/Spinner";
import Toast from "../../../Components/Toast";
import { useMediaQuery } from "@mui/material";
import Demo from "../../../Components/ImageCropper/GalleryImageCrop/GalleryDemo";
import { PlaceholderImage } from "../../../Components/place-holder-image";
import { fetchTableData } from "../../../db/actions";

const ImageGallery = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const token = useSelector((state) => state.tokenSlice.currentuser.token);
  const [, setImageSizeError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [succ, setSucc] = useState();
  const [intialLoadingSpinner, setInitialLoadingSpinner] = useState(true);

  const isMobile = useMediaQuery("(max-width:500px)");

  const [selectedImage, setSelectedImage] = useState(null);
  let aspectRation = 16 / 9;

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handleChooseImage = async (event) => {
    const file = event.target.files[0];
    try {
      setSelectedImage(URL.createObjectURL(file));
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  useEffect(() => {
    const getCafeById = async () => {
      const newInstance = instanceV1(token);
      try {
        // const j = await newInstance.get(`/api/user/restaurant-all-info`)
        const j = await fetchTableData("cafe_profile");
        console.log(j);
        setInitialLoadingSpinner(false);
        setFiles(j[0].gallery.filter((i) => i.is_featured === 0));
      } catch (err) {
        console.log(err);
        setInitialLoadingSpinner(false);
      }
    };
    getCafeById();
  }, []);

  const uploadImage = async (allimages) => {
    const newInstance = instanceV1(token);
    setImageSizeError("");
    setUploading(true);
    const j = await newInstance.post(
      "/api/user/uploadImage",
      { file: allimages, uploadType: "cafe_gallery" },
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    const k = await newInstance.post("/api/restaurant/featured-image", {
      cafe_image_name: allimages.name.slice(0, 30),
      image_position: 0,
      server_image_id: j.data.imageUrl,
      is_featured: 0,
    });
    setFiles((prevFiles) => [...prevFiles, k.data.data]);

    setUploading(false);
    setSucc("Updated Successfully!!!");
  };

  const handleRemoveFile = async (file) => {
    const newInstance = instanceV1(token);
    try {
      await newInstance.delete(
        `/api/restaurant/delete-featured-image/${file.id}`
      );
      const uploadedFiles = files;
      const filtered = uploadedFiles.filter((i) => i.id !== file.id);
      setFiles([...filtered]);
    } catch (error) {
      console.log(error);
    }
  };

  const drawer = useSelector((state) => state.drawerSlice.currentDrawer);

  return (
    <>
      <Paper>
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
          <Box
            sx={{
              pl: {
                xs: "4%",
                lg: drawer ? "19%" : "6.3%",
              },
              pr: "4%",
            }}
          >
            {succ && <Toast err={succ} type={"success"} />}

            <Typography
              paddingTop={"12px"}
              fontSize="1.285rem"
              fontWeight="600"
              marginBottom={1}
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
              onClick={() => navigate("/restaurant/profile/feature-image")}
              style={{
                cursor: "pointer",
                width: "100%",
                display: "flex",
                justifyContent: "start",
              }}
            >
              <ArrowBackIcon style={{ color: "black" }} />
              Edit
            </Typography>
            <Box marginBottom={10}>
              <EditOptions />
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 5 }}>
                  <label
                    htmlFor="file-upload"
                    style={{ display: "block", cursor: "pointer" }}
                  >
                    <Grid
                      size={{ xs: 12 }}
                      component={Box}
                      width="100%"
                      height="305px"
                      marginTop={3}
                      bgcolor={"rgba(231, 236, 240, 1)"}
                      display={"flex"}
                      justifyContent={"center"}
                      alignItems={"center"}
                      borderRadius={"10px"}
                    >
                      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                        {uploading ? (
                          <Spinner size={20} thickness={5} color={"black"} />
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              background: "#E7ECF0",
                              borderRadius: "8px",
                              overflow: "hidden",
                              justifyContent: "center",
                            }}
                          >
                            <Icon condition="upload" />
                            <Typography
                              variant="h6"
                              fontWeight={800}
                              color={"#768DA9"}
                            >
                              Upload Photo
                            </Typography>
                          </div>
                        )}
                        <input
                          hidden
                          id="file-upload"
                          type="file"
                          // multiple
                          onChange={handleChooseImage}
                          accept="image/*"
                        />
                        <Demo
                          uploadImage={uploadImage}
                          aspect={aspectRation}
                          selectedImage={selectedImage}
                          onClose={handleCloseModal}
                          open={!!selectedImage}
                        />
                      </Box>
                    </Grid>
                  </label>
                </Grid>
              </Grid>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  marginTop: "20px",
                  gap: "20px",
                  width: "100%",
                }}
              >
                {Array.isArray(files) &&
                  files.length > 0 &&
                  files.map((element, i) => {
                    return (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                        }}
                      >
                        <Box
                          style={{
                            position: "absolute",
                            top: "5px",
                            right: "5px",
                            cursor: "pointer",
                          }}
                          onClick={() => handleRemoveFile(element)}
                        >
                          <Icon condition="delete" />
                        </Box>
                        {
                          <PlaceholderImage
                            src={element.gallery_cf_original_image_url}
                            placeholder={
                              element.gallery_auzre_placeholder_image_url
                            }
                            style={{
                              width: isMobile ? "92vw" : "200px",
                              height: isMobile
                                ? `${300 * (9 / 16)}px`
                                : `${200 * (9 / 16)}px`, // Set the height to maintain a 16:9 aspect ratio
                              objectFit: "cover", // Preserve aspect ratio and crop the image if necessary
                              borderRadius: "7px",
                            }}
                          />
                        }
                      </div>
                    );
                  })}
              </div>
            </Box>
          </Box>
        )}
      </Paper>
    </>
  );
};

export default ImageGallery;
