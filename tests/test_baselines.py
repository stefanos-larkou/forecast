import pandas as pd

from scoring.baselines import with_bias_correction, with_persistence


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
