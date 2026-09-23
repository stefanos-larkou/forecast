import { Suspense, lazy, useMemo, useState } from "react";
import { Box, ButtonBase, Paper, Stack, Typography } from "@mui/material";
import { RAIN_WORTH_SHOWING } from "../core/constants";
import type { Forecast } from "../core/models/summary";
import { dailyRows, hourlyRows, hoursOfDay } from "../core/utils/forecast";
import { formatMeasurement, formatWeekday } from "../core/utils/format";
import { WeatherIcon } from "./WeatherIcon";
import { weatherState } from "../core/utils/weather";

const DayDetail = lazy(() => import("./DayDetail"));

export function DailyOutlook({ forecast }: { forecast: Forecast; }) {
    const rows = useMemo(() => hourlyRows(forecast), [forecast]);
    const days = useMemo(() => dailyRows(rows), [rows]);
    const [opened, setOpened] = useState("");

    if (days.length === 0) {
        return null;
    }

    return (
        <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
            <Typography variant="overline" component="h2" color="text.secondary">The week ahead</Typography>
            <Stack component="ol" spacing={1} sx={{ listStyle: "none", p: 0, m: 0, mt: 1 }}>
                {days.map(day => (
                    <li key={day.at}>
                        <Stack
                            component={ButtonBase}
                            direction="row"
                            spacing={2}
                            onClick={() => setOpened(day.at)}
                            sx={{ alignItems: "baseline", justifyContent: "space-between", width: "100%", px: 1, py: 0.5, borderRadius: 1, textAlign: "left" }}
                        >
                            <WeatherIcon state={weatherState({ ...day, temperature: day.high })} size={24} />
                            <Typography variant="body1" sx={{ flex: 1 }}>{formatWeekday(day.at)}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ width: theme => theme.spacing(8), textAlign: "right" }}>
                                {day.rain >= RAIN_WORTH_SHOWING ? formatMeasurement("rain_probability", day.rain) : ""}
                            </Typography>
                            <Box sx={{ width: theme => theme.spacing(16), textAlign: "right" }}>
                                <Typography component="span" variant="body2" color="text.secondary">
                                    {formatMeasurement("temperature_2m", day.low)}
                                </Typography>
                                <Typography component="span" variant="body1" sx={{ ml: 1 }}>
                                    {formatMeasurement("temperature_2m", day.high)}
                                </Typography>
                            </Box>
                        </Stack>
                    </li>
                ))}
            </Stack>
            {opened !== "" && (
                <Suspense fallback={null}>
                    <DayDetail hours={hoursOfDay(rows, opened)} onClose={() => setOpened("")} />
                </Suspense>
            )}
        </Paper>
    );
}
