"use client";

import React, { useEffect, useState } from "react";
import {
  Drawer,
  Box,
  TextField,
  Typography,
  Button,
  CircularProgress,
  Paper,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import instanceV1 from "../../restaurant/authaxios.jsx";

const AddEditReleasedLogForm = ({
  open,
  onClose,
  data,
  setAlert,
  action,
  setAction,
}) => {
  const token = localStorage.getItem("authToken");

  // ✅ INITIAL VALUES
  const initialValues = {
    release_version: "",
    release_platform: "",
    release_notes: "",
    is_mandatory: 0,
    is_active: 1,
    release_date: "",
  };

  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);

  // ✅ EDIT MODE
  useEffect(() => {
    if (data) {
      setValues({
        release_version: data.release_version || "",
        release_platform: data.release_platform ?? "",
        release_notes: data.release_notes || "",
        is_mandatory: data.is_mandatory ?? 0,
        is_active: data.is_active ?? 1,
        release_date: data.release_date
          ? data.release_date.slice(0, 16) // for datetime-local
          : "",
      });
    } else {
      setValues(initialValues);
    }
  }, [data]);
const formatDateTime = (dateTime) => {
  if (!dateTime) return "";

  const [date, time] = dateTime.split("T");

  // ensure seconds exist
  const fullTime = time.length === 5 ? `${time}:00` : time;

  return `${date} ${fullTime}`;
};
  // ✅ SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const instance = instanceV1(token);

      const payload = {
        release_version: values.release_version,
        release_platform: values.release_platform,
        release_notes: values.release_notes,
        is_mandatory: values.is_mandatory,
        is_active: values.is_active,
        release_date: formatDateTime(values.release_date),
      };

      console.log("🚀 PAYLOAD:", payload);

      if (!data) {
        await instance.post("/api/app-release/v1/release", payload);
        setAlert({
          open: true,
          message: "Release added successfully",
          severity: "success",
        });
      } else {
        await instance.put(
          `/api/app-release/v1/release/${data.id}`,
          payload
        );
        setAlert({
          open: true,
          message: "Release updated successfully",
          severity: "success",
        });
      }

      setAction(!action);
      setValues(initialValues);
      onClose();
    } catch (err) {
      console.error("❌ ERROR:", err);

      setAlert({
        open: true,
        message: err.response?.data?.msg || "Error saving release",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
disableEnforceFocus      anchor="right"
      open={open}
      onClose={onClose}
        PaperProps={{
                sx: { width: { xs: "100%", sm: 400 }, p: 0, margin: 0, height: "100vh", bgcolor: "#F7F7F7" },
            }}
    >
      {/* HEADER */}
      <Box sx={{ position: "sticky", top: 0, p: 1, bgcolor: "#F7F7F7", zIndex: 10 }}>
        <Paper sx={{ p: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h5">
            {data ? "Edit Release" : "Add Release"}
          </Typography>

          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Paper>
      </Box>

      {/* FORM */}
      <form onSubmit={handleSubmit}>
        <Paper sx={{ m: 1, p: 2 }}>

          {/* VERSION */}
          <TextField
            fullWidth
            size="small"
            label="Release Version"
            sx={{ mb: 2 }}
            value={values.release_version}
            onChange={(e) =>
              setValues({ ...values, release_version: e.target.value })
            }
          />

          {/* PLATFORM */}
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Platform</InputLabel>
            <Select
              value={values.release_platform}
              label="Platform"
              onChange={(e) =>
                setValues({ ...values, release_platform: e.target.value })
              }
            >
              <MenuItem value={0}>iOS</MenuItem>
              <MenuItem value={1}>Android</MenuItem>
              <MenuItem value={2}>Web</MenuItem>
            </Select>
          </FormControl>

          {/* NOTES */}
          <TextField
            fullWidth
            size="small"
            multiline
            rows={3}
            label="Release Notes"
            sx={{ mb: 2 }}
            value={values.release_notes}
            onChange={(e) =>
              setValues({ ...values, release_notes: e.target.value })
            }
          />

          {/* DATE */}
          <TextField
            fullWidth
            size="small"
            type="datetime-local"
            label="Release Date"
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
            value={values.release_date}
            onChange={(e) =>
              setValues({ ...values, release_date: e.target.value })
            }
          />

          {/* MANDATORY */}
          <FormControlLabel
            control={
              <Switch
                checked={values.is_mandatory === 1}
                onChange={(e) =>
                  setValues({
                    ...values,
                    is_mandatory: e.target.checked ? 1 : 0,
                  })
                }
              />
            }
            label="Mandatory Update"
          />

          {/* ACTIVE */}
          <FormControlLabel
            control={
              <Switch
                checked={values.is_active === 1}
                onChange={(e) =>
                  setValues({
                    ...values,
                    is_active: e.target.checked ? 1 : 0,
                  })
                }
              />
            }
            label="Active"
          />
        </Paper>

        {/* FOOTER */}
        <Box sx={{ position: "sticky", bottom: 0, p: 1, bgcolor: "#F7F7F7" }}>
          <Paper sx={{ p: 1, display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              color="error"
              fullWidth
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              fullWidth
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={22} sx={{ color: "#fff" }} />
              ) : (
                "Save"
              )}
            </Button>
          </Paper>
        </Box>
      </form>
    </Drawer>
  );
};

export default AddEditReleasedLogForm;