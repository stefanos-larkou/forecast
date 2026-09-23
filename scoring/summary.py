import json
from pathlib import Path
import sys
import time
from datetime import datetime, timezone

import pandas as pd

from constants import AMOUNT_DECIMALS, BACKFILL_DIR, BAND_VARIABLE, BLEND_MODEL, BYTES_PER_KB, CLIMATE_DIR, CURRENT_MODEL_FILE, FORECASTS_DIR, INTERVALS_DIR, JSON_INDENT, LOCATION, METADATA_FILE, MODELS_DIR, OBSERVATIONS_DIR, PREDICTIONS_DIR, RELIABILITY_METHODS, SCORING_KEY, SUMMARY_DECIMALS, SUMMARY_FILE
from model.training import load_training_data
from model.tune import validation_months
from scoring import precipitation
from scoring.baselines import climatology
from scoring.evaluate import boosted_forecasts, fold_starts, score


def current_model() -> dict:
    version = json.loads(CURRENT_MODEL_FILE.read_text())["version"]
    metadata = json.loads((MODELS_DIR / version / METADATA_FILE).read_text())
    return {key: metadata.get(key) for key in ("version", "trained_at", "commit", "training_window")}


def rounded(values: pd.Series) -> list:
    return [round(float(value), SUMMARY_DECIMALS) for value in values]


def crossover(table: pd.DataFrame, variable: str) -> dict:
    rows = table.loc[("mae", variable)]
    return {
        method: next((int(lead) for lead in rows.index if rows.loc[lead, method] >= rows.loc[lead, "climatology"]), None)
        for method in rows.columns if method not in ("climatology", "persisted")
    }


def build_amount(prepared: pd.DataFrame) -> dict:
    scored = precipitation.boosted_amounts(prepared)
    errors = precipitation.amount_error(scored)
    skill = 1 - errors.div(errors["typical"], axis=0)

    return {
        "leads": [int(lead) for lead in errors.index],
        "wet_hours": len(scored),
        "typical_mm": round(float(scored["typical"].median()), AMOUNT_DECIMALS),
        "mae": {method: rounded(errors[method]) for method in errors.columns},
        "skill": {method: rounded(skill[method]) for method in skill.columns}
    }


def build_rain(forecasts: pd.DataFrame, observations: pd.DataFrame, history: pd.DataFrame) -> dict:
    prepared = precipitation.prepare(forecasts, observations, history)
    scored = prepared.merge(precipitation.boosted_probabilities(prepared), on=SCORING_KEY, how="inner", validate="one_to_one")
    brier = precipitation.brier(scored)
    skill = 1 - brier.div(brier["climatology"], axis=0)

    return {
        "leads": [int(lead) for lead in brier.index],
        "wet_share": round(float(scored["wet"].mean()), SUMMARY_DECIMALS),
        "brier": {method: rounded(brier[method]) for method in brier.columns},
        "skill": {method: rounded(skill[method]) for method in skill.columns},
        "amount": build_amount(prepared),
        "reliability": {
            method: [[round(float(row["mean forecast"]), SUMMARY_DECIMALS), round(float(row["observed wet"]), SUMMARY_DECIMALS), int(row["forecasts"])]
                     for _, row in precipitation.reliability(scored, method).iterrows()]
            for method in RELIABILITY_METHODS
        }
    }


def build_backtest() -> dict:
    began = time.perf_counter()
    observations, graded, trained = load_training_data()
    forecasts = pd.read_parquet(BACKFILL_DIR)
    history = pd.read_parquet(CLIMATE_DIR)
    starts = fold_starts(trained)

    print(f"Scoring {len(starts)} folds from {starts[0]}:", flush=True)
    boosted = boosted_forecasts(trained)
    table = score(graded, observations, climatology(history), boosted)
    leads = sorted({lead for _, _, lead in table.index})
    variables = sorted({variable for _, variable, _ in table.index})

    print("Scoring precipitation:", flush=True)
    rain = build_rain(forecasts, observations, history)

    print(f"Backtest built in {time.perf_counter() - began:.0f}s", flush=True)

    return {
        "from": str(starts[0]),
        "to": str(starts[-1]),
        "forecasts": len(boosted),
        "untouched_by_tuning_from": str(max(validation_months(trained)) + 1),
        "leads": leads,
        "metrics": {
            metric: {variable: {method: rounded(table.loc[(metric, variable)][method]) for method in table.columns} for variable in variables}
            for metric in table.index.get_level_values("metric").unique()
        },
        "crossover": {variable: crossover(table, variable) for variable in variables},
        "rain": rain
    }


def build_forecast(predictions: pd.DataFrame, intervals: pd.DataFrame) -> dict | None:
    if predictions.empty:
        return None

    run_time = predictions["run_time"].max()
    hours = predictions[predictions["run_time"] == run_time].pivot(index="valid_time", columns="variable", values="value").sort_index()
    band = intervals[(intervals["run_time"] == run_time) & (intervals["variable"] == BAND_VARIABLE)].set_index("valid_time").sort_index()

    return {
        "run_time": run_time.isoformat(),
        "hours": [hour.isoformat() for hour in hours.index],
        "variables": {variable: rounded(hours[variable]) for variable in hours.columns if hours[variable].notna().all()},
        "band": {"variable": BAND_VARIABLE, "lower": rounded(band["lower"]), "upper": rounded(band["upper"])}
    }


def build_live(predictions: pd.DataFrame, intervals: pd.DataFrame) -> dict:
    forecasts = pd.read_parquet(FORECASTS_DIR)
    observations = pd.read_parquet(OBSERVATIONS_DIR)
    truth_until = observations["valid_time"].max()

    return {
        "from": forecasts["run_time"].min().isoformat(),
        "to": forecasts["run_time"].max().isoformat(),
        "truth_until": truth_until.isoformat(),
        "snapshots": int(forecasts["run_time"].nunique()),
        "forecasts": len(forecasts),
        "predictions": len(predictions),
        "intervals": len(intervals),
        "graded": int((predictions["valid_time"] <= truth_until).sum()),
        "model": BLEND_MODEL,
        "leaderboard": None,
        "coverage": None,
        "rain": None
    }


def read_table(directory: Path) -> pd.DataFrame:
    return pd.read_parquet(directory) if any(directory.rglob("*.parquet")) else pd.DataFrame()


def main() -> None:
    rebuild = "backtest" in sys.argv[1:]
    previous = json.loads(SUMMARY_FILE.read_text()) if SUMMARY_FILE.exists() else {}

    if rebuild or "backtest" not in previous:
        backtest = build_backtest()
    else:
        print("Carrying the backtest over unchanged. Pass 'backtest' to rebuild it.")
        backtest = previous["backtest"]

    predictions = read_table(PREDICTIONS_DIR)
    intervals = read_table(INTERVALS_DIR)

    summary = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "location": LOCATION.slug,
        "coordinates": {"latitude": LOCATION.latitude, "longitude": LOCATION.longitude},
        "model": current_model(),
        "live": build_live(predictions, intervals),
        "forecast": build_forecast(predictions, intervals),
        "backtest": backtest
    }

    SUMMARY_FILE.write_text(json.dumps(summary, indent=JSON_INDENT))
    print(f"{SUMMARY_FILE} written, {SUMMARY_FILE.stat().st_size / BYTES_PER_KB:.0f} KB")


if __name__ == "__main__":
    main()
