from dataclasses import dataclass
from pathlib import Path

import pandas as pd

from constants import PARQUET_COMPRESSION


@dataclass(frozen=True)
class Table:
    columns: dict[str, str]

    def finalise(self, df: pd.DataFrame) -> pd.DataFrame:
        return df.dropna(subset=list(self.columns)).astype(self.columns)[list(self.columns)]

    def write(self, df: pd.DataFrame, path: Path) -> None:
        if list(df.dtypes.astype(str).items()) != list(self.columns.items()):
            raise ValueError(f"{path}: frame does not match the table schema.")

        path.parent.mkdir(parents=True, exist_ok=True)
        df.to_parquet(path, compression=PARQUET_COMPRESSION, index=False)


FORECASTS = Table({
    "location": "category",
    "run_time": "datetime64[us, UTC]",
    "valid_time": "datetime64[us, UTC]",
    "lead_hours": "int32",
    "model": "category",
    "variable": "category",
    "value": "float32",
    "source": "category"
})


OBSERVATIONS = Table({
    "location": "category",
    "valid_time": "datetime64[us, UTC]",
    "variable": "category",
    "value": "float32"
})


INTERVALS = Table({
    "location": "category",
    "run_time": "datetime64[us, UTC]",
    "valid_time": "datetime64[us, UTC]",
    "lead_hours": "int32",
    "model": "category",
    "variable": "category",
    "lower": "float32",
    "upper": "float32",
    "source": "category"
})
