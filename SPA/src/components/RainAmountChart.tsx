import { useMemo } from "react";
import { AMOUNT_HEADING } from "../core/constants";
import { rainAmountConfig, rainAmountTable } from "../core/charts/rain-amount";
import { useChartStyle } from "../core/hooks/useChartStyle";
import type { RainAmount } from "../core/models/summary";
import { ChartPanel } from "./ChartPanel";

export function RainAmountChart({ amount }: { amount: RainAmount; }) {
    const style = useChartStyle();
    const config = useMemo(() => rainAmountConfig(amount, style), [amount, style]);
    const table = useMemo(() => rainAmountTable(amount), [amount]);

    return (
        <ChartPanel
            title={AMOUNT_HEADING}
            label={`${AMOUNT_HEADING}: mean absolute error in millimetres by hours ahead, over wet hours only`}
            config={config}
            table={table}
        />
    );
}
