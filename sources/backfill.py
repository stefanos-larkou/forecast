import sys
import time
from datetime import date
from pathlib import Path

import pandas as pd

from constants import BACKFILL_DIR, BACKFILL_FIRST_DAY, BACKFILL_LAG_DAYS, BACKFILL_LEAD_DAYS, HOURS_PER_DAY, LOCATION, MODELS, PREVIOUS_RUNS_API_URL, PREVIOUS_RUNS_SOURCE, SECONDS_BETWEEN_REQUESTS, VARIABLES, Location
from schema import FORECASTS
from sources.openmeteo import fetch_hourly


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


def day_path(day: date) -> Path:
    return BACKFILL_DIR / f"{day:%Y}" / f"{day:%m}" / f"{day:%Y-%m-%d}.parquet"


def main() -> None:
    hourly = [previous_runs_name(variable, day) for variable in VARIABLES for day in BACKFILL_LEAD_DAYS]
    last_day = (pd.Timestamp.now(tz="UTC") - pd.Timedelta(days=BACKFILL_LAG_DAYS)).date()
    missing = [day.date() for day in pd.date_range(BACKFILL_FIRST_DAY, last_day, freq="D") if not day_path(day.date()).exists()]
    months = sorted({pd.Period(day, freq="M") for day in missing})

    for month in months:
        days = [day for day in missing if pd.Period(day, freq="M") == month]
        print(f"{month}: fetching {len(days)} day(s)...", flush=True)
        payload = fetch_hourly(
            PREVIOUS_RUNS_API_URL,
            LOCATION,
            hourly,
            models=",".join(MODELS),
            start_date=str(days[0]),
            end_date=str(days[-1])
        )
        df = to_long(payload, LOCATION)

        for day in days:
            day_df = df[df["valid_time"].dt.date == day]
            if day_df.empty:
                print(f"{day}: no values returned. Not written.")
                continue
            FORECASTS.write(day_df, day_path(day))

        print(f"{month}: done", flush=True)
        time.sleep(SECONDS_BETWEEN_REQUESTS)


if __name__ == "__main__":
    main()
