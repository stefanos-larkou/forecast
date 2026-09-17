import time

import requests

from constants import Location


REQUEST_TIMEOUT_SECONDS = 180
ATTEMPTS = 3
SECONDS_BETWEEN_ATTEMPTS = 30
RETRYABLE_STATUS_CODES = {429, 500, 502, 503, 504}


def is_retryable(error: requests.RequestException) -> bool:
    if isinstance(error, (requests.Timeout, requests.ConnectionError)):
        return True
    return error.response is not None and error.response.status_code in RETRYABLE_STATUS_CODES


def fetch_hourly(url: str, location: Location, hourly: list[str], **params) -> dict:
    for attempt in range(1, ATTEMPTS + 1):
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
            if attempt == ATTEMPTS or not is_retryable(error):
                raise
            print(f"Attempt {attempt} of {ATTEMPTS} failed: {error}. Retrying in {SECONDS_BETWEEN_ATTEMPTS} seconds.")
            time.sleep(SECONDS_BETWEEN_ATTEMPTS)
