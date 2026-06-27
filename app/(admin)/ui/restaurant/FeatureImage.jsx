import { useEffect, useState } from "react";
import { Box, Typography, Grid } from "@mui/material";
import EditOptions from "./EditOptions";
import Icon from "../../../assets/Icon";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "@/ui/utils/nextRouting";
import instanceV1 from "../../../api/axiosInstance";
import { useSelector } from "react-redux";
import Toast from "../../../Components/Toast";
import Demo from "../../../Components/ImageCropper/Demo";
import Spinner from "../../../Components/Progress/Spinner";
import { PlaceholderImage } from "../../../Components/place-holder-image";
import { fetchTableData } from "../../../db/actions";

const FeatureImage = () => {
  const token = useSelector((state) => state.tokenSlice.currentuser.token);

  const [featuredId, setFeaturedId] = useState();
  const [files, setFiles] = useState();
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState();
  const [updated, setUpdated] = useState();
  const [filesPlaceholder, setFilesPlaceholder] = useState(null);

  const [intialLoadingSpinner, setInitialLoadingSpinner] = useState(true);

  const [selectedImage, setSelectedImage] = useState(null);
  const [openCropDialog, setOpenCropDialog] = useState(false);

  const aspectRation = 16 / 9;

  const handleCloseModal = () => {
    setOpenCropDialog(false);
    setSelectedImage(null);
  };

  const handleChooseImage = async (event) => {
    const file = event.target.files[0];
    try {
      setSelectedImage(URL.createObjectURL(file));
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setOpenCropDialog(true);
    }
  };

  const uploadImage = async (s) => {
    const newInstance = instanceV1(token);
    console.log(s);
    try {
      setUploading(true);

      const j = await newInstance.post(
        "/api/user/uploadImage",
        { file: s, uploadType: "cafe_gallery" },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const k = await newInstance.post(`api/restaurant/featured-image`, {
        cafe_image_name: s?.name,
        image_position: 1,
        server_image_id: j?.data?.imageUrl,
        is_featured: 1,
      });
      console.log(k.data, "this is after uplaod");
      setFiles(k.data.data.gallery_auzre_480px_image_url);
      setFilesPlaceholder(k.data.data.gallery_auzre_placeholder_image_url);
      setFeaturedId(k.data.data.id);
      setUploading(false);
      setUpdated("Uploaded Successfully !!");
    } catch (err) {
      console.log(err);
      setErr(err.j.data.msg);
    }
  };

  const handleRemoveFile = async () => {
    const newInstance = instanceV1(token);
    try {
      await newInstance.delete(
        `/api/restaurant/delete-featured-image/${featuredId}`
      );
      setFiles(null);
      setFeaturedId();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const getCafeById = async () => {
      try {
        const j = await fetchTableData("cafe_profile");
        setInitialLoadingSpinner(false);
        console.log(j);
        const isFeatured = j.filter((e) => e.is_featured === 1);
        if (isFeatured.length >= 1) {
          setFiles(
            isFeatured[0].gallery.filter((item) => item.is_featured === 1)[0]
              .gallery_cf_original_image_url
          );
          setFeaturedId(isFeatured[0].id);
        }
      } catch (err) {
        console.log(err);
        setInitialLoadingSpinner(false);
      }
    };
    getCafeById();
  }, []);

  const navigate = useNavigate();
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
        <Box
          sx={{
            pl: {
              xs: "4%",
              lg: drawer ? "19%" : "6.3%",
            },
            pr: "4%",
            transition: "padding-left 0.4s ease", // Transition for padding-left
          }}
        >
          {err && <Toast err={err} type={"error"} />}
          {updated && <Toast err={updated} type={"success"} />}

          <Typography
            paddingTop={"12px"}
            fontSize="1.285rem"
            fontWeight="600"
            marginBottom={1}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            onClick={() => navigate("/restaurant/profile/social-info")}
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
            <input
              hidden
              id="file-upload"
              type="file"
              onChange={handleChooseImage}
              accept="image/*"
            />
            <Demo
              uploadImage={uploadImage}
              aspect={aspectRation}
              selectedImage={selectedImage}
              onClose={handleCloseModal}
              // open={!!selectedImage}
              open={openCropDialog}
              setOpenCropDialog={setOpenCropDialog}
              setSelectedImage={setSelectedImage}
            />

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 7.2 }}>
                <label
                  htmlFor="file-upload"
                  style={{ display: "block", cursor: "pointer" }}
                >
                  <Grid
                    size={{ xs: 12 }}
                    component={Box}
                    width="100%"
                    height="350px"
                    marginTop={5}
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
                    </Box>
                  </Grid>
                </label>
              </Grid>
            </Grid>
            {files ? ( // Check if files is not null
              (<div
                className="imgdiv"
                style={{
                  position: "relative",
                  display: "inline-block",
                  marginTop: "16px",
                }}
              >
                <PlaceholderImage
                  src={files}
                  placeholder={filesPlaceholder}
                  classname="relative inline-block mt-8 imgdiv"
                  style={{
                    width: "200px",
                    height: `${200 * (9 / 16)}px`, // Set the height to maintain a 16:9 aspect ratio
                    objectFit: "cover", // Preserve aspect ratio and crop the image if necessary
                    borderRadius: "7px",
                  }}
                />
                <Box
                  onClick={handleRemoveFile}
                  style={{
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                    cursor: "pointer",
                  }}
                >
                  <Icon condition="delete" />
                </Box>
              </div>)
            ) : null}
          </Box>
        </Box>
      )}
    </>
  );
};

export default FeatureImage;
