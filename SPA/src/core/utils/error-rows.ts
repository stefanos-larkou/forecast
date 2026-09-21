import { BACKTEST_SERIES } from "../constants";
import type { Backtest, ErrorRow, VariableKey } from "../models/summary";

export function errorRows(backtest: Backtest, variable: VariableKey): ErrorRow[] {
    const errors = backtest.metrics.mae[variable];
    return BACKTEST_SERIES.flatMap(({ key, label }) => backtest.leads.flatMap((lead, index) => {
        const error = errors[key][index];
        return error === undefined ? [] : [{ series: label, lead, error }];
    }));
}
