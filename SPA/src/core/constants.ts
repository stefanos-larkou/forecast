import type { VariableKey } from "./models/summary";
import type { WeatherState } from "./models/weather";

export const PLACE = "Larnaca";
export const LOCALE = "en-GB";
export const BACKTEST_CAPTION = "Mean absolute error against ERA5 (lower is better). These are archived forecasts, not the live record.";
export const BACKTEST_HEADING = "Error by how far ahead the forecast looks";
export const AMOUNT_HEADING = "How much falls in a wet hour";
export const AMOUNT_CAPTION = "Mean absolute error in millimetres over wet hours only, against ERA5. The amount model answers how much falls given that it does.";
export const LEAD_HEADER = "Hours Ahead";
export const CROSSOVER_HEADING = "When forecasting stops beating the long-term average";
export const CROSSOVER_CAPTION = "Climatology is what 30 years of ERA5 say about that day and hour. A bar that runs the whole way never loses to it within six days.";
export const CROSSOVER_BEYOND = "Beyond";
export const CROSSOVER_LIMIT = 168;
export const COVERAGE_HEADING = "Does the 90% band hold 90% of the time?";
export const COVERAGE_CAPTION = "Measured on held-out data: the band is calibrated on one stretch and checked on the next, so nothing here helped set its own width. A band needs fifteen months behind it where an error score needs twelve, so this starts one fold later than the backtest above. The dashed line is the level it aims for.";
export const COVERAGE_SECTION = "Intervals";
export const COVERAGE_TARGET = "Target";
export const COVERAGE_AXIS = "Share of Outcomes Inside the Band";
export const PAGE_MAX_WIDTH = 1100;
export const CHART_HEIGHT = 40;
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
export const TWO_COLUMNS_FROM = 360;
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
    { key: "climatology", label: "Climatology", colour: "reference", role: "baseline", dash: [6, 4] },
    { key: "persisted", label: "Persistence", colour: "reference", role: "baseline", dash: [2, 3] }
] as const;

export const AMOUNT_SERIES = [
    { key: "boosted", label: "gbm_blend", colour: "ours", role: "ours", dash: [] },
    { key: "typical", label: "Typical Wet Hour", colour: "reference", role: "baseline", dash: [6, 4] },
    { key: "models", label: "The Three Models", colour: "ecmwf", role: "model", dash: [] }
] as const;

export const CROSSOVER_SERIES = [
    { key: "boosted", label: "gbm_blend", colour: "ours" },
    { key: "ecmwf_ifs025 corrected", label: "ECMWF corrected", colour: "ecmwf" },
    { key: "ecmwf_ifs025 raw", label: "ECMWF", colour: "ecmwf" },
    { key: "gfs_seamless corrected", label: "GFS corrected", colour: "gfs" },
    { key: "gfs_seamless raw", label: "GFS", colour: "gfs" },
    { key: "icon_seamless corrected", label: "ICON corrected", colour: "icon" },
    { key: "icon_seamless raw", label: "ICON", colour: "icon" }
] as const;

export const COVERAGE_COLOURS = {
    temperature_2m: "ours",
    relative_humidity_2m: "ecmwf",
    wind_speed_10m: "gfs",
    cloud_cover: "icon"
} as const;

export const SERIES_LINE_WIDTHS = { ours: 3, model: 1.5, baseline: 1.5 } as const;

export function variableLabel(key: VariableKey): string {
    return VARIABLES.filter(variable => variable.key === key)[0]?.label ?? key;
}

export function variableUnit(key: VariableKey): string {
    return VARIABLES.filter(variable => variable.key === key)[0]?.unit ?? "";
}

