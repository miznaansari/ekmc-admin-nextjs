import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

// Custom Actions Menu Component
function ActionsMenu({ row, onView, onEdit }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleView = () => {
    onView(row);
    handleClose();
  };

  const handleEdit = () => {
    onEdit(row);
    handleClose();
  };

  return (
    <>
      <IconButton
        aria-label="more"
        id="actions-button"
        aria-controls={open ? 'actions-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="actions-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'actions-button',
        }}
      >
        <MenuItem onClick={handleView}>View</MenuItem>
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
      </Menu>
    </>
  );
}

// Custom Row Component with Expandable Details
function ExpandableRow({ row, onExpand, expanded }) {
  // Render expandable details
  const renderExpandedContent = () => {
    if (!row.history) return null;

    return (
      <Box sx={{ margin: 1, padding: 2 }}>
        <Typography variant="h6" gutterBottom component="div">
          Purchase History
        </Typography>
        <Table size="small" aria-label="purchases">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Total price ($)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {row.history.map((historyRow, index) => (
              <TableRow key={index}>
                <TableCell component="th" scope="row">
                  {historyRow.date}
                </TableCell>
                <TableCell>{historyRow.customerId}</TableCell>
                <TableCell align="right">{historyRow.amount}</TableCell>
                <TableCell align="right">
                  {Math.round(historyRow.amount * row.price * 100) / 100}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    );
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation(); // Prevent row selection
          onExpand(row.id);
        }}
      >
        {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
      </IconButton>
      {row.history && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          {renderExpandedContent()}
        </Collapse>
      )}
    </>
  );
}

export default function AdvancedTable() {
  // State for expanded rows and selected rows
  const [expandedRows, setExpandedRows] = React.useState({});
  const [selectedRows, setSelectedRows] = React.useState([]);
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [currentRow, setCurrentRow] = React.useState(null);

  // Function to toggle row expansion
  const handleRowExpand = (rowId) => {
    setExpandedRows((prev) => {
      // Close all other expanded rows
      const newExpandedRows = Object.keys(prev).reduce((acc, key) => {
        acc[key] = key === String(rowId) ? !prev[key] : false;
        return acc;
      }, {});
      
      // Toggle the clicked row
      if (!newExpandedRows[rowId]) {
        delete newExpandedRows[rowId];
      }
      
      return newExpandedRows;
    });
  };

  // Functions for view and edit actions
  const handleView = (row) => {
    setCurrentRow(row);
    setViewDialogOpen(true);
  };

  const handleEdit = (row) => {
    setCurrentRow(row);
    setEditDialogOpen(true);
  };

  // Rows remain the same as in the previous implementation
  const rows = [
    { 
      id: 1, 
      name: 'Frozen yoghurt', 
      calories: 159, 
      fat: 6.0, 
      carbs: 24, 
      protein: 4.0, 
      price: 3.99,
      history: [
        { date: '2020-01-05', customerId: '11091700', amount: 3 },
        { date: '2020-01-02', customerId: 'Anonymous', amount: 1 },
      ]
    },
    { 
      id: 2, 
      name: 'Ice cream sandwich', 
      calories: 237, 
      fat: 9.0, 
      carbs: 37, 
      protein: 4.3, 
      price: 4.99,
      history: [
        { date: '2020-02-10', customerId: '22092800', amount: 2 },
      ]
    },
    { 
      id: 3, 
      name: 'Eclair', 
      calories: 262, 
      fat: 16.0, 
      carbs: 24, 
      protein: 6.0, 
      price: 3.79,
      history: [
        { date: '2020-03-15', customerId: '33093900', amount: 1 },
        { date: '2020-03-01', customerId: 'VIP Customer', amount: 2 },
      ]
    },
    { 
      id: 4, 
      name: 'Cupcake', 
      calories: 305, 
      fat: 3.7, 
      carbs: 67, 
      protein: 4.3, 
      price: 2.50,
      history: [
        { date: '2020-04-20', customerId: '44094000', amount: 5 },
        { date: '2020-04-15', customerId: 'Bulk Buyer', amount: 3 },
      ]
    },
    { 
      id: 5, 
      name: 'Gingerbread', 
      calories: 356, 
      fat: 16.0, 
      carbs: 49, 
      protein: 3.9, 
      price: 4.20,
      history: [
        { date: '2020-05-05', customerId: '55095100', amount: 2 },
      ]
    },
    { 
      id: 6, 
      name: 'Jelly bean', 
      calories: 375, 
      fat: 0.0, 
      carbs: 94, 
      protein: 0.0, 
      price: 1.99,
      history: [
        { date: '2020-06-12', customerId: '66096200', amount: 4 },
        { date: '2020-06-01', customerId: 'Seasonal Buyer', amount: 2 },
      ]
    }
  ];

  // Define columns with custom rendering
  const columns = [
    {
      field: 'expand',
      headerName: '',
      width: 70,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <ExpandableRow 
          row={params.row} 
          onExpand={handleRowExpand}
          expanded={expandedRows[params.row.id] || false}
        />
      ),
    },
    { 
      field: 'name', 
      headerName: 'Dessert (100g serving)', 
      width: 200 
    },
    { 
      field: 'calories', 
      headerName: 'Calories', 
      type: 'number', 
      width: 130, 
      align: 'right',
      headerAlign: 'right' 
    },
    { 
      field: 'fat', 
      headerName: 'Fat (g)', 
      type: 'number', 
      width: 130, 
      align: 'right',
      headerAlign: 'right' 
    },
    { 
      field: 'carbs', 
      headerName: 'Carbs (g)', 
      type: 'number', 
      width: 130, 
      align: 'right',
      headerAlign: 'right' 
    },
    { 
      field: 'protein', 
      headerName: 'Protein (g)', 
      type: 'number', 
      width: 130, 
      align: 'right',
      headerAlign: 'right' 
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <ActionsMenu 
          row={params.row}
          onView={handleView}
          onEdit={handleEdit}
        />
      ),
    }
  ];

  return (
    <>
      <Paper sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          checkboxSelection
          disableRowSelectionOnClick // This is the key change
          onRowSelectionModelChange={(newSelectionModel) => {
            setSelectedRows(newSelectionModel);
          }}
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
          }}
          pageSizeOptions={[5, 10, 25]}
          sx={{ 
            border: 0,
            '& .MuiDataGrid-cell': {
              border: 'none',
            },
          }}
        />
      </Paper>

      {/* View Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
      >
        <DialogTitle>View Details</DialogTitle>
        <DialogContent>
          {currentRow && (
            <Box>
              <Typography>Name: {currentRow.name}</Typography>
              <Typography>Calories: {currentRow.calories}</Typography>
              <Typography>Fat: {currentRow.fat}g</Typography>
              <Typography>Carbs: {currentRow.carbs}g</Typography>
              <Typography>Protein: {currentRow.protein}g</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
      >
        <DialogTitle>Edit Details</DialogTitle>
        <DialogContent>
          {currentRow && (
            <Box>
              <Typography>Editing: {currentRow.name}</Typography>
              {/* Add form fields for editing */}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => setEditDialogOpen(false)} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}