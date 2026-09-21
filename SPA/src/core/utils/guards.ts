import type { LiveRecord, ModelVersion, Summary } from "../models/summary";

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasStrings(record: Record<string, unknown>, keys: string[]): boolean {
    return keys.every(key => typeof record[key] === "string");
}

function hasCounts(record: Record<string, unknown>, keys: string[]): boolean {
    return keys.every(key => Number.isInteger(record[key]) && Number(record[key]) >= 0);
}

function isModelVersion(value: unknown): value is ModelVersion {
    return isRecord(value) && hasStrings(value, ["version", "trained_at", "commit"]);
}

function isLiveRecord(value: unknown): value is LiveRecord {
    return isRecord(value)
        && hasStrings(value, ["from", "to", "truth_until"])
        && hasCounts(value, ["snapshots", "forecasts", "predictions", "intervals", "graded"]);
}

export function isSummary(value: unknown): value is Summary {
    return isRecord(value)
        && hasStrings(value, ["generated_at", "location"])
        && isModelVersion(value.model)
        && isLiveRecord(value.live);
}
