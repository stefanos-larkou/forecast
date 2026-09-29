import { type ChartConfiguration } from "chart.js";
import { BLEND_LABEL, LEAD_HEADER, LIVE_RAIN_AXIS, SERIES_LINE_WIDTHS } from "../constants";
import type { ChartStyle, ChartTable } from "../models/charts";
import type { LiveRain } from "../models/summary";
import { formatCount, formatScientific } from "../utils/format";
import { leadChartConfig } from "./lead-chart";

export function liveRainConfig(rain: LiveRain, style: ChartStyle): ChartConfiguration<"line"> {
    return leadChartConfig({
        leads: rain.leads,
        datasets: [{
            label: BLEND_LABEL,
            data: rain.brier,
            borderColor: style.series.ours,
            backgroundColor: style.series.ours,
            borderWidth: SERIES_LINE_WIDTHS.ours,
            borderDash: []
        }],
        style,
        axis: LIVE_RAIN_AXIS,
        value: formatScientific,
        ticks: formatScientific,
        fromZero: true
    });
}

export function liveRainTable(rain: LiveRain, counted: string): ChartTable {
    return {
        rowHeader: `${LEAD_HEADER} (${counted})`,
        columns: [BLEND_LABEL],
        rows: rain.leads.map((lead, index) => ({
            header: `${lead} (${formatCount(rain.counts[index] ?? 0)})`,
            values: [formatScientific(rain.brier[index] ?? 0)]
        }))
    };
}
