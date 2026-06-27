import React, { useState, useRef } from "react";
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Divider,
  Stack,
  Avatar,
  Snackbar,
  Alert,
  Grid,
} from "@mui/material";
import instanceV1 from "../../restaurant/authaxios";
import Demo from "../../restaurant/Demo";

export default function OwnerKyc({ datas }) {
  const [panNumber, setPanNumber] = useState(datas?.pan_number || "");
  const [gstNumber, setGstNumber] = useState(datas?.gst_number || "");
  const [fssaiNumber, setFssaiNumber] = useState(datas?.fassai_licence_number || "");
  const [taxation, setTaxation] = useState(datas?.is_gst ? "Yes" : "No");
  const [fssai, setFssai] = useState(datas?.is_fassai ? "Yes" : "No");
  const [imagePreview, setImagePreview] = useState(datas?.fssai_certificate_url || null);
  const [uploadedUrl, setUploadedUrl] = useState(datas?.fssai_certificate_url || "");
  const [rawFile, setRawFile] = useState(null);
  const [businessName, setBusinessName] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [openCropDialog, setOpenCropDialog] = useState(false);
  const [aspectRatio] = useState(4 / 3);

  const fileInputRef = useRef(null);
  const token = localStorage.getItem("authToken");
  const api = instanceV1(token);

  // ❌ Error states
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  // ❌ Refs for scrolling
  const panRef = useRef(null);
  const gstRef = useRef(null);
  const businessNameRef = useRef(null);

  const fssaiRef = useRef(null);

  const isDisabled = {
    pan: !!datas?.pan_number,
    gst: !!datas?.gst_number,
    fssaiNumber: !!datas?.fassai_licence_number,
    fssaiImage: !!datas?.fssai_certificate_url,
  };

  const uploadImage = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadType", "eats-doc");

    try {
      const res = await api.post("/api/admin/cf/v1/upload", formData);
      if (res.data?.status) {
        setUploadedUrl(res.data.customUrl);
        setImagePreview(res.data.customUrl);
      } else {
        console.error("Upload failed:", res.data);
      }
    } catch (err) {
      console.error("Upload failed:", err.response?.data || err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    setRawFile(file);
    if (selectedImage) URL.revokeObjectURL(selectedImage);
    setSelectedImage(URL.createObjectURL(file));
    setOpenCropDialog(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleReset = () => {
    setImagePreview(null);
    setUploadedUrl("");
    setRawFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (selectedImage) URL.revokeObjectURL(selectedImage);
    setSelectedImage(null);
  };

  const handleCropComplete = (croppedBlob) => {
    if (croppedBlob) {
      const croppedFile = new File([croppedBlob], rawFile?.name || "cropped.png", {
        type: rawFile?.type || "image/png",
      });
      uploadImage(croppedFile);
    }
    setOpenCropDialog(false);
  };

  const handleSave = async () => {
    const cafeListId = localStorage.getItem("cafeListId");
    if (!cafeListId) {
      alert("No Cafe Name found in localStorage");
      return;
    }
    const newErrors = {};
    if (!panNumber) newErrors.pan = true;
    if (!businessName) newErrors.businessName = true;
    if (!gstNumber && taxation === "Yes") newErrors.gst = true;
    if (!fssaiNumber && fssai === "Yes") newErrors.fssaiNumber = true;
    if (!uploadedUrl && fssai === "Yes") newErrors.fssaiImage = true;

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setSnackbar({ open: true, status: 'error', message: "Please fill all required fields" });
      // Scroll to first invalid field
      if (newErrors.pan) panRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (newErrors.businessName) businessNameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      else if (newErrors.gst) gstRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      else if (newErrors.fssaiNumber || newErrors.fssaiImage)
        fssaiRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const data = {


      cafe_list_id: cafeListId,
      pan_number: panNumber,
      is_gst: taxation === "Yes" ? 1 : 0,
      is_fassai: fssai === "Yes" ? 1 : 0,
      gst_number: gstNumber,
      // fassai_licence_number: fssaiNumber,
      fssai_certificate_url: uploadedUrl,
      business_name: businessName,
    };

    try {
      const res = await api.post("/api/admin/onboard/v1/cafe/kyc", data);
      // alert("KYC Saved Successfully!");
      console.log("KYC Saved:", res.data);
      setSnackbar({ open: true, status: 'success', message: "KYC Saved Successfully!" });

    } catch (err) {
      console.error("Save failed:", err);
      setSnackbar({ open: true, status: 'error', message: err.response.data.msg || err.response.data.error.message || "Save failed" });

    }
  };

  return (
    <Paper sx={{ width: "100%", p: 2, mt: 1 }}>
      <Typography variant="h5" mb={2}>
        Owner KYC
      </Typography>
      <Grid container spacing={2}>
        <Grid
          size={{
            xs: 12,
            md: 6
          }}>
          <TextField
            fullWidth
            label="Business Name"
            placeholder="Business Name"
            value={businessName}
            size="small"
            onChange={(e) => {
              setBusinessName(e.target.value);
              setErrors(prev => ({ ...prev, businessName: false })); // clear error on input

            }}
            disabled={isDisabled.businessName}
            error={!!errors.businessName}
            sx={{ mb: 1 }}
            ref={businessNameRef}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            md: 6
          }}>
          {/* PAN Card */}
          <Box ref={panRef} sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              fullWidth
              label="Please provide your PAN Card Number"
              placeholder="XXXX0000X"
              value={panNumber}
              size="small"
              onChange={(e) => {
                setPanNumber(e.target.value);
                setErrors(prev => ({ ...prev, pan: false })); // clear error on input
              }}
              disabled={isDisabled.pan}
              error={!!errors.pan}
            />

            <Button
              variant="contained"
              disabled={!panNumber || isDisabled.pan}
              onClick={() => console.log("PAN Verified")}
            >
              VERIFY
            </Button>
          </Box>
        </Grid></Grid>
      <Divider sx={{ my: 2 }} />
      {/* Taxation Details */}
      <Box ref={gstRef} sx={{ mb: 3 }}>
        <FormLabel>Taxation Details</FormLabel>
        <RadioGroup row value={taxation} onChange={(e) => setTaxation(e.target.value)}>
          <FormControlLabel
            value="Yes"
            control={<Radio color="secondary" />}
            label="Yes"
            disabled={isDisabled.gst}
          />
          <FormControlLabel
            value="No"
            control={<Radio color="secondary" />}
            label="No"
            disabled={isDisabled.gst}
          />
        </RadioGroup>

        <Stack direction="row" spacing={1} alignItems="center" mt={1}>
          <TextField
            fullWidth
            label="GST Number"
            placeholder="00XXXXX0000X0X0"
            value={gstNumber}
            size="small"
            onChange={(e) => setGstNumber(e.target.value)}
            disabled={isDisabled.gst}
            error={!!errors.gst}
          />
          <Button
            variant="contained"
            disabled={!gstNumber || isDisabled.gst}
            onClick={() => console.log("GST Verified")}
          >
            VERIFY
          </Button>
        </Stack>
      </Box>
      <Divider sx={{ my: 2 }} />
      {/* FSSAI Certificate */}
      <Box ref={fssaiRef} sx={{ mb: 3 }}>
        <FormLabel>FSSAI Certificate (Image)</FormLabel>
        <Stack direction="row" spacing={2} alignItems="center" mt={2}>
          <Avatar variant="rounded" sx={{ width: 80, height: 80 }} src={imagePreview || ""}>
            {!imagePreview && "F"}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" mb={1}>
              Certificate Upload
            </Typography>
            <Stack direction="row" spacing={1} mb={1}>
              <Button
                size="small"
                color="primary"
                variant="contained"
                onClick={handleUploadClick}
                disabled={isDisabled.fssaiImage}
              >
                Upload
              </Button>
              <Button
                variant="contained"
                size="small"
                disabled={!imagePreview || isDisabled.fssaiImage}
                onClick={handleReset}
              >
                Reset
              </Button>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Allowed file types: png, jpg, jpeg.
            </Typography>
            {errors.fssaiImage && <Typography color="error">Certificate is required</Typography>}
            <input
              type="file"
              accept="image/png,image/jpg,image/jpeg"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </Box>
        </Stack>

        <RadioGroup row value={fssai} onChange={(e) => setFssai(e.target.value)}>
          <FormControlLabel
            value="Yes"
            control={<Radio color="secondary" />}
            label="Yes"
            disabled={isDisabled.fssaiNumber}
          />
          <FormControlLabel
            value="No"
            control={<Radio color="secondary" />}
            label="No"
            disabled={isDisabled.fssaiNumber}
          />
        </RadioGroup>

        {/* <Stack direction="row" spacing={1} alignItems="center" mt={1}>
          <TextField
            fullWidth
            label="FSSAI Lic No."
            placeholder="000000000000000"
            value={fssaiNumber}
            size="small"
            onChange={(e) => setFssaiNumber(e.target.value)}
            disabled={isDisabled.fssaiNumber}
            error={!!errors.fssaiNumber}
          />
          <Button
            variant="contained"
            disabled={!fssaiNumber || isDisabled.fssaiNumber}
            onClick={() => console.log("FSSAI Verified")}
          >
            VERIFY
          </Button>
        </Stack> */}
      </Box>
      <Button variant="contained" color="primary" onClick={handleSave}>
        SAVE
      </Button>
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.status}>{snackbar.message}</Alert>
      </Snackbar>
      {/* Cropper Dialog */}
      <Demo
        uploadImage={uploadImage}
        aspect={aspectRatio}
        selectedImage={selectedImage}
        onClose={() => setOpenCropDialog(false)}
        open={openCropDialog}
        setOpenCropDialog={setOpenCropDialog}
        setSelectedImage={setSelectedImage}
        onCropComplete={handleCropComplete}
      />
    </Paper>
  );
}
