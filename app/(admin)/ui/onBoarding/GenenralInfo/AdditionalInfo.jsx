import React, { useState, useEffect } from "react";
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
  Autocomplete,
} from "@mui/material";
import instanceV1 from "../../restaurant/authaxios";
import { useNavigate } from "react-router-dom";

const commissionOptions = ["0%", "10%", "18%", "20%"];

export default function AdditionalInfo({ datas }) {
  const navigate = useNavigate();

  const token = localStorage.getItem("authToken");
  const api = instanceV1(token);

  const [zomatoAvailable, setZomatoAvailable] = useState("No");
  const [swiggyAvailable, setSwiggyAvailable] = useState("No");
  const [dineInAvailable, setDineInAvailable] = useState("No");
  const [takeawayAvailable, setTakeawayAvailable] = useState("No");
  const [zomatoCommission, setZomatoCommission] = useState("");
  const [swiggyCommission, setSwiggyCommission] = useState("");

  // Populate state from datas when it is available
  useEffect(() => {
    if (datas?.additional_info) {
      const existing = datas.additional_info;
      setZomatoAvailable(existing.is_zomato ? "Yes" : "No");
      setSwiggyAvailable(existing.is_swiggy ? "Yes" : "No");
      setDineInAvailable(existing.is_dinein ? "Yes" : "No");
      setTakeawayAvailable(existing.is_takeaway ? "Yes" : "No");
      setZomatoCommission(existing.zomato_commission?.toString() || "");
      setSwiggyCommission(existing.swiggy_commission?.toString() || "");
    }
  }, [datas]);

  const handleSave = async () => {
    const cafeListId = localStorage.getItem("cafeListId");
    if (!cafeListId) {
      alert("No Cafe Name found in localStorage");
      return;
    }
    const data = {
      cafe_list_id: cafeListId,
      is_zomato: zomatoAvailable === "Yes" ? 1 : 0,
      is_swiggy: swiggyAvailable === "Yes" ? 1 : 0,
      is_dinein: dineInAvailable === "Yes" ? 1 : 0,
      is_takeaway: takeawayAvailable === "Yes" ? 1 : 0,
      zomato_commission: zomatoAvailable === "Yes" ? zomatoCommission : "0",
      swiggy_commission: swiggyAvailable === "Yes" ? swiggyCommission : "0",
    };

    try {
      const res = await api.post(
        "/api/admin/onboard/v1/cafe/additional",
        data
      );
      console.log("Additional Info Saved:", res.data);
      navigate("/onboarding/time-price");
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  return (
    <Paper sx={{ width: "100%", p: 2, mt: 1 }}>
      <Typography variant="h5" mb={2}>
        Additional Info
      </Typography>

      {/* Zomato */}
      <Box sx={{ mb: 3 }}>
        <FormLabel>Zomato Available</FormLabel>
        <RadioGroup
          row
          value={zomatoAvailable}
          onChange={(e) => setZomatoAvailable(e.target.value)}
        >
          <FormControlLabel value="Yes" control={<Radio color="secondary" />} label="Yes" />
          <FormControlLabel value="No" control={<Radio color="secondary" />} label="No" />
        </RadioGroup>

        {zomatoAvailable === "Yes" && (
          <Autocomplete
            freeSolo
            options={commissionOptions}
            value={zomatoCommission}
            onChange={(event, newValue) => setZomatoCommission(newValue)}
            onInputChange={(event, newInputValue) =>
              setZomatoCommission(newInputValue)
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Zomato Commission"
                placeholder="e.g. 20%"
                fullWidth
                size="small"
                sx={{ mt: 1 }}
              />
            )}
          />
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Swiggy */}
      <Box sx={{ mb: 3 }}>
        <FormLabel>Swiggy Available</FormLabel>
        <RadioGroup
          row
          value={swiggyAvailable}
          onChange={(e) => setSwiggyAvailable(e.target.value)}
        >
          <FormControlLabel value="Yes" control={<Radio color="secondary" />} label="Yes" />
          <FormControlLabel value="No" control={<Radio color="secondary" />} label="No" />
        </RadioGroup>

        {swiggyAvailable === "Yes" && (
          <Autocomplete
            freeSolo
            options={commissionOptions}
            value={swiggyCommission}
            onChange={(event, newValue) => setSwiggyCommission(newValue)}
            onInputChange={(event, newInputValue) =>
              setSwiggyCommission(newInputValue)
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Swiggy Commission"
                placeholder="e.g. 20%"
                fullWidth
                size="small"
                sx={{ mt: 1 }}
              />
            )}
          />
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Dine-in */}
      <Box sx={{ mb: 3 }}>
        <FormLabel>Dine-in Available</FormLabel>
        <RadioGroup
          row
          value={dineInAvailable}
          onChange={(e) => setDineInAvailable(e.target.value)}
        >
          <FormControlLabel value="Yes" control={<Radio color="secondary" />} label="Yes" />
          <FormControlLabel value="No" control={<Radio color="secondary" />} label="No" />
        </RadioGroup>
      </Box>

      {/* Takeaway */}
      <Box sx={{ mb: 3 }}>
        <FormLabel>Takeaway Available</FormLabel>
        <RadioGroup
          row
          value={takeawayAvailable}
          onChange={(e) => setTakeawayAvailable(e.target.value)}
        >
          <FormControlLabel value="Yes" control={<Radio color="secondary" />} label="Yes" />
          <FormControlLabel value="No" control={<Radio color="secondary" />} label="No" />
        </RadioGroup>
      </Box>

      <Stack direction="row" spacing={2} mt={3}>
        <Button variant="contained" color="primary" onClick={handleSave}>
          SAVE & PROCEED
        </Button>
      </Stack>
    </Paper>
  );
}
