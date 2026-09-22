import { Box, Typography } from "@mui/material";
import { VARIABLES } from "../core/constants";
import type { Backtest } from "../core/models/summary";
import { ErrorByLeadChart } from "./ErrorByLeadChart";

export function BacktestSection({ backtest }: { backtest: Backtest; }) {
    return (
        <Box component="section" sx={{ mt: 4 }}>
            <Typography variant="h2" sx={{ mb: 2 }}>Error by how far ahead the forecast looks</Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
                {VARIABLES.map(variable => <ErrorByLeadChart key={variable.key} backtest={backtest} variable={variable} />)}
            </Box>
        </Box>
    );
}
