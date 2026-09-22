import { Box, Typography } from "@mui/material";
import { BACKTEST_HEADING, VARIABLES } from "../core/constants";
import type { Backtest } from "../core/models/summary";
import { ChartGrid } from "./ChartGrid";
import { ErrorByLeadChart } from "./ErrorByLeadChart";

export default function BacktestSection({ backtest }: { backtest: Backtest; }) {
    return (
        <Box component="section" sx={{ mt: 4 }}>
            <Typography variant="h2" sx={{ mb: 2 }}>{BACKTEST_HEADING}</Typography>
            <ChartGrid>
                {VARIABLES.map(variable => <ErrorByLeadChart key={variable.key} backtest={backtest} variable={variable} />)}
            </ChartGrid>
        </Box>
    );
}
