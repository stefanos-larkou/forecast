import itertools
import sys
import time
from concurrent.futures import ProcessPoolExecutor
from dataclasses import asdict

import pandas as pd

from constants import FEATURE_COLUMNS, HYPERPARAMETERS, Hyperparameters, LEADERBOARD_DECIMALS, MAE_VARIABLES, REFERENCE_MODEL, TRAINING_WINDOW_MONTHS, TUNING_GRID, TUNING_HOLDOUT_MONTHS, TUNING_MONTH_GAP, TUNING_MONTHS, TUNING_WORKERS
from model import gbm
from model.training import load_training_data
from scoring.evaluate import fold_rows


worker_rows: pd.DataFrame | None = None


def candidates() -> list[Hyperparameters]:
    return [Hyperparameters(**dict(zip(TUNING_GRID, values))) for values in itertools.product(*TUNING_GRID.values())]


def validation_months(trained: pd.DataFrame) -> list[pd.Period]:
    last = pd.Period(trained["valid_time"].max(), freq="M") - TUNING_HOLDOUT_MONTHS
    months = sorted(last - TUNING_MONTH_GAP * step for step in range(TUNING_MONTHS))

    first_scoreable = pd.Period(trained["valid_time"].min(), freq="M") + TRAINING_WINDOW_MONTHS
    if months[0] < first_scoreable:
        sys.exit(f"Tuning needs {TUNING_MONTHS} months from {months[0]}, but the first month a model can be scored on is {first_scoreable}.")

    return months


def fold_error(rows: pd.DataFrame, month: pd.Period, settings: Hyperparameters) -> float:
    training, validation = fold_rows(rows, month, months=1)
    trees = gbm.fit(training[FEATURE_COLUMNS].to_numpy("float64"), training["target"].to_numpy("float64"), settings=settings)
    correction = gbm.predict(trees, validation[FEATURE_COLUMNS].to_numpy("float64"))
    return float((validation[REFERENCE_MODEL] + correction - validation["observed"]).abs().mean())


def score(rows: pd.DataFrame, months: list[pd.Period], settings: Hyperparameters) -> float:
    return sum(fold_error(rows, month, settings) for month in months) / len(months)


def use_rows(rows: pd.DataFrame) -> None:
    global worker_rows
    worker_rows = rows


def worker_fold_error(task: tuple[pd.Period, Hyperparameters]) -> float:
    month, settings = task
    return fold_error(worker_rows, month, settings)


def results(rows: pd.DataFrame, months: list[pd.Period]) -> pd.DataFrame:
    tasks = [(month, settings) for settings in candidates() for month in months]
    began = time.perf_counter()

    errors = []
    with ProcessPoolExecutor(TUNING_WORKERS, initializer=use_rows, initargs=(rows,)) as pool:
        for finished, error in enumerate(pool.map(worker_fold_error, tasks), start=1):
            errors.append(error)
            if finished % len(months) == 0:
                print(f"  {finished // len(months):3} of {len(candidates())}: mae {sum(errors[-len(months):]) / len(months):.4f}", flush=True)

    print(f"  {len(tasks)} fits on {TUNING_WORKERS} workers in {time.perf_counter() - began:.0f}s", flush=True)
    scored = [{**asdict(settings), "mae": sum(fold_errors) / len(fold_errors)} for settings, fold_errors in zip(candidates(), itertools.batched(errors, len(months)))]

    return pd.DataFrame(scored).sort_values(["mae", *TUNING_GRID]).reset_index(drop=True)


def main() -> None:
    began = time.perf_counter()
    variables = sys.argv[1:] or MAE_VARIABLES
    _, _, trained = load_training_data()
    months = validation_months(trained)
    print(f"{len(candidates())} candidates, validated on {', '.join(str(month) for month in months)}, leaving the last {TUNING_HOLDOUT_MONTHS} months for scoring", flush=True)

    for variable in variables:
        print(f"\n{variable}:", flush=True)
        table = results(trained[trained["variable"] == variable], months)
        print(f"\n{variable}: every candidate, best first. The settings in use are {HYPERPARAMETERS}")
        print(table.round(LEADERBOARD_DECIMALS + 2).to_string())

    print(f"\nFinished in {time.perf_counter() - began:.0f}s")


if __name__ == "__main__":
    main()
