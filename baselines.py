import pandas as pd

from features import trailing_bias, with_trailing_bias


def with_persistence(forecasts: pd.DataFrame, observations: pd.DataFrame) -> pd.DataFrame:
    persisted = observations.rename(columns={"valid_time": "persisted_from", "value": "persisted"})
    forecasts = forecasts.assign(persisted_from=forecasts["valid_time"] - pd.to_timedelta(forecasts["lead_hours"], unit="h"))
    return forecasts.merge(persisted, on=["location", "variable", "persisted_from"], how="left", validate="many_to_one")


def with_bias_correction(forecasts: pd.DataFrame, graded: pd.DataFrame) -> pd.DataFrame:
    corrected = with_trailing_bias(forecasts, trailing_bias(graded))
    return corrected.assign(value_corrected=corrected["value"] - corrected["trailing_bias"])
