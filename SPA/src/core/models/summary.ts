import type { AMOUNT_SERIES, BACKTEST_SERIES, CROSSOVER_SERIES, RAIN_AMOUNT_VARIABLE, RAIN_SKILL_SERIES, RAIN_VARIABLE, RELIABILITY_SERIES, VARIABLES } from "../constants";
import type { WeatherState } from "./weather";

export type Variable = (typeof VARIABLES)[number];
export type VariableKey = Variable["key"];
export type ForecastVariableKey = VariableKey | typeof RAIN_VARIABLE | typeof RAIN_AMOUNT_VARIABLE;
export type SeriesKey = (typeof BACKTEST_SERIES)[number]["key"];
export type SeriesErrors = Record<SeriesKey, number[]>;
export type AmountKey = (typeof AMOUNT_SERIES)[number]["key"];
export type AmountErrors = Record<AmountKey, number[]>;
export type RainKey = (typeof RAIN_SKILL_SERIES)[number]["key"];
export type RainScores = Record<RainKey, number[]>;
export type ReliabilityKey = (typeof RELIABILITY_SERIES)[number]["key"];
export type ReliabilityBin = [number, number, number];
export type CrossoverKey = (typeof CROSSOVER_SERIES)[number]["key"];
export type Crossover = Record<CrossoverKey, number | null>;

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

export interface Rain {
    leads: number[];
    wet_share: number;
    brier: RainScores;
    skill: RainScores;
    amount: RainAmount;
    reliability: Record<ReliabilityKey, ReliabilityBin[]>;
}

export interface Coverage {
    from: string;
    to: string;
    forecasts: number;
    level: number;
    leads: number[];
    inside: Record<VariableKey, number[]>;
}

export interface Backtest {
    from: string;
    to: string;
    forecasts: number;
    leads: number[];
    metrics: BacktestMetrics;
    crossover: Record<VariableKey, Crossover>;
    rain: Rain;
    coverage: Coverage;
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

export interface StoredTable {
    name: string;
    rows: number;
    files: number;
}

export interface Summary {
    generated_at: string;
    location: string;
    coordinates: Coordinates;
    model: ModelVersion;
    live: LiveRecord;
    forecast: Forecast | null;
    tables?: StoredTable[];
    backtest: Backtest;
}
