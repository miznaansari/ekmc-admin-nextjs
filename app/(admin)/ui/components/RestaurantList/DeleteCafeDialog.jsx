import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from "@mui/material";
import instanceV1 from "../../restaurant/authaxios";

export default function DeleteCafeDialog({ cafe, open, setOpen, onDeleted }) {
    const handleClose = () => {
        setOpen(false);
    };

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem("authToken");
            const instance = instanceV1(token);
            const res = await instance.delete(`/api/admin/v1/cafe/${cafe.id}`);
            if (res?.status === 200) {
                if (onDeleted) onDeleted(); // Notify parent to refresh
            } else {
                console.error("Failed to delete cafe", res);
            }
        } catch (error) {
            console.error("Error deleting cafe:", error);
        } finally {
            setOpen(false);
        }
    };


    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
            <DialogTitle color="error">
                Delete Cafe
            </DialogTitle>

            <DialogContent>
                <Typography>
                    Do you want to delete{" "}
                    <strong>{cafe?.cafe_name}</strong>?
                </Typography>

                <Typography variant="body2" color="text.secondary" mt={1}>
                    If you delete this cafe, all related data will be permanently removed.
                </Typography>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} variant="outlined">
                    Cancel
                </Button>

                <Button
                    onClick={handleDelete}
                    variant="contained"
                    color="error"
                >
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}
