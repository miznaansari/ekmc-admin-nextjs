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
      // Return "MM/DD" format for better X-axis readability
      return `${parts[1]}/${parts[2]}`;
    }
    return item.date;
  });

  const chartSeries = [
    {
      name: "Campaigns Executed",
      type: "column",
      data: data.map((item) => item.total_campaigns_executed || 0),
    },
    {
      name: "Notifications Sent",
      type: "column",
      data: data.map((item) => item.total_notifications_sent || 0),
    },
    {
      name: "Customers Enrolled",
      type: "area",
      data: data.map((item) => item.total_customers_enrolled || 0),
    },
    {
      name: "Clicks",
      type: "line",
      data: data.map((item) => item.total_clicks || 0),
    },
  ];

  const chartOptions = {
    chart: {
      height: 350,
      type: "line",
      stacked: false,
      toolbar: {
        show: false,
      },
    },
    stroke: {
      width: [0, 0, 2, 3],
      curve: "smooth",
    },
    plotOptions: {
      bar: {
        columnWidth: "60%",
      },
    },
    colors: ["#3f51b5", "#00bcd4", "#4caf50", "#ff9800"],
    fill: {
      opacity: [0.85, 0.85, 0.25, 1],
      gradient: {
        inverseColors: false,
        shade: "light",
        type: "vertical",
        opacityFrom: 0.85,
        opacityTo: 0.55,
        stops: [0, 100, 100, 100],
      },
    },
    labels: categories,
    markers: {
      size: [0, 0, 0, 5],
    },
    xaxis: {
      type: "category",
      title: {
        text: "Date (MM/DD)",
        style: {
          fontWeight: 600,
        },
      },
    },
    yaxis: [
      {
        title: {
          text: "Count",
          style: {
            color: "#3f51b5",
            fontWeight: 600,
          },
        },
      },
    ],
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function (y) {
          if (typeof y !== "undefined") {
            return y.toFixed(0);
          }
          return y;
        },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "center",
      fontSize: "13px",
      markers: {
        radius: 12,
      },
    },
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      disableEnforceFocus
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 600 },
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
      <Box sx={{ p: 2, flex: 1, overflowY: "auto" }}>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
            <CircularProgress size={36} />
          </Box>
        )}

        {!loading && error && (
          <Paper sx={{ p: 3, textAlign: "center", bgcolor: "#FFF" }}>
            <Typography color="error" variant="body1" fontWeight="500">
              {error}
            </Typography>
          </Paper>
        )}

        {!loading && !error && data.length > 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* STATS CARDS */}
            <Grid container spacing={2}>
              {/* Campaigns Executed */}
              <Grid
                size={{
                  xs: 6,
                  md: 3
                }}>
                <Card sx={{ height: "100%", boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}>
                  <CardContent sx={{ p: 1.5, textCenter: "center", "&:last-child": { pb: 1.5 } }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <CampaignIcon color="primary" fontSize="small" />
                      <Typography variant="caption" color="textSecondary" fontWeight="600">
                        Campaigns
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="700">
                      {totalCampaigns}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Customers Enrolled */}
              <Grid
                size={{
                  xs: 6,
                  md: 3
                }}>
                <Card sx={{ height: "100%", boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}>
                  <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <PeopleIcon color="success" fontSize="small" />
                      <Typography variant="caption" color="textSecondary" fontWeight="600">
                        Enrolled
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="700">
                      {totalEnrolled}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Notifications Sent */}
              <Grid
                size={{
                  xs: 6,
                  md: 3
                }}>
                <Card sx={{ height: "100%", boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}>
                  <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <SendIcon color="secondary" fontSize="small" />
                      <Typography variant="caption" color="textSecondary" fontWeight="600">
                        Sent
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="700">
                      {totalSent}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Total Clicks */}
              <Grid
                size={{
                  xs: 6,
                  md: 3
                }}>
                <Card sx={{ height: "100%", boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}>
                  <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <TouchAppIcon color="warning" fontSize="small" />
                      <Typography variant="caption" color="textSecondary" fontWeight="600">
                        Clicks
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="700">
                      {totalClicks}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* CHART PAPER */}
            <Paper sx={{ p: 2, boxShadow: "0px 2px 8px rgba(0,0,0,0.05)", borderRadius: 1 }}>
              <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
                Campaign Execution & Engagement Trends
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ width: "100%" }}>
                <Chart
                  options={chartOptions}
                  series={chartSeries}
                  type="line"
                  height={350}
                />
              </Box>
            </Paper>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default Last7DaysAnalyticsDrawer;
