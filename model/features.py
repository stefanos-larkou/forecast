import numpy as np
import pandas as pd

from constants import BIAS_MIN_DAYS, BIAS_WINDOW_DAYS, DAYS_PER_YEAR, ERA5_LAG_DAYS, HOURS_PER_DAY, MODEL_MAX_LEAD_HOURS, MODELS, SERIES_KEY


def trailing_bias(graded: pd.DataFrame) -> pd.DataFrame:
    return (
        graded.sort_values("valid_time")
        .set_index("valid_time")
        .groupby(SERIES_KEY, observed=True)["error"]
        .rolling(f"{BIAS_WINDOW_DAYS}D", min_periods=BIAS_MIN_DAYS * HOURS_PER_DAY)
        .mean()
        .rename("trailing_bias")
        .reset_index()
        .rename(columns={"valid_time": "as_of"})
    )


def with_trailing_bias(forecasts: pd.DataFrame, trailing: pd.DataFrame) -> pd.DataFrame:
    forecasts = forecasts.assign(as_of=forecasts["run_time"] - pd.Timedelta(days=ERA5_LAG_DAYS))
    return pd.merge_asof(
        forecasts.sort_values("as_of"),
        trailing.sort_values("as_of"),
        on="as_of",
        by=SERIES_KEY,
        direction="backward"
    )


def cyclic(values: pd.Series, period: float) -> tuple[pd.Series, pd.Series]:
    angle = 2 * np.pi * values / period
    return np.sin(angle), np.cos(angle)


def build_features(forecasts: pd.DataFrame, graded: pd.DataFrame) -> pd.DataFrame:
    forecasts = forecasts[forecasts["lead_hours"] <= MODEL_MAX_LEAD_HOURS]
    long = with_trailing_bias(forecasts, trailing_bias(graded))
    wide = long.pivot(
        index=["location", "variable", "run_time", "valid_time", "lead_hours"],
        columns="model",
        values=["value", "trailing_bias"]
    )
    wide.columns = [model if field == "value" else f"{model}_{field}" for field, model in wide.columns]
    wide = wide.reset_index()

    hour_sin, hour_cos = cyclic(wide["valid_time"].dt.hour, HOURS_PER_DAY)
    day_sin, day_cos = cyclic(wide["valid_time"].dt.dayofyear, DAYS_PER_YEAR)
    return wide.assign(
        spread=wide[MODELS].max(axis=1) - wide[MODELS].min(axis=1),
        hour_sin=hour_sin,
        hour_cos=hour_cos,
        day_sin=day_sin,
        day_cos=day_cos
    )
