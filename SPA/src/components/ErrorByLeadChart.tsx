import { useMemo } from "react";
import { errorByLeadConfig, errorByLeadTable } from "../core/charts/error-by-lead";
import { useChartStyle } from "../core/hooks/useChartStyle";
import type { Backtest, Variable } from "../core/models/summary";
import { ChartPanel } from "./ChartPanel";

export function ErrorByLeadChart({ backtest, variable }: { backtest: Backtest, variable: Variable; }) {
    const style = useChartStyle();
    const config = useMemo(() => errorByLeadConfig(backtest, variable, style), [backtest, variable, style]);
    const table = useMemo(() => errorByLeadTable(backtest, variable), [backtest, variable]);

    return (
        <ChartPanel
            title={variable.label}
            label={`${variable.label}: mean absolute error in ${variable.unit} by hours ahead, one line per forecast`}
            config={config}
            table={table}
        />
    );
}
