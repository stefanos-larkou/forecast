import { Box } from "@mui/material";

export const MOON_BOX = "0 0 100 100";
export const MOON_RADIUS = 50;
const CRATERS = [
    { cx: 35, cy: 32, r: 9 },
    { cx: 63, cy: 44, r: 13 },
    { cx: 44, cy: 68, r: 7 },
    { cx: 26, cy: 56, r: 5 },
    { cx: 72, cy: 72, r: 5 },
    { cx: 56, cy: 21, r: 4 }
];

export function Moon({ cx, cy, r }: { cx: number, cy: number, r: number; }) {
    const scale = r / MOON_RADIUS;

    return (
        <>
            <Box component="circle" cx={cx} cy={cy} r={r} sx={{ fill: theme => theme.vars.palette.weather.moon }} />
            {CRATERS.map(crater => (
                <Box
                    component="circle"
                    key={`${crater.cx} ${crater.cy}`}
                    cx={cx + (crater.cx - MOON_RADIUS) * scale}
                    cy={cy + (crater.cy - MOON_RADIUS) * scale}
                    r={crater.r * scale}
                    sx={{ fill: theme => theme.vars.palette.weather.crater }}
                />
            ))}
        </>
    );
}
