import pandas as pd

from constants import BIAS_MIN_DAYS, BIAS_WINDOW_DAYS, ERA5_LAG_DAYS, HOURS_PER_DAY, SERIES_KEY


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
