import time

import numpy as np
import pandas as pd

from constants import BAND_LEVEL, BAND_REACH_MONTHS, CALIBRATION_MONTHS, COVERAGE_DECIMALS, FEATURE_COLUMNS, LOWER_QUANTILE, MAE_VARIABLES, PHYSICAL_LIMITS, REFERENCE_MODEL, SCORING_KEY, UPPER_QUANTILE
from model import gbm
from model.train import conformal_margin, conformal_scores, training_window
from model.training import load_training_data
from scoring.evaluate import fold_rows, fold_starts


def coverage_starts(trained: pd.DataFrame) -> list[pd.Period]:
    earliest = pd.Period(trained["valid_time"].min().date(), freq="M")
    return [start for start in fold_starts(trained) if start - BAND_REACH_MONTHS >= earliest]


def fold_windows(rows: pd.DataFrame, start: pd.Period) -> tuple[pd.DataFrame, pd.DataFrame]:
    opens = (start - CALIBRATION_MONTHS).start_time.tz_localize("UTC")
    closes = start.start_time.tz_localize("UTC")
    calibration = rows[(rows["valid_time"] > opens) & (rows["valid_time"] <= closes)]
    return training_window(rows, opens), calibration


def inside_the_band(checked: pd.DataFrame, lower_trees: list[dict], upper_trees: list[dict], margins: dict[int, float]) -> pd.DataFrame:
    features = checked[FEATURE_COLUMNS].to_numpy("float64")
    margin = checked["lead_hours"].map(margins)
    lower = checked[REFERENCE_MODEL] + gbm.predict(lower_trees, features) - margin
    upper = checked[REFERENCE_MODEL] + gbm.predict(upper_trees, features) + margin

    low, high = PHYSICAL_LIMITS[checked["variable"].iloc[0]]
    band_lower = np.minimum(lower, upper).clip(low, high)
    band_upper = np.maximum(lower, upper).clip(low, high)

    return checked[SCORING_KEY].assign(
        inside=((checked["observed"] >= band_lower) & (checked["observed"] <= band_upper)).astype("float64"),
        width=band_upper - band_lower
    )


def coverage_fold(rows: pd.DataFrame, start: pd.Period) -> pd.DataFrame:
    _, checked = fold_rows(rows, start)
    fitting, calibration = fold_windows(rows, start)

    print(f"  {start} {rows['variable'].iloc[0]}: fitting on {len(fitting):,} rows, calibrating on {len(calibration):,}, checking {len(checked):,}...", end=" ", flush=True)
    began = time.perf_counter()
    features = fitting[FEATURE_COLUMNS].to_numpy("float64")
    target = fitting["target"].to_numpy("float64")
    lower_trees = gbm.fit(features, target, LOWER_QUANTILE)
    upper_trees = gbm.fit(features, target, UPPER_QUANTILE)

    held = calibration[FEATURE_COLUMNS].to_numpy("float64")
    scores = conformal_scores(calibration["target"], gbm.predict(lower_trees, held), gbm.predict(upper_trees, held))
    margins = {lead: conformal_margin(group) for lead, group in scores.groupby(calibration["lead_hours"], observed=True)}
    print(f"done in {time.perf_counter() - began:.0f}s", flush=True)

    return inside_the_band(checked, lower_trees, upper_trees, margins)


def held_out_bands(trained: pd.DataFrame) -> pd.DataFrame:
    return pd.concat([
        coverage_fold(trained[trained["variable"] == variable], start)
        for start in coverage_starts(trained)
        for variable in MAE_VARIABLES
    ], ignore_index=True)


def coverage(checked: pd.DataFrame) -> pd.DataFrame:
    keys = [checked["variable"], checked["lead_hours"]]
    return checked["inside"].groupby(keys, observed=True).mean().unstack()


def main() -> None:
    began = time.perf_counter()
    _, _, trained = load_training_data()
    starts = coverage_starts(trained)
    print(f"{len(starts)} folds from {starts[0]} to {starts[-1]}, {len(starts) * len(MAE_VARIABLES) * 2} quantile models:", flush=True)

    checked = held_out_bands(trained)
    print(f"\nShare of outcomes inside the {LOWER_QUANTILE:.0%} to {UPPER_QUANTILE:.0%} band, calibrated on the {CALIBRATION_MONTHS} months before each fold and checked on the fold itself")
    print(coverage(checked).round(COVERAGE_DECIMALS).to_string())

    print(f"\nMean band width, in each variable's own units")
    widths = checked["width"].groupby([checked["variable"], checked["lead_hours"]], observed=True).mean().unstack()
    print(widths.round(COVERAGE_DECIMALS).to_string())

    print(f"\n{len(checked):,} forecasts checked against a band aiming for {BAND_LEVEL:.0%}, in {time.perf_counter() - began:.0f}s")


if __name__ == "__main__":
    main()
