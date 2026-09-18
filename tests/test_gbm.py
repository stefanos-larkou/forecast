import json

import lightgbm
import numpy as np

from constants import BOOSTING_ROUNDS, LEARNING_RATE, MIN_LEAF_ROWS, TREE_MAX_DEPTH
from model import gbm


def synthetic_rows() -> tuple[np.ndarray, np.ndarray]:
    generator = np.random.default_rng(0)
    features = generator.integers(1, 21, size=(2000, 4)).astype(float)
    target = 2.0 * (features[:, 0] > 10) - 0.1 * features[:, 1] + generator.normal(0, 0.5, 2000)
    return features, target


def lightgbm_predictions(features: np.ndarray, target: np.ndarray, points: np.ndarray) -> np.ndarray:
    settings = {
        "objective": "regression",
        "learning_rate": LEARNING_RATE,
        "max_depth": TREE_MAX_DEPTH,
        "num_leaves": 2 ** TREE_MAX_DEPTH,
        "min_data_in_leaf": MIN_LEAF_ROWS,
        "min_sum_hessian_in_leaf": 0,
        "lambda_l1": 0,
        "lambda_l2": 0,
        "min_gain_to_split": 0,
        "bagging_fraction": 1.0,
        "feature_fraction": 1.0,
        "boost_from_average": False,
        "deterministic": True,
        "force_row_wise": True,
        "verbose": -1
    }
    booster = lightgbm.train(settings, lightgbm.Dataset(features, target), num_boost_round=BOOSTING_ROUNDS)
    return booster.predict(points)


def test_predictions_match_lightgbm_on_and_between_the_training_values() -> None:
    features, target = synthetic_rows()
    points = np.vstack([features, features + 0.25])
    ours = gbm.predict(gbm.fit(features, target), points)

    assert np.abs(ours - lightgbm_predictions(features, target, points)).max() < 1e-6


def test_a_model_survives_a_json_round_trip() -> None:
    features, target = synthetic_rows()
    trees = gbm.fit(features, target)
    reloaded = json.loads(json.dumps(trees))

    assert np.array_equal(gbm.predict(reloaded, features), gbm.predict(trees, features))
