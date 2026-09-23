import { useMemo } from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { RAIN_WORTH_SHOWING } from "../core/constants";
import type { Forecast } from "../core/models/summary";
import { dailyRows, hourlyRows } from "../core/utils/forecast";
import { formatMeasurement, formatWeekday } from "../core/utils/format";
import { WeatherIcon } from "./WeatherIcon";
import { weatherState } from "../core/utils/weather";

export function DailyOutlook({ forecast }: { forecast: Forecast; }) {
    const days = useMemo(() => dailyRows(hourlyRows(forecast)), [forecast]);

    if (days.length === 0) {
        return null;
    }

    return (
        <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
            <Typography variant="overline" component="h2" color="text.secondary">The week ahead</Typography>
            <Stack component="ol" spacing={1} sx={{ listStyle: "none", p: 0, m: 0, mt: 1 }}>
                {days.map(day => (
                    <Stack
                        component="li"
                        key={day.at}
                        direction="row"
                        spacing={2}
                        sx={{ alignItems: "baseline", justifyContent: "space-between" }}
                    >
                        <WeatherIcon state={weatherState(day)} size={24} />
                        <Typography variant="body1" sx={{ flex: 1 }}>{formatWeekday(day.at)}</Typography>
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
                ))}
            </Stack>
        </Paper>
    );
}
