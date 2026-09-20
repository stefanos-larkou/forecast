import sys
import time
from datetime import date
from pathlib import Path

import pandas as pd

from constants import ARCHIVE_API_URL, ERA5_LAG_DAYS, FETCHED_VARIABLES, HOURS_PER_DAY, LOCATION, OBSERVATIONS_DIR, OBSERVATIONS_FIRST_DAY, SECONDS_BETWEEN_REQUESTS, TRUTH_MODEL, Location
from schema import OBSERVATIONS
from sources.openmeteo import fetch_hourly


def to_long(payload: dict, location: Location) -> pd.DataFrame:
    hourly = payload["hourly"]
    valid_time = pd.to_datetime(hourly["time"], utc=True)
    frames = []

    for variable in FETCHED_VARIABLES:
        if variable not in hourly:
            print(f"Missing: {variable}")
            continue

        frames.append(pd.DataFrame({
            "location": location.slug,
            "valid_time": valid_time,
            "variable": variable,
            "value": hourly[variable]
        }))

    if not frames:
        sys.exit("No observations returned. Check the variable names.")

    return OBSERVATIONS.finalise(pd.concat(frames, ignore_index=True))


def day_path(day: date) -> Path:
    return OBSERVATIONS_DIR / f"{day:%Y}" / f"{day:%m}" / f"{day:%Y-%m-%d}.parquet"


def main() -> None:
    last_day = (pd.Timestamp.now(tz="UTC") - pd.Timedelta(days=ERA5_LAG_DAYS)).date()
    missing = [day.date() for day in pd.date_range(OBSERVATIONS_FIRST_DAY, last_day, freq="D") if not day_path(day.date()).exists()]
    months = sorted({pd.Period(day, freq="M") for day in missing})

    for month in months:
        days = [day for day in missing if pd.Period(day, freq="M") == month]
        print(f"{month}: fetching {len(days)} day(s)...", flush=True)
        payload = fetch_hourly(ARCHIVE_API_URL, LOCATION, FETCHED_VARIABLES, models=TRUTH_MODEL, start_date=str(days[0]), end_date=str(days[-1]))
        df = to_long(payload, LOCATION)

        for day in days:
            day_df = df[df["valid_time"].dt.date == day]
            if len(day_df) < HOURS_PER_DAY * len(FETCHED_VARIABLES):
                print(f"{day}: only {len(day_df)} of {HOURS_PER_DAY * len(FETCHED_VARIABLES)} values. Not written.")
                continue
            OBSERVATIONS.write(day_df, day_path(day))

        print(f"{month}: done", flush=True)
        time.sleep(SECONDS_BETWEEN_REQUESTS)


if __name__ == "__main__":
    main()
