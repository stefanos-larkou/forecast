export const PLACE = "Larnaca";
export const LOCALE = "en-GB";
export const SUMMARY_URL = `${import.meta.env.BASE_URL}data/summary.json`;

export const VARIABLES = [
    { key: "temperature_2m", label: "Temperature", unit: "\u00b0C" },
    { key: "relative_humidity_2m", label: "Humidity", unit: "%" },
    { key: "wind_speed_10m", label: "Wind speed", unit: "km/h" },
    { key: "cloud_cover", label: "Cloud cover", unit: "%" }
] as const;

export const BACKTEST_SERIES = [
    { key: "boosted", label: "gbm_blend" },
    { key: "ecmwf_ifs025 raw", label: "ECMWF" },
    { key: "gfs_seamless raw", label: "GFS" },
    { key: "icon_seamless raw", label: "ICON" },
    { key: "climatology", label: "climatology" },
    { key: "persisted", label: "persistence" }
] as const;
