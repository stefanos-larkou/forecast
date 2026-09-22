export const PLACE = "Larnaca";
export const LOCALE = "en-GB";
export const BACKTEST_HEADING = "Error by how far ahead the forecast looks";
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

