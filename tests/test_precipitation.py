import pandas as pd

from scoring.precipitation import wet


def test_an_hour_of_exactly_the_threshold_counts_as_wet() -> None:
    assert wet(pd.Series([0.0, 0.09, 0.1, 0.2])).tolist() == [0.0, 0.0, 1.0, 1.0]
