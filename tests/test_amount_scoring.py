import pandas as pd

from constants import AMOUNT_METHODS
from scoring.precipitation import amount_error


def scored(observed: list[float], boosted: list[float]) -> pd.DataFrame:
    return pd.DataFrame({
        "lead_hours": [24] * len(observed),
        "observed": observed,
        "models": observed,
        "typical": [1.0] * len(observed),
        "boosted": boosted
    })


def test_the_error_is_the_average_distance_from_what_fell() -> None:
    errors = amount_error(scored([1.0, 3.0], [1.5, 2.0]))

    assert list(errors.columns) == AMOUNT_METHODS
    assert errors.loc[24, "boosted"] == 0.75
    assert errors.loc[24, "models"] == 0.0
    assert errors.loc[24, "typical"] == 1.0
