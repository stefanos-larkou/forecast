import type { BACKTEST_SERIES, RAIN_VARIABLE, VARIABLES } from "../constants";

export type Variable = (typeof VARIABLES)[number];
export type VariableKey = Variable["key"];
export type ForecastVariableKey = VariableKey | typeof RAIN_VARIABLE;
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

export interface ForecastBand {
    variable: string;
    lower: number[];
    upper: number[];
}

export interface Forecast {
    run_time: string;
    hours: string[];
    variables: Record<ForecastVariableKey, number[]>;
    band: ForecastBand;
}

export interface HourlyRow {
    at: string;
    temperature: number;
    lower: number;
    upper: number;
    rain: number;
    cloud: number;
    wind: number;
    humidity: number;
}

export interface DailyRow {
    at: string;
    high: number;
    low: number;
    rain: number;
}

export interface Summary {
    generated_at: string;
    location: string;
    model: ModelVersion;
    live: LiveRecord;
    forecast: Forecast | null;
    backtest: Backtest;
}
