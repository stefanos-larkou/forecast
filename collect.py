import sys
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
import requests

from constants import LOCATION, MODELS, VARIABLES, Location


FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
FORECAST_DAYS = 7
REQUEST_TIMEOUT_SECONDS = 60
OUT_DIR = Path("data/forecasts")


def fetch_forecast(location: Location) -> dict:
    response = requests.get(
        FORECAST_URL,
        params={
            "latitude": location.latitude,
            "longitude": location.longitude,
            "hourly": ",".join(VARIABLES),
            "models": ",".join(MODELS),
            "forecast_days": FORECAST_DAYS,
            "timezone": "UTC"
        },
        timeout=REQUEST_TIMEOUT_SECONDS
    )
    response.raise_for_status()
    return response.json()


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
                "valid_time": valid_time,
                "model": model,
                "variable": variable,
                "value": hourly[column]
            }))

    if not frames:
        sys.exit("No model data returned. Check the model and variable names.")

    df = pd.concat(frames, ignore_index=True)
    df["location"] = location.slug
    df["run_time"] = pd.Timestamp(run_time)
    df["lead_hours"] = (df["valid_time"] - df["run_time"]) // pd.Timedelta(hours=1)
    df = df.dropna(subset=["value"])
    df = df[df["lead_hours"] > 0]
    df["lead_hours"] = df["lead_hours"].astype("int32")
    df["value"] = df["value"].astype("float32")
    df["source"] = "live"

    for column in ["location", "model", "variable", "source"]:
        df[column] = df[column].astype("category")

    return df[["location", "run_time", "valid_time", "lead_hours", "model", "variable", "value", "source"]]


def snapshot_path(run_time: datetime) -> Path:
    return OUT_DIR / f"{run_time:%Y}" / f"{run_time:%m}" / f"run_{run_time:%Y%m%dT%H}.parquet"


def main() -> None:
    run_time = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
    path = snapshot_path(run_time)
    if path.exists():
        print(f"{path} already exists. Snapshot will not be overwritten.")
        return

    payload = fetch_forecast(LOCATION)
    print(f"{LOCATION.name}: model grid point ({payload['latitude']:.3f}, {payload['longitude']:.3f})")

    df = to_long(payload, LOCATION, run_time)
    path.parent.mkdir(parents=True, exist_ok=True)
    df.to_parquet(path, compression="zstd", index=False)
    print(f"{len(df)} rows, lead hours {df['lead_hours'].min()} to {df['lead_hours'].max()} -> {path} ({path.stat().st_size / 1024:.1f} KB)")


if __name__ == "__main__":
    main()
