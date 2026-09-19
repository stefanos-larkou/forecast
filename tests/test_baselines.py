import pandas as pd

from scoring.baselines import climatology, with_bias_correction, with_climatology, with_persistence


def test_persistence_is_the_observation_lead_hours_before_valid_time() -> None:
    observations = pd.DataFrame({
        "location": "larnaca",
        "variable": "temperature_2m",
        "valid_time": pd.date_range("2026-01-01", periods=72, freq="h", tz="UTC"),
        "value": [float(hour) for hour in range(72)]
    })
    forecasts = pd.DataFrame({
        "location": ["larnaca"],
        "variable": ["temperature_2m"],
        "valid_time": [pd.Timestamp("2026-01-03 06:00", tz="UTC")],
        "lead_hours": [48]
    })

    assert with_persistence(forecasts, observations)["persisted"].iloc[0] == 6.0


def test_a_forecast_that_ran_warm_is_corrected_downwards() -> None:
    graded = pd.DataFrame({
        "location": "larnaca",
        "model": "gfs_seamless",
        "variable": "temperature_2m",
        "lead_hours": 24,
        "valid_time": pd.date_range("2026-01-01", periods=30 * 24, freq="h", tz="UTC"),
        "error": 2.0
    })
    forecast = pd.DataFrame({
        "location": ["larnaca"],
        "model": ["gfs_seamless"],
        "variable": ["temperature_2m"],
        "lead_hours": [24],
        "run_time": [pd.Timestamp("2026-01-25", tz="UTC")],
        "value": [20.0]
    })

    assert with_bias_correction(forecast, graded)["value_corrected"].iloc[0] == 18.0


def test_climatology_averages_the_same_hour_over_a_31_day_window_that_wraps_around_the_year() -> None:
    valid_time = pd.date_range("2024-01-01", "2024-12-31 23:00", freq="h", tz="UTC")
    history = pd.DataFrame({
        "location": "larnaca",
        "variable": "temperature_2m",
        "valid_time": valid_time,
        "value": [41.0 if time == pd.Timestamp("2024-01-01 12:00", tz="UTC") else 10.0 for time in valid_time]
    })
    forecasts = pd.DataFrame({
        "location": "larnaca",
        "variable": "temperature_2m",
        "valid_time": pd.to_datetime(["2026-01-01 12:00", "2026-01-16 12:00", "2026-01-17 12:00", "2026-12-26 12:00", "2026-01-01 13:00"], utc=True)
    })

    assert with_climatology(forecasts, climatology(history))["climatology"].tolist() == [11.0, 11.0, 10.0, 11.0, 10.0]
