import { Chart, type ChartConfiguration } from "chart.js";
import { COVERAGE_AXIS, COVERAGE_COLOURS, COVERAGE_TARGET, LEAD_HEADER, LOCALE, SERIES_LINE_WIDTHS, VARIABLES } from "../constants";
import type { ChartStyle, ChartTable } from "../models/charts";
import type { Coverage } from "../models/summary";
import { formatShare } from "../utils/format";

const TARGET_DASH = [6, 4];

function targetLabel(level: number): string {
    return `${COVERAGE_TARGET} (${formatShare(level)})`;
}

export function coverageConfig(coverage: Coverage, style: ChartStyle): ChartConfiguration<"line"> {
    const font = style.font;
    const datasets = [
        ...VARIABLES.map(variable => ({
            label: variable.label,
            data: coverage.inside[variable.key],
            borderColor: style.series[COVERAGE_COLOURS[variable.key]],
            backgroundColor: style.series[COVERAGE_COLOURS[variable.key]],
            borderWidth: SERIES_LINE_WIDTHS.model,
            borderDash: [] as number[]
        })),
        {
            label: targetLabel(coverage.level),
            data: coverage.leads.map(() => coverage.level),
            borderColor: style.series.reference,
            backgroundColor: style.series.reference,
            borderWidth: SERIES_LINE_WIDTHS.baseline,
            borderDash: TARGET_DASH
        }
    ];

    return {
        type: "line",
        data: { labels: coverage.leads, datasets },
        options: {
            maintainAspectRatio: false,
            locale: LOCALE,
            color: style.text,
            interaction: { mode: "index", intersect: false },
            plugins: {
                legend: {
                    labels: {
                        font,
                        usePointStyle: true,
                        pointStyle: "line",
                        generateLabels: chart => Chart.defaults.plugins.legend.labels.generateLabels(chart)
                            .map(item => ({ ...item, lineDash: datasets[item.datasetIndex ?? 0]?.borderDash }))
                    }
                },
                tooltip: {
                    titleFont: font,
                    bodyFont: font,
                    callbacks: {
                        title: items => `${items[0]?.label ?? ""} hours ahead`,
                        label: item => `${item.dataset.label ?? ""}: ${item.parsed.y === null ? "" : formatShare(item.parsed.y)}`
                    }
                }
            },
            scales: {
                x: {
                    ticks: { font },
                    title: { display: true, text: LEAD_HEADER, font },
                    grid: { display: false }
                },
                y: {
                    ticks: { font, callback: value => formatShare(Number(value)) },
                    title: { display: true, text: COVERAGE_AXIS, font },
                    grid: { color: style.grid }
                }
            }
        }
    };
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
