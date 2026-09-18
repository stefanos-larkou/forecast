import pandas as pd

from constants import ERA5_LAG_DAYS, MODEL_MAX_LEAD_HOURS, MODELS
from model.features import build_features, trailing_bias, with_trailing_bias


def hourly_errors(days: int) -> pd.DataFrame:
    return pd.DataFrame({
        "location": "larnaca",
        "model": "gfs_seamless",
        "variable": "temperature_2m",
        "lead_hours": 24,
        "valid_time": pd.date_range("2026-01-01", periods=days * 24, freq="h", tz="UTC"),
        "error": 1.0
    })


def one_forecast(run_time: pd.Timestamp) -> pd.DataFrame:
    return pd.DataFrame({
        "location": ["larnaca"],
        "model": ["gfs_seamless"],
        "variable": ["temperature_2m"],
        "lead_hours": [24],
        "run_time": [run_time]
    })


def bias_for(graded: pd.DataFrame, forecast: pd.DataFrame) -> float:
    return with_trailing_bias(forecast, trailing_bias(graded))["trailing_bias"].iloc[0]


def three_model_history(days: int) -> pd.DataFrame:
    return pd.concat([hourly_errors(days).assign(model=model) for model in MODELS], ignore_index=True)


def three_model_forecast(run_time: pd.Timestamp, lead_hours: int) -> pd.DataFrame:
    return pd.DataFrame({
        "location": "larnaca",
        "model": MODELS,
        "variable": "temperature_2m",
        "lead_hours": lead_hours,
        "run_time": run_time,
        "valid_time": run_time + pd.Timedelta(hours=lead_hours),
        "value": [20.0, 21.0, 22.0]
    })


def test_errors_after_as_of_do_not_change_the_bias_across_a_gap() -> None:
    forecast = one_forecast(pd.Timestamp("2026-02-10", tz="UTC"))
    as_of = forecast["run_time"].iloc[0] - pd.Timedelta(days=ERA5_LAG_DAYS)
    graded = hourly_errors(days=60)
    graded = graded[~graded["valid_time"].between(as_of - pd.Timedelta(hours=1), as_of)]
    tampered = graded.assign(error=graded["error"].where(graded["valid_time"] < as_of, 1000.0))

    assert bias_for(tampered, forecast) == bias_for(graded, forecast) == 1.0


def test_an_error_at_as_of_is_used() -> None:
    graded = hourly_errors(days=60)
    forecast = one_forecast(pd.Timestamp("2026-02-10", tz="UTC"))
    as_of = forecast["run_time"].iloc[0] - pd.Timedelta(days=ERA5_LAG_DAYS)
    tampered = graded.assign(error=graded["error"].where(graded["valid_time"] != as_of, 1000.0))

    assert bias_for(tampered, forecast) > 1.0


def test_no_bias_before_a_week_of_errors() -> None:
    graded = hourly_errors(days=60)
    forecast = one_forecast(pd.Timestamp("2026-01-10", tz="UTC"))

    assert pd.isna(bias_for(graded, forecast))


def test_build_features_ignores_errors_after_as_of() -> None:
    forecasts = three_model_forecast(pd.Timestamp("2026-02-10", tz="UTC"), lead_hours=24)
    as_of = forecasts["run_time"].iloc[0] - pd.Timedelta(days=ERA5_LAG_DAYS)
    graded = three_model_history(days=60)
    tampered = graded.assign(error=graded["error"].where(graded["valid_time"] <= as_of, 1000.0))

    assert build_features(forecasts, tampered).equals(build_features(forecasts, graded))


def test_build_features_leaves_out_leads_beyond_the_model() -> None:
    run_time = pd.Timestamp("2026-02-10", tz="UTC")
    forecasts = pd.concat([
        three_model_forecast(run_time, lead_hours=MODEL_MAX_LEAD_HOURS),
        three_model_forecast(run_time, lead_hours=MODEL_MAX_LEAD_HOURS + 24)
    ])

    assert build_features(forecasts, three_model_history(days=60))["lead_hours"].tolist() == [MODEL_MAX_LEAD_HOURS]
