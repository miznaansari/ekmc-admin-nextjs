import React, { useMemo, useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  Typography,
  Box,
  Grid,
  Select,
  Pagination,
  MenuItem,
} from "@mui/material";

import instanceV1 from "../../../restaurant/authaxios";
import { formatUTCToLocal, FormattedDate } from "../../../utils/timeUtils";

const NotificationHistoryTable = ({
  searchTerm = "",
  campaignId = "",
  templateId = "",
  conditionId = "",
  status = "",
  deliveryStatus = "",
}) => {
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setScreenHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const token = localStorage.getItem("authToken");
  const instance = instanceV1(token);

  const [historyData, setHistoryData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(1);

  const [campaignList, setCampaignList] = useState([]);
  const [templateList, setTemplateList] = useState([]);
  const [conditionList, setConditionList] = useState([]);

  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("campaign_title");

  const deliveryStatusOptions = [
    { label: "Failed", value: 0 },
    { label: "Queued", value: 1 },
    { label: "Sent", value: 2 },
    { label: "Delivered", value: 3 },
    { label: "Clicked", value: 4 },
    { label: "In Process", value: 5 },
  ];

  const campaignStatusOptions = [
    { label: "Active", value: 1 },
    { label: "Inactive", value: 0 },
  ];

  const fetchCampaignList = async () => {
    try {
      const res = await instance.get(
        `/api/admin/notification/campaign/v1/campaigns?page=1&limit=100`
      );

      if (res.data?.data) {
        setCampaignList(res.data.data);
      }
    } catch (error) {
      console.log("Error loading campaigns:", error);
    }
  };

  const fetchTemplateList = async () => {
    try {
      const res = await instance.get(
        `/api/admin/notification/v1/templates?page=1&limit=100`
      );

      if (res.data?.data) {
        setTemplateList(res.data.data);
      }
    } catch (error) {
      console.log("Error loading templates:", error);
    }
  };

  const fetchConditionList = async () => {
    try {
      const res = await instance.get(
        `/api/banner/condition/v1/banners?status=1&page=1&limit=100`
      );

      if (res.data?.data) {
        setConditionList(res.data.data);
      }
    } catch (error) {
      console.log("Error loading conditions:", error);
    }
  };

  useEffect(() => {
    fetchCampaignList();
    fetchTemplateList();
    fetchConditionList();
  }, []);

  const handleSort = (columnId) => {
    const isAsc = orderBy === columnId && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(columnId);
  };

  const sortData = (array, orderBy, order) => {
    return array.sort((a, b) => {
      const A = a[orderBy]?.toString().toLowerCase();
      const B = b[orderBy]?.toString().toLowerCase();
      if (order === "asc") return A > B ? 1 : -1;
      return A < B ? 1 : -1;
    });
  };

  const buildHistoryQuery = () => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(rowsPerPage),
    });

    if (campaignId) params.append("campaign_id", campaignId);
    if (templateId) params.append("template_id", templateId);
    if (conditionId) params.append("condition_id", conditionId);
    if (status !== "") params.append("status", status);
    if (deliveryStatus !== "") params.append("delivery_status", deliveryStatus);

    return params.toString();
  };

  const fetchHistory = async () => {
    try {
      const res = await instance.get(
        `/api/adin/notification/queue/v1/history?${buildHistoryQuery()}`
      );
      if (res.data?.status) {
        setHistoryData(res.data.data || []);
        setTotalRows(res.data.total || res.data.pagination?.total || 0);
        setTotalPages(res.data.pagination?.total_pages || 1);
        setPage(res.data.pagination?.current_page || page);
      }
    } catch (err) {
      console.log("Error loading history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, rowsPerPage, campaignId, templateId, conditionId, status, deliveryStatus]);

  useEffect(() => {
    setPage(1);
  }, [campaignId, templateId, conditionId, status, deliveryStatus]);

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return historyData.filter((item) =>
      Object.values(item).some((val) =>
        val?.toString().toLowerCase().includes(term)
      )
    );
  }, [searchTerm, historyData]);

  const sortedFilteredData = useMemo(() => {
    return sortData([...filteredData], orderBy, order);
  }, [filteredData, order, orderBy]);

  return (
    <Paper sx={{ width: "100%", overflow: "hidden", mt: 1, p: 1, pb: 0 }}>
      <TableContainer sx={{ maxHeight: `${screenHeight - 250}px`, overflowY: "auto" }}>
        <Table stickyHeader size="small">
          <TableHead
            sx={{
              textTransform: "uppercase",
              backgroundColor: "#f7faf7",
              color: "#768DA9",
            }}
          >
            <TableRow>
              {[
                { id: "sno", label: "S.No" },
                { id: "campaign_title", label: "Campaign (ID + Title)" },
                { id: "delivery_status", label: "Status" },
                { id: "sent_at", label: "Sent At" },
                { id: "delivered_at", label: "Delivered At" },
                { id: "ctr", label: "CTR" },
                { id: "platform", label: "Platform" },
                { id: "customer", label: "Customer" },
              ].map((col) => (
                <TableCell key={col.id}>
                  {col.id !== "sno" && col.id !== "customer" ? (
                    <TableSortLabel
                      active={orderBy === col.id}
                      direction={orderBy === col.id ? order : "asc"}
                      onClick={() => handleSort(col.id)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedFilteredData.map((row, i) => (
              <TableRow key={row.id || i}>
                {/* S.No */}
                <TableCell>{(page - 1) * rowsPerPage + i + 1}</TableCell>

                {/* Trigger ID + Title */}
                <TableCell sx={{ display: 'flex', gap: 2 }}>
                  <Typography fontWeight={600}>
                    {row.notification_campaign_id || "-"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {row?.campaign_title || row?.title || "-"}
                  </Typography>
                </TableCell>

                {/* Delivery Status */}
                <TableCell>
                  {{
                    0: "Failed",
                    1: "Queued",
                    2: "Sent",
                    3: "Delivered",
                    4: "Clicked",
                    5: "In Process",
                  }[row.delivery_status] || "Unknown"}
                </TableCell>


                {/* Sent */}
                <TableCell>
                  {row.sent_at ? <FormattedDate value={row.sent_at} /> : (row.scheduled_at ? <FormattedDate value={row.scheduled_at} /> : "-")}
                </TableCell>

                {/* Delivered */}
                <TableCell>
                  {row.delivered_at ? <FormattedDate value={row.delivered_at} /> : "-"}
                </TableCell>

                {/* CTR */}
                <TableCell>{row.ctr ? `${row.ctr}%` : "-"}</TableCell>

                {/* Platform */}
                <TableCell>
                  {row.platform || "-"}
                </TableCell>

                {/* Customer */}
                <TableCell>
                  {row.first_name
                    ? `${row.first_name} ${row.last_name || ""}`
                    : "N/A"}
                  <Typography variant="caption" color="text.secondary">
                    {" "}
                    (ID: {row.user_customer_id || "-"})
                  </Typography>
                </TableCell>
              </TableRow>
            ))}

            {sortedFilteredData.length === 0 && (
              <TableRow>
                <TableCell colSpan={8}>
                  <Box py={3} sx={{ textAlign: "center" }}>
                    <Typography>No Results Found</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Pagination Footer */}
      <Grid container sx={{ my: 1 }}>
        <Grid
          sx={{ ml: "auto" }}
          size={{
            xs: 12,
            sm: "auto"
          }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Rows per page */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                Rows per page:
              </Typography>

              <Select
                size="small"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(1);
                }}
                sx={{
                  minWidth: 70,
                  height: 32,
                  fontSize: "0.875rem",
                }}
              >
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
                <MenuItem value={200}>200</MenuItem>
              </Select>
            </Box>

            {/* Pagination */}
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, val) => setPage(val)}
              shape="rounded"
              variant="outlined"
            />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default NotificationHistoryTable;

