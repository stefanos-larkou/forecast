import type { ChartConfiguration } from "chart.js";
import { LOCALE } from "../constants";
import type { ChartStyle, ChartTable } from "../models/charts";
import type { HourlyRow } from "../models/summary";
import { formatMeasurement, formatTime } from "../utils/format";

const BAND_LABEL = "90% band";
const RAIN_LABEL = "Chance of rain";
const TEMPERATURE_LABEL = "Temperature";
const RAIN_AXIS_MAX = 100;
const ROW_HEADER = "Hour";

export function dayDetailConfig(hours: HourlyRow[], style: ChartStyle): ChartConfiguration<"bar" | "line"> {
    const font = style.font;
    const labels = hours.map(hour => formatTime(hour.at));

    return {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: BAND_LABEL,
                    data: hours.map(hour => hour.upper),
                    borderWidth: 0,
                    pointRadius: 0,
                    backgroundColor: style.band,
                    fill: "+1",
                    order: 2
                },
                {
                    label: "",
                    data: hours.map(hour => hour.lower),
                    borderWidth: 0,
                    pointRadius: 0,
                    fill: false,
                    order: 2
                },
                {
                    label: TEMPERATURE_LABEL,
                    data: hours.map(hour => hour.temperature),
                    borderColor: style.series.ours,
                    backgroundColor: style.series.ours,
                    borderWidth: 3,
                    order: 1
                },
                {
                    type: "bar" as const,
                    label: RAIN_LABEL,
                    data: hours.map(hour => hour.rain * RAIN_AXIS_MAX),
                    backgroundColor: style.series.ecmwf,
                    yAxisID: "rain",
                    order: 3
                }
            ]
        },
        options: {
            maintainAspectRatio: false,
            locale: LOCALE,
            color: style.text,
            interaction: { mode: "index", intersect: false },
            plugins: {
                legend: { labels: { font, boxHeight: 12, filter: item => item.text !== "" } },
                tooltip: { titleFont: font, bodyFont: font, filter: item => item.dataset.label !== "" }
            },
            scales: {
                x: { ticks: { font }, grid: { display: false } },
                y: {
                    ticks: { font },
                    title: { display: true, text: `${TEMPERATURE_LABEL} (\u00b0C)`, font },
                    grid: { color: style.grid }
                },
                rain: {
                    position: "right",
                    min: 0,
                    max: RAIN_AXIS_MAX,
                    ticks: { font },
                    title: { display: true, text: `${RAIN_LABEL} (%)`, font },
                    grid: { display: false }
                }
            }
        }
    };
}

export function dayDetailTable(hours: HourlyRow[]): ChartTable {
    return {
        rowHeader: ROW_HEADER,
        columns: [TEMPERATURE_LABEL, BAND_LABEL, RAIN_LABEL],
        rows: hours.map(hour => ({
            header: formatTime(hour.at),
            values: [
                formatMeasurement("temperature_2m", hour.temperature),
                `${formatMeasurement("temperature_2m", hour.lower)} - ${formatMeasurement("temperature_2m", hour.upper)}`,
                formatMeasurement("rain_probability", hour.rain)
            ]
        }))
    };
}
