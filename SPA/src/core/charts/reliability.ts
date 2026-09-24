import { type ChartConfiguration } from "chart.js";
import { LOCALE, RAIN_VARIABLE, RELIABILITY_DOT_DIVISOR, RELIABILITY_DOT_MAX, RELIABILITY_DOT_MIN, RELIABILITY_FORECAST_AXIS, RELIABILITY_HONEST, RELIABILITY_HOURS, RELIABILITY_HOURS_COLUMN, RELIABILITY_OBSERVED_AXIS, RELIABILITY_ROW_HEADER, RELIABILITY_SERIES, SERIES_LINE_WIDTHS } from "../constants";
import type { ChartStyle, ChartTable } from "../models/charts";
import type { Rain, ReliabilityBin } from "../models/summary";
import { formatCount, formatMeasurement } from "../utils/format";
import { seriesLegend } from "./lead-chart";

const HONEST_DASH = [4, 3];
const NONE = 0;
const ALL = 1;
const HONEST_LINE = [{ x: NONE, y: NONE }, { x: ALL, y: ALL }];

function dotRadius(hours: number): number {
    return Math.max(RELIABILITY_DOT_MIN, Math.min(RELIABILITY_DOT_MAX, Math.sqrt(hours) / RELIABILITY_DOT_DIVISOR));
}

function chance(value: number): string {
    return formatMeasurement(RAIN_VARIABLE, value);
}

export function reliabilityConfig(rain: Rain, style: ChartStyle): ChartConfiguration<"line"> {
    const font = style.font;
    const hours = RELIABILITY_SERIES.map(series => rain.reliability[series.key].map(([, , count]) => count));

    return {
        type: "line",
        data: {
            datasets: [
                ...RELIABILITY_SERIES.map((series, index) => ({
                    label: series.label,
                    data: rain.reliability[series.key].map(([forecast, observed]) => ({ x: forecast, y: observed })),
                    borderColor: style.series[series.colour],
                    backgroundColor: style.series[series.colour],
                    borderWidth: SERIES_LINE_WIDTHS.model,
                    borderDash: [...series.dash],
                    pointRadius: hours[index]?.map(dotRadius) ?? [],
                    pointHoverRadius: hours[index]?.map(count => dotRadius(count) + 1) ?? []
                })),
                {
                    label: RELIABILITY_HONEST,
                    data: HONEST_LINE,
                    borderColor: style.series.reference,
                    backgroundColor: style.series.reference,
                    borderWidth: SERIES_LINE_WIDTHS.baseline,
                    borderDash: HONEST_DASH,
                    pointRadius: [],
                    pointHoverRadius: []
                }
            ]
        },
        options: {
            maintainAspectRatio: false,
            locale: LOCALE,
            color: style.text,
            plugins: {
                legend: { labels: seriesLegend(font, [...RELIABILITY_SERIES.map(series => series.dash), HONEST_DASH]) },
                tooltip: {
                    titleFont: font,
                    bodyFont: font,
                    callbacks: {
                        title: items => `Said ${chance(Number(items[0]?.parsed.x ?? 0))}`,
                        label: item => {
                            const count = hours[item.datasetIndex]?.[item.dataIndex];
                            const wet = `${item.dataset.label ?? ""}: ${item.parsed.y === null ? "" : chance(item.parsed.y)} were wet`;
                            return count === undefined ? wet : `${wet} (${formatCount(count)} ${RELIABILITY_HOURS})`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: "linear",
                    min: NONE,
                    max: ALL,
                    ticks: { font, callback: value => chance(Number(value)) },
                    title: { display: true, text: RELIABILITY_FORECAST_AXIS, font },
                    grid: { display: false }
                },
                y: {
                    min: NONE,
                    max: ALL,
                    ticks: { font, callback: value => chance(Number(value)) },
                    title: { display: true, text: RELIABILITY_OBSERVED_AXIS, font },
                    grid: { color: style.grid }
                }
            }
        }
    };
}

export function reliabilityTable(rain: Rain): ChartTable {
    const rows = RELIABILITY_SERIES.flatMap(series => rain.reliability[series.key].map(([forecast, observed, count]: ReliabilityBin) => ({
        header: `${series.label}, ${chance(forecast)}`,
        values: [chance(observed), formatCount(count)]
    })));

    return { rowHeader: RELIABILITY_ROW_HEADER, columns: [RELIABILITY_OBSERVED_AXIS, RELIABILITY_HOURS_COLUMN], rows };
}
