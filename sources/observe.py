import time
from datetime import date
from pathlib import Path

import pandas as pd

from constants import ARCHIVE_API_URL, DAYS_PER_FILE, ERA5_LAG_DAYS, FETCHED_VARIABLES, LOCATION, OBSERVATIONS_DIR, OBSERVATIONS_FIRST_DAY, SECONDS_BETWEEN_REQUESTS, TRUTH_MODEL
from schema import OBSERVATIONS
from sources.openmeteo import expected_observations, fetch_hourly, to_observations


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
        df = to_observations(payload, LOCATION)

        expected = expected_observations(DAYS_PER_FILE)
        for day in days:
            day_df = df[df["valid_time"].dt.date == day]
            if len(day_df) < expected:
                print(f"{day}: only {len(day_df)} of {expected} values. Not written.")
                continue
            OBSERVATIONS.write(day_df, day_path(day))

        print(f"{month}: done", flush=True)
        time.sleep(SECONDS_BETWEEN_REQUESTS)


if __name__ == "__main__":
    main()
