import { type ChartConfiguration } from "chart.js";
import { RAIN_SKILL_AXIS, RAIN_SKILL_SERIES } from "../constants";
import type { ChartStyle, ChartTable } from "../models/charts";
import type { Rain } from "../models/summary";
import { formatError } from "../utils/format";
import { leadChartConfig, leadTable, seriesDatasets } from "./lead-chart";

export function rainSkillConfig(rain: Rain, style: ChartStyle): ChartConfiguration<"line"> {
    return leadChartConfig({
        leads: rain.leads,
        datasets: seriesDatasets(RAIN_SKILL_SERIES, rain.skill, style),
        style,
        axis: RAIN_SKILL_AXIS,
        value: formatError,
        ticks: formatError
    });
}

export function rainSkillTable(rain: Rain): ChartTable {
    return leadTable(rain.leads, RAIN_SKILL_SERIES, rain.skill, formatError);
}
