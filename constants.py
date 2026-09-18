from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Location:
    slug: str
    name: str
    latitude: float
    longitude: float


LOCATION = Location("larnaca", "Larnaca, Cyprus", 34.9221, 33.62794)
MODELS = ["gfs_seamless", "ecmwf_ifs025", "icon_seamless"]
VARIABLES = ["temperature_2m", "relative_humidity_2m", "precipitation", "wind_speed_10m", "cloud_cover"]
HOURS_PER_DAY = 24

FORECAST_API_URL = "https://api.open-meteo.com/v1/forecast"
PREVIOUS_RUNS_API_URL = "https://previous-runs-api.open-meteo.com/v1/forecast"
ARCHIVE_API_URL = "https://archive-api.open-meteo.com/v1/archive"

REQUEST_TIMEOUT_SECONDS = 180
REQUEST_ATTEMPTS = 3
SECONDS_BETWEEN_ATTEMPTS = 30
RETRYABLE_STATUS_CODES = {429, 500, 502, 503, 504}
SECONDS_BETWEEN_REQUESTS = 1

FORECASTS_DIR = Path("data/forecasts")
BACKFILL_DIR = Path("data/backfill")
OBSERVATIONS_DIR = Path("data/observations")

LIVE_FORECAST_DAYS = 7

BACKFILL_FIRST_MONTH = "2024-03"
BACKFILL_LEAD_DAYS = range(1, 8)

TRUTH_MODEL = "era5"
OBSERVATIONS_FIRST_DAY = "2024-03-01"
ERA5_LAG_DAYS = 6
