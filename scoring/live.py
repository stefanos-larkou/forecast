from collections.abc import Iterable

import pandas as pd

from constants import BAND_LEVEL, BLEND_MODEL, LIVE_BRIER_DECIMALS, MAE_VARIABLES, MODEL_MAX_LEAD_HOURS, MODELS, RAIN_PROBABILITY_VARIABLE, RAIN_VARIABLE, SCORING_KEY, SUMMARY_DECIMALS
from model.predict import lead_bucket
from scoring.grading import grade
from scoring.precipitation import wet


def rounded(values: Iterable[float], decimals: int = SUMMARY_DECIMALS) -> list:
    return [round(float(value), decimals) for value in values]


def graded_leads(leads: Iterable) -> list[int]:
    return sorted(int(lead) for lead in set(leads))


def whole_days(rows: pd.DataFrame) -> pd.DataFrame:
    return rows.assign(lead_hours=lead_bucket(rows["lead_hours"]))


def hours_per_lead(errors: pd.DataFrame, leads: pd.Series) -> pd.Series:
    hours = pd.Series(errors.index.get_level_values("valid_time"), index=errors.index)
    return hours.groupby(leads, observed=True).nunique()


def hours_scored(rows: pd.DataFrame) -> pd.Series:
    return rows.groupby("lead_hours", observed=True)["valid_time"].nunique()


def build_leaderboard(forecasts: pd.DataFrame, predictions: pd.DataFrame, observations: pd.DataFrame) -> dict | None:
    if predictions.empty:
        return None

    saved = pd.concat([forecasts, predictions], ignore_index=True)
    saved = saved[saved["variable"].isin(MAE_VARIABLES) & (saved["lead_hours"] <= MODEL_MAX_LEAD_HOURS)]
    scored = grade(saved, observations)
    if scored.empty:
        return None

    by_model = scored.pivot_table(index=SCORING_KEY, columns="model", values="value", observed=True)
    methods = [model for model in [BLEND_MODEL, *MODELS] if model in by_model.columns]
    if BLEND_MODEL not in methods:
        return None

    truth = scored.drop_duplicates(SCORING_KEY).set_index(SCORING_KEY)["value_observed"]
    compared = by_model[methods].join(truth).dropna()
    if compared.empty:
        return None

    errors = compared[methods].sub(compared["value_observed"], axis=0).abs()
    variables = errors.index.get_level_values("variable")
    leads = lead_bucket(pd.Series(errors.index.get_level_values("lead_hours"), index=errors.index))
    mae = errors.groupby([variables, leads], observed=True).mean()
    counted = hours_per_lead(errors, leads)
    shown = graded_leads(leads)

    return {
        "leads": shown,
        "forecasts": len(compared),
        "counts": [int(counted.loc[lead]) for lead in shown],
        "mae": {
            variable: {method: rounded(mae.loc[(variable, lead), method] for lead in shown) for method in methods}
            for variable in MAE_VARIABLES if variable in set(variables)
        }
    }


def build_coverage(intervals: pd.DataFrame, observations: pd.DataFrame) -> dict | None:
    if intervals.empty:
        return None

    band = intervals.merge(observations.rename(columns={"value": "observed"}), on=["location", "variable", "valid_time"], how="inner", validate="many_to_one")
    if band.empty:
        return None

    band = whole_days(band)
    leads = graded_leads(band["lead_hours"])
    inside = band.assign(inside=((band["observed"] >= band["lower"]) & (band["observed"] <= band["upper"])).astype("float64"))
    held = inside.groupby(["variable", "lead_hours"], observed=True)["inside"].mean()
    counted = hours_scored(inside)

    return {
        "leads": leads,
        "forecasts": len(band),
        "level": round(BAND_LEVEL, SUMMARY_DECIMALS),
        "counts": [int(counted.loc[lead]) for lead in leads],
        "inside": {
            variable: rounded(held.loc[(variable, lead)] for lead in leads)
            for variable in MAE_VARIABLES if variable in held.index.get_level_values("variable")
        }
    }


def build_rain(predictions: pd.DataFrame, observations: pd.DataFrame) -> dict | None:
    if predictions.empty:
        return None

    chances = predictions[predictions["variable"] == RAIN_PROBABILITY_VARIABLE]
    truth = observations[observations["variable"] == RAIN_VARIABLE]
    scored = chances.merge(
        truth.rename(columns={"value": "observed"})[["location", "valid_time", "observed"]],
        on=["location", "valid_time"],
        how="inner",
        validate="many_to_one"
    )
    if scored.empty:
        return None

    scored = whole_days(scored)
    leads = graded_leads(scored["lead_hours"])
    squared = scored.assign(wet=wet(scored["observed"]))
    squared = squared.assign(brier=(squared["value"] - squared["wet"]) ** 2)
    scores = squared.groupby("lead_hours", observed=True)["brier"].mean()
    counted = hours_scored(squared)

    return {
        "leads": leads,
        "forecasts": len(scored),
        "wet_share": round(float(squared["wet"].mean()), SUMMARY_DECIMALS),
        "counts": [int(counted.loc[lead]) for lead in leads],
        "brier": rounded((scores.loc[lead] for lead in leads), LIVE_BRIER_DECIMALS)
    }
