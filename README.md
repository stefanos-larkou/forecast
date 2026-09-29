# Forecast

A weather forecast for Larnaca that keeps score of itself. Four times a day it saves what three
global weather models predict, corrects them with a hand-written gradient-boosted model trained on
two years of archived forecasts, and grades every prediction against ERA5 reanalysis once the truth
catches up. Nothing is graded before its outcome was known, so the published record is a live one.

Python pipeline in GitHub Actions, React dashboard on GitHub Pages.

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
  - [Repository layout](#repository-layout)
  - [The pipeline](#the-pipeline)
  - [The model](#the-model)
- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Clone](#1-clone)
  - [2. Create the Python environment](#2-create-the-python-environment)
  - [3. Install the dashboard](#3-install-the-dashboard)
  - [4. Trust a local HTTPS certificate](#4-trust-a-local-https-certificate)
- [Running the pipeline](#running-the-pipeline)
- [Running the dashboard](#running-the-dashboard)
- [Testing](#testing)
- [Deployment](#deployment)
- [Attribution and licence](#attribution-and-licence)

## Features

The dashboard is a single page. Each section answers one question about how well the forecasting
works.

| Section | What it shows |
| --- | --- |
| Current conditions | The hour now, with a sky that reflects the weather conditions |
| Daily outlook | Seven days ahead, expandable into an hour by hour strip |
| Live scoreboard | Scoring of all four models on forecasts saved before their outcome was known |
| Error by how far ahead the forecast looks | Backtested error per lead time, against persistence and climatology |
| When forecasting stops beating the long-term average | The lead time at which climatology overtakes each model |
| Chance of rain, can it be trusted? | Brier score, skill against climatology, and a reliability curve |
| How much falls in a wet hour | Rainfall amount error over wet hours only |
| Does the 90% band hold 90% of the time? | Measured coverage of the prediction intervals, per lead |
| Every forecast ever saved | Row and file counts for every stored table |

**The live scoreboard** is the honest record. Every forecast on it was written to disk before the
hour it describes had happened, then scored against ERA5 once the reanalysis caught up. It grows on
its own as the collector runs.

**The backtest** is the deeper measurement. It uses rolling-origin folds over two years of archived
forecasts, so a model is always scored on weeks that came after the weeks it trained on. Every
figure carries the window and the number of forecasts behind it.

**Intervals** are conformalised quantile regression, calibrated per variable and per lead bucket.
The page reports what share of outcomes actually landed inside the 90% band instead of assuming the
band is right.

**Rain is scored separately** from the other variables. Precipitation is mostly zero, so mean error
would be meaningless. The chance of rain is scored with the Brier score and a reliability curve, and
the amount that falls in a wet hour is a separate model scored over wet hours alone.

## Tech stack

| Layer | Technology |
| --- | --- |
| Pipeline | Python 3.13 |
| Data | pandas, NumPy, PyArrow, Parquet with zstd compression |
| Model | Hand-written gradient boosting on NumPy, no ML framework |
| HTTP | requests, against the Open-Meteo APIs |
| Pipeline tests | pytest, with LightGBM as a reference implementation |
| Dashboard | React 19, TypeScript 6, Vite 8 |
| UI | MUI 9 with Emotion |
| Charts | Chart.js 4 |
| Sun and moon | suncalc |
| Dashboard tests | Vitest 5, React Testing Library, MSW |
| Automation | GitHub Actions |
| Hosting | GitHub Pages |

The boosted model is written from scratch in [`model/gbm.py`](model/gbm.py). LightGBM appears only
in the test suite, where it is the oracle the hand-written trees are checked against.

## Architecture

There is no server and no database. The pipeline is a set of Python scripts that GitHub Actions runs
on a schedule, and everything they produce is committed to the repository as Parquet and JSON. The
dashboard is a static page that reads one file, `data/summary.json`.

### Repository layout

```text
sources/            # Fetching from the Open-Meteo APIs
  collect.py        # A forecast snapshot, every six hours
  backfill.py       # Historical forecasts from the Previous Runs API
  observe.py        # ERA5 truth, one file per day
  climate.py        # 30 years of ERA5, fetched once
  openmeteo.py      # The shared HTTP layer
model/              # Training and prediction
  gbm.py            # The gradient-boosted trees
  features.py       # Feature construction, shared by training and prediction
  training.py       # Loading and assembling the training table
  train.py          # Fits a model, scores it, promotes it if it wins
  predict.py        # Predicts the newest snapshot
  tune.py           # Hyperparameter search, run by hand
scoring/            # Everything that produces a number
  grading.py        # Joining forecasts to truth
  baselines.py      # Persistence and climatology
  evaluate.py       # Rolling-origin backtest
  intervals.py      # Interval coverage backtest
  precipitation.py  # Brier score, reliability, rainfall amount
  live.py           # The live scoreboard
  summary.py        # Writes data/summary.json
SPA/                # The dashboard
  src/components/   # One file per component, with its test beside it
  src/core/         # Constants, models, hooks, chart builders, utilities
data/               # Everything the pipeline writes
models/             # Trained model artifacts as JSON
constants.py        # Every setting in the pipeline
schema.py           # Table definitions and their behaviour
```

The three packages run in one direction. `sources` writes raw data and knows nothing downstream.
`model` reads that data and writes predictions. `scoring` reads both and writes numbers. Scripts run as modules from the repository root.

### The pipeline

Seven workflows, numbered in the order data flows through them.

| Workflow | Runs | What it does |
| --- | --- | --- |
| `1. Climate` | By hand, once | Fetches 1994 to 2023 of ERA5 for the climatology baseline |
| `2. Backfill` | Daily | Fetches historical forecasts, one day per file, from 1 March 2024 |
| `3. Observe` | Daily | Fetches ERA5 truth, one day per file, and rebuilds the summary |
| `4. Train` | Weekly | Retrains from scratch on a rolling window and promotes only on an improvement |
| `5. Collect` | Every six hours | Saves a forecast snapshot from all three models |
| `6. Predict` | After Collect | Predicts the newest snapshot and writes its intervals |
| `7. Deploy` | After Observe, Train and Predict | Builds the dashboard and publishes it |

The data flows in one direction and nothing is ever rewritten:

```text
Open-Meteo Forecast API   ->  data/forecasts/     raw snapshots, append-only
Open-Meteo Previous Runs  ->  data/backfill/      historical forecasts, one file a day
Open-Meteo Archive (ERA5) ->  data/observations/  the truth, one file a day
                          ->  data/climate/       30 years of it, for climatology

data/forecasts + models/  ->  data/predictions/   gbm_blend's forecasts
                          ->  data/intervals/     their 90% bands

everything above          ->  data/summary.json   every number the page shows
                          ->  GitHub Pages
```

ERA5 runs about six days behind real time, which is the reason the live scoreboard fills in slowly
and why the longest lead times rest on the fewest graded hours.

### The model

`gbm_blend` predicts the residual `observed - ECMWF`. Predicting zero is then equivalent to trusting
ECMWF, so the floor is the best operational model and the target carries no seasonal cycle for the
trees to waste capacity rediscovering. It sees all three models'
output, so beating any one of them is ensembling, which the page says plainly.

- One model per variable, with lead time as a feature.
- Trained on a rolling 12 month window, refitted every three months, always from scratch.
- Covers lead times of 1 to 144 hours.
- Promotion is gated. A new model replaces the current one only if it scores at least as well on the
  same forecasts, and a rejected model is still saved with `"promoted": false`.
- Intervals come from quantile models at the 5th and 95th percentiles, widened by a conformal margin
  measured on a held-out calibration block.

Full detail on the data and the pipeline is in [DATA.md](DATA.md).

## Getting started

### Prerequisites

| Requirement | Version | Notes |
| --- | --- | --- |
| [Python](https://www.python.org/downloads/) | 3.13 | The version Actions uses, set in each workflow |
| [Node.js](https://nodejs.org/) | 24 | Needed only for the dashboard |
| [.NET SDK](https://dotnet.microsoft.com/download) | Any recent | Only to mint a local HTTPS certificate |

No API key is needed. Open-Meteo's free tier covers everything the pipeline fetches, and it is for
non-commercial use.

### 1. Clone

```bash
git clone <repo-url>
cd Forecast
```

### 2. Create the Python environment

```bash
python -m venv .venv
.venv\Scripts\activate           # Windows
source .venv/bin/activate        # macOS and Linux
python -m pip install -r requirements-dev.txt
```

`requirements.txt` holds what the pipeline runs and is what every workflow installs.
`requirements-dev.txt` starts with it and adds pytest and LightGBM, so one install gives a full
development setup.

### 3. Install the dashboard

```bash
cd SPA
npm install
```

### 4. Trust a local HTTPS certificate

The dev server runs over HTTPS, so from `SPA/`:

```bash
dotnet dev-certs https --export-path certs/localhost.pem --format PEM --no-password
```

`SPA/certs/` is ignored. The dev server refuses to start without the certificate and prints this
command.

## Running the pipeline

Every script runs as a module from the repository root, with the virtual environment active.

| Command | What it does |
| --- | --- |
| `python -m sources.collect` | Saves one forecast snapshot from all three models |
| `python -m sources.backfill` | Fetches any missing days of historical forecasts |
| `python -m sources.observe` | Fetches any missing days of ERA5 truth |
| `python -m sources.climate` | Fetches any missing years of the climate history |
| `python -m model.train` | Trains, scores and possibly promotes a model |
| `python -m model.train overwrite` | Trains over today's model directory |
| `python -m model.predict` | Predicts the newest snapshot and writes its intervals |
| `python -m model.tune` | Hyperparameter search, run by hand and never scheduled |
| `python -m scoring.evaluate` | Prints the rolling-origin backtest |
| `python -m scoring.intervals` | Prints measured interval coverage |
| `python -m scoring.precipitation` | Prints the rain scores and reliability table |
| `python -m scoring.summary` | Rewrites `data/summary.json`, carrying the backtest over |
| `python -m scoring.summary backtest` | Rewrites it and recomputes the backtest, which is slow |

A run that finds nothing to do says so and exits. A run that finds a file already written leaves it
alone, because everything under `data/` is append-only.

Local runs write into `data/` and `models/`, which the author never commits. Clean up with
`git restore -- data` and `git clean -fd data`. Deleting the folder would also remove files the bot
had already committed.

## Running the dashboard

```bash
cd SPA
npm start
```

Then open <https://localhost:5174/forecast/>.

The dev server serves the repository's `data/` folder at `/forecast/data/`, so the page reads the
same `summary.json` the deployed site does. Run the pipeline at least once, or the page has nothing
to show.

| Command | Where | What it does |
| --- | --- | --- |
| `npm start` | `SPA/` | Dev server with hot reload, over HTTPS on port 5174 |
| `npm run build` | `SPA/` | Type check and production build into `dist/` |
| `npm run preview` | `SPA/` | Serves the real build under the real `/forecast/` base |
| `npm run lint` | `SPA/` | ESLint |
| `npm test` | `SPA/` | Vitest |
| `npm run check` | `SPA/` | Lint, then tests, then a production build |

## Testing

```bash
pytest                    # the pipeline, from the repository root
cd SPA && npm run check   # lint, tests and a production build
```

Both suites are offline. No test touches the network, and fixtures are small frames built in the
test itself.

The pipeline tests guard the failures that would otherwise be silent. The hand-written boosted model
is checked against LightGBM on a fixed synthetic dataset. Feature construction is checked to ignore
observations later than each row's own cutoff, which is the leakage that would make a backtest look
excellent and a live model disappoint. A trained model is checked to survive a round trip through
JSON with identical predictions.

> **Note:** `pytest` cannot rebuild while the dashboard's dev server is running against the same
> files. Stop it first if a test fails on a locked file.

## Deployment

`7. Deploy` builds the dashboard and publishes it to GitHub Pages at `/forecast/`. The build runs
`npm run check` first, so a failing lint, test or type check leaves the previous site up.

The published artifact holds the built app and `data/summary.json`. It does not carry the raw
snapshots or the models, which grow by roughly 100 MB a year against a 1 GB limit on a published
Pages site.

The site is rebuilt whenever something it publishes changes, triggered by `workflow_run` after the
workflows that write `summary.json`. A commit pushed by a workflow starts no other workflow by
GitHub's design, so watching the data path would never fire.

## Attribution and licence

Weather data comes from [Open-Meteo.com](https://open-meteo.com) under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), which is credited on the page as the
licence requires. Truth is ERA5 reanalysis, produced by ECMWF and served through Open-Meteo's
archive.

The forecasts of the three operational models belong to their originating services: NOAA for GFS,
ECMWF for IFS and DWD for ICON.

This project's own source code is [MIT licensed](LICENSE).
