import time
from pathlib import Path

import pandas as pd

from constants import ARCHIVE_API_URL, CLIMATE_DIR, CLIMATE_FIRST_YEAR, CLIMATE_LAST_YEAR, HOURS_PER_DAY, LOCATION, SECONDS_BETWEEN_REQUESTS, TRUTH_MODEL, VARIABLES
from schema import OBSERVATIONS
from sources.observe import to_long
from sources.openmeteo import fetch_hourly


def year_path(year: int) -> Path:
    return CLIMATE_DIR / f"{year}.parquet"


def main() -> None:
    missing = [year for year in range(CLIMATE_FIRST_YEAR, CLIMATE_LAST_YEAR + 1) if not year_path(year).exists()]
    print(f"{len(missing)} of {CLIMATE_LAST_YEAR - CLIMATE_FIRST_YEAR + 1} years missing", flush=True)

    for year in missing:
        print(f"{year}: fetching...", end=" ", flush=True)
        payload = fetch_hourly(ARCHIVE_API_URL, LOCATION, VARIABLES, models=TRUTH_MODEL, start_date=f"{year}-01-01", end_date=f"{year}-12-31")
        df = to_long(payload, LOCATION)

        expected = pd.Timestamp(year=year, month=12, day=31).dayofyear * HOURS_PER_DAY * len(VARIABLES)
        if len(df) < expected:
            print(f"only {len(df)} of {expected} values. Not written.")
            continue

        OBSERVATIONS.write(df, year_path(year))
        print(f"{len(df):,} values", flush=True)
        time.sleep(SECONDS_BETWEEN_REQUESTS)


if __name__ == "__main__":
    main()
