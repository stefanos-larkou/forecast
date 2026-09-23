import { Box } from "@mui/material";
import type { WeatherState } from "../core/utils/weather";
import { WEATHER_LABELS } from "../core/utils/weather";

const RAYS = [0, 45, 90, 135, 180, 225, 270, 315];
const CLOUD = [
    "M7 17",                    // start at the bottom left
    "h9.5",                     // flat base, 9.5 to the right
    "a3.5 3.5 0 0 0 .3-7",      // right bump, curving up 7
    "5 5 0 0 0-9.6-.7",         // top bump, curving left 9.6
    "A3.6 3.6 0 0 0 7 17",      // left bump, back down to the start
    "z"                         // close the shape
].join(" ");
const SHOWER_DROPS = [9, 15];
const RAIN_DROPS = [7, 12, 17];

function Sun({ cx, cy, r }: { cx: number, cy: number, r: number; }) {
    return (
        <>
            <Box component="circle" cx={cx} cy={cy} r={r} sx={{ fill: theme => theme.vars.palette.weather.sun }} />
            {RAYS.map(angle => (
                <Box
                    component="line"
                    key={angle}
                    x1={cx}
                    y1={cy - r - 1.5}
                    x2={cx}
                    y2={cy - r - 3.5}
                    transform={`rotate(${angle} ${cx} ${cy})`}
                    sx={{ stroke: theme => theme.vars.palette.weather.sun, strokeWidth: 1.6, strokeLinecap: "round" }}
                />
            ))}
        </>
    );
}

function Cloud({ raining }: { raining: boolean; }) {
    return (
        <Box
            component="path"
            d={CLOUD}
            sx={{ fill: theme => raining ? theme.vars.palette.weather.rainCloud : theme.vars.palette.weather.cloud }}
        />
    );
}

function Drops({ at }: { at: number[]; }) {
    return (
        <>
            {at.map(x => (
                <Box
                    component="line"
                    key={x}
                    x1={x}
                    y1={19}
                    x2={x - 1.5}
                    y2={22}
                    sx={{ stroke: theme => theme.vars.palette.weather.rain, strokeWidth: 1.8, strokeLinecap: "round" }}
                />
            ))}
        </>
    );
}

export function WeatherIcon({ state, size = 28 }: { state: WeatherState, size?: number; }) {
    return (
        <Box component="svg" viewBox="0 0 24 24" width={size} height={size} role="img" aria-label={WEATHER_LABELS[state]} sx={{ display: "block" }}>
            {state === "clear" && <Sun cx={12} cy={12} r={5} />}
            {state === "partly" && <Sun cx={15} cy={8} r={3.6} />}
            {state !== "clear" && <Cloud raining={state === "rain" || state === "showers"} />}
            {state === "showers" && <Drops at={SHOWER_DROPS} />}
            {state === "rain" && <Drops at={RAIN_DROPS} />}
        </Box>
    );
}
