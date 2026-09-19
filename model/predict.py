import json

import numpy as np
import pandas as pd

from constants import BACKFILL_DIR, BLEND_MODEL, CURRENT_MODEL_FILE, FEATURE_COLUMNS, FORECASTS_DIR, HOURS_PER_DAY, LIVE_SOURCE, MODEL_FILE, MODELS_DIR, OBSERVATIONS_DIR, PHYSICAL_LIMITS, PREDICTIONS_DIR, REFERENCE_MODEL
from model import gbm
from model.features import build_features
from schema import FORECASTS
from scoring.grading import grade


def load_current_model() -> tuple[str, dict[str, list[dict]]]:
    version = json.loads(CURRENT_MODEL_FILE.read_text())["version"]
    return version, json.loads((MODELS_DIR / version / MODEL_FILE).read_text())


def lead_bucket(lead_hours: pd.Series) -> pd.Series:
    return np.ceil(lead_hours / HOURS_PER_DAY).astype(FORECASTS.columns["lead_hours"]) * HOURS_PER_DAY


def predict(snapshot: pd.DataFrame, graded: pd.DataFrame, models: dict[str, list[dict]]) -> pd.DataFrame:
    bucketed = snapshot.assign(lead_hours=lead_bucket(snapshot["lead_hours"]))
    features = build_features(bucketed, graded)
    complete = features.dropna(subset=FEATURE_COLUMNS)
    print(f"{len(complete):,} of {len(features):,} rows have every feature", flush=True)

    frames = []
    for variable, trees in models.items():
        rows = complete[complete["variable"] == variable]
        correction = gbm.predict(trees, rows[FEATURE_COLUMNS].to_numpy("float64"))
        lower, upper = PHYSICAL_LIMITS[variable]
        value = (rows[REFERENCE_MODEL] + correction).clip(lower, upper)
        frames.append(rows[["location", "run_time", "valid_time", "variable"]].assign(value=value))

    predictions = pd.concat(frames, ignore_index=True)
    return FORECASTS.finalise(predictions.assign(
        lead_hours=(predictions["valid_time"] - predictions["run_time"]) // pd.Timedelta(hours=1),
        model=BLEND_MODEL,
        source=LIVE_SOURCE
    ))


def main() -> None:
    snapshot_path = max(FORECASTS_DIR.rglob("*.parquet"))
    path = PREDICTIONS_DIR / snapshot_path.relative_to(FORECASTS_DIR)
    if path.exists():
        print(f"{path} already exists. The prediction will not be overwritten.")
        return

    version, models = load_current_model()
    print(f"Predicting {snapshot_path} with model {version}", flush=True)
    snapshot = pd.read_parquet(snapshot_path)
    graded = grade(pd.read_parquet(BACKFILL_DIR), pd.read_parquet(OBSERVATIONS_DIR))

    predictions = predict(snapshot, graded, models)
    FORECASTS.write(predictions, path)
    print(f"{len(predictions):,} predictions, lead hours {predictions['lead_hours'].min()} to {predictions['lead_hours'].max()} -> {path}")


if __name__ == "__main__":
    main()
