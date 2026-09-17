from pathlib import Path

import pandas as pd


COLUMNS = ["location", "run_time", "valid_time", "lead_hours", "model", "variable", "value", "source"]
CATEGORY_COLUMNS = ["location", "model", "variable", "source"]


def finalise(df: pd.DataFrame) -> pd.DataFrame:
    df = df.dropna(subset=["value"])
    df["lead_hours"] = df["lead_hours"].astype("int32")
    df["value"] = df["value"].astype("float32")

    for column in CATEGORY_COLUMNS:
        df[column] = df[column].astype("category")
        
    return df[COLUMNS]


def write(df: pd.DataFrame, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    df.to_parquet(path, compression="zstd", index=False)
