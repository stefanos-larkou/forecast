import json

import numpy as np
import pandas as pd

from constants import BACKFILL_DIR, BLEND_MODEL, CURRENT_MODEL_FILE, FEATURE_COLUMNS, FORECASTS_DIR, HOURS_PER_DAY, INTERVALS_DIR, LIVE_SOURCE, LOWER_MODEL_FILE, METADATA_FILE, MODEL_FILE, MODELS_DIR, OBSERVATIONS_DIR, PHYSICAL_LIMITS, PREDICTIONS_DIR, RAIN_MODEL_FILE, RAIN_PROBABILITY_VARIABLE, RAIN_VARIABLE, REFERENCE_MODEL, UPPER_MODEL_FILE
from model import gbm
from model.features import build_features
from schema import FORECASTS, INTERVALS
from scoring.grading import grade


def load_current_model() -> tuple[str, dict[str, list[dict]]]:
    version = json.loads(CURRENT_MODEL_FILE.read_text())["version"]
    return version, json.loads((MODELS_DIR / version / MODEL_FILE).read_text())


def load_rain_model(version: str) -> list[dict] | None:
    path = MODELS_DIR / version / RAIN_MODEL_FILE
    return json.loads(path.read_text()) if path.exists() else None


def load_interval_models(version: str) -> tuple[dict[str, list[dict]], dict[str, list[dict]], dict[str, dict[str, float]]] | None:
    directory = MODELS_DIR / version
    if not (directory / LOWER_MODEL_FILE).exists():
        return None

    lower_models = json.loads((directory / LOWER_MODEL_FILE).read_text())
    upper_models = json.loads((directory / UPPER_MODEL_FILE).read_text())
    margins = json.loads((directory / METADATA_FILE).read_text())["conformal_margins"]
    return lower_models, upper_models, margins


def lead_bucket(lead_hours: pd.Series) -> pd.Series:
    return np.ceil(lead_hours / HOURS_PER_DAY).astype(FORECASTS.columns["lead_hours"]) * HOURS_PER_DAY


def complete_features(snapshot: pd.DataFrame, graded: pd.DataFrame) -> pd.DataFrame:
    bucketed = snapshot.assign(lead_hours=lead_bucket(snapshot["lead_hours"]))
    features = build_features(bucketed, graded)
    complete = features.dropna(subset=FEATURE_COLUMNS)
    print(f"{len(complete):,} of {len(features):,} rows have every feature", flush=True)
    return complete


def as_live_rows(frame: pd.DataFrame) -> pd.DataFrame:
    return frame.assign(
        lead_hours=(frame["valid_time"] - frame["run_time"]) // pd.Timedelta(hours=1),
        model=BLEND_MODEL,
        source=LIVE_SOURCE
    )


def rain_probabilities(complete: pd.DataFrame, trees: list[dict]) -> pd.DataFrame:
    rows = complete[complete["variable"] == RAIN_VARIABLE]
    probability = gbm.predict(trees, rows[FEATURE_COLUMNS].to_numpy("float64")).clip(0, 1)
    return rows[["location", "run_time", "valid_time"]].assign(variable=RAIN_PROBABILITY_VARIABLE, value=probability)


def predict(complete: pd.DataFrame, models: dict[str, list[dict]], rain_model: list[dict] | None) -> pd.DataFrame:
    frames = []
    for variable, trees in models.items():
        rows = complete[complete["variable"] == variable]
        correction = gbm.predict(trees, rows[FEATURE_COLUMNS].to_numpy("float64"))
        lower, upper = PHYSICAL_LIMITS[variable]
        value = (rows[REFERENCE_MODEL] + correction).clip(lower, upper)
        frames.append(rows[["location", "run_time", "valid_time", "variable"]].assign(value=value))

    if rain_model is None:
        print("The current model has no rain model, so no rain probabilities are written.")
    else:
        frames.append(rain_probabilities(complete, rain_model))

    return FORECASTS.finalise(as_live_rows(pd.concat(frames, ignore_index=True)))


def intervals(complete: pd.DataFrame, lower_models: dict[str, list[dict]], upper_models: dict[str, list[dict]], margins: dict[str, dict[str, float]]) -> pd.DataFrame:
    frames = []
    for variable in lower_models:
        rows = complete[complete["variable"] == variable]
        features = rows[FEATURE_COLUMNS].to_numpy("float64")
        margin = rows["lead_hours"].astype(str).map(margins[variable])
        lower = rows[REFERENCE_MODEL] + gbm.predict(lower_models[variable], features) - margin
        upper = rows[REFERENCE_MODEL] + gbm.predict(upper_models[variable], features) + margin
        low, high = PHYSICAL_LIMITS[variable]
        frames.append(rows[["location", "run_time", "valid_time", "variable"]].assign(
            lower=np.minimum(lower, upper).clip(low, high),
            upper=np.maximum(lower, upper).clip(low, high)
        ))

    return INTERVALS.finalise(as_live_rows(pd.concat(frames, ignore_index=True)))


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
    complete = complete_features(snapshot, graded)

    predictions = predict(complete, models, load_rain_model(version))
    FORECASTS.write(predictions, path)
    print(f"{len(predictions):,} predictions, lead hours {predictions['lead_hours'].min()} to {predictions['lead_hours'].max()} -> {path}")

    interval_models = load_interval_models(version)
    if interval_models is None:
        print(f"Model {version} has no interval models, so no intervals are written.")
        return

    bands = intervals(complete, *interval_models)
    interval_path = INTERVALS_DIR / snapshot_path.relative_to(FORECASTS_DIR)
    INTERVALS.write(bands, interval_path)
    print(f"{len(bands):,} intervals -> {interval_path}")


if __name__ == "__main__":
    main()
