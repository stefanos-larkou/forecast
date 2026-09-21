import { Box, Typography } from "@mui/material";
import { PLACE } from "./core/constants";

export function App() {
    return (
        <Box component="main" sx={{ p: 2 }}>
            <Typography variant="h1">{PLACE}</Typography>
        </Box>
    );
}
