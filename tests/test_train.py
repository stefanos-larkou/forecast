import pandas as pd
import pytest

from constants import FEATURE_COLUMNS, RAIN_VARIABLE, WET_HOUR_MM
from model import gbm
from model.train import fit_amount_model


def window(observed: list[float]) -> pd.DataFrame:
    return pd.DataFrame({
        **{column: [1.0] * len(observed) for column in FEATURE_COLUMNS},
        "variable": RAIN_VARIABLE,
        "observed": observed
    })


def test_the_amount_model_is_trained_on_wet_hours_alone() -> None:
    rows = window([0.0] * 30 + [4.0] * 10)
    trees, trained_on = fit_amount_model(rows)

    assert trained_on == 10
    assert gbm.predict(trees, rows[FEATURE_COLUMNS].head(1).to_numpy("float64")) == pytest.approx(4.0, abs=0.01)


def test_an_hour_of_exactly_the_threshold_is_wet_enough_to_train_on() -> None:
    _, trained_on = fit_amount_model(window([0.09] * 20 + [WET_HOUR_MM] * 20))

    assert trained_on == 20
