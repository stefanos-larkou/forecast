import { useMemo } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { LIVE_ABOUT, LIVE_CAPTION, LIVE_FORECASTS, LIVE_HEADING, LIVE_RAIN_ABOUT, LIVE_RAIN_EXPLAINER, LIVE_RAIN_LABEL, LIVE_SECTION, LIVE_THROUGH, LIVE_WAITING, LIVE_WIDE_VARIABLE, VARIABLES, variableLabel } from "../core/constants";
import { liveMaeConfig, liveMaeTable } from "../core/charts/live-mae";
import { liveRainConfig, liveRainTable } from "../core/charts/live-rain";
import { useChartStyle } from "../core/hooks/useChartStyle";
import type { LiveErrors, LiveRain, LiveRecord, VariableKey } from "../core/models/summary";
import { formatUtcDate } from "../core/utils/format";
import { ChartGrid } from "./ChartGrid";
import { ChartPanel } from "./ChartPanel";
import { InfoTip } from "./InfoTip";

const WHOLE_ROW = { gridColumn: "1 / -1" };

function LiveChart({ leads, errors, counts, variable }: { leads: number[], errors: LiveErrors, counts: number[], variable: VariableKey; }) {
    const style = useChartStyle();
    const label = variableLabel(variable);
    const config = useMemo(() => liveMaeConfig(leads, errors, variable, style), [leads, errors, variable, style]);
    const table = useMemo(() => liveMaeTable(leads, errors, counts, LIVE_FORECASTS), [leads, errors, counts]);

    return <ChartPanel title={label} label={`${label}, live: mean absolute error by hours ahead`} config={config} table={table} />;
}

function RainChart({ rain }: { rain: LiveRain; }) {
    const style = useChartStyle();
    const config = useMemo(() => liveRainConfig(rain, style), [rain, style]);
    const table = useMemo(() => liveRainTable(rain, LIVE_FORECASTS), [rain]);

    return (
        <ChartPanel
            title={LIVE_RAIN_LABEL}
            label={`${LIVE_RAIN_LABEL}, live: Brier score by hours ahead, where lower is better`}
            about={LIVE_RAIN_EXPLAINER}
            aboutLabel={LIVE_RAIN_ABOUT}
            config={config}
            table={table}
        />
    );
}

export default function LiveScoreboard({ live }: { live: LiveRecord; }) {
    const leaderboard = live.leaderboard;
    if (leaderboard === null) {
        return null;
    }

    return (
        <Box component="section" sx={{ mt: 4 }}>
            <Typography variant="overline" component="p" sx={{ color: "text.secondary" }}>
                {`${LIVE_SECTION} \u00b7 ${LIVE_THROUGH} ${formatUtcDate(live.truth_until)}`}
            </Typography>
            <Stack direction="row" sx={{ alignItems: "center", gap: 0.5, mb: 2 }}>
                <Typography variant="h2">{LIVE_HEADING}</Typography>
                <InfoTip about={`${LIVE_CAPTION} ${LIVE_WAITING}`} label={LIVE_ABOUT} />
            </Stack>
            <ChartGrid>
                {VARIABLES.filter(variable => leaderboard.mae[variable.key] !== undefined).map(variable => (
                    <Box key={variable.key} sx={variable.key === LIVE_WIDE_VARIABLE ? WHOLE_ROW : undefined}>
                        <LiveChart
                            leads={leaderboard.leads}
                            errors={leaderboard.mae[variable.key] ?? {}}
                            counts={leaderboard.counts}
                            variable={variable.key}
                        />
                    </Box>
                ))}
                {live.rain !== null && <RainChart rain={live.rain} />}
            </ChartGrid>
        </Box>
    );
}
