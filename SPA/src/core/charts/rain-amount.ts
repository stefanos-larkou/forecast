import { type ChartConfiguration } from "chart.js";
import { AMOUNT_AXIS, AMOUNT_SERIES } from "../constants";
import type { ChartStyle, ChartTable } from "../models/charts";
import type { RainAmount } from "../models/summary";
import { formatError } from "../utils/format";
import { leadChartConfig, leadTable, seriesDatasets } from "./lead-chart";

export function rainAmountConfig(amount: RainAmount, style: ChartStyle): ChartConfiguration<"line"> {
    return leadChartConfig({
        leads: amount.leads,
        datasets: seriesDatasets(AMOUNT_SERIES, amount.mae, style),
        style,
        axis: AMOUNT_AXIS,
        value: formatError,
        fromZero: true
    });
}

export function rainAmountTable(amount: RainAmount): ChartTable {
    return leadTable(amount.leads, AMOUNT_SERIES, amount.mae, formatError);
}
