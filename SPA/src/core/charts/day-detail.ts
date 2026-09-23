import type { ChartConfiguration } from "chart.js";
import { LOCALE, SNOW_STATES, variableLabel, variableUnit } from "../constants";
import type { ChartStyle, ChartTable } from "../models/charts";
import type { HourlyRow } from "../models/summary";
import { formatMeasurement, formatTime } from "../utils/format";
import { chanceLabel, weatherState } from "../utils/weather";

const BAND_LABEL = "90% band";
const RAIN_AXIS_MAX = 100;
const HOUR_HEADER = "Hour";
const RAIN_UNIT = "%";

function chanceOf(hours: HourlyRow[]): string {
    return chanceLabel(hours.map(weatherState).find(state => SNOW_STATES.includes(state)) ?? "rain");
}

export function dayDetailConfig(hours: HourlyRow[], style: ChartStyle): ChartConfiguration<"bar" | "line"> {
    const font = style.font;
    const labels = hours.map(hour => formatTime(hour.at));
    const temperature = variableLabel("temperature_2m");
    const chance = chanceOf(hours);

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
                    label: temperature,
                    data: hours.map(hour => hour.temperature),
                    borderColor: style.series.ours,
                    backgroundColor: style.series.ours,
                    borderWidth: 3,
                    order: 1
                },
                {
                    type: "bar" as const,
                    label: chance,
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
                    title: { display: true, text: `${temperature} (${variableUnit("temperature_2m")})`, font },
                    grid: { color: style.grid }
                },
                rain: {
                    position: "right",
                    min: 0,
                    max: RAIN_AXIS_MAX,
                    ticks: { font },
                    title: { display: true, text: `${chance} (${RAIN_UNIT})`, font },
                    grid: { display: false }
                }
            }
        }
    };
}

export function dayDetailTable(hours: HourlyRow[]): ChartTable {
    return {
        rowHeader: HOUR_HEADER,
        columns: [variableLabel("temperature_2m"), BAND_LABEL, chanceOf(hours)],
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
