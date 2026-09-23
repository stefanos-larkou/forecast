import { useMemo } from "react";
import { Stack, Typography } from "@mui/material";
import { MUTED_ON_SKY, RAIN_WORTH_SHOWING } from "../core/constants";
import type { Coordinates, Forecast, HourlyRow } from "../core/models/summary";
import { hourlyRows, upcomingRows } from "../core/utils/forecast";
import { formatMeasurement, formatTime } from "../core/utils/format";
import { isNight, weatherState } from "../core/utils/weather";
import { ScrollStrip } from "./ScrollStrip";
import { WeatherIcon } from "./WeatherIcon";

const HOUR_WIDTH = 8;

export function HourlyStrip({ forecast, where }: { forecast: Forecast, where: Coordinates; }) {
    const rows = useMemo(() => hourlyRows(forecast), [forecast]);
    const hours = upcomingRows(rows, new Date());
    const wet = (hour: HourlyRow) => hour.rain >= RAIN_WORTH_SHOWING;

    if (hours.length === 0) {
        return null;
    }

    return (
        <Stack sx={{ mt: 3 }}>
            <ScrollStrip back="Earlier hours" forward="Later hours">
                {hours.map(hour => (
                    <Stack
                        component="li"
                        key={hour.at}
                        spacing={0.5}
                        sx={{
                            alignItems: "center",
                            flex: "0 0 auto",
                            width: theme => theme.spacing(HOUR_WIDTH),
                            py: 1,
                            borderRadius: 1,
                            "&:hover": { backgroundColor: "glass.fill" }
                        }}
                    >
                        <Typography variant="body2" sx={{ opacity: MUTED_ON_SKY }}>{formatTime(hour.at)}</Typography>
                        <WeatherIcon state={weatherState(hour)} night={isNight(hour.at, where)} />
                        <Typography variant="body1" sx={{ fontWeight: "medium" }}>{formatMeasurement("temperature_2m", hour.temperature)}</Typography>
                        <Typography variant="body2" sx={{ opacity: MUTED_ON_SKY, visibility: wet(hour) ? "visible" : "hidden" }}>
                            {formatMeasurement("rain_probability", hour.rain)}
                        </Typography>
                    </Stack>
                ))}
            </ScrollStrip>
        </Stack>
    );
}
