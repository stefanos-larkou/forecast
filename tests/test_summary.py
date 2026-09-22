import pandas as pd

from scoring.summary import build_forecast


def predictions_frame() -> pd.DataFrame:
    rows = [
        ("2026-09-22T17:00:00Z", "2026-09-22T18:00:00Z", "temperature_2m", 26.28),
        ("2026-09-22T17:00:00Z", "2026-09-22T19:00:00Z", "temperature_2m", 25.41),
        ("2026-09-22T17:00:00Z", "2026-09-22T18:00:00Z", "rain_probability", 0.02),
        ("2026-09-22T17:00:00Z", "2026-09-22T19:00:00Z", "rain_probability", 0.05),
        ("2026-09-22T11:00:00Z", "2026-09-22T18:00:00Z", "temperature_2m", 30.0),
        ("2026-09-22T11:00:00Z", "2026-09-22T18:00:00Z", "rain_probability", 0.9)
    ]
    frame = pd.DataFrame(rows, columns=["run_time", "valid_time", "variable", "value"])
    return frame.assign(run_time=pd.to_datetime(frame["run_time"], utc=True), valid_time=pd.to_datetime(frame["valid_time"], utc=True))


def intervals_frame() -> pd.DataFrame:
    rows = [
        ("2026-09-22T17:00:00Z", "2026-09-22T18:00:00Z", "temperature_2m", 24.63, 27.27),
        ("2026-09-22T17:00:00Z", "2026-09-22T19:00:00Z", "temperature_2m", 23.80, 26.90),
        ("2026-09-22T17:00:00Z", "2026-09-22T18:00:00Z", "wind_speed_10m", 4.0, 9.0),
        ("2026-09-22T11:00:00Z", "2026-09-22T18:00:00Z", "temperature_2m", 29.0, 31.0)
    ]
    frame = pd.DataFrame(rows, columns=["run_time", "valid_time", "variable", "lower", "upper"])
    return frame.assign(run_time=pd.to_datetime(frame["run_time"], utc=True), valid_time=pd.to_datetime(frame["valid_time"], utc=True))


def test_the_forecast_is_the_newest_run_only() -> None:
    forecast = build_forecast(predictions_frame(), intervals_frame())

    assert forecast["run_time"] == "2026-09-22T17:00:00+00:00"
    assert forecast["hours"] == ["2026-09-22T18:00:00+00:00", "2026-09-22T19:00:00+00:00"]
    assert forecast["variables"]["temperature_2m"] == [26.28, 25.41]


def test_every_variable_lines_up_with_the_hours() -> None:
    forecast = build_forecast(predictions_frame(), intervals_frame())

    assert forecast["variables"]["rain_probability"] == [0.02, 0.05]
    assert all(len(values) == len(forecast["hours"]) for values in forecast["variables"].values())


def test_the_band_is_the_same_run_and_variable_as_the_hero_line() -> None:
    forecast = build_forecast(predictions_frame(), intervals_frame())

    assert forecast["band"] == {"variable": "temperature_2m", "lower": [24.63, 23.8], "upper": [27.27, 26.9]}


def test_no_predictions_means_no_forecast() -> None:
    assert build_forecast(predictions_frame().iloc[:0], intervals_frame()) is None
