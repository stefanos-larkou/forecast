import { LOCALE } from "../constants";
import type { ForecastVariableKey } from "../models/summary";

const ERROR_DECIMALS = 2;

const DATE = new Intl.DateTimeFormat(LOCALE, { day: "2-digit", month: "2-digit", year: "numeric" });
const TIME = new Intl.DateTimeFormat(LOCALE, { hour: "2-digit", minute: "2-digit" });
const MONTH = new Intl.DateTimeFormat(LOCALE, { month: "long", year: "numeric", timeZone: "UTC" });
const COUNT = new Intl.NumberFormat(LOCALE);
const ERROR = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: ERROR_DECIMALS, maximumFractionDigits: ERROR_DECIMALS });

export function formatDate(timestamp: string): string {
    return DATE.format(new Date(timestamp));
}

export function formatDateTime(timestamp: string): string {
    const date = new Date(timestamp);
    return `${DATE.format(date)} ${TIME.format(date)}`;
}

export function formatMonth(month: string): string {
    return MONTH.format(new Date(`${month}-01T00:00:00Z`));
}

export function formatTime(timestamp: string): string {
    return TIME.format(new Date(timestamp));
}

export function formatCount(count: number): string {
    return COUNT.format(count);
}

const MEASUREMENTS: Record<ForecastVariableKey, Intl.NumberFormat> = {
    temperature_2m: new Intl.NumberFormat(LOCALE, { style: "unit", unit: "celsius", minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    relative_humidity_2m: new Intl.NumberFormat(LOCALE, { style: "unit", unit: "percent", maximumFractionDigits: 0 }),
    wind_speed_10m: new Intl.NumberFormat(LOCALE, { style: "unit", unit: "kilometer-per-hour", maximumFractionDigits: 0 }),
    cloud_cover: new Intl.NumberFormat(LOCALE, { style: "unit", unit: "percent", maximumFractionDigits: 0 }),
    rain_probability: new Intl.NumberFormat(LOCALE, { style: "percent", maximumFractionDigits: 0 })
};

export function formatMeasurement(variable: ForecastVariableKey, value: number): string {
    return MEASUREMENTS[variable].format(value);
}

export function formatError(error: number): string {
    return ERROR.format(error);
}
