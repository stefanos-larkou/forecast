import { useMemo } from "react";
import { Box, Stack, Typography } from "@mui/material";
import type { Theme } from "@mui/material";
import { MUTED_ON_SKY, PAGE_MAX_WIDTH, PLACE, TWO_COLUMNS_FROM, variableLabel, WEATHER_LABELS } from "../core/constants";
import type { Coordinates, Forecast } from "../core/models/summary";
import { currentRow, hourlyRows } from "../core/utils/forecast";
import { formatDateTime, formatMeasurement } from "../core/utils/format";
import { evenColumns, responsiveColumns } from "../core/utils/layout";
import { chanceLabel, isNight, weatherState } from "../core/utils/weather";
import { HourlyStrip } from "./HourlyStrip";
import { Sky } from "./Sky";

const ISSUED_PREFIX = "Forecast issued";
const INTERVAL_LABEL = "90% interval";
const LABEL_TYPE = { opacity: MUTED_ON_SKY, fontSize: (theme: Theme) => theme.typography.body2.fontSize };
const FOUR_COLUMNS_FROM = 600;

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
            <Box sx={{ maxWidth: PAGE_MAX_WIDTH, mx: "auto", px: 2, py: 3 }}>
                <Stack component="section" aria-label="Current conditions">
                    <Stack direction="row" spacing={1.5} useFlexGap sx={{ alignItems: "baseline", flexWrap: "wrap" }}>
                        <Typography variant="h4" component="h1">{PLACE}</Typography>
                        <Typography variant="body2" sx={{ opacity: MUTED_ON_SKY }}>
                            {`${ISSUED_PREFIX} ${formatDateTime(forecast.run_time)}`}
                        </Typography>
                    </Stack>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 1, sm: 4 }} sx={{ alignItems: { sm: "flex-end" }, mt: 2 }}>
                        <Typography variant="h1" component="p">{formatMeasurement("temperature_2m", now.temperature)}</Typography>
                        <Stack sx={{ pb: 1 }}>
                            <Typography variant="overline" component="p" sx={LABEL_TYPE}>{INTERVAL_LABEL}</Typography>
                            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                {`${formatMeasurement("temperature_2m", now.lower)} - ${formatMeasurement("temperature_2m", now.upper)}`}
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: MUTED_ON_SKY }}>{WEATHER_LABELS[state]}</Typography>
                        </Stack>
                    </Stack>
                    <Box
                        component="dl"
                        sx={{
                            ...responsiveColumns({ [TWO_COLUMNS_FROM]: evenColumns(2), [FOUR_COLUMNS_FROM]: evenColumns(4) }),
                            gap: 2,
                            mt: 2,
                            mb: 0
                        }}
                    >
                        {alongside.map(({ label, value }) => (
                            <div key={label}>
                                <Typography variant="overline" component="dt" sx={LABEL_TYPE}>{label}</Typography>
                                <Typography variant="h6" component="dd" sx={{ m: 0 }}>{value}</Typography>
                            </div>
                        ))}
                    </Box>
                </Stack>
                <HourlyStrip forecast={forecast} where={where} />
            </Box>
        </Sky>
    );
}
