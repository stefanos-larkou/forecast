import type { VariableKey } from "./models/summary";
import type { WeatherState } from "./models/weather";

export const PLACE = "Larnaca";
export const HOME_URL = import.meta.env.VITE_HOME_URL ?? "/";
export const HOME_LABEL = "Back to the home page";
export const TO_DARK = "Switch to dark theme";
export const TO_LIGHT = "Switch to light theme";
export const GLYPH_BOX = "0 0 24 24";
export const GLYPH_SIZE = 24;
export const SUN_GLYPH = "M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5M2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1m18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1M11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1m0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1M5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0z";
export const INFO_GLYPH = "M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8";
export const MOON_GLYPH = "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z";
export const BACK_GLYPH = "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z";
export const LOCALE = "en-GB";
export const BACKTEST_CAPTION = "Mean absolute error against ERA5. These are archived forecasts, not the live record.";
export const BACKTEST_HEADING = "Error by how far ahead the forecast looks";
export const AMOUNT_HEADING = "How much falls in a wet hour";
export const AMOUNT_CAPTION = "Mean absolute error in millimetres over wet hours only, against ERA5. The amount model answers how much falls given that it does.";
export const LEAD_HEADER = "Hours Ahead";
export const LEAD_TOOLTIP = "hours ahead";
export const ERROR_AXIS = "Mean Absolute Error";
export const AMOUNT_AXIS = "Mean Absolute Error (mm)";
export const REFERENCE_DASH = [6, 4] as const;
export const PERSISTENCE_DASH = [2, 3] as const;
export const CROSSOVER_HEADING = "When forecasting stops beating the long-term average";
export const CROSSOVER_CAPTION = "Climatology is what 30 years of ERA5 say about that day and hour. A bar that runs the whole way never loses to it within six days.";
export const CROSSOVER_BEYOND = "Beyond";
export const CROSSOVER_LIMIT = 168;
export const COVERAGE_HEADING = "Does the 90% band hold 90% of the time?";
export const COVERAGE_CAPTION = "Measured on held-out data: the band is calibrated on one stretch and checked on the next, so nothing here helped set its own width. A band needs fifteen months behind it where an error score needs twelve, so this starts one fold later than the backtest above. The dashed line is the level it aims for.";
export const COVERAGE_SECTION = "Intervals";
export const EXPLORE_ROWS = "rows";
export const EXPLORE_FILES = "files";
export const EXPLORE_HEADING = "Every forecast ever saved";
export const EXPLORE_LEAD = "Every table below is committed to the repository as Parquet, one file per snapshot or per day, and these counts are read from those files.";
export const TABLE_COLUMN = "Table";
export const ROWS_COLUMN = "Rows";
export const FILES_COLUMN = "Files";
export const COVERS_COLUMN = "Covers";
export const TABLE_COVERS: Record<string, string> = {
    "data/forecasts": "live snapshots of all three models, four a day",
    "data/predictions": "gbm_blend, one file per snapshot",
    "data/intervals": "the 90% band, since the model gained one",
    "data/backfill": "archived forecasts, 1 to 7 days ahead",
    "data/observations": "ERA5 truth, one file a day",
    "data/climate": "ERA5 1994-2023, the climatology baseline"
};
export const CREDIT_LEAD = "Weather data by";
export const CREDIT_SOURCE = "Open-Meteo.com";
export const CREDIT_SOURCE_URL = "https://open-meteo.com";
export const CREDIT_LICENCE = ", CC BY 4.0. Truth is ERA5 reanalysis.";
export const LIVE_SECTION = "Live record";
export const LIVE_HEADING = "Live scoreboard";
export const LIVE_CAPTION = "Every forecast here was saved before its outcome was known, then scored against ERA5 once the truth arrived. Each point is the mean absolute error over every hour graded so far at that lead.";
export const LIVE_WAITING = "ERA5 runs about six days behind, so the longest leads rest on the fewest hours, and every point firms up as the record grows.";
export const LIVE_FORECASTS = "forecasts";
export const LIVE_ABOUT = "About the live scoreboard";
export const LIVE_RAIN_ABOUT = "About the chance of rain score";
export const LIVE_RAIN_EXPLAINER = "The mean squared gap between the chance given and what happened, counting a wet hour as one and a dry hour as zero. Lower is better, and a stretch of dry hours forecast with a near zero chance scores near zero.";
export const INFO_SIZE = 20;
export const TOOLTIP_WIDTH = 420;
export const LEAVE_TOUCH_DELAY = 10000;
export const LIVE_RAIN_LABEL = "Chance of Rain";
export const LIVE_WIDE_VARIABLE = "temperature_2m";
export const LIVE_RAIN_AXIS = "Brier Score";
export const BLEND_LABEL = "gbm_blend";
export const LIVE_GRADED = "graded";
export const RAIN_SECTION = "Rain";
export const RAIN_HEADING = "Chance of rain, can it be trusted?";
export const RAIN_WET_SHARE = "of hours were wet";
export const RAIN_SKILL_HEADING = "Brier skill against climatology";
export const RAIN_SKILL_CAPTION = "Brier skill against climatology, over the same forecasts. Above zero beats it, below zero is worse.";
export const RAIN_SKILL_AXIS = "Brier Skill";
export const RELIABILITY_HEADING = "Forecast chance against what happened";
export const RELIABILITY_CAPTION = "Of the hours given each chance, how many were actually wet. On the diagonal is honest, bigger dots are more hours.";
export const RELIABILITY_HONEST = "Perfectly honest";
export const RELIABILITY_FORECAST_AXIS = "Forecast Chance";
export const RELIABILITY_OBSERVED_AXIS = "Share That Was Wet";
export const RELIABILITY_HOURS = "hours";
export const RELIABILITY_HOURS_COLUMN = "Hours";
export const RELIABILITY_ROW_HEADER = "Model and Forecast Chance";
export const RELIABILITY_BIN_PARTS = 3;
export const RELIABILITY_DOT_MIN = 3;
export const RELIABILITY_DOT_MAX = 9;
export const RELIABILITY_DOT_DIVISOR = 30;
export const COVERAGE_TARGET = "Target";
export const COVERAGE_AXIS = "Share of Outcomes Inside the Band";
export const PAGE_MAX_WIDTH = 1100;
export const CHART_HEIGHT = 40;
export const LOAD_MARGIN = "400px";
export const SHOW_MARGIN = "0px 0px -120px 0px";
export const REVEAL_MS = 700;
export const REVEAL_RISE = "24px";
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
    { key: "climatology", label: "Climatology", colour: "reference", role: "baseline", dash: REFERENCE_DASH },
    { key: "persisted", label: "Persistence", colour: "reference", role: "baseline", dash: PERSISTENCE_DASH }
] as const;

