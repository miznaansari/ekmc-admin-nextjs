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
  MenuItem,
  Pagination,
} from "@mui/material";

import instanceV1 from "../../../restaurant/authaxios";

const NotificationSentHistoryTable = ({ searchTerm = "" }) => {
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => setScreenHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const token = localStorage.getItem("authToken");
  const instance = instanceV1(token);

  const [historyData, setHistoryData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("id");

  const handleSort = (columnId) => {
    const isAsc = orderBy === columnId && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(columnId);
  };

  const sortData = (array, orderBy, order) => {
    return array.sort((a, b) => {
      const A = a[orderBy]?.toString().toLowerCase() || "";
      const B = b[orderBy]?.toString().toLowerCase() || "";
      if (order === "asc") return A > B ? 1 : -1;
      return A < B ? 1 : -1;
    });
  };

  const fetchHistory = async () => {
    try {
      const res = await instance.get(
        `/api/admin/notification/v1/push/sent?page=${page}&limit=${rowsPerPage}`
      );

      if (res.data?.status) {
        const response = res.data.response;
        setHistoryData(response.data || []);
        setTotalRows(response.total || 0);
      }
    } catch (err) {
      console.log("Error loading sent history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, rowsPerPage]);

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
          <TableHead sx={{ textTransform: "uppercase", backgroundColor: "#f7faf7" }}>
            <TableRow>
              {[
                { id: "sno", label: "S.No" },
                { id: "id", label: "ID" },
                { id: "trigger_title", label: "Trigger Title" },
                { id: "template_title", label: "Template Title" },
                { id: "condition_title", label: "Condition" },
                { id: "trigger_id", label: "Trigger ID" },
                { id: "sent_by", label: "Sent By" },
                { id: "created_at", label: "Sent At" },
              ].map((col) => (
                <TableCell key={col.id}>
                  {col.id !== "sno" ? (
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
                <TableCell>{(page - 1) * rowsPerPage + i + 1}</TableCell>
                <TableCell>{row.id}</TableCell>

                <TableCell>
                  <Typography fontWeight={600}>{row.trigger_title}</Typography>
                </TableCell>

                <TableCell>{row.template_title}</TableCell>

                <TableCell>{row.condition_title}</TableCell>

                <TableCell>{row.trigger_id}</TableCell>

                <TableCell>{row.sent_by}</TableCell>

                <TableCell>
                  {row.created_at ? new Date(row.created_at).toLocaleString() : "-"}
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
      {/* Pagination */}
      <Grid container sx={{ my: 1 }}>
        <Grid
          sx={{ ml: "auto" }}
          size={{
            xs: 12,
            sm: "auto"
          }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
                sx={{ minWidth: 70, height: 32, fontSize: "0.875rem" }}
              >
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
                <MenuItem value={200}>200</MenuItem>
              </Select>
            </Box>

            <Pagination
              count={Math.ceil(totalRows / rowsPerPage)}
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

export default NotificationSentHistoryTable;
