import React, { useState, useEffect } from "react";
import { Box, TextField, Paper, Typography, Button, useMediaQuery, Stack, Grid, CircularProgress } from "@mui/material";
import InstagramExtractorTable from "./InstagramExtractorTable.jsx";
import AddEditInstagramExtractorForm from "./AddEditInstagramExtractorForm.jsx";
import GlobalSnackbar from "../../utils/GlobalSnackbar.jsx";
import { useLocation } from "@/ui/utils/nextRouting";
import mapAdminAccess from "../../mapAdminAccess.json";
import instanceV1 from "../../restaurant/authaxios";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutlined";
import RateReview from "@mui/icons-material/RateReview";
import CancelOutlined from "@mui/icons-material/CancelOutlined";
import HourglassEmpty from "@mui/icons-material/HourglassEmpty";
const InstagramExtractor = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openDrawer, setOpenDrawer] = useState(false);
  const [action, setAction] = useState(false);
  const [editData, setEditData] = useState(null);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });


  // import mapAdminAccess from "../../mapAdminAccess.json"

  const location = useLocation();
  const locationName = location.pathname;
  const pathName = mapAdminAccess.filter(
    (access) => access.path === locationName
  );
  const basePermission = pathName?.[0]?.permission || "";
  const userRole = localStorage.getItem("userRole") || "";
  const writePermission = basePermission.replace(/-read$/, "-write");
  console.log('writePermission', writePermission)
  const accessMember = JSON.parse(localStorage.getItem("user_permission")) || [];
  const checkAccess = accessMember.filter(
    (access) => access?.permission_name === writePermission
  );
  console.log('checkAccess', checkAccess)
  const hasWriteAccess = checkAccess[0]?.status === 1;
  console.log('object', hasWriteAccess)

  // {(userRole === '1' || hasWriteAccess) && (<>

const isMobile = useMediaQuery("(max-width:600px)");

  const [stats, setStats] = useState({
    approved: 0,
    ready: 0,
    rejected: 0,
    queue: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      const api = instanceV1(token);
      const res = await api.get("/api/admin/crawler/v1/insta/data?page=1&limit=1000");
      const list = res.data?.response?.data || [];

      let approved = 0;
      let ready = 0;
      let rejected = 0;
      let queue = 0;

      list.forEach((profile) => {
        if (profile.reels && Array.isArray(profile.reels)) {
          profile.reels.forEach((reel) => {
            if (reel.is_processed !== 1) {
              queue++;
            } else if (reel.is_rejected === 0 && reel.is_approved === 0) {
              ready++;
            } else if (reel.is_rejected === 1 && reel.is_approved === 0) {
              rejected++;
            } else if (reel.is_rejected === 0 && reel.is_approved === 1) {
              approved++;
            }
          });
        }
      });

      setStats({ approved, ready, rejected, queue });
    } catch (err) {
      console.error("Failed to fetch reel statistics:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => {
      fetchStats();
    }, 30000);
    return () => clearInterval(interval);
  }, [action]);

  return (
    <Paper sx={{ p: 2, mt: 1 }}>
      {/* Search Box */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
          mb: 2,
        }}
      >
        {/* LEFT SECTION */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={2}
          flex={1}
        >
          <Typography variant="h5" sx={{ whiteSpace: "nowrap" }}>
            Instagram Extractor
          </Typography>

          <TextField
            label="Search User Profiles"
            variant="outlined"
            size="small"
            fullWidth={isMobile}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Stack>

        {/* RIGHT SECTION */}
        {(userRole === "1" || hasWriteAccess) && (
          <Button
            variant="outlined"
            size="small"
            fullWidth={isMobile}
            sx={{ height: 40 }}
            onClick={() => {
              setEditData(null);
              setOpenDrawer(true);
            }}
          >
            Bulk Reel Upload
          </Button>
        )}
      </Box>
      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3, display: { xs: "none", sm: "flex" } }}>
        {[
          {
            title: "Approved Reels",
            value: stats.approved,
            icon: <CheckCircleOutline sx={{ fontSize: 32, color: "#10b981" }} />,
            bg: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
            border: "1px solid #bbf7d0",
            textColor: "#14532d",
          },
          {
            title: "Ready for Review",
            value: stats.ready,
            icon: <RateReview sx={{ fontSize: 32, color: "#3b82f6" }} />,
            bg: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
            border: "1px solid #bfdbfe",
            textColor: "#1e3a8a",
          },
          {
            title: "Rejected Reels",
            value: stats.rejected,
            icon: <CancelOutlined sx={{ fontSize: 32, color: "#ef4444" }} />,
            bg: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
            border: "1px solid #fecaca",
            textColor: "#7f1d1d",
          },
          {
            title: "Reels in Queue",
            value: stats.queue,
            icon: <HourglassEmpty sx={{ fontSize: 32, color: "#f59e0b" }} />,
            bg: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
            border: "1px solid #fde68a",
            textColor: "#78350f",
          },
        ].map((card, idx) => (
          <Grid
            key={idx}
            size={{
              xs: 12,
              sm: 6,
              md: 3
            }}>
            <Box
              sx={{
                p: 2.5,
                borderRadius: 1.5,
                background: card.bg,
                border: card.border,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.025)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 20px -8px rgba(0,0,0,0.12), 0 4px 12px -2px rgba(0,0,0,0.08)",
                },
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ color: card.textColor, fontWeight: 600, opacity: 0.8, mb: 0.5 }}>
                  {card.title}
                </Typography>
                {statsLoading ? (
                  <CircularProgress size={20} sx={{ color: card.textColor, mt: 0.5 }} />
                ) : (
                  <Typography variant="h4" sx={{ color: card.textColor, fontWeight: 700, letterSpacing: "-1px" }}>
                    {card.value}
                  </Typography>
                )}
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 1.5,
                  borderRadius: "50%",
                  bgcolor: "rgba(255, 255, 255, 0.5)",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.06)",
                }}
              >
                {card.icon}
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
      {/* Table Component */}
      <InstagramExtractorTable searchTerm={searchTerm} action={action} setAction={setAction} setEditData={setEditData} setOpenDrawer={setOpenDrawer} />
      <AddEditInstagramExtractorForm
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        data={editData}
        setAlert={setAlert}
        action={action}
        setAction={setAction}
      />
      <GlobalSnackbar alert={alert} setAlert={setAlert} />
    </Paper>
  );
};

export default InstagramExtractor;
