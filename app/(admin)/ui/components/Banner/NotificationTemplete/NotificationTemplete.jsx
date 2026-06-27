import React, { useState } from "react";
import { Box, TextField, Paper, Typography, Button } from "@mui/material";
import NotificationTriggerTable from "./NotificationTempleteTable.jsx";
import AddEditTemplateForm from "./AddEditTemplateForm.jsx";
import GlobalSnackbar from "../../../utils/GlobalSnackbar.jsx";
import mapAdminAccess from "../../../mapAdminAccess.json"
import { useLocation } from "@/ui/utils/nextRouting";
const NotificationTemplete = () => {
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

  //  {(userRole === '1' || hasWriteAccess) && (<>

  //  </>)}

  return (
    <Paper sx={{ p: 2, mt: 1 }}>
      {/* Search Box */}
      <Box sx={{ mb: 2, gap: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5">
            Notification Templete
          </Typography>
          <TextField
            label="Search Notifications"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>
           {(userRole === '1' || hasWriteAccess) && (<>


        <Button variant="outlined" size="small" onClick={() => { setEditData(null); setOpenDrawer(true); }}>
          Add Template
        </Button>
           </>)}
      </Box>
      <AddEditTemplateForm
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        data={editData}
        action={action}
        setAlert={setAlert}
        setAction={setAction}
      />

      {/* Table Component */}
      <NotificationTriggerTable searchTerm={searchTerm} action={action} setAction={setAction} />
      <GlobalSnackbar alert={alert} setAlert={setAlert} />

    </Paper>
  );
};

export default NotificationTemplete;
