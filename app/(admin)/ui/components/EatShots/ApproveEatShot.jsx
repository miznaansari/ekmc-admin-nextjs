import { Box, Button } from "@mui/material";
import axios from "axios";

const ApproveEatshot= ({onSuccess, content_id, is_approve})=>{
    const baseurl= import.meta.env.VITE_REACT_APP_BACKEND_URL;
    const token= localStorage.getItem("authToken");
    console.log("baseUrl:", baseurl);
    console.log("token:",token);
    console.log("content id:", content_id);
    const ApproveEatShot = async () => {
      try {
        const response = await axios.put(
          `${baseurl}/api/v1/social/approve`,
          {
            content_arr: [
              {
                content_id: content_id
              }
            ]
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        );
        console.log("response in approve eatshot:", response);
        onSuccess();
      } catch (e) {
        console.log("approve failed / server error/ error:", e);
      }
    };
    
    const handleApprove= ()=>{
        ApproveEatShot();
    }

    //Delete Eatshot
    const DeleteEatShot = async () => {
        try {
          const response = await axios.delete(`${baseurl}/api/v1/social/delete`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            data: {
              content_arr: [
                {
                  content_id: content_id
                }
              ]
            }
          });
          console.log("status:", response.status)
          console.log("response in delete eatshot:", response);
          if(response.status === 200){
            onSuccess();
          }
          
        } catch (e) {
          console.log("error / server error:", e);
        }
      };
      
    const HandleDeleteEatshot= ()=>{
        DeleteEatShot();
    }
    return(
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
          {is_approve !=1 &&
            <Button
                variant="contained"
                color="primary"
                onClick={handleApprove}
            >
                Approve
            </Button>
          }
            <Button
                variant="contained"
                color="error"
                onClick={HandleDeleteEatshot}
            >
                Delete
            </Button>
        </Box>
    );
}

export default ApproveEatshot;