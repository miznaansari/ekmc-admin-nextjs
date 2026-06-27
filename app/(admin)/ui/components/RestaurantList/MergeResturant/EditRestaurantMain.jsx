import {
  Stack,
  Box,
  Typography,
  IconButton,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useMediaQuery, useTheme } from "@mui/system";
import axios from "axios";

import EditRestaurant from "./MergeRestaurant";
import GeneralInfo from "./GeneralInfo";
import TimeSetting from "./TimeSetting";
import AddressInfo from "./AddressInfo";
import SocialInfo from "./SocialInfo";
import ImageGallery from "./ImageGallery";
import Document from "./Document";
import AdditionalInfo from "./AdditionalInfo";
import DeviceInfo from "./DeviceInfo";

import { useCafe } from "../../../context/cafeContext";
import { Close } from "@mui/icons-material";

const EditRestaurantMain = ({ cafeId, onClose, mergeCafe1 = null, mergeCafe2 = null }) => {
  const { setCafeIdContext, cafeIdContext } = useCafe();
  const baseUrl = process.env.VITE_REACT_APP_BACKEND_URL;
  const token = localStorage.getItem("authToken");
  const isMergeMode = Boolean(mergeCafe1 && mergeCafe2);

  const MERGE_STEPS = ["GeneralInfo", "TimeSetting", "AddressInfo", "SocialInfo", "ImageGallery"];

  const [selectedSourceCafeId, setSelectedSourceCafeId] = useState(cafeId || null);
  const [deleteTargetCafeId, setDeleteTargetCafeId] = useState(null);
  const [confirmMergeOpen, setConfirmMergeOpen] = useState(false);
  const [mergeLoading, setMergeLoading] = useState(false);
  const [timeTransferSignal, setTimeTransferSignal] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [isCrawlerData, setIsCrawlerData] = useState(null);
  const [validationError, setValidationError] = useState(null);

  const resolvedCafeId = isMergeMode
    ? selectedSourceCafeId
    : cafeId || cafeIdContext;

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const [menu, setMenu] = useState("settings");

  const allStepsComplete = MERGE_STEPS.length === completedSteps.size;

  // Auto-mark step complete when page is visited
  useEffect(() => {
    const stepMap = { settings: "GeneralInfo", time: "TimeSetting", "address-info": "AddressInfo", "social-info": "SocialInfo", imggallery: "ImageGallery" };
    const currentStep = stepMap[menu];

    if (isMergeMode && currentStep) {
      markStepComplete(currentStep);
    }
  }, [menu, isMergeMode]);

  useEffect(() => {
    if (!isMergeMode) return;
    let leftCafeId = mergeCafe1?.id;
    let rightCafeId = mergeCafe2?.id;

    if (leftCafeId > rightCafeId) {
      [leftCafeId, rightCafeId] = [rightCafeId, leftCafeId];
    }

    const fetchCrawlerStatus = async () => {
      try {
        const [resLeft, resRight] = await Promise.all([
          axios.get(`${baseUrl}/api/user/admin/restaurant-all-info/${leftCafeId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${baseUrl}/api/user/admin/restaurant-all-info/${rightCafeId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // const leftCrawler = resLeft.data?.data?.[0]?.is_crawler;
        // const rightCrawler = resRight.data?.data?.[0]?.is_crawler;

        // setIsCrawlerData({ left: leftCrawler, right: rightCrawler });

        // if (leftCrawler === rightCrawler) {
        //   const msg = leftCrawler === 1 ? "Both cafes are crawler" : "Both cafes are real";
        //   setValidationError(msg);
        //   return;
        // }

        setValidationError(null);
        // Always delete is_crawler=0, always keep is_crawler=1
        // Left has 0, delete left
        setDeleteTargetCafeId(leftCafeId);
        setSelectedSourceCafeId(rightCafeId);
        // Left has 1, delete right (which has 0)

      } catch (error) {
        console.error("Error fetching crawler status", error);
      }
    };

    fetchCrawlerStatus();
  }, [isMergeMode, mergeCafe1, mergeCafe2, baseUrl, token]);

  /* =========================
     SET CAFE ID IN CONTEXT
  ========================= */
  useEffect(() => {
    if (!isMergeMode && resolvedCafeId) {
      setCafeIdContext(resolvedCafeId);
    }
  }, [isMergeMode, resolvedCafeId, setCafeIdContext]);

  const renderMenuContent = (targetCafeId) => {
    const contentKey = `${menu}-${targetCafeId}`;
    const transferTargetCafeId =
      isMergeMode && targetCafeId === deleteTargetCafeId
        ? getOtherMergeCafeId(targetCafeId)
        : null;

    if (menu === "settings") return <GeneralInfo key={contentKey} cafeId={targetCafeId} transferTargetCafeId={transferTargetCafeId} onSave={isMergeMode ? () => markStepComplete("GeneralInfo") : undefined} />;
    if (menu === "time") {
      return (
        <TimeSetting
          key={contentKey}
          cafeId={targetCafeId}
          transferTargetCafeId={transferTargetCafeId}
          timeTransferSignal={timeTransferSignal}
          onTransferSuccess={() => setTimeTransferSignal((prev) => prev + 1)}
          onSave={isMergeMode ? () => markStepComplete("TimeSetting") : undefined}
        />
      );
    }
    if (menu === "address-info") return <AddressInfo key={contentKey} cafeId={targetCafeId} mapContainerId={`map-${targetCafeId}`} />;
    if (menu === "social-info") return <SocialInfo key={contentKey} cafeId={targetCafeId} transferTargetCafeId={transferTargetCafeId} onSave={isMergeMode ? () => markStepComplete("SocialInfo") : undefined} />;
    if (menu === "imggallery") return <ImageGallery key={contentKey} cafeId={targetCafeId} transferTargetCafeId={transferTargetCafeId} onSave={isMergeMode ? () => markStepComplete("ImageGallery") : undefined} />;
    return null;
  };

  const getOtherMergeCafeId = (targetId) => {
    if (!isMergeMode) return null;
    return mergeCafe1?.id === targetId ? mergeCafe2?.id : mergeCafe1?.id;
  };

  const markStepComplete = (step) => {
    setCompletedSteps((prev) => new Set([...prev, step]));
  };

  const orderedMergeCafes = [
    [mergeCafe1, mergeCafe2].find((cafe) => cafe?.id === deleteTargetCafeId),
    [mergeCafe1, mergeCafe2].find((cafe) => cafe?.id === selectedSourceCafeId),
  ].filter(Boolean);

  const handleDeleteSelectedCafe = async () => {
    if (!deleteTargetCafeId) return;

    try {
      setMergeLoading(true);
      await axios.delete(`${baseUrl}/api/admin/v1/cafe/${deleteTargetCafeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setConfirmMergeOpen(false);
      onClose?.();
    } catch (error) {
      console.error("Failed to delete selected cafe", error);
    } finally {
      setMergeLoading(false);
    }
  };

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ position: "sticky", top: 10, zIndex: 999, pb: 1, bgcolor: "#F7F7F7" }}>
        <Paper sx={{ p: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight={600}>
            {isMergeMode ? "Merge Restaurants" : "Edit Restaurant"}
          </Typography>
          <IconButton onClick={onClose} sx={{ p: 0.5 }}>
            <Close />
          </IconButton>
        </Paper>
      </Box>
      <Stack
        direction={isSmallScreen ? "column" : "row"}
        spacing={2}
        alignItems="flex-start"
      >
        {/* Sidebar */}
        <EditRestaurant
          menu={menu}
          setMenu={setMenu}
          cafeId={resolvedCafeId}
        />

        {/* Main Content */}
        {!isMergeMode && renderMenuContent(resolvedCafeId)}

        {isMergeMode && (
          <Stack spacing={1.5} sx={{ width: "100%" }}>
            {validationError ? (
              <Paper sx={{ p: 2, bgcolor: "#ffebee", borderLeft: "4px solid #f44336" }}>
                <Typography variant="body2" color="error">
                  {validationError}
                </Typography>
              </Paper>
            ) : (
              <>
                <Paper sx={{ p: 1.5 }}>
                  <Stack spacing={1}>                  <Typography variant="subtitle1" fontWeight={700}>
                    Merge Steps Progress
                  </Typography>
                    <Stepper activeStep={Math.min(completedSteps.size, MERGE_STEPS.length - 1)} sx={{ width: "100%" }}>
                      {MERGE_STEPS.map((step) => (
                        <Step key={step} completed={completedSteps.has(step)}>
                          <StepLabel>{step.replace(/([A-Z])/g, " $1").trim()}</StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center", display: "bl  ock", mt: 1 }}>
                      {completedSteps.size} of {MERGE_STEPS.length} steps completed
                    </Typography>
                  </Stack>
                </Paper>

                <Paper sx={{ p: 1.5 }}>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={1}
                    alignItems={{ xs: "stretch", md: "center" }}
                    justifyContent="space-between"
                  >
                    <Stack>
                      <Typography variant="subtitle2" fontWeight={700}>
                        Delete: {deleteTargetCafeId}
                      </Typography>
                      {/* <Typography variant="caption" color="text.secondary">
                        (Left side - Real)
                      </Typography> */}
                    </Stack>

                    {/* <Typography variant="caption" sx={{ textAlign: "center" }}>
                      {"-->"}  MERGE  {"<--"}
                    </Typography> */}
                    <Button
                      variant="contained"
                      color="error"
                      disabled={!allStepsComplete || mergeLoading}
                      onClick={() => setConfirmMergeOpen(true)}
                    >
                      {!allStepsComplete
                        ? `Complete ${MERGE_STEPS.length - completedSteps.size} more step(s)`
                        : mergeLoading
                          ? "Merging..."
                          : "Merge & Delete"}
                    </Button>
                    <Stack>
                      <Typography variant="subtitle2" fontWeight={700}>
                        Keep: {selectedSourceCafeId}
                      </Typography>
                      {/* <Typography variant="caption" color="text.secondary">
                        (Right side - Crawler)
                      </Typography> */}
                    </Stack>
                  </Stack>
                </Paper>



                <Stack
                  direction={isSmallScreen ? "column" : "row"}
                  spacing={1.5}
                  sx={{ width: "100%" }}
                >
                  {orderedMergeCafes.map((mergeCafe) => (
                    <Paper key={mergeCafe.id} sx={{ p: 1, flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                        {mergeCafe.id} - {mergeCafe.cafe_name}
                      </Typography>
                      <Box sx={{ p: 0.5 }}>{renderMenuContent(mergeCafe.id)}</Box>
                    </Paper>
                  ))}
                </Stack>
              </>
            )}
          </Stack>
        )}
      </Stack>
      <Dialog
        open={confirmMergeOpen}
        onClose={() => setConfirmMergeOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Confirm Merge
        </DialogTitle>

        <DialogContent dividers>
          <DialogContentText sx={{ mb: 2 }}>
            This action will merge the selected cafes. Please review the details carefully before proceeding.
          </DialogContentText>

          {/* Keep Section */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              width: "100%",
            }}
          >
            {/* Keep Section */}
            <Box
              sx={{
                flex: 1,
                p: 2,
                borderRadius: 2,
                bgcolor: "success.lighter",
                border: "1px solid",
                borderColor: "success.light",
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} color="success.main" mb={0.5}>
                Keep
              </Typography>

              <Typography variant="body2">
                <strong>ID:</strong> {selectedSourceCafeId ?? "-"}
              </Typography>

              <Typography variant="body2">
                <strong>Name:</strong>{" "}
                {mergeCafe1?.id === selectedSourceCafeId
                  ? mergeCafe1?.cafe_name
                  : mergeCafe2?.cafe_name}
              </Typography>
            </Box>

            {/* Delete Section */}
            <Box
              sx={{
                flex: 1,
                p: 2,
                borderRadius: 2,
                bgcolor: "error.lighter",
                border: "1px solid",
                borderColor: "error.light",
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} color="error.main" mb={0.5}>
                Delete
              </Typography>

              <Typography variant="body2">
                <strong>ID:</strong> {deleteTargetCafeId ?? "-"}
              </Typography>

              <Typography variant="body2">
                <strong>Name:</strong>{" "}
                {mergeCafe1?.id === deleteTargetCafeId
                  ? mergeCafe1?.cafe_name
                  : mergeCafe2?.cafe_name}
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setConfirmMergeOpen(false)}
            disabled={mergeLoading}
            variant="outlined"
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteSelectedCafe}
            disabled={mergeLoading}
            sx={{
              minWidth: 120,
              fontWeight: 600,
            }}
          >
            {mergeLoading ? "Merging..." : "Confirm Merge"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EditRestaurantMain;
