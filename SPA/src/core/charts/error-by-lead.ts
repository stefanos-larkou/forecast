import { type ChartConfiguration } from "chart.js";
import { BACKTEST_SERIES, ERROR_AXIS } from "../constants";
import type { ChartStyle, ChartTable } from "../models/charts";
import type { Backtest, Variable } from "../models/summary";
import { formatError } from "../utils/format";
import { leadChartConfig, leadTable, seriesDatasets } from "./lead-chart";

export function errorByLeadConfig(backtest: Backtest, variable: Variable, style: ChartStyle): ChartConfiguration<"line"> {
    return leadChartConfig({
        leads: backtest.leads,
        datasets: seriesDatasets(BACKTEST_SERIES, backtest.metrics.mae[variable.key], style),
        style,
        axis: `${ERROR_AXIS} (${variable.unit})`,
        value: formatError,
        fromZero: true
    });
}

export function errorByLeadTable(backtest: Backtest, variable: Variable): ChartTable {
    return leadTable(backtest.leads, BACKTEST_SERIES, backtest.metrics.mae[variable.key], formatError);
}
