import { Suspense, lazy, useMemo, useState } from "react";
import { Box, ButtonBase, Paper, Stack, Typography } from "@mui/material";
import { RAIN_WORTH_SHOWING } from "../core/constants";
import type { Forecast } from "../core/models/summary";
import { dailyRows, hourlyRows, hoursOfDay } from "../core/utils/forecast";
import { formatDate, formatMeasurement, formatWeekday } from "../core/utils/format";
import { ScrollStrip } from "./ScrollStrip";
import { WeatherIcon } from "./WeatherIcon";

const DayDetail = lazy(() => import("./DayDetail"));

const CARD_WIDTH = 17;
const DAY_ICON_SIZE = 34;
const TODAY = "Today";
const RAIN_SUFFIX = "rain";

export function DailyOutlook({ forecast }: { forecast: Forecast; }) {
    const rows = useMemo(() => hourlyRows(forecast), [forecast]);
    const days = useMemo(() => dailyRows(rows), [rows]);
    const [opened, setOpened] = useState("");

    if (days.length === 0) {
        return null;
    }

    return (
        <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
            <Typography variant="overline" component="h2" sx={{ color: "text.secondary" }}>The week ahead</Typography>
            <ScrollStrip back="Earlier days" forward="Later days" spacing={0.5}>
                {days.map((day, index) => (
                    <Box component="li" key={day.at} sx={{ flex: "0 0 auto", width: theme => theme.spacing(CARD_WIDTH) }}>
                        <ButtonBase
                            onClick={() => setOpened(day.at)}
                            sx={{
                                display: "block",
                                width: "100%",
                                px: 1,
                                py: 1.5,
                                borderRadius: 1.5,
                                border: "1px solid transparent",
                                "&:hover, &:focus-visible": { backgroundColor: "action.hover", borderColor: "divider" }
                            }}
                        >
                            <Stack spacing={1} sx={{ alignItems: "center" }}>
                                <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                                    {index === 0 ? TODAY : formatWeekday(day.at)}
                                </Typography>
                                <Typography variant="caption" sx={{ color: "text.secondary" }}>{formatDate(day.at)}</Typography>
                                <WeatherIcon state={day.state} size={DAY_ICON_SIZE} />
                                <Stack direction="row" spacing={1} sx={{ alignItems: "baseline" }}>
                                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                        {formatMeasurement("temperature_2m", day.high)}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "text.disabled" }}>
                                        {formatMeasurement("temperature_2m", day.low)}
                                    </Typography>
                                </Stack>
                                <Typography variant="caption" sx={{ color: theme => theme.vars.palette.weather.rain, visibility: day.rain >= RAIN_WORTH_SHOWING ? "visible" : "hidden" }}>
                                    {`${formatMeasurement("rain_probability", day.rain)} ${RAIN_SUFFIX}`}
                                </Typography>
                            </Stack>
                        </ButtonBase>
                    </Box>
                ))}
            </ScrollStrip>
            {opened !== "" && (
                <Suspense fallback={null}>
                    <DayDetail hours={hoursOfDay(rows, opened)} onClose={() => setOpened("")} />
                </Suspense>
            )}
        </Paper>
    );
}
