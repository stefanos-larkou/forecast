import { useMemo } from "react";
import { RELIABILITY_HEADING } from "../core/constants";
import { reliabilityConfig, reliabilityTable } from "../core/charts/reliability";
import { useChartStyle } from "../core/hooks/useChartStyle";
import type { Rain } from "../core/models/summary";
import { ChartPanel } from "./ChartPanel";

export function ReliabilityChart({ rain }: { rain: Rain; }) {
    const style = useChartStyle();
    const config = useMemo(() => reliabilityConfig(rain, style), [rain, style]);
    const table = useMemo(() => reliabilityTable(rain), [rain]);

    return (
        <ChartPanel
            title={RELIABILITY_HEADING}
            label={`${RELIABILITY_HEADING}: the share of hours that were wet against the chance given them`}
            config={config}
            table={table}
        />
    );
}
