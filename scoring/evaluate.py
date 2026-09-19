import time

import pandas as pd

from constants import FEATURE_COLUMNS, LEADERBOARD_DECIMALS, MAE_VARIABLES, REFERENCE_MODEL, REFIT_EVERY_MONTHS, SCORING_KEY, TRAINING_WINDOW_MONTHS
from model import gbm
from model.training import load_training_data
from scoring.baselines import with_bias_correction, with_persistence


def score(graded: pd.DataFrame, observations: pd.DataFrame, boosted: pd.DataFrame) -> pd.DataFrame:
    scored = with_persistence(with_bias_correction(graded, graded), observations)

    by_model = scored.pivot(index=SCORING_KEY, columns="model", values=["value", "value_corrected"])
    by_model.columns = [f"{model} {'raw' if field == 'value' else 'corrected'}" for field, model in by_model.columns]
    shared = scored.drop_duplicates(SCORING_KEY).set_index(SCORING_KEY)[["persisted", "value_observed"]]

    compared = by_model.join(shared).reset_index().merge(boosted, on=SCORING_KEY, how="inner").dropna()
    methods = [*by_model.columns, "persisted", "boosted"]
    errors = compared[methods].sub(compared["value_observed"], axis=0).abs()
    return errors.assign(variable=compared["variable"], lead_hours=compared["lead_hours"]).groupby(["variable", "lead_hours"], observed=True).mean()


def fold_starts(trained: pd.DataFrame) -> list[pd.Period]:
    first_month = pd.Period(trained["valid_time"].min().date(), freq="M")
    last_month = pd.Period(trained["run_time"].max().date(), freq="M")
    months = pd.period_range(first_month + TRAINING_WINDOW_MONTHS, last_month, freq="M")
    return list(months[::REFIT_EVERY_MONTHS])


def forecast_fold(rows: pd.DataFrame, start: pd.Period) -> pd.DataFrame:
    train_from = (start - TRAINING_WINDOW_MONTHS).start_time.tz_localize("UTC")
    score_from = start.start_time.tz_localize("UTC")
    score_until = (start + REFIT_EVERY_MONTHS).start_time.tz_localize("UTC")

    training = rows[(rows["valid_time"] >= train_from) & (rows["valid_time"] < score_from)]
    scored = rows[(rows["run_time"] >= score_from) & (rows["run_time"] < score_until)]

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
    for variable in MAE_VARIABLES:
        print(f"\n{variable}: mean absolute error, forecasts from {first_fold} on, each scored by a model trained only on the {TRAINING_WINDOW_MONTHS} months before its fold")
        print(table.loc[variable].astype("float64").round(LEADERBOARD_DECIMALS).T.to_string())


def main() -> None:
    began = time.perf_counter()
    observations, graded, trained = load_training_data()
    starts = fold_starts(trained)
    print(f"{len(graded):,} graded forecasts, {len(trained):,} training rows, {len(starts)} folds from {starts[0]} to {starts[-1]}", flush=True)

    print(f"Training {len(starts) * len(MAE_VARIABLES)} models, one per fold and variable:", flush=True)
    boosted = boosted_forecasts(trained)

    print("Scoring every method on the same forecasts...", flush=True)
    print_leaderboard(score(graded, observations, boosted), starts[0])
    print(f"\nFinished in {time.perf_counter() - began:.0f}s")


if __name__ == "__main__":
    main()
