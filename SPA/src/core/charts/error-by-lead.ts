import { Chart, type ChartConfiguration } from "chart.js";
import { BACKTEST_SERIES, LOCALE, SERIES_LINE_WIDTHS } from "../constants";
import type { ChartStyle, ChartTable } from "../models/charts";
import type { Backtest, Variable } from "../models/summary";
import { formatError } from "../utils/format";

const ROW_HEADER = "Hours ahead";

export function errorByLeadConfig(backtest: Backtest, variable: Variable, style: ChartStyle): ChartConfiguration<"line"> {
    const errors = backtest.metrics.mae[variable.key];
    const font = style.font;
    const datasets = BACKTEST_SERIES.map(series => ({
        label: series.label,
        data: errors[series.key],
        borderColor: style.series[series.colour],
        backgroundColor: style.series[series.colour],
        borderWidth: SERIES_LINE_WIDTHS[series.role],
        borderDash: [...series.dash]
    }));

    return {
        type: "line",
        data: { labels: backtest.leads, datasets },
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
                    title: { display: true, text: ROW_HEADER, font },
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    ticks: { font },
                    title: { display: true, text: `Mean absolute error (${variable.unit})`, font },
                    grid: { color: style.grid }
                }
            }
        }
    };
}

export function errorByLeadTable(backtest: Backtest, variable: Variable): ChartTable {
    const errors = backtest.metrics.mae[variable.key];
    return {
        rowHeader: ROW_HEADER,
        columns: BACKTEST_SERIES.map(series => series.label),
        rows: backtest.leads.map((lead, index) => ({
            header: String(lead),
            values: BACKTEST_SERIES.map(series => {
                const error = errors[series.key][index];
                return error === undefined ? "" : formatError(error);
            })
        }))
    };
}
