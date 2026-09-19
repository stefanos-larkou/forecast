import numpy as np
import pandas as pd

from constants import CLIMATOLOGY_WINDOW_DAYS
from model.features import trailing_bias, with_trailing_bias


def with_persistence(forecasts: pd.DataFrame, observations: pd.DataFrame) -> pd.DataFrame:
    persisted = observations.rename(columns={"valid_time": "persisted_from", "value": "persisted"})
    forecasts = forecasts.assign(persisted_from=forecasts["valid_time"] - pd.to_timedelta(forecasts["lead_hours"], unit="h"))
    return forecasts.merge(persisted, on=["location", "variable", "persisted_from"], how="left", validate="many_to_one")


def with_bias_correction(forecasts: pd.DataFrame, graded: pd.DataFrame) -> pd.DataFrame:
    corrected = with_trailing_bias(forecasts, trailing_bias(graded))
    return corrected.assign(value_corrected=corrected["value"] - corrected["trailing_bias"])


def climatology(history: pd.DataFrame) -> pd.DataFrame:
    keyed = history.assign(day=history["valid_time"].dt.dayofyear, hour=history["valid_time"].dt.hour)
    daily = keyed.groupby(["location", "variable", "hour", "day"], observed=True)["value"].agg(["sum", "count"])
    sums = daily["sum"].unstack("day")
    counts = daily["count"].unstack("day")

    shifts = range(-(CLIMATOLOGY_WINDOW_DAYS // 2), CLIMATOLOGY_WINDOW_DAYS // 2 + 1)
    window_sums = sum(np.roll(sums.to_numpy(), shift, axis=1) for shift in shifts)
    window_counts = sum(np.roll(counts.to_numpy(), shift, axis=1) for shift in shifts)
    means = pd.DataFrame(window_sums / window_counts, index=sums.index, columns=sums.columns)
    return means.stack().rename("climatology").reset_index()


def with_climatology(forecasts: pd.DataFrame, table: pd.DataFrame) -> pd.DataFrame:
    keyed = forecasts.assign(day=forecasts["valid_time"].dt.dayofyear, hour=forecasts["valid_time"].dt.hour)
    return keyed.merge(table, on=["location", "variable", "hour", "day"], how="left", validate="many_to_one").drop(columns=["day", "hour"])
