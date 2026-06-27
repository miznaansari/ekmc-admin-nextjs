import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  Checkbox,
  FormControlLabel,
  Stack,
  Tooltip,
} from "@mui/material";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import SaveIcon from "@mui/icons-material/Save";
import GroupIcon from "@mui/icons-material/Group";
import instanceV1 from "../../restaurant/authaxios";
import { useNavigate } from "react-router-dom";
import QrDialog from "./QrDialog";

const HelpDocumentation = ({
  setCompletedFields,
  setMenuData,
  setCafeListId,
  setCafeName,
  completedFields,

  downloadLink = "https://go.a2d.co.in/download-ekmc-platform",
  communityLink = "https://go.a2d.co.in/community-wa-invite",
}) => {
  const [phone, setPhone] = useState("");
  const [sameForWhatsapp, setSameForWhatsapp] = useState(true);
  const [whatsapp, setWhatsapp] = useState("");

  // ✅ Single dialog for QR
  const [openQR, setOpenQR] = useState(false);
  const [qrTitle, setQrTitle] = useState("");
  const [qrData, setQrData] = useState("");

  const navigate = useNavigate();

  const handleOpenQR = (type) => {
    if (type === "download") {
      setQrTitle("Download App QR");
      setQrData(downloadLink);
    } else if (type === "community") {
      setQrTitle("Join Community QR");
      setQrData(communityLink);
    }
    setOpenQR(true);
  };

  const handleComplete = async () => {
    const token = localStorage.getItem("authToken");
    const cafeListId = localStorage.getItem("cafeListId");
    const instance = instanceV1(token);

    try {
      const res = await instance.post(
        `/api/admin/onboard/v1/cafe/completion`,
        {
          "cafe_list_id": cafeListId,
          "whatsapp_number": whatsapp
        }
      );
      if (res.data.status) {
        alert("Cafe setup completed successfully!");

        localStorage.removeItem("cafeName");
        localStorage.removeItem("cafeListId");
        setCompletedFields([]);
        setMenuData([]);
        setCafeListId("");
        setCafeName("");
        navigate("/onboarding/settings");
      } else {
        alert("Failed to mark complete");
      }
    } catch (err) {
      if (err.response && err.response.data?.msg === "onboarding already completed") {
        alert("Onboarding already completed");
        setCompletedFields([]);

        setMenuData([]);
        setCafeListId("");
        setCafeName("");
        localStorage.removeItem("cafeName");
        localStorage.removeItem("cafeListId");
        navigate("/onboarding/settings");
      } else {
        console.error("❌ API request failed:", err);
        alert("Failed to mark complete due to network or server error");
      }
    }
  };

  const requiredFields = ["address-info", "settings", "time-price", "imggallery"];
  const fieldLabels = {
    "address-info": "Address Info",
    settings: "Basic Info",
    "time-price": "Opening Hours",
    imggallery: "Image Gallery",
  };
  const isComplete = requiredFields.every((field) => completedFields.includes(field));
  const missingFields = requiredFields
    .filter((field) => !completedFields.includes(field))
    .map((field) => fieldLabels[field]);

  return (
    <Paper sx={{ width: "100%", p: 2 }}>
      <Typography variant="h5" mb={2}>
        Help and Documentation
      </Typography>

      {/* EKMC Download */}
      <Typography variant="subtitle2">EKMC Platform Download Link</Typography>
      <Stack direction="row" spacing={2} alignItems="center" mb={1}>
        <Button
          variant="outlined"
          startIcon={<CloudDownloadIcon />}
          sx={{ borderColor: "orange", color: "orange" }}
          onClick={() => handleOpenQR("download")}
        >
          Download App
        </Button>
      </Stack>

      {/* WhatsApp Community */}
      <Typography variant="subtitle2">WhatsApp Community Joining Link</Typography>
      <Stack direction="row" spacing={2} alignItems="center" mb={1}>
        <Button
          variant="outlined"
          startIcon={<GroupIcon />}
          sx={{ borderColor: "orange", color: "orange" }}
          onClick={() => handleOpenQR("community")}
        >
          Join Community
        </Button>
      </Stack>

      <Typography variant="body2" sx={{ mb: 2 }}>
        Send the following details to customer:
        <br />1. EKMC Platform App QR / Link
        <br />2. WhatsApp Community QR / Link
      </Typography>

      {/* <Box sx={{ mb: 2 }}>
        <TextField
          label="Phone Number"
          fullWidth
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          size="small"
          sx={{ mb: 1 }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={sameForWhatsapp}
              onChange={(e) => setSameForWhatsapp(e.target.checked)}
              sx={{ color: "orange" }}
            />
          }
          label="Same for WhatsApp"
        />
   (
        
        )}
      </Box>

      <Stack direction="row" spacing={2}>
        <Button variant="contained" color="secondary">
          SEND
        </Button>
      </Stack> */}
  <TextField
            label="WhatsApp Number"
            fullWidth
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            size="small"
            sx={{ mt: 1 }}
          />
      <Stack direction="row" mt={1} spacing={2}>
        <Tooltip
          title={
            !isComplete ? `Complete these sections first: ${missingFields.join(", ")}` : ""
          }
          arrow
          enterTouchDelay={0}
        >
          <span>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={() => handleComplete()}
              disabled={!isComplete}
            >
              COMPLETE DASHBOARD
            </Button>
          </span>
        </Tooltip>
      </Stack>

      {/* ✅ Single QR Dialog */}
      <QrDialog
        open={openQR}
        onClose={() => setOpenQR(false)}
        title={qrTitle}
        qrData={qrData}
      />
    </Paper>
  );
};

export default HelpDocumentation;
