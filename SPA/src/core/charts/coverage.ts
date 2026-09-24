import { type ChartConfiguration } from "chart.js";
import { COVERAGE_AXIS, COVERAGE_COLOURS, COVERAGE_TARGET, LEAD_HEADER, REFERENCE_DASH, SERIES_LINE_WIDTHS, VARIABLES } from "../constants";
import type { ChartStyle, ChartTable } from "../models/charts";
import type { Coverage } from "../models/summary";
import { formatShare } from "../utils/format";
import { leadChartConfig, type LineDataset } from "./lead-chart";

function targetLabel(level: number): string {
    return `${COVERAGE_TARGET} (${formatShare(level)})`;
}

function coverageDatasets(coverage: Coverage, style: ChartStyle): LineDataset[] {
    return [
        ...VARIABLES.map(variable => ({
            label: variable.label,
            data: coverage.inside[variable.key],
            borderColor: style.series[COVERAGE_COLOURS[variable.key]],
            backgroundColor: style.series[COVERAGE_COLOURS[variable.key]],
            borderWidth: SERIES_LINE_WIDTHS.model,
            borderDash: []
        })),
        {
            label: targetLabel(coverage.level),
            data: coverage.leads.map(() => coverage.level),
            borderColor: style.series.reference,
            backgroundColor: style.series.reference,
            borderWidth: SERIES_LINE_WIDTHS.baseline,
            borderDash: [...REFERENCE_DASH]
        }
    ];
}

export function coverageConfig(coverage: Coverage, style: ChartStyle): ChartConfiguration<"line"> {
    return leadChartConfig({
        leads: coverage.leads,
        datasets: coverageDatasets(coverage, style),
        style,
        axis: COVERAGE_AXIS,
        value: formatShare,
        ticks: formatShare
    });
}

export function coverageTable(coverage: Coverage): ChartTable {
    return {
        rowHeader: LEAD_HEADER,
        columns: [...VARIABLES.map(variable => variable.label), targetLabel(coverage.level)],
        rows: coverage.leads.map((lead, index) => ({
            header: String(lead),
            values: [
                ...VARIABLES.map(variable => {
                    const share = coverage.inside[variable.key][index];
                    return share === undefined ? "" : formatShare(share);
                }),
                formatShare(coverage.level)
            ]
        }))
    };
}
