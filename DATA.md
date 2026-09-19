# Data

Every file under `data/forecasts/`, `data/backfill/` and `data/predictions/` has these eight columns, in this order.

Example row: `larnaca | 2026-09-17 15:00 | 2026-09-17 16:00 | 1 | gfs_seamless | temperature_2m | 29.0 | live`

## Columns

| Column | Type | Description | Example |
| --- | --- | --- | --- |
| `location` | category | Which place the forecast is for. For now it is the same on every row. | `larnaca` |
| `run_time` | UTC timestamp | When the snapshot was saved, rounded down to the hour. The same on every row of one file. It is the time the collector ran, **not** the time the weather model was run. | `2026-09-17 15:00` |
| `valid_time` | UTC timestamp | The moment the forecast is about. | `2026-09-17 16:00` |
| `lead_hours` | int32 | How far ahead the forecast looks: `valid_time - run_time` in whole hours. Always above 0. | `1` |
| `model` | category | The weather model that made the prediction. | `gfs_seamless` |
| `variable` | category | What is being predicted. | `temperature_2m` |
| `value` | float32 | The predicted value, in the variable's unit. | `29.0` |
| `source` | category | `live` for the collector's snapshots and the predictions made from them, `previous_runs` for the historical backfill | `live` |

## Models

| Model | Run by |
| --- | --- |
| `gfs_seamless` | NOAA, the United States' weather service (GFS) |
| `ecmwf_ifs025` | The European Centre for Medium-Range Weather Forecasts (IFS) |
| `icon_seamless` | DWD, Germany's weather service (ICON) |
| `gbm_blend` | This project: a gradient-boosted model that corrects ECMWF using all three models above |

## Predictions

Files under `data/predictions/` hold `gbm_blend`'s forecasts. Each one is named after the snapshot
in `data/forecasts/` it was made from, and has the same `run_time`.

- **Four variables, not five.** Precipitation is not predicted.
- **Lead hours 1 to 144.** Longer leads are not predicted.
- **Values stay within what is physically possible**: cloud cover and humidity between 0 and 100,
  wind speed 0 or above.
- **Only the newest snapshot is predicted, as soon as it is saved**, so every prediction was made
  before its outcome was known. A snapshot with no prediction file was never predicted.

## Variables

| Variable | Meaning | Unit | Measured |
| --- | --- | --- | --- |
| `temperature_2m` | Air temperature 2 m above the ground | &deg;C | At `valid_time` |
| `relative_humidity_2m` | Relative humidity 2 m above the ground | % | At `valid_time` |
| `precipitation` | Rain, showers and snow | mm | Total over the hour before `valid_time` |
| `wind_speed_10m` | Wind speed 10 m above the ground | km/h | At `valid_time` |
| `cloud_cover` | Share of the sky covered by cloud | % | At `valid_time` |
