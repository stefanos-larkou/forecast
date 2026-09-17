import requests

from constants import Location


REQUEST_TIMEOUT_SECONDS = 180


def fetch_hourly(url: str, location: Location, hourly: list[str], **params) -> dict:
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
