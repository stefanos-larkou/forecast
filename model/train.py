import json
import subprocess
import sys
import time
from dataclasses import asdict
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd

from constants import AMOUNT_MODEL_FILE, AMOUNT_QUANTILE, BYTES_PER_KB, CALIBRATION_MONTHS, CURRENT_MODEL_FILE, FEATURE_COLUMNS, HYPERPARAMETERS, JSON_INDENT, LOWER_MODEL_FILE, LOWER_QUANTILE, MAE_VARIABLES, METADATA_FILE, MODEL_FILE, MODEL_FORMAT, MODEL_VERSION_FORMAT, MODELS_DIR, OVERWRITE, PROMOTION_TOLERANCE, RAIN_AMOUNT_VARIABLE, RAIN_MODEL_FILE, RAIN_VARIABLE, SCORING_KEY, TRAINING_WINDOW_MONTHS, UPPER_MODEL_FILE, UPPER_QUANTILE, WET_HOUR_MM
from model import gbm
from model.training import load_training_data
from scoring.evaluate import boosted_forecasts
from scoring.precipitation import wet


def training_window(trained: pd.DataFrame, end: pd.Timestamp) -> pd.DataFrame:
    start = end - pd.DateOffset(months=TRAINING_WINDOW_MONTHS)
    return trained[(trained["valid_time"] > start) & (trained["valid_time"] <= end)]


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


def fit_models(window: pd.DataFrame, quantile: float | None = None) -> tuple[dict[str, list[dict]], dict[str, int]]:
    label = "point" if quantile is None else f"{quantile:.0%} quantile"
    print(f"Training {label} models on {window['valid_time'].min()} to {window['valid_time'].max()}", flush=True)

    models = {}
    rows = {}
    for variable in MAE_VARIABLES:
        subset = window[window["variable"] == variable]
        print(f"  {variable}: training on {len(subset):,} rows...", end=" ", flush=True)
        began = time.perf_counter()
        models[variable] = gbm.fit(subset[FEATURE_COLUMNS].to_numpy("float64"), subset["target"].to_numpy("float64"), quantile)
        rows[variable] = len(subset)
        print(f"done in {time.perf_counter() - began:.0f}s", flush=True)

    return models, rows


def fit_rain_model(window: pd.DataFrame) -> tuple[list[dict], int]:
    rows = window[window["variable"] == RAIN_VARIABLE]
    outcome = wet(rows["observed"])

    print(f"Training the rain model on {len(rows):,} rows, {outcome.mean():.2%} of their hours wet...", end=" ", flush=True)
    began = time.perf_counter()
    trees = gbm.fit(rows[FEATURE_COLUMNS].to_numpy("float64"), outcome.to_numpy("float64"))
    print(f"done in {time.perf_counter() - began:.0f}s", flush=True)

    return trees, len(rows)


def fit_amount_model(window: pd.DataFrame) -> tuple[list[dict], int]:
    rows = window[(window["variable"] == RAIN_VARIABLE) & (window["observed"] >= WET_HOUR_MM)]

    print(f"Training the amount model on {len(rows):,} wet rows, {rows['observed'].median():.2f} mm in a typical one...", end=" ", flush=True)
    began = time.perf_counter()
    trees = gbm.fit(rows[FEATURE_COLUMNS].to_numpy("float64"), rows["observed"].to_numpy("float64"), AMOUNT_QUANTILE)
    print(f"done in {time.perf_counter() - began:.0f}s", flush=True)

    return trees, len(rows)


def conformal_margin(scores: pd.Series) -> float:
    coverage = UPPER_QUANTILE - LOWER_QUANTILE
    level = min(1.0, np.ceil((len(scores) + 1) * coverage) / len(scores))
    return float(np.quantile(scores, level, method="higher"))


