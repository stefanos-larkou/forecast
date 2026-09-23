import { BACKTEST_SERIES, RAIN_VARIABLE, VARIABLES } from "../constants";
import type { Backtest, Coordinates, Forecast, ForecastVariableKey, LiveRecord, ModelVersion, SeriesErrors, Summary, VariableKey } from "../models/summary";

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasStrings(record: Record<string, unknown>, keys: string[]): boolean {
    return keys.every(key => typeof record[key] === "string");
}

function hasCounts(record: Record<string, unknown>, keys: string[]): boolean {
    return keys.every(key => Number.isInteger(record[key]) && Number(record[key]) >= 0);
}

function isCoordinates(value: unknown): value is Coordinates {
    return isRecord(value)
        && Number.isFinite(value.latitude) && Math.abs(Number(value.latitude)) <= 90
        && Number.isFinite(value.longitude) && Math.abs(Number(value.longitude)) <= 180;
}

function isModelVersion(value: unknown): value is ModelVersion {
    return isRecord(value) && hasStrings(value, ["version", "trained_at", "commit"]);
}

function isLiveRecord(value: unknown): value is LiveRecord {
    return isRecord(value)
        && hasStrings(value, ["from", "to", "truth_until"])
        && hasCounts(value, ["snapshots", "forecasts", "predictions", "intervals", "graded"]);
}

function isLeads(value: unknown): value is number[] {
    return Array.isArray(value) && value.length > 0 && value.every(lead => Number.isInteger(lead) && lead > 0);
}

function isNumbers(value: unknown, length: number): value is number[] {
    return Array.isArray(value) && value.length === length && value.every(item => Number.isFinite(item));
}

function isSeriesErrors(value: unknown, length: number): value is SeriesErrors {
    return isRecord(value) && BACKTEST_SERIES.every(({ key }) => isNumbers(value[key], length));
}

function isErrors(value: unknown, length: number): value is Record<VariableKey, SeriesErrors> {
    return isRecord(value) && VARIABLES.every(({ key }) => isSeriesErrors(value[key], length));
}

function isHours(value: unknown): value is string[] {
    return Array.isArray(value) && value.length > 0 && value.every(hour => typeof hour === "string");
}

const FORECAST_KEYS: ForecastVariableKey[] = [...VARIABLES.map(variable => variable.key), RAIN_VARIABLE];

function isForecast(value: unknown): value is Forecast {
    if (!isRecord(value)) {
        return false;
    }

    const hours = value.hours;
    const variables = value.variables;
    const band = value.band;

    return hasStrings(value, ["run_time"])
        && isHours(hours)
        && isRecord(variables)
        && FORECAST_KEYS.every(key => isNumbers(variables[key], hours.length))
        && isRecord(band)
        && hasStrings(band, ["variable"])
        && isNumbers(band.lower, hours.length)
        && isNumbers(band.upper, hours.length);
}

function isBacktest(value: unknown): value is Backtest {
    return isRecord(value)
        && hasStrings(value, ["from", "to"])
        && hasCounts(value, ["forecasts"])
        && isLeads(value.leads)
        && isRecord(value.metrics)
        && isErrors(value.metrics.mae, value.leads.length);
}

export function isSummary(value: unknown): value is Summary {
    return isRecord(value)
        && hasStrings(value, ["generated_at", "location"])
        && isCoordinates(value.coordinates)
        && isModelVersion(value.model)
        && isLiveRecord(value.live)
        && (value.forecast === null || isForecast(value.forecast))
        && isBacktest(value.backtest);
}
