import { Box, Paper, Stack, Typography } from "@mui/material";
import { CROSSOVER_BEYOND, CROSSOVER_CAPTION, CROSSOVER_HEADING, CROSSOVER_LIMIT, CROSSOVER_SERIES, VARIABLES } from "../core/constants";
import type { Backtest, Crossover } from "../core/models/summary";
import { useChartStyle } from "../core/hooks/useChartStyle";

const TWO_BLOCKS_FROM = 680;
const LABEL_WIDTH = 15;
const VALUE_WIDTH = 8;
const BAR_HEIGHT = 1;

function Horizon({ crossover }: { crossover: Crossover; }) {
    const style = useChartStyle();

    return (
        <Stack component="dl" spacing={1} sx={{ m: 0, mt: 1 }}>
            {CROSSOVER_SERIES.map(series => {
                const lead = crossover[series.key];
                const reached = lead === null;

                return (
                    <Stack key={series.key} direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <Typography variant="caption" component="dt" sx={{ width: theme => theme.spacing(LABEL_WIDTH), color: "text.secondary" }}>
                            {series.label}
                        </Typography>
                        <Box
                            aria-hidden="true"
                            sx={{ flex: 1, height: theme => theme.spacing(BAR_HEIGHT), borderRadius: 999, backgroundColor: "action.hover", overflow: "hidden" }}
                        >
                            <Box
                                sx={{
                                    height: "100%",
                                    width: `${((lead ?? CROSSOVER_LIMIT) / CROSSOVER_LIMIT) * 100}%`,
                                    backgroundColor: style.series[series.colour]
                                }}
                            />
                        </Box>
                        <Typography
                            variant="caption"
                            component="dd"
                            sx={{ width: theme => theme.spacing(VALUE_WIDTH), m: 0, textAlign: "right", color: reached ? "text.primary" : "text.secondary" }}
                        >
                            {reached ? CROSSOVER_BEYOND : `${lead} h`}
                        </Typography>
                    </Stack>
                );
            })}
        </Stack>
    );
}

export function SkillHorizon({ backtest }: { backtest: Backtest; }) {
    return (
        <Box component="section" sx={{ mt: 4 }}>
            <Typography variant="h2" sx={{ mb: 2 }}>{CROSSOVER_HEADING}</Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr",
                        [`@media (min-width: ${TWO_BLOCKS_FROM}px)`]: { gridTemplateColumns: "repeat(2, 1fr)" },
                        gap: 3
                    }}
                >
                    {VARIABLES.map(variable => (
                        <Box key={variable.key}>
                            <Typography variant="h6" component="h3">{variable.label}</Typography>
                            <Horizon crossover={backtest.crossover[variable.key]} />
                        </Box>
                    ))}
                </Box>
            </Paper>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 2 }}>{CROSSOVER_CAPTION}</Typography>
        </Box>
    );
}
