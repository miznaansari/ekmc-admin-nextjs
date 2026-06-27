import {useState } from "react";
import Cropper from "react-easy-crop";
import Slider from "@mui/material/Slider";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import getCroppedImg from "./CorpImage";
// import Primary from "../Button/Primary";
import { Button,
  Grid} from "@mui/material";
import Outline from "./Outline";
import { useMediaQuery } from "@mui/material";

const DemoAi = ({
  selectedImage,
  onClose,
  open,
  aspect,
  setSelectedImage,
  setOpenCropDialog,
  onCropCompleteImage
}) => {
  const [crop, setCrop] = useState({ x: 40, y: 70 });
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const isMobile = useMediaQuery("(max-width:500px)");

  const handleClose = () => {
    onClose();
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const showCroppedImage = async () => {
    console.log('crop function run ho bhi raha hai anhi nahi')
    try {
      const croppedImageBlobUrl = await getCroppedImg(
        selectedImage,
        croppedAreaPixels,
        rotation
      );
      const croppedFile = await convertBlobToFile(
        croppedImageBlobUrl,
        "cropped_image.jpg"
      );
      setOpenCropDialog(false);
      console.log('upload ke liye call ho raha hai ki nahi')
      console.log(croppedFile)
      setSelectedImage(URL.createObjectURL(croppedFile));
      onCropCompleteImage(croppedFile); 
      // handleClose();
    } catch (error) {
      console.error(error);
    }
  };

  const convertBlobToFile = async (blobUrl, fileName) => {
    // Fetch the blob
    const blob = await fetch(blobUrl).then((r) => r.blob());

    // Create a File object from the blob
    const file = new File([blob], fileName, { type: blob.type });

    return file;
  };

  const handleZoomChange = (e, zoom) => {
    setZoom(zoom);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ elevation: 0 }}
    >
      {/* <DialogTitle>Crop Image</DialogTitle> */}
      <DialogContent>
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 300,
            background: "#333",
            maxWidth: "550px",
          }}
        >
          <Cropper
            image={selectedImage}
            crop={crop}
            rotation={rotation}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>
        <div style={{ padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              style={{ flexGrow: 1, color: "#00CF63" }}
              onChange={handleZoomChange}
              sx={{ maxWidth: "100%" }}
            />
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Grid
          container
          style={{
            display: "flex",
            flexWrap: isMobile ? "wrap" : "nowrap",
            gap: "5px",
            marginBottom: "1rem",
          }}
        >
          <Grid item xs={12} sm={6}>
            <Outline
              handleClick={handleClose}
              variant="outlined"
              value={"Cancel"}
              width={"100%"}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              color="primary"
              onClick={showCroppedImage}
              variant="contained"
            >
              Crop and Save
            </Button>
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  );
};

export default DemoAi;
