import { useMemo } from "react";
import { Paper, Typography } from "@mui/material";
import { errorByLeadConfig } from "../core/charts/error-by-lead";
import { useChartStyle } from "../core/hooks/useChartStyle";
import type { Backtest, Variable } from "../core/models/summary";
import { ChartCanvas } from "./ChartCanvas";

export function ErrorByLeadChart({ backtest, variable }: { backtest: Backtest, variable: Variable; }) {
    const style = useChartStyle();
    const config = useMemo(() => errorByLeadConfig(backtest, variable, style), [backtest, variable, style]);

    return (
        <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" component="h3">{variable.label}</Typography>
            <ChartCanvas config={config} label={`${variable.label}: mean absolute error in ${variable.unit} by hours ahead, one line per forecast`} />
        </Paper>
    );
}
