import { useMemo } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { MUTED_ON_SKY, variableLabel, WEATHER_LABELS } from "../core/constants";
import type { Coordinates, Forecast } from "../core/models/summary";
import { currentRow, hourlyRows } from "../core/utils/forecast";
import { formatDateTime, formatMeasurement } from "../core/utils/format";
import { chanceLabel, isNight, weatherState } from "../core/utils/weather";
import { HourlyStrip } from "./HourlyStrip";
import { Sky } from "./Sky";

export function CurrentConditions({ forecast, where }: { forecast: Forecast, where: Coordinates; }) {
    const rows = useMemo(() => hourlyRows(forecast), [forecast]);
    const now = currentRow(rows, new Date());

    if (!now) {
        return null;
    }

    const state = weatherState(now);
    const alongside = [
        { label: chanceLabel(state), value: formatMeasurement("rain_probability", now.rain) },
        { label: variableLabel("cloud_cover"), value: formatMeasurement("cloud_cover", now.cloud) },
        { label: variableLabel("wind_speed_10m"), value: formatMeasurement("wind_speed_10m", now.wind) },
        { label: variableLabel("relative_humidity_2m"), value: formatMeasurement("relative_humidity_2m", now.humidity) }
    ];

    return (
        <Sky state={state} night={isNight(now.at, where)}>
            <Box sx={{ p: 3 }}>
                <Stack component="section" aria-label="Current conditions">
                    <Typography variant="overline" component="p" sx={{ opacity: MUTED_ON_SKY }}>
                        {`${WEATHER_LABELS[state]} \u00b7 forecast issued ${formatDateTime(forecast.run_time)}`}
                    </Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 2, sm: 4 }} sx={{ alignItems: { sm: "baseline" }, mt: 1 }}>
                        <Typography variant="h2" component="p">{formatMeasurement("temperature_2m", now.temperature)}</Typography>
                        <Typography variant="body1" sx={{ opacity: MUTED_ON_SKY }}>
                            {`${formatMeasurement("temperature_2m", now.lower)} - ${formatMeasurement("temperature_2m", now.upper)}, 90% of the time`}
                        </Typography>
                    </Stack>
                    <Stack component="dl" direction="row" spacing={4} useFlexGap sx={{ flexWrap: "wrap", mt: 2, mb: 0 }}>
                        {alongside.map(({ label, value }) => (
                            <div key={label}>
                                <Typography variant="overline" component="dt" sx={{ opacity: MUTED_ON_SKY }}>{label}</Typography>
                                <Typography component="dd" sx={{ m: 0 }}>{value}</Typography>
                            </div>
                        ))}
                    </Stack>
                </Stack>
                <HourlyStrip forecast={forecast} />
            </Box>
        </Sky>
    );
}
