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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Close,
  People as PeopleIcon,
  Send as SendIcon,
  TouchApp as TouchAppIcon,
  BarChart as BarChartIcon,
} from "@mui/icons-material";
import instanceV1 from "../../../restaurant/authaxios";
import { FormattedDate } from "../../../utils/timeUtils";

const CampaignAnalyticsDrawer = ({ open, onClose, campaignId }) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !campaignId) return;

    let isMounted = true;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("authToken");
        const api = instanceV1(token);
        
        const res = await api.get(
          `/api/admin/notification/campaign/v1/campaigns?campaign_id=${campaignId}`
        );

        const payload = res?.data?.data;
        const fetchedItem = Array.isArray(payload) ? payload[0] : payload;

        if (isMounted) {
          if (fetchedItem) {
            setAnalyticsData(fetchedItem);
          } else {
            setError("No analytics data found for this campaign");
          }
        }
      } catch (err) {
        console.error("Error fetching campaign analytics:", err);
        if (isMounted) {
          setError("Failed to load campaign analytics");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAnalytics();

    return () => {
      isMounted = false;
    };
  }, [open, campaignId]);

  const analytics = analyticsData?.analytics || {};
  const clickedUsers = analyticsData?.clicked_users || [];

  // Calculate CTR (Click-Through Rate)
  const ctr =
    analytics.successfully_sent_count > 0
      ? ((analytics.total_clicks / analytics.successfully_sent_count) * 100).toFixed(2)
      : "0.00";

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      disableEnforceFocus
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 550 },
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
            Campaign Analytics {analyticsData?.title ? `- ${analyticsData.title}` : ""}
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

        {!loading && !error && analyticsData && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            
            {/* METRICS GRID */}
            <Grid container spacing={2}>
              {/* Total Enrolled Users */}
              <Grid size={6}>
                <Card
                  sx={{
                    height: "100%",
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
                        Enrolled Users
                      </Typography>
                      <Typography variant="h6" fontWeight="800" sx={{ color: "#1e293b", lineHeight: 1 }}>
                        {analytics.total_enrolled_users ?? 0}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Successfully Sent */}
              <Grid size={6}>
                <Card
                  sx={{
                    height: "100%",
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
                        Sent Successfully
                      </Typography>
                      <Typography variant="h6" fontWeight="800" sx={{ color: "#1e293b", lineHeight: 1 }}>
                        {analytics.successfully_sent_count ?? 0}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Total Clicks */}
              <Grid size={6}>
                <Card
                  sx={{
                    height: "100%",
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
                        Total Clicks
                      </Typography>
                      <Typography variant="h6" fontWeight="800" sx={{ color: "#1e293b", lineHeight: 1 }}>
                        {analytics.total_clicks ?? 0}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Click-Through Rate (CTR) */}
              <Grid size={6}>
                <Card
                  sx={{
                    height: "100%",
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
                      <BarChartIcon sx={{ color: "#6366f1", fontSize: 22 }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary" fontWeight="600" sx={{ display: "block", mb: 0.2 }}>
                        CTR (%)
                      </Typography>
                      <Typography variant="h6" fontWeight="800" sx={{ color: "#1e293b", lineHeight: 1 }}>
                        {ctr}%
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* CLICKED USERS SECTION */}
            <Paper sx={{ p: 2, boxShadow: "0px 2px 8px rgba(0,0,0,0.05)", borderRadius: 1 }}>
              <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
                Clicked Users ({clickedUsers.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {clickedUsers.length === 0 ? (
                <Box sx={{ py: 4, textAlign: "center" }}>
                  <Typography variant="body2" color="textSecondary">
                    No clicks recorded for this campaign.
                  </Typography>
                </Box>
              ) : (
                <TableContainer sx={{ maxHeight: 400 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold", bgcolor: "#F4F6F8" }}>User</TableCell>
                        <TableCell sx={{ fontWeight: "bold", bgcolor: "#F4F6F8" }}>Contact Details</TableCell>
                        <TableCell sx={{ fontWeight: "bold", bgcolor: "#F4F6F8" }}>Clicked At</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {clickedUsers.map((user) => (
                        <TableRow key={user.id} hover>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  fontSize: "0.875rem",
                                  bgcolor: "primary.light",
                                }}
                              >
                                {user.first_name?.[0]?.toUpperCase() || "?"}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight="600">
                                  {user.first_name || ""} {user.last_name || ""}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  ID: {user.id}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" sx={{ fontSize: "0.8125rem" }}>
                                {user.mobile_number || "No number"}
                              </Typography>
                              {user.email && (
                                <Typography variant="caption" color="textSecondary" display="block">
                                  {user.email}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontSize: "0.8125rem" }}>
                              {user.clicked_at ? (
                                <FormattedDate value={user.clicked_at} />
                              ) : (
                                "-"
                              )}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default CampaignAnalyticsDrawer;
