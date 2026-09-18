import pandas as pd

from constants import BACKFILL_DIR, LEADERBOARD_DECIMALS, MAE_VARIABLES, OBSERVATIONS_DIR
from scoring.baselines import with_bias_correction, with_persistence
from scoring.grading import grade


def score(graded: pd.DataFrame, observations: pd.DataFrame) -> pd.DataFrame:
    scored = with_persistence(with_bias_correction(graded, graded), observations)
    fair = scored.dropna(subset=["trailing_bias", "persisted"])
    fair = fair.assign(
        raw=(fair["value"] - fair["value_observed"]).abs(),
        corrected=(fair["value_corrected"] - fair["value_observed"]).abs(),
        persistence=(fair["persisted"] - fair["value_observed"]).abs()
    )
    return fair.groupby(["variable", "lead_hours", "model"], observed=True)[["raw", "corrected", "persistence"]].mean()


def main() -> None:
    observations = pd.read_parquet(OBSERVATIONS_DIR)
    graded = grade(pd.read_parquet(BACKFILL_DIR), observations)
    table = score(graded, observations)

    for variable in MAE_VARIABLES:
        print(f"\n{variable}: mean absolute error, backfill")
        print(table.loc[variable].astype("float64").round(LEADERBOARD_DECIMALS).unstack("model").to_string())


if __name__ == "__main__":
    main()
