import { Box, Typography } from "@mui/material";
import { BACKTEST_HEADING, VARIABLES } from "../core/constants";
import type { Backtest } from "../core/models/summary";
import { formatCount, formatMonth } from "../core/utils/format";
import { ChartGrid } from "./ChartGrid";
import { ErrorByLeadChart } from "./ErrorByLeadChart";

export default function BacktestSection({ backtest }: { backtest: Backtest; }) {
    return (
        <Box component="section" sx={{ mt: 4 }}>
            <Typography variant="overline" component="p" color="text.secondary">
                {`Backtest \u00b7 ${formatCount(backtest.forecasts)} forecasts, ${formatMonth(backtest.from)} to ${formatMonth(backtest.to)}`}
            </Typography>
            <Typography variant="h2" sx={{ mb: 2 }}>{BACKTEST_HEADING}</Typography>
            <ChartGrid>
                {VARIABLES.map(variable => <ErrorByLeadChart key={variable.key} backtest={backtest} variable={variable} />)}
            </ChartGrid>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Mean absolute error against ERA5 (lower is better). These are
                archived forecasts, not the live record.
            </Typography>
        </Box>
    );
}
