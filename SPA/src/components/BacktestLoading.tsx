import { Box, CircularProgress, Paper, Typography } from "@mui/material";
import { BACKTEST_HEADING, VARIABLES } from "../core/constants";
import { ChartGrid } from "./ChartGrid";

export function BacktestLoading() {
    return (
        <Box component="section" sx={{ mt: 4 }}>
            <Typography variant="h2" sx={{ mb: 2 }}>{BACKTEST_HEADING}</Typography>
            <ChartGrid>
                {VARIABLES.map(variable => (
                    <Paper
                        key={variable.key}
                        variant="outlined"
                        sx={{ p: 2, height: theme => theme.spacing(48), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}
                    >
                        <CircularProgress size={64} disableShrink />
                        <Typography variant="body1" color="text.secondary">{variable.label}</Typography>
                    </Paper>
                ))}
            </ChartGrid>
        </Box>
    );
}