def calibrate(calibration: pd.DataFrame, lower_models: dict[str, list[dict]], upper_models: dict[str, list[dict]]) -> dict[str, dict[str, float]]:
    print(f"Calibrating on {calibration['valid_time'].min()} to {calibration['valid_time'].max()}:", flush=True)
    margins = {}
    for variable in MAE_VARIABLES:
        rows = calibration[calibration["variable"] == variable]
        features = rows[FEATURE_COLUMNS].to_numpy("float64")

        lower = gbm.predict(lower_models[variable], features)
        upper = gbm.predict(upper_models[variable], features)

        scores = pd.Series(np.maximum(lower - rows["target"], rows["target"] - upper), index=rows.index)
        margins[variable] = {str(lead): conformal_margin(group) for lead, group in scores.groupby(rows["lead_hours"])}
        print(f"  {variable}: {(scores <= 0).mean():.1%} inside the uncalibrated band, margins {margins[variable]}", flush=True)

    return margins


def build_metadata(version: str, window: pd.DataFrame, rows: dict[str, int], quantile_window: pd.DataFrame, calibration: pd.DataFrame, margins: dict[str, dict[str, float]], backtested: pd.DataFrame, promoted: bool) -> dict:
    return {
        "version": version,
        "format": MODEL_FORMAT,
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "commit": commit_sha(),
        "training_window": {"from": window["valid_time"].min().isoformat(), "to": window["valid_time"].max().isoformat()},
        "rows": rows,
        "features": FEATURE_COLUMNS,
        "hyperparameters": {
            **asdict(HYPERPARAMETERS),
            "training_window_months": TRAINING_WINDOW_MONTHS,
            "lower_quantile": LOWER_QUANTILE,
            "upper_quantile": UPPER_QUANTILE,
            "calibration_months": CALIBRATION_MONTHS,
            "wet_hour_mm": WET_HOUR_MM
        },
        "quantile_training_window": {"from": quantile_window["valid_time"].min().isoformat(), "to": quantile_window["valid_time"].max().isoformat()},
        "calibration_window": {"from": calibration["valid_time"].min().isoformat(), "to": calibration["valid_time"].max().isoformat()},
        "conformal_margins": margins,
        "backtest": backtest_scores(backtested, backtested["valid_time"].max()),
        "promoted": promoted
    }


def save(directory: Path, files: dict[str, dict]) -> None:
    directory.mkdir(parents=True, exist_ok=True)
    for name, content in files.items():
        (directory / name).write_text(json.dumps(content, indent=JSON_INDENT if name == METADATA_FILE else None))
    print(f"Saved {directory} ({sum((directory / name).stat().st_size for name in files) / BYTES_PER_KB:.0f} KB)")


def promote(version: str) -> None:
    CURRENT_MODEL_FILE.write_text(json.dumps({"version": version}, indent=JSON_INDENT))
    print(f"Promoted: {CURRENT_MODEL_FILE} now points at {version}")


def main() -> None:
    version = datetime.now(timezone.utc).strftime(MODEL_VERSION_FORMAT)
    directory = MODELS_DIR / version
    if directory.exists() and OVERWRITE not in sys.argv[1:]:
        raise SystemExit(f"{directory} already exists. Pass '{OVERWRITE}' to train over it.")

    _, _, trained = load_training_data()
    backtested = backtest(trained)
    promoted = should_promote(backtested)

    end = trained["valid_time"].max()
    window = training_window(trained, end)
    models, rows = fit_models(window)
    rain_model, rows[RAIN_VARIABLE] = fit_rain_model(window)
    amount_model, rows[RAIN_AMOUNT_VARIABLE] = fit_amount_model(window)

    calibration_start = end - pd.DateOffset(months=CALIBRATION_MONTHS)
    quantile_window = training_window(trained, calibration_start)
    calibration = trained[trained["valid_time"] > calibration_start]
    lower_models, _ = fit_models(quantile_window, LOWER_QUANTILE)
    upper_models, _ = fit_models(quantile_window, UPPER_QUANTILE)
    margins = calibrate(calibration, lower_models, upper_models)

    save(directory, {
        MODEL_FILE: models,
        RAIN_MODEL_FILE: rain_model,
        AMOUNT_MODEL_FILE: amount_model,
        LOWER_MODEL_FILE: lower_models,
        UPPER_MODEL_FILE: upper_models,
        METADATA_FILE: build_metadata(version, window, rows, quantile_window, calibration, margins, backtested, promoted)
    })

    if promoted:
        promote(version)
    else:
        print(f"Not promoted: {CURRENT_MODEL_FILE} still points at the incumbent.")


if __name__ == "__main__":
    main()
