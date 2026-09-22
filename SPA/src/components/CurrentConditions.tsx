import { useMemo } from "react";
import { Paper, Stack, Typography } from "@mui/material";
import type { Forecast } from "../core/models/summary";
import { currentRow, hourlyRows } from "../core/utils/forecast";
import { formatDateTime, formatMeasurement } from "../core/utils/format";

export function CurrentConditions({ forecast }: { forecast: Forecast; }) {
    const rows = useMemo(() => hourlyRows(forecast), [forecast]);
    const now = currentRow(rows, new Date());

    if (!now) {
        return null;
    }

    const alongside = [
        { label: "Chance of rain", value: formatMeasurement("rain_probability", now.rain) },
        { label: "Cloud Cover", value: formatMeasurement("cloud_cover", now.cloud) },
        { label: "Wind Speed", value: formatMeasurement("wind_speed_10m", now.wind) },
        { label: "Humidity", value: formatMeasurement("relative_humidity_2m", now.humidity) }
    ];

    return (
        <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="overline" component="p" color="text.secondary">
                {`Forecast issued ${formatDateTime(forecast.run_time)}`}
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 2, sm: 4 }} sx={{ alignItems: { sm: "baseline" }, mt: 1 }}>
                <Typography variant="h2" component="p">{formatMeasurement("temperature_2m", now.temperature)}</Typography>
                <Typography variant="body1" color="text.secondary">
                    {`${formatMeasurement("temperature_2m", now.lower)} to ${formatMeasurement("temperature_2m", now.upper)}, nine times in ten`}
                </Typography>
            </Stack>
            <Stack component="dl" direction="row" spacing={4} useFlexGap sx={{ flexWrap: "wrap", mt: 2, mb: 0 }}>
                {alongside.map(({ label, value }) => (
                    <div key={label}>
                        <Typography variant="overline" component="dt" color="text.secondary">{label}</Typography>
                        <Typography component="dd" sx={{ m: 0 }}>{value}</Typography>
                    </div>
                ))}
            </Stack>
        </Paper>
    );
}
