import { AMOUNT_SERIES, BACKTEST_SERIES, CROSSOVER_SERIES, LIVE_SERIES, RAIN_AMOUNT_VARIABLE, RAIN_SKILL_SERIES, RAIN_VARIABLE, RELIABILITY_BIN_PARTS, RELIABILITY_SERIES, VARIABLES } from "../constants";
import type { AmountErrors, Backtest, Coordinates, Coverage, Crossover, Forecast, ForecastVariableKey, LiveCoverage, LiveErrors, LiveLeaderboard, LiveRain, LiveRecord, ModelVersion, Rain, RainAmount, RainScores, ReliabilityBin, SeriesErrors, StoredTable, Summary, VariableKey } from "../models/summary";

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
        && hasCounts(value, ["snapshots", "forecasts", "predictions", "intervals", "graded"])
        && (value.leaderboard === null || isLiveLeaderboard(value.leaderboard))
        && (value.coverage === null || isLiveCoverage(value.coverage))
        && (value.rain === null || isLiveRain(value.rain));
}

function isCounts(value: unknown, length: number): boolean {
    return Array.isArray(value) && value.length === length && value.every(count => Number.isInteger(count) && count >= 0);
}

function isLeads(value: unknown): value is number[] {
    return Array.isArray(value) && value.length > 0 && value.every(lead => Number.isInteger(lead) && lead > 0);
}

function isNumbers(value: unknown, length: number): value is number[] {
    return Array.isArray(value) && value.length === length && value.every(item => Number.isFinite(item));
}

function isLiveErrors(value: unknown, length: number): value is LiveErrors {
    return isRecord(value)
        && Object.keys(value).length > 0
        && LIVE_SERIES.every(({ key }) => value[key] === undefined || isNumbers(value[key], length));
}

function isLiveLeaderboard(value: unknown): value is LiveLeaderboard {
    if (!isRecord(value) || !isLeads(value.leads) || !isRecord(value.mae)) {
        return false;
    }

    const mae = value.mae;
    const leads = value.leads.length;
    return hasCounts(value, ["forecasts"])
        && isCounts(value.counts, leads)
        && Object.keys(mae).length > 0
        && VARIABLES.every(({ key }) => mae[key] === undefined || isLiveErrors(mae[key], leads));
}

function isLiveCoverage(value: unknown): value is LiveCoverage {
    if (!isRecord(value) || !isLeads(value.leads) || !isRecord(value.inside)) {
        return false;
    }

    const inside = value.inside;
    const leads = value.leads.length;
    return hasCounts(value, ["forecasts"])
        && Number.isFinite(value.level)
        && isCounts(value.counts, leads)
        && VARIABLES.every(({ key }) => inside[key] === undefined || isNumbers(inside[key], leads));
}

function isLiveRain(value: unknown): value is LiveRain {
    if (!isRecord(value) || !isLeads(value.leads)) {
        return false;
    }

    return hasCounts(value, ["forecasts"])
        && Number.isFinite(value.wet_share)
        && isCounts(value.counts, value.leads.length)
        && isNumbers(value.brier, value.leads.length);
}

function isSeriesErrors(value: unknown, length: number): value is SeriesErrors {
    return isRecord(value) && BACKTEST_SERIES.every(({ key }) => isNumbers(value[key], length));
}

function isErrors(value: unknown, length: number): value is Record<VariableKey, SeriesErrors> {
    return isRecord(value) && VARIABLES.every(({ key }) => isSeriesErrors(value[key], length));
}

function isAmountErrors(value: unknown, length: number): value is AmountErrors {
    return isRecord(value) && AMOUNT_SERIES.every(({ key }) => isNumbers(value[key], length));
}

function isRainAmount(value: unknown): value is RainAmount {
    if (!isRecord(value) || !isLeads(value.leads)) {
        return false;
    }

    return hasCounts(value, ["wet_hours"])
        && Number.isFinite(value.typical_mm)
        && isAmountErrors(value.mae, value.leads.length)
        && isAmountErrors(value.skill, value.leads.length);
}

function isRainScores(value: unknown, length: number): value is RainScores {
    return isRecord(value) && RAIN_SKILL_SERIES.every(({ key }) => isNumbers(value[key], length));
}

function isReliabilityBin(value: unknown): value is ReliabilityBin {
    return Array.isArray(value)
        && value.length === RELIABILITY_BIN_PARTS
        && Number.isFinite(value[0])
        && Number.isFinite(value[1])
        && Number.isInteger(value[2]) && Number(value[2]) >= 0;
}

function isReliability(value: unknown): value is Record<string, ReliabilityBin[]> {
    return isRecord(value) && RELIABILITY_SERIES.every(({ key }) => Array.isArray(value[key]) && (value[key] as unknown[]).every(isReliabilityBin));
}

function isRain(value: unknown): value is Rain {
    if (!isRecord(value) || !isLeads(value.leads)) {
        return false;
    }

    return Number.isFinite(value.wet_share)
        && isRainScores(value.brier, value.leads.length)
        && isRainScores(value.skill, value.leads.length)
        && isReliability(value.reliability)
        && isRainAmount(value.amount);
}

function isCoverage(value: unknown): value is Coverage {
    if (!isRecord(value) || !isLeads(value.leads) || !isRecord(value.inside)) {
        return false;
    }

    const inside = value.inside;
    return hasStrings(value, ["from", "to"])
        && hasCounts(value, ["forecasts"])
        && Number.isFinite(value.level)
        && VARIABLES.every(({ key }) => isNumbers(inside[key], (value.leads as number[]).length));
}

function isStoredTable(value: unknown): value is StoredTable {
    return isRecord(value) && hasStrings(value, ["name"]) && hasCounts(value, ["rows", "files"]);
}

function isTables(value: unknown): value is StoredTable[] {
    return Array.isArray(value) && value.every(isStoredTable);
}

function isCrossover(value: unknown): value is Crossover {
    return isRecord(value)
        && CROSSOVER_SERIES.every(({ key }) => value[key] === null || (Number.isInteger(value[key]) && Number(value[key]) > 0));
}

function isCrossovers(value: unknown): value is Record<VariableKey, Crossover> {
    return isRecord(value) && VARIABLES.every(({ key }) => isCrossover(value[key]));
}

function isHours(value: unknown): value is string[] {
    return Array.isArray(value) && value.length > 0 && value.every(hour => typeof hour === "string");
}

const FORECAST_KEYS: ForecastVariableKey[] = [...VARIABLES.map(variable => variable.key), RAIN_VARIABLE, RAIN_AMOUNT_VARIABLE];

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
        && isErrors(value.metrics.mae, value.leads.length)
        && isCrossovers(value.crossover)
        && isRain(value.rain)
        && isCoverage(value.coverage);
}

export function isSummary(value: unknown): value is Summary {
    return isRecord(value)
        && hasStrings(value, ["generated_at", "location"])
        && isCoordinates(value.coordinates)
        && isModelVersion(value.model)
        && isLiveRecord(value.live)
        && (value.forecast === null || isForecast(value.forecast))
        && (value.tables === undefined || isTables(value.tables))
        && isBacktest(value.backtest);
}
