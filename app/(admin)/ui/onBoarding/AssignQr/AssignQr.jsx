import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  Chip,
  Autocomplete,
  Stack,
  Paper,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import { Scanner } from '@yudiel/react-qr-scanner';
import instanceV1 from '../../restaurant/authaxios';

const AssignQr = ({setCompletedFields}) => {
  const [selectedQrs, setSelectedQrs] = useState([]);
  const [openScanner, setOpenScanner] = useState(false);
  const [scanned, setScanned] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [inputValue, setInputValue] = useState("");

  const qrOptions = [];

  // ✅ handle QR Scan
  const handleScan = async (result) => {
    if (!result || scanned) return;
    setScanned(true);

    try {
      const response = await fetch(result.rawValue, { redirect: "follow" });
      const finalUrl = response.url;

      const url = new URL(finalUrl);
      const qr_uid = url.searchParams.get("qr_uid");

      const instance = instanceV1(localStorage.getItem("authToken"));
      const qrIdRes = await instance.get(`/api/admin/onboard/v1/qr/${qr_uid}`);
      const qrId = qrIdRes.data.data;

      if (!qr_uid) {
        setSnackbar({ open: true, message: "Invalid QR Code", severity: "error" });
      } else if (selectedQrs.some(qr => qr.qr_uid === qr_uid)) {
        setSnackbar({ open: true, message: "This QR is already added", severity: "warning" });
      } else {
        setSelectedQrs(prev => [...prev, { qr_uid, qrId }]);
        setSnackbar({ open: true, message: `QR ${qr_uid} added successfully`, severity: "success" });
      }
    } catch (err) {
      console.error("❌ Error handling QR:", err, result);
      setSnackbar({ open: true, message: "Error reading QR", severity: "error" });
    } finally {
      setOpenScanner(false);
    }
  };

  // ✅ Handle Submit
  const handleSubmitQr = async () => {
    const token = localStorage.getItem("authToken");
    const instance = instanceV1(token);
    const cafeListId = localStorage.getItem("cafeListId");

    const payload = {
      cafe_list_id: cafeListId,
      qr_codes: selectedQrs.map(qr => ({ id: qr.qrId })) // ✅ only send qrId
    };

    try {
      const response = await instance.post('/api/admin/onboard/v1/cafe/assign-qr', payload);
      const data = response.data;

      // Map qrId back to qr_uid for user-friendly messages
      const idToUidMap = selectedQrs.reduce((acc, qr) => {
        acc[qr.qrId] = qr.qr_uid;
        return acc;
      }, {});

      let message = "";

      if (data.connected_qr?.length > 0) {
        const connectedUids = data.connected_qr.map(id => idToUidMap[id]).join(", ");
        message += `Connected: ${connectedUids}. `;
        setCompletedFields((prev) => [...prev, 'assign-qr']);

      }

      if (data.rejected_qr?.length > 0) {
        const rejectedUids = data.rejected_qr.map(id => idToUidMap[id]).join(", ");
        message += `Rejected: ${rejectedUids}.`;
      }

      if (!message) message = "No QR codes were assigned.";

      setSnackbar({ open: true, message, severity: data.rejected_qr?.length > 0 ? "warning" : "success" });
    } catch (error) {
      console.error('Error assigning QR codes:', error);
      setSnackbar({ open: true, message: "Error assigning QR codes", severity: "error" });
    }
  };

  return (
    <Paper sx={{ width: '100%', p: 2 }}>
      <Typography variant="h5" mb={2}>Assign QR</Typography>
      {/* ✅ Open Scanner */}
      <Button
        variant="outlined"
        startIcon={<QrCodeScannerIcon />}
        sx={{
          mb: 2,
          borderColor: '#28a745',
          color: '#28a745',
          '&:hover': { borderColor: '#218838', bgcolor: '#f0fff4' }
        }}
        onClick={() => {
          setScanned(false);
          setOpenScanner(true);
        }}
      >
        Scan QR Code
      </Button>
      {/* ✅ Scanner Dialog */}
      <Dialog
        open={openScanner}
        onClose={() => setOpenScanner(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            height: "100%",       // take full viewport height
            // margin: 0,            // remove extra margins
            // borderRadius: 0       // optional: remove rounded corners
          }
        }}
      >
        <DialogTitle>
          Scan QR Code
          <IconButton
            aria-label="close"
            onClick={() => setOpenScanner(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ width: '100%', height: 400, bgcolor: 'black' }}>
            <Scanner
              onScan={(detectedCodes) => {
                if (detectedCodes && detectedCodes.length > 0) {
                  handleScan(detectedCodes[0]);
                }
              }}
              constraints={{ facingMode: "environment" }}
              styles={{
                container: { width: "100%", height: "100%" },
                video: { width: "100%", height: "100%", objectFit: "cover" }
              }}
              scanDelay={500}
            />
          </Box>
        </DialogContent>
      </Dialog>
      {/* ✅ Autocomplete with qr_uid display */}
      <Autocomplete
        multiple
        freeSolo
        options={qrOptions.map(qr => ({ qr_uid: qr, qrId: null }))}
        value={selectedQrs}
        inputValue={inputValue}
        getOptionLabel={(option) => option.qr_uid}
        onInputChange={(e, newInputValue) => setInputValue(newInputValue)}
        onChange={(event, newValue) => {
          const unique = Array.from(new Map(newValue.map(qr => [qr.qr_uid, qr])).values());
          setSelectedQrs(unique);
        }}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              key={option.qr_uid}
              label={option.qr_uid}
              {...getTagProps({ index })}
              sx={{ bgcolor: 'orange', color: 'white', fontWeight: 500 }}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            label="Search QR"
            size="small"
            onKeyDown={async (e) => {
              if (e.key === "Enter" || e.key === "," || e.key === " ") {
                e.preventDefault();
                let input = inputValue.trim();
                if (!input) return;

                let parts = input.split(/[,\s]+/).filter(Boolean);

                const instance = instanceV1(localStorage.getItem("authToken"));
                const cafeListId = localStorage.getItem("cafeListId"); // optional if needed

                const newQrs = [];

                for (let qr_uid of parts) {
                  // ✅ Skip if already added
                  if (selectedQrs.some(qr => qr.qr_uid === qr_uid)) continue;

                  try {
                    const qrIdRes = await instance.get(`/api/admin/onboard/v1/qr/${qr_uid}`);
                    const qrId = qrIdRes.data.data;

                    newQrs.push({ qr_uid, qrId });

                    setSnackbar({
                      open: true,
                      message: `QR ${qr_uid} added successfully`,
                      severity: "success"
                    });
                  } catch (err) {
                    console.error("❌ Error fetching QR ID:", err);
                    setSnackbar({
                      open: true,
                      message: `Error fetching QR ${qr_uid}`,
                      severity: "error"
                    });
                  }
                }

                setSelectedQrs(prev => [...prev, ...newQrs]);
                setInputValue("");
              }
            }}

          />
        )}
        sx={{ mb: 3, maxWidth: 400 }}
      />
      {/* ✅ Save Button */}
      <Stack direction="row" spacing={2}>
        <Button
          variant="outlined"
          endIcon={<ArrowForwardIcon />}
          onClick={handleSubmitQr}
          sx={{ borderColor: 'green', color: 'green', '&:hover': { borderColor: 'darkgreen', bgcolor: '#f0fff4' } }}
        >
          Save & Proceed
        </Button>
      </Stack>
      {/* ✅ Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default AssignQr;
