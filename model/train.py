import json
import subprocess
import time
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

from constants import BOOSTING_ROUNDS, BYTES_PER_KB, CURRENT_MODEL_FILE, FEATURE_COLUMNS, JSON_INDENT, LEARNING_RATE, MAE_VARIABLES, METADATA_FILE, MIN_LEAF_ROWS, MODEL_FILE, MODEL_VERSION_FORMAT, MODELS_DIR, PROMOTION_TOLERANCE, SCORING_KEY, TRAINING_WINDOW_MONTHS, TREE_MAX_DEPTH
from model import gbm
from model.training import load_training_data
from scoring.evaluate import boosted_forecasts


def training_window(trained: pd.DataFrame) -> pd.DataFrame:
    end = trained["valid_time"].max()
    return trained[trained["valid_time"] > end - pd.DateOffset(months=TRAINING_WINDOW_MONTHS)]


def commit_sha() -> str:
    return subprocess.run(["git", "rev-parse", "HEAD"], capture_output=True, text=True, check=True).stdout.strip()


def backtest(trained: pd.DataFrame) -> pd.DataFrame:
    print("Backtesting the candidate on rolling-origin folds:", flush=True)
    return boosted_forecasts(trained).merge(trained[[*SCORING_KEY, "observed"]], on=SCORING_KEY, how="inner", validate="one_to_one")


def backtest_scores(backtested: pd.DataFrame, until: pd.Timestamp) -> dict:
    scored = backtested[backtested["valid_time"] <= until]
    errors = (scored["boosted"] - scored["observed"]).abs().groupby(scored["variable"], observed=True)
    return {"until": until.isoformat(), "mae": errors.mean().to_dict(), "forecasts": errors.size().to_dict()}


def incumbent_backtest() -> dict | None:
    version = json.loads(CURRENT_MODEL_FILE.read_text())["version"]
    return json.loads((MODELS_DIR / version / METADATA_FILE).read_text()).get("backtest")


def passes_gate(candidate: dict, incumbent: dict) -> bool:
    if candidate["forecasts"] != incumbent["forecasts"]:
        print(f"Not comparable: the incumbent scored {incumbent['forecasts']}, the candidate {candidate['forecasts']}")
        return False

    for variable in MAE_VARIABLES:
        print(f"  {variable}: incumbent {incumbent['mae'][variable]:.4f}, candidate {candidate['mae'][variable]:.4f}")

    return all(candidate["mae"][variable] <= incumbent["mae"][variable] + PROMOTION_TOLERANCE for variable in MAE_VARIABLES)


def should_promote(backtested: pd.DataFrame) -> bool:
    incumbent = incumbent_backtest()
    if incumbent is None:
        print("The incumbent has no recorded backtest, so the candidate is promoted.")
        return True

    print(f"Comparing on forecasts up to {incumbent['until']}:")
    return passes_gate(backtest_scores(backtested, pd.Timestamp(incumbent["until"])), incumbent)


def fit_models(window: pd.DataFrame) -> tuple[dict[str, list[dict]], dict[str, int]]:
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

    return models, rows


def build_metadata(version: str, window: pd.DataFrame, rows: dict[str, int], backtested: pd.DataFrame, promoted: bool) -> dict:
    return {
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
        },
        "backtest": backtest_scores(backtested, backtested["valid_time"].max()),
        "promoted": promoted
    }


def save(directory: Path, models: dict[str, list[dict]], metadata: dict) -> None:
    directory.mkdir(parents=True)
    (directory / MODEL_FILE).write_text(json.dumps(models))
    (directory / METADATA_FILE).write_text(json.dumps(metadata, indent=JSON_INDENT))
    print(f"Saved {directory} ({(directory / MODEL_FILE).stat().st_size / BYTES_PER_KB:.0f} KB)")


def promote(version: str) -> None:
    CURRENT_MODEL_FILE.write_text(json.dumps({"version": version}, indent=JSON_INDENT))
    print(f"Promoted: {CURRENT_MODEL_FILE} now points at {version}")


def main() -> None:
    version = datetime.now(timezone.utc).strftime(MODEL_VERSION_FORMAT)
    directory = MODELS_DIR / version
    if directory.exists():
        print(f"{directory} already exists. The model will not be overwritten.")
        return

    _, _, trained = load_training_data()
    backtested = backtest(trained)
    promoted = should_promote(backtested)

    window = training_window(trained)
    models, rows = fit_models(window)
    save(directory, models, build_metadata(version, window, rows, backtested, promoted))

    if promoted:
        promote(version)
    else:
        print(f"Not promoted: {CURRENT_MODEL_FILE} still points at the incumbent.")


if __name__ == "__main__":
    main()
