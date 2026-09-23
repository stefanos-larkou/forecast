import type { VariableKey } from "./models/summary";
import type { WeatherState } from "./models/weather";

export const PLACE = "Larnaca";
export const LOCALE = "en-GB";
export const BACKTEST_CAPTION = "Mean absolute error against ERA5 (lower is better). These are archived forecasts, not the live record.";
export const BACKTEST_HEADING = "Error by how far ahead the forecast looks";
export const PAGE_MAX_WIDTH = 1100;
export const HOURS_AHEAD_SHOWN = 24;
export const CLOUD_CLEAR_UNDER = 25;
export const CLOUD_OVERCAST_FROM = 70;
export const RAIN_LIKELY_FROM = 0.55;
export const RAIN_POSSIBLE_FROM = 0.3;
export const RAIN_DRIZZLE_UNDER = 0.5;
export const RAIN_DOWNPOUR_FROM = 4;
export const SNOW_MAX_C = 1;
export const RAIN_WORTH_SHOWING = 0.005;
export const MUTED_ON_SKY = 0.85;
export const CHANCE_OF_RAIN = "Chance of rain";
export const CHANCE_OF_SNOW = "Chance of snow";

export const WEATHER_LABELS: Record<WeatherState, string> = {
    heavySnow: "Heavy snow",
    snow: "Snow",
    downpour: "Downpour",
    rain: "Rain",
    showers: "Showers",
    drizzle: "Drizzle",
    overcast: "Overcast",
    partly: "Partly cloudy",
    clear: "Clear"
};

export const WET_STATES: WeatherState[] = ["heavySnow", "snow", "downpour", "rain", "showers", "drizzle"];
export const SNOW_STATES: WeatherState[] = ["heavySnow", "snow"];
export const RAIN_VARIABLE = "rain_probability";
export const RAIN_AMOUNT_VARIABLE = "rain_amount";
export const SUMMARY_URL = `${import.meta.env.BASE_URL}data/summary.json`;

export const VARIABLES = [
    { key: "temperature_2m", label: "Temperature", unit: "\u00b0C" },
    { key: "relative_humidity_2m", label: "Humidity", unit: "%" },
    { key: "wind_speed_10m", label: "Wind Speed", unit: "km/h" },
    { key: "cloud_cover", label: "Cloud Cover", unit: "%" }
] as const;

export const BACKTEST_SERIES = [
    { key: "boosted", label: "gbm_blend", colour: "ours", role: "ours", dash: [] },
    { key: "ecmwf_ifs025 raw", label: "ECMWF", colour: "ecmwf", role: "model", dash: [] },
    { key: "gfs_seamless raw", label: "GFS", colour: "gfs", role: "model", dash: [] },
    { key: "icon_seamless raw", label: "ICON", colour: "icon", role: "model", dash: [] },
    { key: "climatology", label: "climatology", colour: "reference", role: "baseline", dash: [6, 4] },
    { key: "persisted", label: "persistence", colour: "reference", role: "baseline", dash: [2, 3] }
] as const;

export const SERIES_LINE_WIDTHS = { ours: 3, model: 1.5, baseline: 1.5 } as const;

export function variableLabel(key: VariableKey): string {
    return VARIABLES.filter(variable => variable.key === key)[0]?.label ?? key;
}

export function variableUnit(key: VariableKey): string {
    return VARIABLES.filter(variable => variable.key === key)[0]?.unit ?? "";
}

