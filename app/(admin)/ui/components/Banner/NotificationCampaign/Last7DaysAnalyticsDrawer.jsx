import React, { useEffect, useState } from "react";
import {
  Drawer,
  Box,
  Paper,
  Typography,
  IconButton,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import {
  Close,
  Campaign as CampaignIcon,
  Send as SendIcon,
  People as PeopleIcon,
  TouchApp as TouchAppIcon,
} from "@mui/icons-material";
import Chart from "react-apexcharts";
import instanceV1 from "../../../restaurant/authaxios";

const Last7DaysAnalyticsDrawer = ({ open, onClose }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    let isMounted = true;

    const fetchLast7DaysAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("authToken");
        const api = instanceV1(token);

        const res = await api.get(
          "/api/admin/notification/campaign/v1/last7days"
        );

        if (isMounted) {
          if (res.data?.status && Array.isArray(res.data?.data)) {
            setData(res.data.data);
          } else {
            setError("Failed to parse analytics data");
          }
        }
      } catch (err) {
        console.error("Error fetching last 7 days analytics:", err);
        if (isMounted) {
          setError("Failed to load last 7 days analytics");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLast7DaysAnalytics();

    return () => {
      isMounted = false;
    };
  }, [open]);

  // Aggregate stats
  const totalCampaigns = data.reduce((acc, curr) => acc + (curr.total_campaigns_executed || 0), 0);
  const totalSent = data.reduce((acc, curr) => acc + (curr.total_notifications_sent || 0), 0);
  const totalEnrolled = data.reduce((acc, curr) => acc + (curr.total_customers_enrolled || 0), 0);
  const totalClicks = data.reduce((acc, curr) => acc + (curr.total_clicks || 0), 0);

  // Prepare Chart Data
  const categories = data.map((item) => {
    const parts = item.date.split("-");
    if (parts.length === 3) {
      return `${parts[1]}/${parts[2]}`;
    }
    return item.date;
  });

  const campaignsSeries = [
    {
      name: "Campaigns Executed",
      data: data.map((item) => Number(item.total_campaigns_executed ?? 0)),
    },
  ];

  const notificationsSeries = [
    {
      name: "Notifications Sent",
      data: data.map((item) => Number(item.total_notifications_sent ?? 0)),
    },
  ];

  const enrolledSeries = [
    {
      name: "Customers Enrolled",
      data: data.map((item) => Number(item.total_customers_enrolled ?? 0)),
    },
  ];

  const clicksSeries = [
    {
      name: "Clicks",
      data: data.map((item) => Number(item.total_clicks ?? 0)),
    },
  ];

  const getChartOptions = (color) => ({
    chart: {
      height: 180,
      type: "area",
      toolbar: {
        show: false,
      },
      sparkline: {
        enabled: false,
      },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
      },
    },
    stroke: {
      width: 3,
      curve: "smooth",
    },
    colors: [color],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.02,
        stops: [0, 100],
      },
    },
    markers: {
      size: 0,
      hover: {
        size: 6,
      },
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    xaxis: {
      type: "category",
      categories: categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#94a3b8",
          fontSize: "10px",
          fontWeight: 500,
        },
      },
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      labels: {
        style: {
          colors: "#94a3b8",
          fontSize: "10px",
        },
      },
    },
    tooltip: {
      theme: "dark",
      x: {
        show: true,
      },
      y: {
        formatter: (val) => val.toFixed(0),
      },
    },
  });

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      disableEnforceFocus
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 650 },
          p: 0,
          margin: 0,
          height: "100vh",
          bgcolor: "#F7F7F7",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          p: 1,
          pb: 0,
          bgcolor: "#F7F7F7",
        }}
      >
        <Paper sx={{ p: 1 }}>
          <Typography variant="h5" fontWeight="600">
            Last 7 Days Analytics
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </Paper>
      </Box>
      {/* BODY */}
      <Box sx={{ p: 3, flex: 1, overflowY: "auto" }}>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 12 }}>
            <CircularProgress size={40} thickness={4} sx={{ color: "#6366f1" }} />
          </Box>
        )}

        {!loading && error && (
          <Paper sx={{ p: 4, textAlign: "center", borderRadius: "16px", bgcolor: "#FFF", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
            <Typography color="error" variant="body1" fontWeight="600">
              {error}
            </Typography>
          </Paper>
        )}

        {!loading && !error && data.length > 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
            {/* STATS CARDS */}
            <Grid container spacing={2}>
              {/* Campaigns Executed */}
              <Grid size={6}>
                <Card
                  sx={{
                    borderRadius: "12px",
                    boxShadow: "0px 4px 20px rgba(0,0,0,0.02)",
                    border: "1px solid rgba(0,0,0,0.02)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0px 10px 25px rgba(99, 102, 241, 0.08)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 1.5, display: "flex", alignItems: "center", gap: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "10px",
                        bgcolor: "rgba(99, 102, 241, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <CampaignIcon sx={{ color: "#6366f1", fontSize: 22 }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary" fontWeight="600" sx={{ display: "block", mb: 0.2 }}>
                        Campaigns
                      </Typography>
                      <Typography variant="h6" fontWeight="800" sx={{ color: "#1e293b", lineHeight: 1 }}>
                        {totalCampaigns}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Customers Enrolled */}
              <Grid size={6}>
                <Card
                  sx={{
                    borderRadius: "12px",
                    boxShadow: "0px 4px 20px rgba(0,0,0,0.02)",
                    border: "1px solid rgba(0,0,0,0.02)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0px 10px 25px rgba(16, 185, 129, 0.08)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 1.5, display: "flex", alignItems: "center", gap: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "10px",
                        bgcolor: "rgba(16, 185, 129, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <PeopleIcon sx={{ color: "#10b981", fontSize: 22 }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary" fontWeight="600" sx={{ display: "block", mb: 0.2 }}>
                        Enrolled
                      </Typography>
                      <Typography variant="h6" fontWeight="800" sx={{ color: "#1e293b", lineHeight: 1 }}>
                        {totalEnrolled}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Notifications Sent */}
              <Grid size={6}>
                <Card
                  sx={{
                    borderRadius: "12px",
                    boxShadow: "0px 4px 20px rgba(0,0,0,0.02)",
                    border: "1px solid rgba(0,0,0,0.02)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0px 10px 25px rgba(6, 182, 212, 0.08)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 1.5, display: "flex", alignItems: "center", gap: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "10px",
                        bgcolor: "rgba(6, 182, 212, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <SendIcon sx={{ color: "#06b6d4", fontSize: 22 }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary" fontWeight="600" sx={{ display: "block", mb: 0.2 }}>
                        Sent
                      </Typography>
                      <Typography variant="h6" fontWeight="800" sx={{ color: "#1e293b", lineHeight: 1 }}>
                        {totalSent}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Total Clicks */}
              <Grid size={6}>
                <Card
                  sx={{
                    borderRadius: "12px",
                    boxShadow: "0px 4px 20px rgba(0,0,0,0.02)",
                    border: "1px solid rgba(0,0,0,0.02)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0px 10px 25px rgba(245, 158, 11, 0.08)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 1.5, display: "flex", alignItems: "center", gap: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "10px",
                        bgcolor: "rgba(245, 158, 11, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <TouchAppIcon sx={{ color: "#f59e0b", fontSize: 22 }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary" fontWeight="600" sx={{ display: "block", mb: 0.2 }}>
                        Clicks
                      </Typography>
                      <Typography variant="h6" fontWeight="800" sx={{ color: "#1e293b", lineHeight: 1 }}>
                        {totalClicks}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* 4 CHARTS GRID */}
            <Grid container spacing={3}>
              {/* Campaigns Executed Chart */}
              <Grid
                size={{
                  xs: 12,
                  md: 6
                }}>
                <Paper
                  sx={{
                    p: 2.5,
                    boxShadow: "0px 4px 25px rgba(0,0,0,0.02)",
                    borderRadius: "18px",
                    border: "1px solid rgba(0,0,0,0.02)",
                    bgcolor: "#ffffff",
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1.5, color: "#334155" }}>
                    Campaigns Executed
                  </Typography>
                  <Chart
                    options={getChartOptions("#6366f1")}
                    series={campaignsSeries}
                    type="area"
                    height={180}
                  />
                </Paper>
              </Grid>

              {/* Notifications Sent Chart */}
              <Grid
                size={{
                  xs: 12,
                  md: 6
                }}>
                <Paper
                  sx={{
                    p: 2.5,
                    boxShadow: "0px 4px 25px rgba(0,0,0,0.02)",
                    borderRadius: "18px",
                    border: "1px solid rgba(0,0,0,0.02)",
                    bgcolor: "#ffffff",
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1.5, color: "#334155" }}>
                    Notifications Sent
                  </Typography>
                  <Chart
                    options={getChartOptions("#06b6d4")}
                    series={notificationsSeries}
                    type="area"
                    height={180}
                  />
                </Paper>
              </Grid>

              {/* Customers Enrolled Chart */}
              <Grid
                size={{
                  xs: 12,
                  md: 6
                }}>
                <Paper
                  sx={{
                    p: 2.5,
                    boxShadow: "0px 4px 25px rgba(0,0,0,0.02)",
                    borderRadius: "18px",
                    border: "1px solid rgba(0,0,0,0.02)",
                    bgcolor: "#ffffff",
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1.5, color: "#334155" }}>
                    Customers Enrolled
                  </Typography>
                  <Chart
                    options={getChartOptions("#10b981")}
                    series={enrolledSeries}
                    type="area"
                    height={180}
                  />
                </Paper>
              </Grid>

              {/* Clicks Chart */}
              <Grid
                size={{
                  xs: 12,
                  md: 6
                }}>
                <Paper
                  sx={{
                    p: 2.5,
                    boxShadow: "0px 4px 25px rgba(0,0,0,0.02)",
                    borderRadius: "18px",
                    border: "1px solid rgba(0,0,0,0.02)",
                    bgcolor: "#ffffff",
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1.5, color: "#334155" }}>
                    Clicks Trend
                  </Typography>
                  <Chart
                    options={getChartOptions("#f59e0b")}
                    series={clicksSeries}
                    type="area"
                    height={180}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default Last7DaysAnalyticsDrawer;
