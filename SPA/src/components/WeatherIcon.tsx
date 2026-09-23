import { Box } from "@mui/material";
import { WEATHER_LABELS, WET_STATES } from "../core/constants";
import type { WeatherState } from "../core/models/weather";

const RAYS = [0, 45, 90, 135, 180, 225, 270, 315];
const RAY_GAP = 1.5;
const RAY_LENGTH = 3.5;
const RAY_WIDTH = 1.6;
const SUN = { cx: 12, cy: 12, r: 5 };
const SUN_BEHIND_CLOUD = { cx: 15, cy: 8, r: 3.6 };
const ICON_SIZE = 28;
const ICON_BOX = "0 0 24 24";
const DROP_TOP = 19;
const DROP_WIDTH = 1.8;
const DROP_LENGTH = 3;
const DRIZZLE_LENGTH = 1.6;
const DOWNPOUR_LENGTH = 4.5;
const CLOUD = [
    "M7 17",
    "h9.5",
    "a3.5 3.5 0 0 0 .3-7",
    "5 5 0 0 0-9.6-.7",
    "A3.6 3.6 0 0 0 7 17",
    "z"
].join(" ");
const DRIZZLE_DROPS = [10, 14];
const SHOWER_DROPS = [9.5, 14];
const RAIN_DROPS = [8.5, 12, 15.5];
const DOWNPOUR_DROPS = [8, 10.8, 13.6, 16.4];
const SNOW_FLAKES = [[10, 19.4, 1.9], [14.2, 21.6, 1.4]];
const HEAVY_SNOW_FLAKES = [[8.8, 19.3, 1.9], [12, 21.8, 1.4], [15.2, 19.8, 1.7]];

function Sun({ cx, cy, r }: { cx: number, cy: number, r: number; }) {
    return (
        <>
            <Box component="circle" cx={cx} cy={cy} r={r} sx={{ fill: theme => theme.vars.palette.weather.sun }} />
            {RAYS.map(angle => (
                <Box
                    component="line"
                    key={angle}
                    x1={cx}
                    y1={cy - r - RAY_GAP}
                    x2={cx}
                    y2={cy - r - RAY_LENGTH}
                    transform={`rotate(${angle} ${cx} ${cy})`}
                    sx={{ stroke: theme => theme.vars.palette.weather.sun, strokeWidth: RAY_WIDTH, strokeLinecap: "round" }}
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

function Drops({ at, length = DROP_LENGTH }: { at: number[], length?: number; }) {
    return (
        <>
            {at.map(x => (
                <Box
                    component="line"
                    key={x}
                    x1={x}
                    y1={DROP_TOP}
                    x2={x - length / 2}
                    y2={DROP_TOP + length}
                    sx={{ stroke: theme => theme.vars.palette.weather.rain, strokeWidth: DROP_WIDTH, strokeLinecap: "round" }}
                />
            ))}
        </>
    );
}

function Flakes({ at }: { at: number[][]; }) {
    return (
        <>
            {at.map(([x, y, radius]) => (
                <Box
                    component="circle"
                    key={x}
                    cx={x}
                    cy={y}
                    r={radius}
                    sx={{ fill: theme => theme.vars.palette.weather.snow }}
                />
            ))}
        </>
    );
}

export function WeatherIcon({ state, size = ICON_SIZE }: { state: WeatherState, size?: number; }) {
    return (
        <Box component="svg" viewBox={ICON_BOX} width={size} height={size} role="img" aria-label={WEATHER_LABELS[state]} sx={{ display: "block" }}>
            {state === "clear" && <Sun {...SUN} />}
            {state === "partly" && <Sun {...SUN_BEHIND_CLOUD} />}
            {state !== "clear" && <Cloud raining={WET_STATES.includes(state)} />}
            {state === "drizzle" && <Drops at={DRIZZLE_DROPS} length={DRIZZLE_LENGTH} />}
            {state === "showers" && <Drops at={SHOWER_DROPS} />}
            {state === "rain" && <Drops at={RAIN_DROPS} />}
            {state === "downpour" && <Drops at={DOWNPOUR_DROPS} length={DOWNPOUR_LENGTH} />}
            {state === "snow" && <Flakes at={SNOW_FLAKES} />}
            {state === "heavySnow" && <Flakes at={HEAVY_SNOW_FLAKES} />}
        </Box>
    );
}
