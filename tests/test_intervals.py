import numpy as np
import pandas as pd

from constants import BAND_REACH_MONTHS, FEATURE_COLUMNS, REFERENCE_MODEL
from model.train import conformal_scores
from scoring.intervals import coverage, coverage_starts, fold_windows, inside_the_band


def flat_tree(value: float) -> list[dict]:
    return [{"value": value}]


def checked_frame(variable: str, observed: list[float], reference: list[float]) -> pd.DataFrame:
    frame = pd.DataFrame({
        "location": "larnaca",
        "variable": variable,
        "valid_time": pd.date_range("2026-01-01", periods=len(observed), freq="h", tz="UTC"),
        "lead_hours": 24,
        "observed": observed,
        REFERENCE_MODEL: reference
    })
    return frame.assign(**{column: 0.0 for column in FEATURE_COLUMNS if column not in frame})


def trained_frame(days: int) -> pd.DataFrame:
    valid_time = pd.date_range("2024-03-14", periods=days, freq="D", tz="UTC")
    return pd.DataFrame({"variable": "temperature_2m", "valid_time": valid_time, "run_time": valid_time})


def test_the_scores_are_how_far_outside_the_band_each_outcome_fell() -> None:
    scores = conformal_scores(pd.Series([5.0, 0.0, -5.0]), np.array([-1.0] * 3), np.array([1.0] * 3))

    assert list(scores) == [4.0, -1.0, 4.0]


def test_a_fold_is_calibrated_on_the_months_before_it_and_never_on_itself() -> None:
    fitting, calibration = fold_windows(trained_frame(600), pd.Period("2025-09", freq="M"))

    assert calibration["valid_time"].min() > pd.Timestamp("2025-06-01", tz="UTC")
    assert calibration["valid_time"].max() <= pd.Timestamp("2025-09-01", tz="UTC")
    assert fitting["valid_time"].max() <= pd.Timestamp("2025-06-01", tz="UTC")


def test_a_fold_without_room_to_fit_and_calibrate_behind_it_is_left_out() -> None:
    assert min(coverage_starts(trained_frame(900))) == pd.Period("2024-03", freq="M") + BAND_REACH_MONTHS


def test_an_outcome_on_the_edge_of_the_band_counts_as_inside() -> None:
    band = inside_the_band(checked_frame("temperature_2m", [21.0, 19.0, 23.0], [20.0, 20.0, 20.0]), flat_tree(-1.0), flat_tree(1.0), {24: 0.0})

    assert list(band["inside"]) == [1.0, 1.0, 0.0]
    assert list(band["width"]) == [2.0, 2.0, 2.0]


def test_the_margin_widens_the_band_on_both_sides() -> None:
    band = inside_the_band(checked_frame("temperature_2m", [23.0], [20.0]), flat_tree(-1.0), flat_tree(1.0), {24: 2.0})

    assert list(band["inside"]) == [1.0]
    assert list(band["width"]) == [6.0]


def test_the_band_never_promises_what_the_variable_cannot_do() -> None:
    band = inside_the_band(checked_frame("relative_humidity_2m", [100.0, 0.0], [98.0, 2.0]), flat_tree(-5.0), flat_tree(5.0), {24: 0.0})

    assert list(band["width"]) == [7.0, 7.0]


def test_coverage_is_the_share_inside_per_variable_and_lead() -> None:
    checked = pd.DataFrame({
        "variable": ["temperature_2m"] * 4,
        "lead_hours": [24, 24, 48, 48],
        "inside": [1.0, 0.0, 1.0, 1.0]
    })
    shares = coverage(checked)

    assert shares.loc["temperature_2m", 24] == 0.5
    assert shares.loc["temperature_2m", 48] == 1.0
