import { type ChartConfiguration } from "chart.js";
import { ERROR_AXIS, LEAD_HEADER, LIVE_SERIES, SERIES_LINE_WIDTHS, variableUnit } from "../constants";
import type { ChartStyle, ChartTable } from "../models/charts";
import type { LiveErrors, VariableKey } from "../models/summary";
import { formatCount, formatError } from "../utils/format";
import { leadChartConfig, type LineDataset } from "./lead-chart";

function scored(errors: LiveErrors, style: ChartStyle): LineDataset[] {
    return LIVE_SERIES.filter(series => errors[series.key] !== undefined).map(series => ({
        label: series.label,
        data: errors[series.key] ?? [],
        borderColor: style.series[series.colour],
        backgroundColor: style.series[series.colour],
        borderWidth: SERIES_LINE_WIDTHS[series.role],
        borderDash: [...series.dash]
    }));
}

export function liveMaeConfig(leads: number[], errors: LiveErrors, variable: VariableKey, style: ChartStyle): ChartConfiguration<"line"> {
    return leadChartConfig({
        leads,
        datasets: scored(errors, style),
        style,
        axis: `${ERROR_AXIS} (${variableUnit(variable)})`,
        value: formatError,
        fromZero: true
    });
}

export function liveMaeTable(leads: number[], errors: LiveErrors, counts: number[], counted: string): ChartTable {
    const series = LIVE_SERIES.filter(one => errors[one.key] !== undefined);

    return {
        rowHeader: `${LEAD_HEADER} (${counted})`,
        columns: series.map(one => one.label),
        rows: leads.map((lead, index) => ({
            header: `${lead} (${formatCount(counts[index] ?? 0)})`,
            values: series.map(one => {
                const error = errors[one.key]?.[index];
                return error === undefined ? "" : formatError(error);
            })
        }))
    };
}
