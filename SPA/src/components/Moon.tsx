import { Box } from "@mui/material";

// Craters laid out in a moon of radius MOON_UNIT, then scaled to whatever
// radius the caller draws at, so the hero and the hourly icons wear the same
// face. Each is kept clear of the rim, so none is clipped.
const MOON_UNIT = 50;
const CRATERS = [
    { cx: 35, cy: 32, r: 9 },
    { cx: 63, cy: 44, r: 13 },
    { cx: 44, cy: 68, r: 7 },
    { cx: 26, cy: 56, r: 5 },
    { cx: 72, cy: 72, r: 5 },
    { cx: 56, cy: 21, r: 4 }
];

export function Moon({ cx, cy, r }: { cx: number, cy: number, r: number; }) {
    const scale = r / MOON_UNIT;

    return (
        <>
            <Box component="circle" cx={cx} cy={cy} r={r} sx={{ fill: theme => theme.vars.palette.weather.moon }} />
            {CRATERS.map(crater => (
                <Box
                    component="circle"
                    key={`${crater.cx} ${crater.cy}`}
                    cx={cx + (crater.cx - MOON_UNIT) * scale}
                    cy={cy + (crater.cy - MOON_UNIT) * scale}
                    r={crater.r * scale}
                    sx={{ fill: theme => theme.vars.palette.weather.crater }}
                />
            ))}
        </>
    );
}
