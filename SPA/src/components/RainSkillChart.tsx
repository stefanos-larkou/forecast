import { useMemo } from "react";
import { RAIN_SKILL_HEADING } from "../core/constants";
import { rainSkillConfig, rainSkillTable } from "../core/charts/rain-skill";
import { useChartStyle } from "../core/hooks/useChartStyle";
import type { Rain } from "../core/models/summary";
import { ChartPanel } from "./ChartPanel";

export function RainSkillChart({ rain }: { rain: Rain; }) {
    const style = useChartStyle();
    const config = useMemo(() => rainSkillConfig(rain, style), [rain, style]);
    const table = useMemo(() => rainSkillTable(rain), [rain]);

    return (
        <ChartPanel
            title={RAIN_SKILL_HEADING}
            label={`${RAIN_SKILL_HEADING}: Brier skill by hours ahead, where zero is climatology`}
            config={config}
            table={table}
        />
    );
}
