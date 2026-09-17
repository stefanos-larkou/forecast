import sys
import time
from pathlib import Path

import pandas as pd

from constants import LOCATION, MODELS, VARIABLES, Location
from openmeteo import fetch_hourly
from schema import finalise, write


PREVIOUS_RUNS_URL = "https://previous-runs-api.open-meteo.com/v1/forecast"
LEAD_DAYS = range(1, 8)
FIRST_MONTH = "2024-03"
SECONDS_BETWEEN_REQUESTS = 1
OUT_DIR = Path("data/backfill")


def to_long(payload: dict, location: Location) -> pd.DataFrame:
    hourly = payload["hourly"]
    valid_time = pd.to_datetime(hourly["time"], utc=True)
    frames = []

    for model in MODELS:
        for variable in VARIABLES:
            for day in LEAD_DAYS:
                column = f"{variable}_previous_day{day}_{model}"

                if column not in hourly:
                    print(f"Missing: {column}")
                    continue

                frames.append(pd.DataFrame({
                    "location": location.slug,
                    "run_time": valid_time - pd.Timedelta(days=day),
                    "valid_time": valid_time,
                    "lead_hours": day * 24,
                    "model": model,
                    "variable": variable,
                    "value": hourly[column],
                    "source": "previous_runs"
                }))

    if not frames:
        sys.exit("No data returned. Check the model and variable names.")

    return finalise(pd.concat(frames, ignore_index=True))


def month_path(month: pd.Period) -> Path:
    return OUT_DIR / f"{month}.parquet"


def main() -> None:
    hourly = [f"{variable}_previous_day{day}" for variable in VARIABLES for day in LEAD_DAYS]
    last_complete_month = pd.Period(pd.Timestamp.now(tz="UTC").date(), freq="M") - 1

    for month in pd.period_range(FIRST_MONTH, last_complete_month, freq="M"):
        path = month_path(month)
        if path.exists():
            continue

        payload = fetch_hourly(
            PREVIOUS_RUNS_URL,
            LOCATION,
            hourly,
            models=",".join(MODELS),
            start_date=str(month.start_time.date()),
            end_date=str(month.end_time.date())
        )
        df = to_long(payload, LOCATION)
        write(df, path)
        print(f"{month}: {len(df)} rows -> {path} ({path.stat().st_size / 1024:.0f} KB)")
        time.sleep(SECONDS_BETWEEN_REQUESTS)


if __name__ == "__main__":
    main()
