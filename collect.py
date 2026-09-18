import sys
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

from constants import FORECAST_API_URL, FORECASTS_DIR, LIVE_FORECAST_DAYS, LOCATION, MODELS, VARIABLES, Location
from openmeteo import fetch_hourly
from schema import FORECASTS


def to_long(payload: dict, location: Location, run_time: datetime) -> pd.DataFrame:
    hourly = payload["hourly"]
    valid_time = pd.to_datetime(hourly["time"], utc=True)
    frames = []

    for model in MODELS:
        for variable in VARIABLES:
            column = f"{variable}_{model}"

            if column not in hourly:
                print(f"Missing: {column}")
                continue

            frames.append(pd.DataFrame({
                "location": location.slug,
                "run_time": pd.Timestamp(run_time),
                "valid_time": valid_time,
                "model": model,
                "variable": variable,
                "value": hourly[column],
                "source": "live"
            }))

    if not frames:
        sys.exit("No model data returned. Check the model and variable names.")

    df = pd.concat(frames, ignore_index=True)
    df["lead_hours"] = (df["valid_time"] - df["run_time"]) // pd.Timedelta(hours=1)

    return FORECASTS.finalise(df[df["lead_hours"] > 0])


def snapshot_path(run_time: datetime) -> Path:
    return FORECASTS_DIR / f"{run_time:%Y}" / f"{run_time:%m}" / f"run_{run_time:%Y%m%dT%H}.parquet"


def main() -> None:
    run_time = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
    path = snapshot_path(run_time)
    if path.exists():
        print(f"{path} already exists. Snapshot will not be overwritten.")
        return

    payload = fetch_hourly(FORECAST_API_URL, LOCATION, VARIABLES, models=",".join(MODELS), forecast_days=LIVE_FORECAST_DAYS)
    print(f"{LOCATION.name}: model grid point ({payload['latitude']:.3f}, {payload['longitude']:.3f})")

    df = to_long(payload, LOCATION, run_time)
    FORECASTS.write(df, path)
    print(f"{len(df)} rows, lead hours {df['lead_hours'].min()} to {df['lead_hours'].max()} -> {path} ({path.stat().st_size / 1024:.1f} KB)")


if __name__ == "__main__":
    main()
