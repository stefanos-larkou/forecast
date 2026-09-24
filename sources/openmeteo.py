import sys
import time

import pandas as pd
import requests

from constants import FETCHED_VARIABLES, HOURS_PER_DAY, REQUEST_ATTEMPTS, REQUEST_TIMEOUT_SECONDS, RETRYABLE_STATUS_CODES, SECONDS_BETWEEN_ATTEMPTS, Location
from schema import OBSERVATIONS


def is_retryable(error: requests.RequestException) -> bool:
    if isinstance(error, (requests.Timeout, requests.ConnectionError, requests.JSONDecodeError)):
        return True
    return error.response is not None and error.response.status_code in RETRYABLE_STATUS_CODES


def fetch_hourly(url: str, location: Location, hourly: list[str], **params) -> dict:
    for attempt in range(1, REQUEST_ATTEMPTS + 1):
        try:
            response = requests.get(
                url,
                params={
                    "latitude": location.latitude,
                    "longitude": location.longitude,
                    "hourly": ",".join(hourly),
                    "timezone": "UTC",
                    **params
                },
                timeout=REQUEST_TIMEOUT_SECONDS
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as error:
            if attempt == REQUEST_ATTEMPTS or not is_retryable(error):
                raise
            print(f"Attempt {attempt} of {REQUEST_ATTEMPTS} failed: {error}. Retrying in {SECONDS_BETWEEN_ATTEMPTS} seconds.")
            time.sleep(SECONDS_BETWEEN_ATTEMPTS)


def to_observations(payload: dict, location: Location) -> pd.DataFrame:
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


def expected_observations(days: int) -> int:
    return days * HOURS_PER_DAY * len(FETCHED_VARIABLES)
