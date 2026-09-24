import { useMemo } from "react";
import { COVERAGE_HEADING } from "../core/constants";
import { coverageConfig, coverageTable } from "../core/charts/coverage";
import { useChartStyle } from "../core/hooks/useChartStyle";
import type { Coverage } from "../core/models/summary";
import { ChartPanel } from "./ChartPanel";

export function CoverageChart({ coverage }: { coverage: Coverage; }) {
    const style = useChartStyle();
    const config = useMemo(() => coverageConfig(coverage, style), [coverage, style]);
    const table = useMemo(() => coverageTable(coverage), [coverage]);

    return (
        <ChartPanel
            title={COVERAGE_HEADING}
            label={`${COVERAGE_HEADING}: the share of outcomes that landed inside the forecast band, by hours ahead`}
            config={config}
            table={table}
        />
    );
}
