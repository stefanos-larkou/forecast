import { useMemo } from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { RAIN_WORTH_SHOWING } from "../core/constants";
import type { Forecast, HourlyRow } from "../core/models/summary";
import { hourlyRows, upcomingRows } from "../core/utils/forecast";
import { formatMeasurement, formatTime } from "../core/utils/format";

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
                        <Typography variant="body2">{formatMeasurement("temperature_2m", hour.temperature)}</Typography>
                        {anyRain && (
                            <Box sx={{ width: "100%", height: theme => theme.spacing(5), display: "flex", alignItems: "flex-end" }}>
                                <Box
                                    sx={{
                                        width: "100%",
                                        height: `${Math.max(hour.rain * 100, 2)}%`,
                                        borderRadius: 1,
                                        backgroundColor: theme => wet(hour) ? theme.vars.palette.series.ecmwf : theme.vars.palette.divider
                                    }}
                                />
                            </Box>
                        )}
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
