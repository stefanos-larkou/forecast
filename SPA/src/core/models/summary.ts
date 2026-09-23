import type { AMOUNT_SERIES, BACKTEST_SERIES, RAIN_AMOUNT_VARIABLE, RAIN_VARIABLE, VARIABLES } from "../constants";
import type { WeatherState } from "./weather";

export type Variable = (typeof VARIABLES)[number];
export type VariableKey = Variable["key"];
export type ForecastVariableKey = VariableKey | typeof RAIN_VARIABLE | typeof RAIN_AMOUNT_VARIABLE;
export type SeriesKey = (typeof BACKTEST_SERIES)[number]["key"];
export type SeriesErrors = Record<SeriesKey, number[]>;
export type AmountKey = (typeof AMOUNT_SERIES)[number]["key"];
export type AmountErrors = Record<AmountKey, number[]>;

export interface Coordinates {
    latitude: number;
    longitude: number;
}

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

export interface RainAmount {
    leads: number[];
    wet_hours: number;
    typical_mm: number;
    mae: AmountErrors;
    skill: AmountErrors;
}

export interface Backtest {
    from: string;
    to: string;
    forecasts: number;
    leads: number[];
    metrics: BacktestMetrics;
    rain: { amount: RainAmount; };
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
    amount: number;
    cloud: number;
    wind: number;
    humidity: number;
}

export interface DailyRow {
    at: string;
    high: number;
    low: number;
    rain: number;
    state: WeatherState;
}

export interface Summary {
    generated_at: string;
    location: string;
    coordinates: Coordinates;
    model: ModelVersion;
    live: LiveRecord;
    forecast: Forecast | null;
    backtest: Backtest;
}
