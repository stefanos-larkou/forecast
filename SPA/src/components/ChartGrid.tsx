import type { ReactNode } from "react";
import { Box } from "@mui/material";

export function ChartGrid({ children }: { children: ReactNode; }) {
    return (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))" }, gap: 2, alignItems: "start" }}>
            {children}
        </Box>
    );
}
