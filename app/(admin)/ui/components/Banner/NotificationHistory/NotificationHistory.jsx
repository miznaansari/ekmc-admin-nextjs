import React, { useState } from "react";
import {
  Box,
  TextField,
  Paper,
  Typography,
  IconButton,
  Popover,
  Stack,
  MenuItem,
  Button,
} from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import instanceV1 from "../../../restaurant/authaxios";
import NotificationHistoryTable from "./NotificationHistoryTable";

const NotificationHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [campaignList, setCampaignList] = useState([]);
  const [templateList, setTemplateList] = useState([]);
  const [conditionList, setConditionList] = useState([]);
  const [campaignId, setCampaignId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [conditionId, setConditionId] = useState("");
  const [status, setStatus] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState("");

  const open = Boolean(filterAnchorEl);
  const token = localStorage.getItem("authToken");
  const instance = instanceV1(token);
  const hasActiveFilters = Boolean(
    campaignId || templateId || conditionId || status !== "" || deliveryStatus !== ""
  );

  React.useEffect(() => {
    const fetchCampaignList = async () => {
      try {
        const res = await instance.get(`/api/admin/notification/campaign/v1/campaigns?page=1&limit=100`);
        setCampaignList(res.data?.data || []);
      } catch (error) {
        console.log("Error loading campaigns:", error);
      }
    };

    const fetchTemplateList = async () => {
      try {
        const res = await instance.get(`/api/admin/notification/v1/templates?page=1&limit=100`);
        setTemplateList(res.data?.data || []);
      } catch (error) {
        console.log("Error loading templates:", error);
      }
    };

    const fetchConditionList = async () => {
      try {
        const res = await instance.get(`/api/banner/condition/v1/banners?status=1&page=1&limit=100`);
        setConditionList(res.data?.data || []);
      } catch (error) {
        console.log("Error loading conditions:", error);
      }
    };

    fetchCampaignList();
    fetchTemplateList();
    fetchConditionList();
  }, []);

  const handleOpenFilters = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleCloseFilters = () => {
    setFilterAnchorEl(null);
  };

  return (
    <Paper sx={{ p: 2, mt:1 }}>
      {/* Search Box */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h5">
          Notification History
           </Typography>
        <TextField
          label="Search Notifications"
          variant="outlined"
          size="small"
          sx={{ ml: 1 }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <IconButton
          onClick={handleOpenFilters}
          aria-label="open filters"
         
           sx={{
      color: hasActiveFilters ? "primary.main" : "inherit",
      bgcolor: hasActiveFilters ? "success.main" : "transparent",
      "&:hover": {
        bgcolor: hasActiveFilters ? "success.light" : "action.hover",
      },
    }}
        >
          <FilterAltIcon />
        </IconButton>
      </Box>

      <Popover
        open={open}
        anchorEl={filterAnchorEl}
        onClose={handleCloseFilters}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box sx={{ p: 2, width: 320 }}>
          <Stack spacing={1.5}>
            <TextField
              select
              size="small"
              label="Campaign"
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              fullWidth
            >
              <MenuItem value="">All</MenuItem>
              {campaignList.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.title}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label="Template"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              fullWidth
            >
              <MenuItem value="">All</MenuItem>
              {templateList.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.title}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label="Condition"
              value={conditionId}
              onChange={(e) => setConditionId(e.target.value)}
              fullWidth
            >
              <MenuItem value="">All</MenuItem>
              {conditionList.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.title}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              fullWidth
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value={1}>Active</MenuItem>
              <MenuItem value={0}>Inactive</MenuItem>
            </TextField>

            <TextField
              select
              size="small"
              label="Delivery Status"
              value={deliveryStatus}
              onChange={(e) => setDeliveryStatus(e.target.value)}
              fullWidth
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value={0}>Failed</MenuItem>
              <MenuItem value={1}>Queued</MenuItem>
              <MenuItem value={2}>Sent</MenuItem>
              <MenuItem value={3}>Delivered</MenuItem>
              <MenuItem value={4}>Clicked</MenuItem>
              <MenuItem value={5}>In Process</MenuItem>
            </TextField>

            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setCampaignId("");
                  setTemplateId("");
                  setConditionId("");
                  setStatus("");
                  setDeliveryStatus("");
                }}
              >
                Clear
              </Button>
            </Box>
          </Stack>
        </Box>
      </Popover>

      {/* Table Component */}
      <NotificationHistoryTable
        searchTerm={searchTerm}
        campaignId={campaignId}
        templateId={templateId}
        conditionId={conditionId}
        status={status}
        deliveryStatus={deliveryStatus}
      />
    </Paper>
  );
};

export default NotificationHistory;
