import { useMemo } from "react";
import { Paper, Stack, Typography } from "@mui/material";
import { RAIN_WORTH_SHOWING } from "../core/constants";
import type { Forecast, HourlyRow } from "../core/models/summary";
import { hourlyRows, upcomingRows } from "../core/utils/forecast";
import { formatMeasurement, formatTime } from "../core/utils/format";
import { weatherState } from "../core/utils/weather";
import { WeatherIcon } from "./WeatherIcon";

export function HourlyStrip({ forecast }: { forecast: Forecast; }) {
    const rows = useMemo(() => hourlyRows(forecast), [forecast]);
    const hours = upcomingRows(rows, new Date());
    const wet = (hour: HourlyRow) => hour.rain >= RAIN_WORTH_SHOWING;
    const anyRain = hours.some(wet);

    if (hours.length === 0) {
        return null;
    }

    return (
        <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
            <Typography variant="overline" component="h2" color="text.secondary">Hour by hour</Typography>
            <Stack
                component="ol"
                direction="row"
                spacing={1}
                sx={{ listStyle: "none", p: 0, m: 0, mt: 1, overflowX: "auto", scrollSnapType: "x mandatory" }}
            >
                {hours.map(hour => (
                    <Stack
                        component="li"
                        key={hour.at}
                        spacing={0.5}
                        sx={{ alignItems: "center", flex: "0 0 auto", width: theme => theme.spacing(8), py: 1, scrollSnapAlign: "start" }}
                    >
                        <Typography variant="caption" color="text.secondary">{formatTime(hour.at)}</Typography>
                        <WeatherIcon state={weatherState(hour)} />
                        <Typography variant="body2">{formatMeasurement("temperature_2m", hour.temperature)}</Typography>
                        {anyRain && (
                            <Typography variant="caption" color="text.secondary">
                                {wet(hour) ? formatMeasurement("rain_probability", hour.rain) : ""}
                            </Typography>
                        )}
                    </Stack>
                ))}
            </Stack>
        </Paper>
    );
}
