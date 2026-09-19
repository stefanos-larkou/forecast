import time

import requests

from constants import REQUEST_ATTEMPTS, REQUEST_TIMEOUT_SECONDS, RETRYABLE_STATUS_CODES, SECONDS_BETWEEN_ATTEMPTS, Location


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
