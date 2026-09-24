import { Chart, type ChartConfiguration } from "chart.js";
import { LEAD_HEADER, LOCALE, RAIN_SKILL_AXIS, RAIN_SKILL_SERIES, SERIES_LINE_WIDTHS } from "../constants";
import type { ChartStyle, ChartTable } from "../models/charts";
import type { Rain } from "../models/summary";
import { formatError } from "../utils/format";

export function rainSkillConfig(rain: Rain, style: ChartStyle): ChartConfiguration<"line"> {
    const font = style.font;
    const datasets = RAIN_SKILL_SERIES.map(series => ({
        label: series.label,
        data: rain.skill[series.key],
        borderColor: style.series[series.colour],
        backgroundColor: style.series[series.colour],
        borderWidth: SERIES_LINE_WIDTHS[series.role],
        borderDash: [...series.dash]
    }));

    return {
        type: "line",
        data: { labels: rain.leads, datasets },
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
                    ticks: { font, callback: value => formatError(Number(value)) },
                    title: { display: true, text: RAIN_SKILL_AXIS, font },
                    grid: { color: style.grid }
                }
            }
        }
    };
}

export function rainSkillTable(rain: Rain): ChartTable {
    return {
        rowHeader: LEAD_HEADER,
        columns: RAIN_SKILL_SERIES.map(series => series.label),
        rows: rain.leads.map((lead, index) => ({
            header: String(lead),
            values: RAIN_SKILL_SERIES.map(series => {
                const skill = rain.skill[series.key][index];
                return skill === undefined ? "" : formatError(skill);
            })
        }))
    };
}
