# Data

Every file under `data/forecasts/`, `data/backfill/` and `data/predictions/` has these eight columns, in this order. Files under `data/intervals/` differ in one column; see [Intervals](#intervals).

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

- **Four variables, plus two for rain.** Precipitation is not predicted directly: instead there are
  `rain_probability` rows, the chance the hour reaches 0.1 mm, and `rain_amount` rows, how much falls
  in a typical wet hour if it does. The amount is a median, so the two do not multiply
  into an expected total.
- **Lead hours 1 to 144.** Longer leads are not predicted.
- **Values stay within what is physically possible**: cloud cover and humidity between 0 and 100,
  wind speed 0 or above.
- **Only the newest snapshot is predicted, as soon as it is saved**, so every prediction was made
  before its outcome was known. A snapshot with no prediction file was never predicted.

## Intervals

Files under `data/intervals/` hold a 90% band around each of `gbm_blend`'s predictions: the truth is
meant to fall between `lower` and `upper` nine times in ten. Each file is named after the snapshot
it was made from, like its prediction file, and has the same columns except that `value` is replaced
by two:

| Column | Type | Description | Example |
| --- | --- | --- | --- |
| `lower` | float32 | The lower edge of the band, in the variable's unit. | `26.9` |
| `upper` | float32 | The upper edge of the band, in the variable's unit. | `31.2` |

A band pairs with its prediction on `location`, `run_time`, `valid_time`, `lead_hours`, `model`,
`variable` and `source`.

- **Written in the same run as the prediction, or not at all.** A prediction without an interval
  file was made by a model that had no interval models yet, no band is ever added later.
- **Edges stay within what is physically possible**, like the predictions.
- **The band holds about as often as it promises.** Backtested on held-out data - calibrated on one
  stretch, checked on the next - the share of outcomes inside it runs 87 to 88% for temperature and
  89 to 91% for the other three, at every lead from 24 to 144 hours. `data/summary.json` carries the
  figures under `backtest.coverage`.

## Variables

| Variable | Meaning | Unit | Measured |
| --- | --- | --- | --- |
| `temperature_2m` | Air temperature 2 m above the ground | &deg;C | At `valid_time` |
| `relative_humidity_2m` | Relative humidity 2 m above the ground | % | At `valid_time` |
| `precipitation` | Rain, showers and snow | mm | Total over the hour before `valid_time` |
| `wind_speed_10m` | Wind speed 10 m above the ground | km/h | At `valid_time` |
| `cloud_cover` | Share of the sky covered by cloud | % | At `valid_time` |
| `rain_probability` | The chance that the hour before `valid_time` reaches 0.1 mm of precipitation. Only `gbm_blend` forecasts it, in `data/predictions/`, the weather models report `precipitation` in mm instead. | 0 to 1 | Over the hour before `valid_time` |
| `rain_amount` | How much precipitation falls in the hour before `valid_time`, given that the hour is wet. Only `gbm_blend` forecasts it, in `data/predictions/`. Trained on wet hours alone and fitted to their median, so it is the typical amount when it rains, not an expected total. | mm | Over the hour before `valid_time` |
