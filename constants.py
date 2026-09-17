from dataclasses import dataclass


@dataclass(frozen=True)
class Location:
    slug: str
    name: str
    latitude: float
    longitude: float


LOCATION = Location("larnaca", "Larnaca, Cyprus", 34.9221, 33.62794)
MODELS = ["gfs_seamless", "ecmwf_ifs025", "icon_seamless"]
VARIABLES = ["temperature_2m", "relative_humidity_2m", "precipitation", "wind_speed_10m", "cloud_cover"]