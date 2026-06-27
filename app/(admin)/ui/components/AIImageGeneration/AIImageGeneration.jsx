import React, { useState } from "react";
import { Box, TextField, Paper, Typography, Button } from "@mui/material";
import AIImageGenerationTable from "./AIImageGenerationTable.jsx";
import AddEditAIImageGeneration from "./AddEditAIImageGeneration.jsx";
import GlobalSnackbar from "../../utils/GlobalSnackbar.jsx";
import { useLocation } from "react-router-dom";
import mapAdminAccess from "../../mapAdminAccess.json"
import AddEditAIVideoGeneration from "./AddEditAIVideoGeneration.jsx";
import OptionImageOrVideo from "./OptionImageOrVideo.jsx";
const AIImageGeneration = () => {
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
      console.log('checkAccess',checkAccess)
      const hasWriteAccess = checkAccess[0]?.status === 1;
      console.log('object', hasWriteAccess)
    
      // {(userRole === '1' || hasWriteAccess) && (<>
    
      // </>)}
  
  return (
    <Paper sx={{ p: 2, mt: 1 }}>
      {/* Search Box */}
      <Box sx={{ mb: 2, gap: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5">
            AI Generation
          </Typography>
          {/* <TextField
            label="Search User Profiles"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          /> */}
        </Box>
    
        <Button variant="outlined" size="small" onClick={() => { setEditData(null); setOpenDrawer(true); }}>
          Generate 
        </Button>

      </Box>

      {/* Table Component */}
      <AIImageGenerationTable searchTerm={searchTerm} action={action} setAction={setAction} setEditData={setEditData} setOpenDrawer={setOpenDrawer} />
      {/* <AddEditAIImageGeneration
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        data={editData}
        setAlert={setAlert}
        action={action}
        setAction={setAction}
      />
      <AddEditAIVideoGeneration
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        data={editData}
        setAlert={setAlert}
        action={action}
        setAction={setAction}
      /> */}
      <OptionImageOrVideo
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

export default AIImageGeneration;
