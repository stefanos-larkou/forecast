import type { BACKTEST_SERIES, VARIABLES } from "../constants";

export type VariableKey = (typeof VARIABLES)[number]["key"];
export type SeriesKey = (typeof BACKTEST_SERIES)[number]["key"];
export type SeriesErrors = Record<SeriesKey, number[]>;

export interface ModelVersion {
    version: string;
    trained_at: string;
    commit: string;
}

export interface LiveRecord {
    from: string;
    to: string;
    truth_until: string;
    snapshots: number;
    forecasts: number;
    predictions: number;
    intervals: number;
    graded: number;
}

export interface BacktestMetrics {
    mae: Record<VariableKey, SeriesErrors>;
}

export interface Backtest {
    from: string;
    to: string;
    forecasts: number;
    leads: number[];
    metrics: BacktestMetrics;
}

export interface Summary {
    generated_at: string;
    location: string;
    model: ModelVersion;
    live: LiveRecord;
    backtest: Backtest;
}

export interface ErrorRow {
    series: string;
    lead: number;
    error: number;
}
