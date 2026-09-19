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
DAYS_PER_YEAR = 365.25
BYTES_PER_KB = 1024

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
PREDICTIONS_DIR = Path("data/predictions")
INTERVALS_DIR = Path("data/intervals")
PARQUET_COMPRESSION = "zstd"

LIVE_SOURCE = "live"
LIVE_FORECAST_DAYS = 7

PREVIOUS_RUNS_SOURCE = "previous_runs"
BACKFILL_FIRST_DAY = "2024-03-01"
BACKFILL_LAG_DAYS = 2
BACKFILL_LEAD_DAYS = range(1, 8)

TRUTH_MODEL = "era5"
OBSERVATIONS_FIRST_DAY = "2024-03-01"
ERA5_LAG_DAYS = 6

SERIES_KEY = ["location", "model", "variable", "lead_hours"]
BIAS_WINDOW_DAYS = 30
BIAS_MIN_DAYS = 7

MAE_VARIABLES = ["temperature_2m", "relative_humidity_2m", "wind_speed_10m", "cloud_cover"]
LEADERBOARD_DECIMALS = 2

REFERENCE_MODEL = "ecmwf_ifs025"
MODEL_MAX_LEAD_HOURS = 144
FEATURE_COLUMNS = [
    *MODELS,
    *[f"{model}_trailing_bias" for model in MODELS],
    "spread",
    "lead_hours",
    "hour_sin",
    "hour_cos",
    "day_sin",
    "day_cos"
]

TREE_MAX_DEPTH = 3
MIN_LEAF_ROWS = 100
BOOSTING_ROUNDS = 200
LEARNING_RATE = 0.1
LOWER_QUANTILE = 0.05
UPPER_QUANTILE = 0.95

SCORING_KEY = ["location", "variable", "valid_time", "lead_hours"]
TRAINING_WINDOW_MONTHS = 12
REFIT_EVERY_MONTHS = 3
CALIBRATION_MONTHS = 3

MODELS_DIR = Path("models")
MODEL_FILE = "model.json"
LOWER_MODEL_FILE = "lower.json"
UPPER_MODEL_FILE = "upper.json"
METADATA_FILE = "metadata.json"
CURRENT_MODEL_FILE = MODELS_DIR / "current.json"
MODEL_VERSION_FORMAT = "%Y-%m-%d"
JSON_INDENT = 4
PROMOTION_TOLERANCE = 1e-9

BLEND_MODEL = "gbm_blend"
PHYSICAL_LIMITS = {
    "temperature_2m": (None, None),
    "relative_humidity_2m": (0, 100),
    "wind_speed_10m": (0, None),
    "cloud_cover": (0, 100)
}
