import pandas as pd

from constants import BLEND_MODEL, MODEL_MAX_LEAD_HOURS, REFERENCE_MODEL
from scoring.live import build_coverage, build_leaderboard, build_rain


def saved(model: str, hours: list[int], leads: list[int], values: list[float], variable: str = "temperature_2m") -> pd.DataFrame:
    return pd.DataFrame({
        "location": "larnaca",
        "run_time": pd.Timestamp("2026-09-19T00:00:00Z"),
        "valid_time": [pd.Timestamp("2026-09-19T00:00:00Z") + pd.Timedelta(hours=hour) for hour in hours],
        "lead_hours": leads,
        "model": model,
        "variable": variable,
        "value": values,
        "source": "live"
    })


def observed(hours: list[int], values: list[float], variable: str = "temperature_2m") -> pd.DataFrame:
    return pd.DataFrame({
        "location": "larnaca",
        "valid_time": [pd.Timestamp("2026-09-19T00:00:00Z") + pd.Timedelta(hours=hour) for hour in hours],
        "variable": variable,
        "value": values
    })


def test_every_model_is_scored_on_the_forecasts_the_blend_also_made() -> None:
    blend = saved(BLEND_MODEL, [1], [1], [21.0])
    reference = saved(REFERENCE_MODEL, [1, 6], [1, 6], [22.0, 30.0])
    board = build_leaderboard(reference, blend, observed([1, 6], [20.0, 20.0]))

    assert board["mae"]["temperature_2m"][BLEND_MODEL] == [1.0]
    assert board["mae"]["temperature_2m"][REFERENCE_MODEL] == [2.0]


def test_a_forecast_stands_at_the_whole_day_its_lead_falls_within() -> None:
    leads = [1, 25, 49]
    blend = saved(BLEND_MODEL, leads, leads, [21.0] * 3)
    reference = saved(REFERENCE_MODEL, leads, leads, [22.0] * 3)

    assert build_leaderboard(reference, blend, observed(leads, [20.0] * 3))["leads"] == [24, 48, 72]


def test_a_day_pools_every_hour_that_falls_in_it() -> None:
    leads = [1, 12, 24]
    blend = saved(BLEND_MODEL, leads, leads, [21.0, 23.0, 25.0])
    reference = saved(REFERENCE_MODEL, leads, leads, [22.0] * 3)
    board = build_leaderboard(reference, blend, observed(leads, [20.0] * 3))

    assert board["leads"] == [24]
    assert board["mae"]["temperature_2m"][BLEND_MODEL] == [3.0]


def test_the_board_stops_where_the_model_stops_forecasting() -> None:
    beyond = MODEL_MAX_LEAD_HOURS + 1
    blend = saved(BLEND_MODEL, [1], [1], [21.0])
    reference = saved(REFERENCE_MODEL, [1, beyond], [1, beyond], [22.0, 22.0])

    assert build_leaderboard(reference, blend, observed([1, beyond], [20.0, 20.0]))["leads"] == [24]


def test_a_lead_counts_the_hours_behind_it_not_the_rows() -> None:
    hours = [1, 2, 3]
    blend = pd.concat([saved(BLEND_MODEL, hours, [1, 1, 1], [21.0] * 3, variable) for variable in ("temperature_2m", "cloud_cover")])
    reference = pd.concat([saved(REFERENCE_MODEL, hours, [1, 1, 1], [22.0] * 3, variable) for variable in ("temperature_2m", "cloud_cover")])
    truth = pd.concat([observed(hours, [20.0] * 3, variable) for variable in ("temperature_2m", "cloud_cover")])

    assert build_leaderboard(reference, blend, truth)["counts"] == [3]


def test_nothing_is_scored_until_truth_catches_up_with_the_predictions() -> None:
    blend = saved(BLEND_MODEL, [1], [1], [21.0])
    reference = saved(REFERENCE_MODEL, [1], [1], [22.0])

    assert build_leaderboard(reference, blend, observed([], [])) is None


def test_an_outcome_on_the_edge_of_its_band_counts_as_covered() -> None:
    band = saved(BLEND_MODEL, [1, 25], [1, 25], [0.0, 0.0]).drop(columns="value")
    band = band.assign(lower=[19.0, 19.0], upper=[21.0, 21.0])

    covered = build_coverage(band, observed([1, 25], [21.0, 25.0]))

    assert covered["inside"]["temperature_2m"] == [1.0, 0.0]
    assert covered["counts"] == [1, 1]


def test_the_chance_of_rain_is_scored_against_whether_the_hour_was_wet() -> None:
    chances = saved(BLEND_MODEL, [1, 25], [1, 25], [1.0, 0.0], variable="rain_probability")
    truth = observed([1, 25], [5.0, 0.0], variable="precipitation")

    scored = build_rain(chances, truth)

    assert scored["brier"] == [0.0, 0.0]
    assert scored["wet_share"] == 0.5


def test_a_confident_chance_of_rain_on_a_dry_hour_scores_the_worst_it_can() -> None:
    chances = saved(BLEND_MODEL, [1], [1], [1.0], variable="rain_probability")

    assert build_rain(chances, observed([1], [0.0], variable="precipitation"))["brier"] == [1.0]
