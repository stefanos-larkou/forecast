import sys
import time
from pathlib import Path

import pandas as pd

from constants import BACKFILL_DIR, BACKFILL_FIRST_MONTH, BACKFILL_LEAD_DAYS, HOURS_PER_DAY, LOCATION, MODELS, PREVIOUS_RUNS_API_URL, PREVIOUS_RUNS_SOURCE, SECONDS_BETWEEN_REQUESTS, VARIABLES, Location
from openmeteo import fetch_hourly
from schema import FORECASTS


def previous_runs_name(variable: str, day: int) -> str:
    return f"{variable}_previous_day{day}"


def to_long(payload: dict, location: Location) -> pd.DataFrame:
    hourly = payload["hourly"]
    valid_time = pd.to_datetime(hourly["time"], utc=True)
    frames = []

    for model in MODELS:
        for variable in VARIABLES:
            for day in BACKFILL_LEAD_DAYS:
                column = f"{previous_runs_name(variable, day)}_{model}"

                if column not in hourly:
                    print(f"Missing: {column}")
                    continue

                frames.append(pd.DataFrame({
                    "location": location.slug,
                    "run_time": valid_time - pd.Timedelta(days=day),
                    "valid_time": valid_time,
                    "lead_hours": day * HOURS_PER_DAY,
                    "model": model,
                    "variable": variable,
                    "value": hourly[column],
                    "source": PREVIOUS_RUNS_SOURCE
                }))

    if not frames:
        sys.exit("No data returned. Check the model and variable names.")

    return FORECASTS.finalise(pd.concat(frames, ignore_index=True))


def month_path(month: pd.Period) -> Path:
    return BACKFILL_DIR / f"{month}.parquet"


def main() -> None:
    hourly = [previous_runs_name(variable, day) for variable in VARIABLES for day in BACKFILL_LEAD_DAYS]
    last_complete_month = pd.Period(pd.Timestamp.now(tz="UTC").date(), freq="M") - 1

    for month in pd.period_range(BACKFILL_FIRST_MONTH, last_complete_month, freq="M"):
        path = month_path(month)
        if path.exists():
            continue

        payload = fetch_hourly(
            PREVIOUS_RUNS_API_URL,
            LOCATION,
            hourly,
            models=",".join(MODELS),
            start_date=str(month.start_time.date()),
            end_date=str(month.end_time.date())
        )
        df = to_long(payload, LOCATION)
        FORECASTS.write(df, path)
        print(f"{month}: {len(df)} rows -> {path} ({path.stat().st_size / 1024:.0f} KB)")
        time.sleep(SECONDS_BETWEEN_REQUESTS)


if __name__ == "__main__":
    main()
