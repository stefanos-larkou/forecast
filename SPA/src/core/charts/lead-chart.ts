import { Chart, type ChartConfiguration } from "chart.js";
import { LEAD_HEADER, LEAD_TOOLTIP, LOCALE, SERIES_LINE_WIDTHS } from "../constants";
import type { ChartFont, ChartStyle, ChartTable } from "../models/charts";
import type { SeriesPalette } from "../theme";

export interface Series<TKey extends string> {
    key: TKey;
    label: string;
    colour: keyof SeriesPalette;
    role: keyof typeof SERIES_LINE_WIDTHS;
    dash: readonly number[];
}

export interface LineDataset {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    borderWidth: number;
    borderDash: number[];
}

export function seriesLegend(font: ChartFont, dashes: readonly (readonly number[])[]) {
    return {
        font,
        usePointStyle: true,
        pointStyle: "line" as const,
        generateLabels: (chart: Chart) => Chart.defaults.plugins.legend.labels.generateLabels(chart)
            .map((item, index) => ({ ...item, lineDash: [...(dashes[item.datasetIndex ?? index] ?? [])] }))
    };
}

export function seriesDatasets<TKey extends string>(series: readonly Series<TKey>[], values: Record<TKey, number[]>, style: ChartStyle): LineDataset[] {
    return series.map(one => ({
        label: one.label,
        data: values[one.key],
        borderColor: style.series[one.colour],
        backgroundColor: style.series[one.colour],
        borderWidth: SERIES_LINE_WIDTHS[one.role],
        borderDash: [...one.dash]
    }));
}

export function leadChartConfig({ leads, datasets, style, axis, value, ticks, fromZero }: {
    leads: number[],
    datasets: LineDataset[],
    style: ChartStyle,
    axis: string,
    value: (shown: number) => string,
    ticks?: (shown: number) => string,
    fromZero?: boolean;
}): ChartConfiguration<"line"> {
    const font = style.font;

    return {
        type: "line",
        data: { labels: leads, datasets },
        options: {
            maintainAspectRatio: false,
            locale: LOCALE,
            color: style.text,
            interaction: { mode: "index", intersect: false },
            plugins: {
                legend: { labels: seriesLegend(font, datasets.map(dataset => dataset.borderDash)) },
                tooltip: {
                    titleFont: font,
                    bodyFont: font,
                    callbacks: {
                        title: items => `${items[0]?.label ?? ""} ${LEAD_TOOLTIP}`,
                        label: item => `${item.dataset.label ?? ""}: ${item.parsed.y === null ? "" : value(item.parsed.y)}`
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
                    beginAtZero: fromZero,
                    ticks: ticks === undefined ? { font } : { font, callback: shown => ticks(Number(shown)) },
                    title: { display: true, text: axis, font },
                    grid: { color: style.grid }
                }
            }
        }
    };
}

export function leadTable<TKey extends string>(leads: number[], series: readonly Series<TKey>[], values: Record<TKey, number[]>, shown: (value: number) => string): ChartTable {
    return {
        rowHeader: LEAD_HEADER,
        columns: series.map(one => one.label),
        rows: leads.map((lead, index) => ({
            header: String(lead),
            values: series.map(one => {
                const value = values[one.key][index];
                return value === undefined ? "" : shown(value);
            })
        }))
    };
}
