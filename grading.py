import pandas as pd

from constants import REFERENCE_MODEL


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


def with_target(features: pd.DataFrame, observations: pd.DataFrame) -> pd.DataFrame:
    trained = features.merge(
        observations.rename(columns={"value": "observed"}),
        on=["location", "variable", "valid_time"],
        how="inner",
        validate="many_to_one"
    )
    trained["target"] = trained["observed"] - trained[REFERENCE_MODEL]
    return trained
