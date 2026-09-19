import pandas as pd

from constants import BACKFILL_DIR, FEATURE_COLUMNS, OBSERVATIONS_DIR
from model.features import build_features
from scoring.grading import grade, with_target


def load_training_data() -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    print("Loading forecasts and observations...", flush=True)
    observations = pd.read_parquet(OBSERVATIONS_DIR)
    forecasts = pd.read_parquet(BACKFILL_DIR)
    graded = grade(forecasts, observations)

    print("Building features...", flush=True)
    trained = with_target(build_features(forecasts, graded), observations).dropna(subset=[*FEATURE_COLUMNS, "target"])
    return observations, graded, trained
