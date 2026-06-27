"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  CircularProgress,
  Box,
  Grid,
  Typography,
  Select,
  MenuItem,
  Pagination,
  Skeleton,
  Chip,
} from "@mui/material";
import TableSortLabel from "@mui/material/TableSortLabel";
import instanceV1 from "../../restaurant/authaxios.jsx";

const platformMap = {
  0: "iOS",
  1: "Android",
  2: "Web",
};

const ReleasedLogTable = ({
  searchTerm,
  platformFilter,
  statusFilter, action
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [total, setTotal] = useState(0);

  // 🔥 SORT STATE
  const [orderBy, setOrderBy] = useState("release_date");
  const [order, setOrder] = useState("desc");

  // 🔄 HANDLE SORT CLICK
  const handleSort = (column) => {
    const isAsc = orderBy === column && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(column);
  };

  const fetchReleases = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("authToken");
      const instance = instanceV1(token);

      const params = {
        page: page ,
        limit: rowsPerPage,
        sort_by: orderBy,      // 🔥 send to API
        sort_order: order,     // 🔥 send to API
      };

      if (searchTerm) params.release_version = searchTerm;
      if (platformFilter !== "") params.release_platform = platformFilter;
      if (statusFilter !== "") params.is_active = statusFilter;

      const res = await instance.get(
        "/api/app-release/v1/release",
        { params }
      );

      if (res?.data?.status) {
        setData(res.data.releases || []);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Debounce
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchReleases();
    }, 400);

    return () => clearTimeout(delay);
  }, [searchTerm, platformFilter, statusFilter, page, rowsPerPage, order, orderBy, action]);

  return (
    <Box>
      {loading ? (
      <Table>
  <TableHead
    sx={{
      textTransform: "uppercase",
      backgroundColor: "#f7faf7",
    }}
  >
    <TableRow>
      <TableCell>S.No.</TableCell>
      <TableCell>ID</TableCell>
      <TableCell>Version</TableCell>
      <TableCell>Release Note</TableCell>
      <TableCell>Platform</TableCell>
      <TableCell>Status</TableCell>
      <TableCell>Date</TableCell>
    </TableRow>
  </TableHead>

  <TableBody>
    {[...Array(8)].map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton width={30} /></TableCell>
        <TableCell><Skeleton width={40} /></TableCell>
        <TableCell><Skeleton width={80} /></TableCell>
        <TableCell><Skeleton width={70} /></TableCell>
        <TableCell><Skeleton width={60} /></TableCell>
        <TableCell><Skeleton width={140} /></TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
      ) : (
        <>
          <Table>
            <TableHead sx={{
              textTransform: "uppercase",
              backgroundColor: "#f7faf7",
            }}>
              <TableRow>

                {/* ID */}
                <TableCell>S.No.</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "id"}
                    direction={orderBy === "id" ? order : "asc"}
                    onClick={() => handleSort("id")}
                  >
                    ID
                  </TableSortLabel>
                </TableCell>

                {/* VERSION */}
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "release_version"}
                    direction={orderBy === "release_version" ? order : "asc"}
                    onClick={() => handleSort("release_version")}
                  >
                    Version
                  </TableSortLabel>
                </TableCell>
                  <TableCell>
                  <TableSortLabel
                    active={orderBy === "release_version"}
                    direction={orderBy === "release_version" ? order : "asc"}
                    onClick={() => handleSort("release_version")}
                  >
                    Release Note
                  </TableSortLabel>
                </TableCell>

                {/* PLATFORM */}
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "release_platform"}
                    direction={orderBy === "release_platform" ? order : "asc"}
                    onClick={() => handleSort("release_platform")}
                  >
                    Platform
                  </TableSortLabel>
                </TableCell>

                {/* STATUS */}
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "is_active"}
                    direction={orderBy === "is_active" ? order : "asc"}
                    onClick={() => handleSort("is_active")}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>

                {/* DATE */}
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "release_date"}
                    direction={orderBy === "release_date" ? order : "asc"}
                    onClick={() => handleSort("release_date")}
                  >
                    Date
                  </TableSortLabel>
                </TableCell>

              </TableRow>
            </TableHead>

            <TableBody>
              {data.map((row, index) => (
                <TableRow key={row.id} hover>

                  {/* ✅ S.NO */}
                  <TableCell>
                   {(page - 1) * rowsPerPage + index + 1}
                  </TableCell>

                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.release_version}</TableCell>
                  <TableCell>{row.release_notes}</TableCell>

                  <TableCell>
                    {platformMap[row.release_platform]}
                  </TableCell>

                <TableCell sx={{display:'flex',justifyItems:'center'}}>
  <Chip
    label={row.is_active ? "Active" : "Inactive"}
    color={row.is_active ? "primary" : "error"}
    size="small"
    variant="filled"
  />
</TableCell>

                  <TableCell>
                    {new Date(row.release_date).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    })}
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* PAGINATION */}
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
            setPage(1); // ✅ reset to first page
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
        count={Math.ceil(total / rowsPerPage)} // ✅ calculate total pages
        page={page}
        onChange={(e, val) => setPage(val)}
        shape="rounded"
        variant="outlined"
        color="primary"
      />

    </Box>
  </Grid>
</Grid>
        </>
      )}
    </Box>
  );
};

export default ReleasedLogTable;