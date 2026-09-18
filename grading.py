import pandas as pd


def grade(forecasts: pd.DataFrame, observations: pd.DataFrame) -> pd.DataFrame:
    graded = forecasts.merge(
        observations,
        on=["location", "valid_time", "variable"],
        how="inner",
        suffixes=("", "_observed"),
        validate="many_to_one"
    )
    graded["error"] = graded["value"] - graded["value_observed"]
    return graded
