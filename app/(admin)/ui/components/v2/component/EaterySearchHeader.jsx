import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  InputAdornment,
  Chip,
  Button,
  Paper,
  Stack,
  Drawer,
  Snackbar,
  Alert,
  useMediaQuery,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import MapIcon from "@mui/icons-material/Map";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import CloseIcon from "@mui/icons-material/Close";


import instanceV1 from "../../../restaurant/authaxios";

/* ========================= */
/* MAIN COMPONENT */
/* ========================= */

const EaterySearchHeader = ({
  handleOpenMergeDrawer,
  handleClearMergeSelection,
  selectedCafeIds,

  title = "List Eatery",
  isMobile,
  searchOpen,
  setSearchOpen,
  onSearchChange,
  onFilterClick,
  searchValue,
  onSearchClear,
  filterChips = [],
  onClearFilter,
}) => {
  const hasFilters = filterChips.length > 0;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [googleMapUrl, setGoogleMapUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const isSmallScreen = useMediaQuery("(max-width:600px)");

  /* ========================= */
  /* HANDLERS */
  /* ========================= */

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
    resetMessages();
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setGoogleMapUrl("");
    resetMessages();
  };

  const resetMessages = () => {
    setError("");
    setSuccess("");
  };

  const expandUrl = async (shortUrl) => {
    try {
      const res = await fetch(shortUrl, {
        method: "GET",
        redirect: "follow",
      });
      return res.url;
    } catch {
      return shortUrl;
    }
  };

  const handleSave = async () => {
    if (!googleMapUrl.trim()) {
      showError("Google Map URL is required");
      return;
    }

    setLoading(true);
    resetMessages();

    try {
      const finalUrl = await expandUrl(googleMapUrl);

      const token = localStorage.getItem("authToken");
      const instance = instanceV1(token);

      await instance.post("/api/admin/v1/google/cafe", {
        google_map_url: finalUrl,
      });

      setDrawerOpen(false);
      setGoogleMapUrl("");
      showSuccess("Cafe added successfully!");
    } catch (e) {
      const msg =
        e?.response?.data?.msg ||
        e?.message ||
        "Something went wrong";

      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  const showError = (msg) => {
    setError(msg);
    setSnackbarOpen(true);
  };

  const showSuccess = (msg) => {
    setSuccess(msg);
    setSnackbarOpen(true);
  };

  /* ========================= */
  /* RENDER */
  /* ========================= */

  return (
    <>
      {/* ================= HEADER ================= */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
          minHeight: 48,
        }}
      >
        {/* ================= DESKTOP ================= */}
        {!isMobile && (
          <>
            {/* LEFT */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flex: 1,
                overflow: "hidden",
              }}
            >
              <Typography variant="h5" noWrap>
                {title}
              </Typography>

              <TextField
                size="small"
                placeholder="Search restaurants..."
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 260 }}
              />

              <FilterButton
                onClick={onFilterClick}
                active={hasFilters}
              />

              {hasFilters && (
                <Box
                  sx={{
                    display: "flex",
                    gap: 0.5,
                    maxWidth: 250,
                    overflowX: "auto",
                  }}
                >
                  {filterChips.map((chip) => (
                    <Chip
                      key={chip.key}
                      size="small"
                      label={chip.label}
                      onDelete={() => onClearFilter(chip.key)}
                      sx={{ height: 24 }}
                    />
                  ))}
                </Box>
              )}

            </Box>

            {/* RIGHT */}
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleDrawerOpen}
                startIcon={<AddIcon />}
                endIcon={<MapIcon />}
              >
                Add Eatery
              </Button>

              <Button
                variant="contained"
                disabled={selectedCafeIds.length !== 2}
                onClick={handleOpenMergeDrawer}
              >
                Merge Selected
              </Button>

              <Button
                variant="outlined"
                disabled={selectedCafeIds.length === 0}
                onClick={handleClearMergeSelection}
              >
                Clear
              </Button>
            </Box>
          </>
        )}

        {/* ================= MOBILE ================= */}
        {isMobile && (
          <>
            {/* LEFT ANIMATION AREA */}
            <Box sx={{ flex: 1, position: "relative", minHeight: 48 }}>
              {/* TITLE */}
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  transform: searchOpen
                    ? "translateY(24px)"
                    : "translateY(0)",
                  opacity: searchOpen ? 0 : 1,
                  transition: "all 300ms",
                }}
              >
                <Typography variant="h5">{title}</Typography>
              </Box>

              {/* SEARCH */}
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  transform: searchOpen
                    ? "translateY(0)"
                    : "translateY(-24px)",
                  opacity: searchOpen ? 1 : 0,
                  transition: "all 300ms",
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search..."
                  value={searchValue}
                  onChange={(e) =>
                    onSearchChange(e.target.value)
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Box>

            {/* RIGHT */}
            {!searchOpen ? (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  onClick={handleDrawerOpen}
                  startIcon={<AddIcon />}
                >
                  Add Eatery
                </Button>

                <IconButton
                  onClick={() => setSearchOpen(true)}
                >
                  <SearchIcon />
                </IconButton>

                <FilterButton
                  onClick={onFilterClick}
                  active={hasFilters}
                />
              </Box>
            ) : (
              <Box sx={{ display: "flex" }}>
                <IconButton
                  onClick={() => {
                    setSearchOpen(false);
                    onSearchClear?.();
                  }}
                >
                  ✕
                </IconButton>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* ================= DRAWER ================= */}
      <Drawer
        disableEnforceFocus
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerClose}
        PaperProps={{
          sx: {
            p: 2,
            margin: 1,
            height: "100vh",
            bgcolor: "#F7F7F7",
          },
        }}
      >
        <Box sx={{ bgcolor: "#F7F7F7", p: 0, display: "flex", flexDirection: "column", height: "100%", width: '400px' }}>

          <Box position="sticky" width={'100%'} top={0} zIndex={999} sx={{ bgcolor: "#F7F7F7", pb: 1 }}>
            <Paper sx={{ padding: 1, width: '100%', m: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5">Add Eatery</Typography>
                <IconButton
                  onClick={handleDrawerClose}
                >
                  <CloseIcon />
                </IconButton>
              </Stack>
            </Paper>
          </Box>
          <Paper sx={{ padding: 1, m: 1 }}>

            {/* <Typography variant="h5" mb={2}>Add Eatery Using Google Map URL</Typography> */}
            <TextField
              label="Google Map URL"
              value={googleMapUrl}
              onChange={e => setGoogleMapUrl(e.target.value)}
              fullWidth
              autoFocus
              error={!!error && !success}
              helperText={error && !success ? error : ""}
              sx={{ mb: 2 }}
              disabled={loading}
            />
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={loading}
                fullWidth
              >
                {loading ? "Saving..." : "Save"}
              </Button>
              <Button
                onClick={handleDrawerClose}
                disabled={loading}
                fullWidth
                variant="outlined"
              >
                Cancel
              </Button>
            </Stack>
          </Paper>

        </Box>

      </Drawer>

      {/* ================= SNACKBAR ================= */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        {success ? (
          <Alert severity="success">{success}</Alert>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : null}
      </Snackbar>
    </>
  );
};

export default EaterySearchHeader;

/* ========================= */
/* FILTER BUTTON */
/* ========================= */

const FilterButton = ({ onClick, active }) => (
  <IconButton
    onClick={onClick}
    sx={{
      color: active ? "primary.main" : "inherit",
      bgcolor: active ? "success.main" : "transparent",
      "&:hover": {
        bgcolor: active ? "success.light" : "action.hover",
      },
    }}
  >
    <FilterAltIcon />
  </IconButton>
);