export const AMOUNT_SERIES = [
    { key: "boosted", label: "gbm_blend", colour: "ours", role: "ours", dash: [] },
    { key: "typical", label: "Typical Wet Hour", colour: "reference", role: "baseline", dash: REFERENCE_DASH },
    { key: "models", label: "The Three Models", colour: "ecmwf", role: "model", dash: [] }
] as const;

export const RAIN_SKILL_SERIES = [
    { key: "boosted", label: "gbm_blend", colour: "ours", role: "ours", dash: [] },
    { key: "models", label: "The Three Models", colour: "ecmwf", role: "model", dash: [] },
    { key: "climatology", label: "Climatology", colour: "reference", role: "baseline", dash: REFERENCE_DASH },
    { key: "persisted", label: "Persistence", colour: "reference", role: "baseline", dash: PERSISTENCE_DASH }
] as const;

export const RELIABILITY_SERIES = [
    { key: "boosted", label: "gbm_blend", colour: "ours", dash: [] },
    { key: "models", label: "The Three Models", colour: "ecmwf", dash: [5, 4] }
] as const;

export const LIVE_SERIES = [
    { key: "gbm_blend", label: "gbm_blend", colour: "ours", role: "ours", dash: [] },
    { key: "ecmwf_ifs025", label: "ECMWF", colour: "ecmwf", role: "model", dash: [] },
    { key: "gfs_seamless", label: "GFS", colour: "gfs", role: "model", dash: [] },
    { key: "icon_seamless", label: "ICON", colour: "icon", role: "model", dash: [] }
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
export const POINT_OVERFLOW = 6;

export function variableLabel(key: VariableKey): string {
    return VARIABLES.filter(variable => variable.key === key)[0]?.label ?? key;
}

export function variableUnit(key: VariableKey): string {
    return VARIABLES.filter(variable => variable.key === key)[0]?.unit ?? "";
}

