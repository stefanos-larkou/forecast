import { Chart, type ChartConfiguration } from "chart.js";
import { AMOUNT_SERIES, LEAD_HEADER, LOCALE, SERIES_LINE_WIDTHS } from "../constants";
import type { ChartStyle, ChartTable } from "../models/charts";
import type { RainAmount } from "../models/summary";
import { formatError } from "../utils/format";

const AXIS_TITLE = "Mean Absolute Error (mm)";

export function rainAmountConfig(amount: RainAmount, style: ChartStyle): ChartConfiguration<"line"> {
    const font = style.font;
    const datasets = AMOUNT_SERIES.map(series => ({
        label: series.label,
        data: amount.mae[series.key],
        borderColor: style.series[series.colour],
        backgroundColor: style.series[series.colour],
        borderWidth: SERIES_LINE_WIDTHS[series.role],
        borderDash: [...series.dash]
    }));

    return {
        type: "line",
        data: { labels: amount.leads, datasets },
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
                        label: item => `${item.dataset.label ?? ""}: ${item.parsed.y === null ? "" : formatError(item.parsed.y)}`
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
                    beginAtZero: true,
                    ticks: { font },
                    title: { display: true, text: AXIS_TITLE, font },
                    grid: { color: style.grid }
                }
            }
        }
    };
}

export function rainAmountTable(amount: RainAmount): ChartTable {
    return {
        rowHeader: LEAD_HEADER,
        columns: AMOUNT_SERIES.map(series => series.label),
        rows: amount.leads.map((lead, index) => ({
            header: String(lead),
            values: AMOUNT_SERIES.map(series => {
                const error = amount.mae[series.key][index];
                return error === undefined ? "" : formatError(error);
            })
        }))
    };
}
