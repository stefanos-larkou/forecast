import time

import numpy as np
import pandas as pd

from constants import AMOUNT_DECIMALS, AMOUNT_METHODS, AMOUNT_QUANTILE, BACKFILL_DIR, BRIER_DECIMALS, CLIMATE_DIR, FEATURE_COLUMNS, LEADERBOARD_DECIMALS, MODELS, OBSERVATIONS_DIR, PHYSICAL_LIMITS, RAIN_AMOUNT_VARIABLE, RAIN_METHODS, RAIN_PROBABILITY_VARIABLE, RAIN_VARIABLE, RELIABILITY_BIN_COUNT, RELIABILITY_METHODS, SCORING_KEY, SKILL_DECIMALS, WET_HOUR_MM
from model import gbm
from model.features import build_features
from scoring.baselines import climatology, with_climatology, with_persistence
from scoring.evaluate import fold_rows, fold_starts
from scoring.grading import grade


def wet(values: pd.Series) -> pd.Series:
    return (values >= WET_HOUR_MM).astype("float64")


def prepare(forecasts: pd.DataFrame, observations: pd.DataFrame, history: pd.DataFrame) -> pd.DataFrame:
    features = build_features(forecasts, grade(forecasts, observations))
    rows = features[features["variable"] == RAIN_VARIABLE].dropna(subset=FEATURE_COLUMNS)

    truth = observations[observations["variable"] == RAIN_VARIABLE]
    rows = rows.merge(truth.rename(columns={"value": "observed"}), on=["location", "variable", "valid_time"], validate="many_to_one")
    rows = with_persistence(rows, truth).dropna(subset=["persisted"])

    wet_history = history[history["variable"] == RAIN_VARIABLE]
    rows = with_climatology(rows, climatology(wet_history.assign(value=wet(wet_history["value"])))).dropna(subset=["climatology"])

    return rows.assign(
        wet=wet(rows["observed"]),
        persisted=wet(rows["persisted"]),
        models=np.mean([wet(rows[model]) for model in MODELS], axis=0)
    )


def probability_fold(rows: pd.DataFrame, start: pd.Period) -> pd.DataFrame:
    training, scored = fold_rows(rows, start)

    print(f"  {start}: training on {len(training):,} rows, scoring {len(scored):,} forecasts...", end=" ", flush=True)
    began = time.perf_counter()
    trees = gbm.fit(training[FEATURE_COLUMNS].to_numpy("float64"), training["wet"].to_numpy("float64"))
    probability = gbm.predict(trees, scored[FEATURE_COLUMNS].to_numpy("float64")).clip(*PHYSICAL_LIMITS[RAIN_PROBABILITY_VARIABLE])
    print(f"done in {time.perf_counter() - began:.0f}s", flush=True)

    return scored[SCORING_KEY].assign(boosted=probability)


def boosted_probabilities(prepared: pd.DataFrame) -> pd.DataFrame:
    return pd.concat([probability_fold(prepared, start) for start in fold_starts(prepared)], ignore_index=True)


def amount_fold(rows: pd.DataFrame, start: pd.Period) -> pd.DataFrame:
    training, scored = fold_rows(rows, start)
    wet_training = training[training["wet"] == 1]
    wet_scored = scored[scored["wet"] == 1]

    print(f"  {start}: training on {len(wet_training):,} wet rows, scoring {len(wet_scored):,} wet forecasts...", end=" ", flush=True)
    began = time.perf_counter()
    trees = gbm.fit(wet_training[FEATURE_COLUMNS].to_numpy("float64"), wet_training["observed"].to_numpy("float64"), AMOUNT_QUANTILE)
    amount = gbm.predict(trees, wet_scored[FEATURE_COLUMNS].to_numpy("float64")).clip(*PHYSICAL_LIMITS[RAIN_AMOUNT_VARIABLE])
    print(f"done in {time.perf_counter() - began:.0f}s", flush=True)

    return wet_scored[SCORING_KEY].assign(
        observed=wet_scored["observed"],
        models=wet_scored[MODELS].mean(axis=1),
        typical=wet_training["observed"].median(),
        boosted=amount
    )


def boosted_amounts(prepared: pd.DataFrame) -> pd.DataFrame:
    return pd.concat([amount_fold(prepared, start) for start in fold_starts(prepared)], ignore_index=True)


def amount_error(scored: pd.DataFrame) -> pd.DataFrame:
    absolute = scored[AMOUNT_METHODS].sub(scored["observed"], axis=0).abs()
    return absolute.groupby(scored["lead_hours"], observed=True).mean()


def brier(scored: pd.DataFrame) -> pd.DataFrame:
    squared = scored[RAIN_METHODS].sub(scored["wet"], axis=0) ** 2
    return squared.groupby(scored["lead_hours"], observed=True).mean()


def reliability(scored: pd.DataFrame, method: str) -> pd.DataFrame:
    lowest, highest = PHYSICAL_LIMITS[RAIN_PROBABILITY_VARIABLE]
    bins = pd.cut(scored[method], np.linspace(lowest, highest, RELIABILITY_BIN_COUNT + 1), include_lowest=True)
    grouped = scored.groupby(bins, observed=True)
    return pd.DataFrame({
        "forecasts": grouped.size(),
        "mean forecast": grouped[method].mean(),
        "observed wet": grouped["wet"].mean()
    })


def main() -> None:
    began = time.perf_counter()
    print("Loading forecasts, observations and the climate history...", flush=True)
    observations = pd.read_parquet(OBSERVATIONS_DIR)
    forecasts = pd.read_parquet(BACKFILL_DIR)
    history = pd.read_parquet(CLIMATE_DIR)

    print("Building features...", flush=True)
    prepared = prepare(forecasts, observations, history)
    starts = fold_starts(prepared)
    print(f"{len(prepared):,} forecasts, {prepared['wet'].mean():.2%} of their hours wet, {len(starts)} folds from {starts[0]} to {starts[-1]}", flush=True)

    print(f"Training {len(starts)} probability models, one per fold:", flush=True)
    scored = prepared.merge(boosted_probabilities(prepared), on=SCORING_KEY, how="inner", validate="one_to_one")

    table = brier(scored)
    print(f"\nPrecipitation, Brier score: mean squared error of the probability that an hour reaches {WET_HOUR_MM} mm, forecasts from {starts[0]} on")
    print(table.round(BRIER_DECIMALS).T.to_string())

    print("\nPrecipitation, Brier skill score against climatology: 1 means perfect, 0 no better than climatology, below 0 worse")
    print((1 - table.div(table["climatology"], axis=0)).round(SKILL_DECIMALS).T.to_string())

    print(f"\nTraining {len(starts)} amount models on wet hours alone, one per fold:", flush=True)
    amounts = boosted_amounts(prepared)
    errors = amount_error(amounts)

    print(f"\nPrecipitation, mean absolute error over the {len(amounts):,} wet hours only, in mm: how much fell, given that it did")
    print(errors.round(AMOUNT_DECIMALS).T.to_string())

    print(f"\nPrecipitation, skill against a typical wet hour: the amount model fits the {AMOUNT_QUANTILE:.0%} quantile")
    print((1 - errors.div(errors["typical"], axis=0)).round(SKILL_DECIMALS).T.to_string())

    for method in RELIABILITY_METHODS:
        print(f"\nprecipitation, reliability of {method}: of the hours given each probability, how many were wet")
        print(reliability(scored, method).round(LEADERBOARD_DECIMALS).to_string())

    print(f"\nFinished in {time.perf_counter() - began:.0f}s")


if __name__ == "__main__":
    main()
