import { Box, Chip, CircularProgress, Typography } from "@mui/material";

export default function CustomChip({
    label,
    loading,
    onClick,
    color,
}) {
    return (
        <Chip
            onClick={loading ? null : onClick}
            label={
                loading ? (
                    <>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <CircularProgress size={13} color="inherit" />
                            <Typography size="small" fontSize={'12px'}>Wait</Typography></Box>
                    </>
                ) : (
                    label
                )
            }
            color={color}
            size="small"
        />
    );
}