# Data and pipeline

How the data is shaped, where it is stored, what guarantees it carries, and how every published
number is produced. For what the project is and how to run it, see [README.md](README.md). For how
code is written here, see [CONVENTIONS.md](CONVENTIONS.md).

- [Columns](#columns)
- [Models](#models)
- [Variables](#variables)
- [Predictions](#predictions)
- [Intervals](#intervals)
- [Storage](#storage)
- [Sources](#sources)
- [Evaluation](#evaluation)
- [The model](#the-model)
- [Uncertainty](#uncertainty)
- [Model artifacts](#model-artifacts)

## Columns

Every file under `data/forecasts/`, `data/backfill/` and `data/predictions/` has these eight
columns, in this order. Files under `data/intervals/` differ in one column, described under
[Intervals](#intervals).

Example row: `larnaca | 2026-09-17 15:00 | 2026-09-17 16:00 | 1 | gfs_seamless | temperature_2m | 29.0 | live`

| Column | Type | Description | Example |
| --- | --- | --- | --- |
| `location` | category | Which place the forecast is for. For now it is the same on every row. | `larnaca` |
| `run_time` | UTC timestamp | When the snapshot was saved, rounded down to the hour. The same on every row of one file. It is the time the collector ran, **not** the time the weather model was run. | `2026-09-17 15:00` |
| `valid_time` | UTC timestamp | The moment the forecast is about. | `2026-09-17 16:00` |
| `lead_hours` | int32 | How far ahead the forecast looks: `valid_time - run_time` in whole hours. Always above 0. | `1` |
| `model` | category | The weather model that made the prediction. | `gfs_seamless` |
| `variable` | category | What is being predicted. | `temperature_2m` |
| `value` | float32 | The predicted value, in the variable's unit. | `29.0` |
| `source` | category | `live` for the collector's snapshots and the predictions made from them, `previous_runs` for the historical backfill. | `live` |

The schema is fixed, and every table of forecasts uses it. The three operational models and the blended one
share it, so scoring never has to special-case a source.

## Models

| Model | Run by |
| --- | --- |
| `gfs_seamless` | NOAA, the United States' weather service (GFS) |
| `ecmwf_ifs025` | The European Centre for Medium-Range Weather Forecasts (IFS) |
| `icon_seamless` | DWD, Germany's weather service (ICON) |
| `gbm_blend` | This project: a gradient-boosted model that corrects ECMWF using all three models above |

## Variables

| Variable | Meaning | Unit | Measured |
| --- | --- | --- | --- |
| `temperature_2m` | Air temperature 2 m above the ground | &deg;C | At `valid_time` |
| `relative_humidity_2m` | Relative humidity 2 m above the ground | % | At `valid_time` |
| `precipitation` | Rain, showers and snow | mm | Total over the hour before `valid_time` |
| `wind_speed_10m` | Wind speed 10 m above the ground | km/h | At `valid_time` |
| `cloud_cover` | Share of the sky covered by cloud | % | At `valid_time` |
| `rain_probability` | The chance that the hour before `valid_time` reaches 0.1 mm of precipitation. Only `gbm_blend` forecasts it, in `data/predictions/`. The weather models report `precipitation` in mm instead. | 0 to 1 | Over the hour before `valid_time` |
| `rain_amount` | How much precipitation falls in the hour before `valid_time`, given that the hour is wet. Only `gbm_blend` forecasts it, in `data/predictions/`. Trained on wet hours alone and fitted to their median, so it gives the typical amount when it rains. Multiply it by `rain_probability` for an expected total. | mm | Over the hour before `valid_time` |

Every variable is declared once, as a `Variable` in `constants.py`, carrying what it is: whether it
is fetched from the API, whether it is scored with MAE, and its physical limits. `FETCHED_VARIABLES`,
`MAE_VARIABLES` and `PHYSICAL_LIMITS` are derived from that list. Adding a variable is one line, and
a variable cannot reach the requests while its limits are forgotten.

`FETCHED_VARIABLES` is what a request sends, becoming `hourly=...` in the URL, so a computed variable
such as `rain_probability` never appears there.

Three subsets come out of that table, and the counts differ, so the rest of this document is careful
about which one it means:

| Subset | Count | Which |
| --- | --- | --- |
| `FETCHED_VARIABLES` | 5 | Everything the weather APIs return. A snapshot, a backfill day and an observation day all hold these. |
| `MAE_VARIABLES` | 4 | The fetched five without `precipitation`, which is scored as a probability instead of by mean error. |
| Predicted by `gbm_blend` | 6 | The four scored by MAE, plus `rain_probability` and `rain_amount` in place of `precipitation`. |

## Predictions

Files under `data/predictions/` hold `gbm_blend`'s forecasts. Each one is named after the snapshot
in `data/forecasts/` it was made from, and has the same `run_time`.

- **Four variables, plus two for rain.** Precipitation is never predicted directly. Instead there are
  `rain_probability` rows, the chance the hour reaches 0.1 mm, and `rain_amount` rows, how much falls
  in a typical wet hour if it does. The amount is a median, so the two do not multiply into an
  expected total.
- **Lead hours 1 to 144.** Longer leads are left unpredicted.
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

- **Written in the same run as the prediction, or not at all.** A prediction without an interval file
  was made by a model that had no interval models yet. No band is ever added later.
- **Edges stay within what is physically possible**, like the predictions.
- **The band holds about as often as it promises.** Backtested on held-out data, calibrated on one
  stretch and checked on the next, the share of outcomes inside it runs 87 to 88% for temperature and
  89 to 91% for the other three, at every lead from 24 to 144 hours. `data/summary.json` carries the
  figures under `backtest.coverage`.

`INTERVALS` is a sibling table. That is what lets every prediction file keep the forecast schema,
including the ones written before intervals existed.

## Storage

Everything is Parquet with zstd compression, in long format: one row per
`(location, run_time, valid_time, model, variable)`. Verification joins on
`(location, valid_time, variable)` and groups by `(model, lead_hours)`, and long format makes both of
those one line each.

Parquet earns its place on size and on types. A day of the backfill is 9.6 KB against 261.6 KB as
CSV, 27 times smaller, and every file is committed to git on the run that writes it. It also stores
the schema, so `category`, `int32`, `float32` and UTC-aware timestamps survive a round trip, and the
deliberate choice of `float32` for `value` would otherwise be guessed back into `float64` on every
read.

The footer carries the schema and the row count, which is how `count_table` in `scoring/summary.py`
reports millions of rows for the inventory section without opening a single row group.

| Table | Path | Written |
| --- | --- | --- |
| Forecast snapshots | `data/forecasts/YYYY/MM/run_<YYYYMMDDTHH>.parquet` | Every six hours |
| Historical forecasts | `data/backfill/YYYY/MM/YYYY-MM-DD.parquet` | One file per day |
| Observations | `data/observations/YYYY/MM/YYYY-MM-DD.parquet` | One file per day |
| Climate history | `data/climate/<year>.parquet` | Once per year of history |
| Predictions | `data/predictions/YYYY/MM/run_<YYYYMMDDTHH>.parquet` | Once per snapshot |
| Intervals | `data/intervals/YYYY/MM/run_<YYYYMMDDTHH>.parquet` | With its prediction |

- **Raw snapshots are append-only and kept forever.** They are the source of truth. If the grading
  method changes, everything downstream is recomputed from them. Nothing ever edits or deletes one,
  and the backfill and observations follow the same rule.
- **Partitioned by month from the first file.** A flat directory of thousands of files makes the
  GitHub interface unusable, and moving files later would break every path that names them.
- **Observations and the backfill get one file per day.** Monthly files would be
  fewer and smaller, but the current month's would be rewritten daily, and each rewrite adds a full
  copy to git history.
- **A row with no value is dropped.** A model that does not cover a
  variable simply has no rows for it. `Table.finalise` drops a row missing any declared column.
- **Columns are snake_case**, and a variable keeps Open-Meteo's name, such as `temperature_2m`, so a
  value can always be traced back to the request that produced it.
- **Observations are their own table**, declared as `OBSERVATIONS` in `schema.py`, holding
  `location`, `valid_time`, `variable` and `value`. No model, no lead, no run time. They are joined to
  forecasts on `(location, valid_time, variable)` when needed and never stored joined, which would
  repeat each observed value once per model and lead.
- **The climate history uses the observations schema**, one file per year, fetched once. It is
  observations that happen to be older, so it shares `observe.py`'s `to_long` and the `OBSERVATIONS`
  table.

## Sources

Four scripts fetch, each from an Open-Meteo API, and each writes only what is complete.

**`sources.collect`** saves a forecast snapshot from all three models every six hours. `run_time` is
stamped from when the script actually ran, rounded down to the hour, and never from the schedule.
GitHub delays and skips scheduled runs under load, and a stamp that assumed the schedule held would
be wrong exactly when it matters. Only rows with `lead_hours > 0` are written, so every stored row
predicts a moment that had not yet happened when the snapshot was taken.

**`sources.backfill`** fetches historical forecasts from the Previous Runs API, from 1 March 2024, a
month per request and one file per day. The API returns one column per lead day, named
`<variable>_previous_day1` through `_previous_day7`. The column for day 3 holds the forecast for that
hour as it stood three days earlier, which is what gives each row its lead time.

The two most recent days are left alone. `BACKFILL_LAG_DAYS` (2) sets that gap, so a date is fetched
only once it is at least two days old, by which point every run behind it has been issued and the
day itself is over.

That gap is decided by the calendar, and the script never decides a day is ready by counting how
many values came back. A run that has not been issued yet is not reported as missing: the API
substitutes the current forecast in that column. A day too recent to be safe therefore arrives
looking complete, while holding values that will change once the real run exists, and a count would
wave it through. A count would also be unable to tell that day apart from a genuine gap in the
archive, which needs retrying forever until it fills.

**`sources.observe`** fetches ERA5 truth, one file per day, from the same first day as the backfill.
Truth is requested explicitly with `models=era5`. The archive's default is ECMWF's own model and
includes forecasts for hours that have not happened yet, so grading against it would score ECMWF
against itself and leak the future into the truth.

A day is written only when all of its values exist, 24 hours times the five fetched variables. ERA5
returns unpublished days as nulls instead of as missing rows, so without the check an empty day
would be written once and stay empty forever. An incomplete day is skipped and retried on the next run.

Preliminary ERA5 is accepted and never refreshed. ECMWF first publishes recent weeks as a
provisional version, ERA5T, and replaces it months later with the final one, usually differing
slightly. Each day keeps the values it was first written with, because refreshing would break
append-only for a difference far smaller than the forecast errors being measured.

Observations start on 1 March 2024, the first `valid_time` in the backfill. A baseline that needs
earlier truth later, such as climatology needing decades, moves `OBSERVATIONS_FIRST_DAY` back and the
next run fills only the older days.

**`sources.climate`** fetches 1994 to 2023 of ERA5 once, for the climatology baseline.

## Evaluation

Every model is scored by the same code, `gbm_blend` included. `evaluate.py` has no idea which model
the project owns, because special-casing one is how a leaderboard stops being fair.

- **Error is `predicted - observed`.** Positive means the forecast ran high, and the sign convention
  is never flipped anywhere.
- **A score is always reported against a baseline.** Two degrees of error at 72 hours means nothing
  on its own. The error leaderboard carries two, alongside every model:
  - **Persistence** is the value observed at the moment the forecast was issued, carried forward
    unchanged. A 72-hour forecast is held against whatever the weather actually was three days
    earlier, which is what you would guess knowing only the present.
  - **Climatology** is the historical average for that calendar day and hour, which is what you would
    guess knowing only the season.
- **The lead time at which climatology overtakes the models is the headline number**, the horizon
  past which forecasting adds nothing for this city.
- **Climatology is a fixed 30-year ERA5 window ending before every forecast scored** (1994 to 2023),
  averaged per variable, hour and day of year over a 31-day window that wraps the year. It is
  recomputed from `data/climate/` on demand, and never extended into the years being scored, which
  would leak. Its own bias against the 2020s is measured
  and quoted per hour. Over the whole day it is small, at -0.11 degrees, but it runs -0.7 to -1.6 at
  midday and turns positive overnight.
- **Bias and scatter are computed separately** and published beside MAE in
  `backtest.metrics`. Mean error is correctable and the spread around it is not, and a single MAE
  hides which one a model has. The page draws MAE alone so far.
- **Splits are rolling-origin, never random.** Train on weeks 1 to 4, test on week 5, roll forward.
  Forecasts for adjacent hours are nearly identical, so a random split puts near-duplicates on both
  sides and reports a score that is pure leakage. A calibration set is a contiguous block of time for
  the same reason.
- **Every published figure states its window**, the dates and the number of forecasts it covers.

### Rain

Precipitation is mostly zero, so mean error and intervals are the wrong tools. It is treated as a
probability of precipitation and scored with the Brier score and a reliability curve.

- **An hour is wet at `WET_HOUR_MM`, with `>=`.** The API rounds precipitation to 0.1 mm, so that is
  the smallest meaningful threshold, and the hours sitting exactly on it are a quarter of the events.
- **A probability model is the same GBM on a 0/1 target.** Squared error on that target is the Brier
  score, and a leaf's mean is the share of wet rows, so nothing new is needed and what is optimised is
  what is reported. The prediction is clipped to 0 and 1.
- **A Brier score is reported with its skill against climatology**, per lead, and always with the
  reliability table. A method can score well and still be systematically overconfident, as the
  models' vote is.
- **How much rain is a separate question from whether it rains**, so the amount head is both trained
  and scored on wet hours alone. A squared-error model fitted on every hour predicts the
  unconditional mean, which multiplies the chance of rain into its intensity, and the chance is
  already published separately. Four hours of 0, 0, 0 and 4 mm train to 1 mm across all of them and to
  4 mm on the wet one, and only the second is an intensity. Scoring it on dry hours would measure the
  probability head's job instead. `amount_error` in `scoring/precipitation.py` scores it against the
  three models' own millimetres and against a constant. Multiply `rain_amount` by `rain_probability`
  for an expected total.
- **The amount head fits the median.** Wet-hour rainfall is mostly 0.2 mm with a long tail, so squared
  error chased an inflated average: the mean-fitted head predicted 0.40 mm where the truth was 0.20,
  and scored 0.427 mm MAE against 0.376 for a flat constant, worse than guessing. Fitted at
  `AMOUNT_QUANTILE` it predicts 0.19 and scores 0.361, beating every baseline at every lead.
- **The yardstick for a mean absolute error is the median.** MAE is minimised by the median, so a mean
  baseline is a soft target that a weak model can appear to clear. Reading the old head as useful cost
  two sessions, and the mistake was in the baseline, not the model.
- **A quantile model shrinks the extremes harder than a mean one.** The median head's highest
  prediction on the 12-month window was 1.86 mm against an observed maximum of 8.1, so the downpour
  band cannot fire from it at all. The band stays at its meteorologically correct threshold anyway,
  because the bands describe rain itself, not what this model happens to emit.

## The model

The target is the residual `observed - ECMWF`, not the observation itself. Predicting zero is
then equivalent to trusting ECMWF, so the floor is the best operational model, and the target has no
seasonal cycle for the model to waste capacity rediscovering. It sees all three models' output, so beating
any one of them is ensembling.

- **One model per variable, with `lead_hours` as a feature.** One model per lead time would fragment
  data that is already thin, and trees can partition on lead time themselves.
- **The model covers leads up to 144 hours.** ICON publishes no 7-day forecast, so every 168-hour row
  lacks one of the three inputs. Filling it with invented values, or teaching the hand-written trees
  to handle missing inputs, costs more than one lead out of seven is worth in a first version. The
  168-hour lead is covered by the rolling 30-day bias correction instead, which needs only the one
  model it corrects.
- **Cyclic features are sin and cos pairs**, for hour of day and day of year, so 23:00 sits next to
  00:00 and 31 December next to 1 January.
- **The rolling 30-day bias correction stays on the leaderboard**, as the `corrected` series against
  each model's `raw` one, and is the bar `gbm_blend` has to clear.
- **The boosted model is batch-retrained weekly on a rolling window, from scratch.** It is never
  continued from an existing model, because old trees cannot be unlearned and a relationship that has
  drifted would be baked in. This is scheduled batch retraining. The parts that do update online are
  the rolling bias correction, the adaptive conformal updates and the evaluation itself.
- **Quantile loss sets each leaf to the empirical quantile of that leaf's residuals**, not the mean
  of the gradients. The gradient of quantile loss is only plus or minus one, so the mean carries
  no magnitude.
- **Tuning chooses on months older than `TUNING_HOLDOUT_MONTHS`**, reports on the months after them,
  and confirms a winner on those held-out folds one fold at a time. A gain that
  appears in the tuning months and not in the holdout is noise, and the honest outcome is to keep the
  defaults and say so. Tuning is run by hand, its window slides forward as history
  grows, and it refuses to run when there is not enough history to keep the two regions apart.

### Leakage

Leakage is information from the future reaching a prediction or an evaluation. It produces a backtest
that looks excellent and a live model that disappoints.

- **Training uses the backfill and validation uses the live data, and the two are never
  concatenated.** The backfill's leads are whole days and the live data's are hours, so `lead_hours`
  does not mean the same thing in both. The boundary is also free protection, because the live data
  did not exist when the model was fitted.
- **`build_features(forecasts, graded)` is the only way features are built**, called by both
  `train.py` and `predict.py`. Two code paths drift apart, and the symptom is a model that backtests
  well and underperforms live. The rolling bias correction uses the same trailing-bias code for the
  same reason.
- **`as_of` is derived from each row's own `run_time` and never passed in.** ERA5 runs about five days
  behind real time, so at `run_time` no observation newer than that exists. Any feature computed from
  truth, the trailing bias above all, uses nothing later than `as_of = run_time - 6 days`, the lag
  plus a day of margin, so a slow week at ECMWF cannot quietly open a gap. Deriving it inside the
  feature code, per row, means no caller can pass a wrong cutoff or forget one.
- **The past is looked up with `merge_asof(..., direction="backward")`**, the latest value at or
  before `as_of`. An exact join would leave a forecast uncorrected across an archive gap, and
  `"forward"` or `"nearest"` would reach into the future whenever a later value was closer.
- **Features and the target are built separately.** `build_features` never needs the truth, because at
  prediction time there is none. `with_target` adds it only for training.

## Uncertainty

Intervals are conformalised quantile regression: fit the 5th and 95th percentiles, measure on a
calibration block how far outside the interval observations fell, and widen by that amount.

- **Calibration is per lead-time bucket and per variable** (Mondrian). One global correction gives
  intervals that are too wide at short leads and dangerously narrow at long ones, while still
  reporting 90% overall.
- **Weather is not exchangeable**, so the guarantee degrades. Calibration blocks are contiguous, and
  alpha is updated online from recently observed coverage, which is adaptive conformal inference.
- **Coverage is reported per lead bucket, against the nominal level.**
- **Precipitation is not conformalised.** See [Evaluation](#evaluation).
- **The quantile models train on the 12 months before a 3-month calibration block**, the most recent
  three months (`CALIBRATION_MONTHS`). The point model keeps the latest 12 months. Splitting the point
  model's window instead would leave the quantile models a season short.
- **Quantile trees split on the gradients and set each leaf to the quantile of its residuals.** The
  point model is the same code with no quantile, where gradients are the residuals and the leaf their
  mean. Both boost from zero, and both are tested against LightGBM.
- **A calibration score is `max(lower - truth, truth - upper)`**, negative inside the band and
  positive outside, the distance either way. The margin is the score at level
  `ceil((n + 1) * 0.9) / n`, capped at 1, taken with `method="higher"`, which is the finite-sample
  rule the guarantee rests on. The 0.9 is `UPPER_QUANTILE - LOWER_QUANTILE`, never typed again. A
  negative margin narrows the band.
- **A published band is `ECMWF + quantile correction -/+ margin`**, with the margin looked up by the
  row's lead bucket, the edges put in order with `np.minimum` and `np.maximum`, and both clipped to
  `PHYSICAL_LIMITS`. The point prediction is not forced inside the band.
- **Coverage on the calibration block proves only the arithmetic**, where it is 90% by construction.
  The honest check is held out: calibrate on one part of the block and measure another.

## Model artifacts

A model is saved as JSON. Trees are nested `{feature, threshold, left, right}` objects
with leaf values. JSON is diffable in git, loads in any language and version, and cannot run code
when it is read.

A model directory holds four files: `model.json` for the point models, `lower.json` and `upper.json`
for the quantile models, each keyed by variable, and `metadata.json`, the only indented one.

`metadata.json` records the training window, the feature list *in order*, the hyperparameters, the
seed, the conformal quantiles per lead bucket and variable, the commit SHA of the code that trained
it, its backtest, and whether it was promoted. Without it a result cannot be reproduced six months
later. The conformal margins live there as `conformal_margins[variable][lead]`, with the quantile
training window and the calibration window beside them.

- **`models/current.json` points at the active model**, and `predict.py` loads only through it. A
  model without `lower.json`, meaning any trained before 21 September 2026, still predicts and simply
  writes no intervals.
- **An extra head is its own file, loaded if it is there and skipped if it is not.** `rain.json` and
  `amount.json` sit beside `model.json` and are read through one `load_head`. A promoted model that
  predates a head writes none of that variable and says so, which is what lets a head ship without a
  `MODEL_FORMAT` bump or a forced retrain.
- **The learning rate is baked into the leaves at fit time**, so a saved model is a plain sum of its
  trees and means the same thing forever. Reading the rate at prediction time would silently rescale
  every earlier model the moment the constant changed. `MODEL_FORMAT` marks the convention, and
  `predict.py` skips a model that does not match, so it can never write rescaled nonsense.
- **Promotion is gated.** A newly trained model replaces the current one only if its rolling-origin
  score is at least as good. Otherwise the result is logged and the incumbent stays.
- **The gate compares on the same forecasts.** The candidate is scored only up to the incumbent's
  recorded `until`, the forecast counts must match, and every variable must be at least as good within
  `PROMOTION_TOLERANCE`. Two scores over different forecasts measure the weeks, not the models.
- **A model directory is written once.** A rejected model is still saved, with `"promoted": false`.
  `current.json` is written last and only on promotion, so it never points at a half-written model.
- **An interval is written only in the run that writes its prediction**, and the prediction is written
  first, so a failing interval step never costs the point forecast.
- **A live lead is rounded up to its lead bucket**, a whole day from 24 to 144, for both the
  trailing-bias lookup and the `lead_hours` feature. The stored row keeps its real lead.
- **A prediction is clipped to its variable's `PHYSICAL_LIMITS`**, and a variable that was never
  declared raises a `KeyError`. Training uses the raw residuals.
  A probability is clipped the same way, through `rain_probability`'s limits of 0 and 1.
- **A row missing any feature is dropped before prediction, and the count is printed.** A missing value
  fails every threshold comparison and would silently take the right branch at every split.
