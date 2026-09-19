import json
import subprocess
import time
from datetime import datetime, timezone

import pandas as pd

from constants import BOOSTING_ROUNDS, BYTES_PER_KB, CURRENT_MODEL_FILE, FEATURE_COLUMNS, JSON_INDENT, LEARNING_RATE, MAE_VARIABLES, METADATA_FILE, MIN_LEAF_ROWS, MODEL_FILE, MODEL_VERSION_FORMAT, MODELS_DIR, TRAINING_WINDOW_MONTHS, TREE_MAX_DEPTH
from model import gbm
from model.training import load_training_data


def training_window(trained: pd.DataFrame) -> pd.DataFrame:
    end = trained["valid_time"].max()
    return trained[trained["valid_time"] > end - pd.DateOffset(months=TRAINING_WINDOW_MONTHS)]


def commit_sha() -> str:
    return subprocess.run(["git", "rev-parse", "HEAD"], capture_output=True, text=True, check=True).stdout.strip()


def main() -> None:
    version = datetime.now(timezone.utc).strftime(MODEL_VERSION_FORMAT)
    directory = MODELS_DIR / version
    if directory.exists():
        print(f"{directory} already exists. The model will not be overwritten.")
        return

    _, _, trained = load_training_data()
    window = training_window(trained)
    print(f"Training window: {window['valid_time'].min()} to {window['valid_time'].max()}", flush=True)

    models = {}
    rows = {}
    for variable in MAE_VARIABLES:
        subset = window[window["variable"] == variable]
        print(f"  {variable}: training on {len(subset):,} rows...", end=" ", flush=True)
        began = time.perf_counter()
        models[variable] = gbm.fit(subset[FEATURE_COLUMNS].to_numpy("float64"), subset["target"].to_numpy("float64"))
        rows[variable] = len(subset)
        print(f"done in {time.perf_counter() - began:.0f}s", flush=True)

    metadata = {
        "version": version,
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "commit": commit_sha(),
        "training_window": {"from": window["valid_time"].min().isoformat(), "to": window["valid_time"].max().isoformat()},
        "rows": rows,
        "features": FEATURE_COLUMNS,
        "hyperparameters": {
            "tree_max_depth": TREE_MAX_DEPTH,
            "min_leaf_rows": MIN_LEAF_ROWS,
            "boosting_rounds": BOOSTING_ROUNDS,
            "learning_rate": LEARNING_RATE,
            "training_window_months": TRAINING_WINDOW_MONTHS
        }
    }

    directory.mkdir(parents=True)
    (directory / MODEL_FILE).write_text(json.dumps(models))
    (directory / METADATA_FILE).write_text(json.dumps(metadata, indent=JSON_INDENT))
    CURRENT_MODEL_FILE.write_text(json.dumps({"version": version}, indent=JSON_INDENT))
    print(f"Saved {directory} ({(directory / MODEL_FILE).stat().st_size / BYTES_PER_KB:.0f} KB) and pointed {CURRENT_MODEL_FILE} at it")


if __name__ == "__main__":
    main()
