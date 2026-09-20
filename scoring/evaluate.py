import time

import pandas as pd

from constants import CLIMATE_DIR, FEATURE_COLUMNS, LEADERBOARD_DECIMALS, LEADERBOARD_METRICS, MAE_VARIABLES, REFERENCE_MODEL, REFIT_EVERY_MONTHS, SCORING_KEY, TRAINING_WINDOW_MONTHS
from model import gbm
from model.training import load_training_data
from scoring.baselines import climatology, with_bias_correction, with_climatology, with_persistence


def score(graded: pd.DataFrame, observations: pd.DataFrame, climate: pd.DataFrame, boosted: pd.DataFrame) -> pd.DataFrame:
    scored = with_climatology(with_persistence(with_bias_correction(graded, graded), observations), climate)

    by_model = scored.pivot(index=SCORING_KEY, columns="model", values=["value", "value_corrected"])
    by_model.columns = [f"{model} {'raw' if field == 'value' else 'corrected'}" for field, model in by_model.columns]
    shared = scored.drop_duplicates(SCORING_KEY).set_index(SCORING_KEY)[["persisted", "climatology", "value_observed"]]

    compared = by_model.join(shared).reset_index().merge(boosted, on=SCORING_KEY, how="inner").dropna()
    methods = [*by_model.columns, "persisted", "climatology", "boosted"]
    errors = compared[methods].sub(compared["value_observed"], axis=0)
    keys = [compared["variable"], compared["lead_hours"]]

    return pd.concat({
        "mae": errors.abs().groupby(keys, observed=True).mean(),
        "bias": errors.groupby(keys, observed=True).mean(),
        "scatter": errors.groupby(keys, observed=True).std()
    }, names=["metric"])


def fold_starts(trained: pd.DataFrame) -> list[pd.Period]:
    first_month = pd.Period(trained["valid_time"].min().date(), freq="M")
    last_month = pd.Period(trained["run_time"].max().date(), freq="M")
    months = pd.period_range(first_month + TRAINING_WINDOW_MONTHS, last_month, freq="M")
    return list(months[::REFIT_EVERY_MONTHS])


def fold_rows(rows: pd.DataFrame, start: pd.Period, months: int = REFIT_EVERY_MONTHS) -> tuple[pd.DataFrame, pd.DataFrame]:
    train_from = (start - TRAINING_WINDOW_MONTHS).start_time.tz_localize("UTC")
    score_from = start.start_time.tz_localize("UTC")
    score_until = (start + months).start_time.tz_localize("UTC")

    training = rows[(rows["valid_time"] >= train_from) & (rows["valid_time"] < score_from)]
    scored = rows[(rows["run_time"] >= score_from) & (rows["run_time"] < score_until)]
    return training, scored


def forecast_fold(rows: pd.DataFrame, start: pd.Period) -> pd.DataFrame:
    training, scored = fold_rows(rows, start)

    print(f"  {start} {rows['variable'].iloc[0]}: training on {len(training):,} rows, scoring {len(scored):,} forecasts...", end=" ", flush=True)
    began = time.perf_counter()
    trees = gbm.fit(training[FEATURE_COLUMNS].to_numpy("float64"), training["target"].to_numpy("float64"))
    correction = gbm.predict(trees, scored[FEATURE_COLUMNS].to_numpy("float64"))
    print(f"done in {time.perf_counter() - began:.0f}s", flush=True)

    return scored[SCORING_KEY].assign(boosted=scored[REFERENCE_MODEL] + correction)


def boosted_forecasts(trained: pd.DataFrame) -> pd.DataFrame:
    return pd.concat([
        forecast_fold(trained[trained["variable"] == variable], start)
        for start in fold_starts(trained)
        for variable in MAE_VARIABLES
    ], ignore_index=True)


def print_leaderboard(table: pd.DataFrame, first_fold: pd.Period) -> None:
    print(f"\nForecasts from {first_fold} on, each scored by a model trained only on the {TRAINING_WINDOW_MONTHS} months before its fold")
    for variable in MAE_VARIABLES:
        for metric, description in LEADERBOARD_METRICS.items():
            print(f"\n{variable}, {metric}: {description}")
            print(table.loc[(metric, variable)].astype("float64").round(LEADERBOARD_DECIMALS).T.to_string())


def main() -> None:
    began = time.perf_counter()
    observations, graded, trained = load_training_data()
    starts = fold_starts(trained)
    print(f"{len(graded):,} graded forecasts, {len(trained):,} training rows, {len(starts)} folds from {starts[0]} to {starts[-1]}", flush=True)

    print(f"Training {len(starts) * len(MAE_VARIABLES)} models, one per fold and variable:", flush=True)
    boosted = boosted_forecasts(trained)

    print("Scoring every method on the same forecasts...", flush=True)
    climate = climatology(pd.read_parquet(CLIMATE_DIR))
    print_leaderboard(score(graded, observations, climate, boosted), starts[0])
    print(f"\nFinished in {time.perf_counter() - began:.0f}s")


if __name__ == "__main__":
    main()
