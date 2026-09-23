import type { ReactNode } from "react";
import { Box } from "@mui/material";
import { keyframes } from "@mui/system";
import type { SkyPalette } from "../core/theme";
import { WET_STATES } from "../core/constants";
import { Moon } from "./Moon";
import type { WeatherState } from "../core/models/weather";
import { FallingWeather } from "./FallingWeather";

const CLOUD_PATH = "M26 48a17 17 0 0 1 .4-33.6A23 23 0 0 1 68 12a15 15 0 0 1 22 12 13 13 0 0 1-3 24z";
const CLOUD_BOX = "0 0 120 56";

const CLOUDS = [
    { top: "8%", width: 19, duration: 46, started: 6, opacity: 0.92 },
    { top: "44%", width: 13, duration: 46, started: 29, opacity: 0.74 },
    { top: "24%", width: 10, duration: 58, started: 19, opacity: 0.62 },
    { top: "60%", width: 16, duration: 52, started: 40, opacity: 0.84 },
    { top: "2%", width: 11, duration: 64, started: 52, opacity: 0.55 },
    { top: "34%", width: 17, duration: 50, started: 12, opacity: 0.8 },
    { top: "70%", width: 12, duration: 56, started: 34, opacity: 0.66 },
    { top: "16%", width: 14, duration: 42, started: 25, opacity: 0.7 }
];
const CLOUDS_SHOWN: Partial<Record<WeatherState, number>> = { partly: 4, overcast: 8 };
const CLOUDS_WHEN_WET = 4;
const CLOUD_NIGHT_FADE = 0.4;

const MOON_BOX = "0 0 100 100";
const MOON_CENTRE = 50;
const SUN = { top: "12%", right: "12%", size: 10 };
const MOON = { top: "18%", right: "12%", size: 7 };
const CLOUD_FROM = "-20%";
const CLOUD_TO = "110%";
const SUNSHINE_SIZE = 50;
const MOONSHINE_SIZE = 26;
const SUNSHINE_THROUGH_CLOUD = 0.3;

const drift = keyframes({
    from: { left: CLOUD_FROM },
    to: { left: CLOUD_TO }
});

function skyKey(state: WeatherState, night: boolean): keyof SkyPalette {
    if (!night) return state;
    const dull = state === "overcast" || WET_STATES.includes(state);
    return dull ? "dullNight" : "night";
}

function cloudCount(state: WeatherState): number {
    if (state === "clear") return 0;
    return CLOUDS_SHOWN[state] ?? CLOUDS_WHEN_WET;
}

export function Sky({ state, night, children }: { state: WeatherState, night: boolean, children: ReactNode; }) {
    const clouds = CLOUDS.slice(0, cloudCount(state));
    const wet = WET_STATES.includes(state);
    const tone = skyKey(state, night);
    const shine = night ? { size: MOONSHINE_SIZE, colour: "moonshine" } as const : { size: SUNSHINE_SIZE, colour: "sunshine" } as const;

    return (
        <Box
            sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 1,
                background: theme => theme.vars.palette.sky[tone].background,
                color: theme => theme.vars.palette.sky[tone].ink
            }}
        >
            {state !== "overcast" && !wet && (
                <Box
                    sx={{
                        position: "absolute",
                        top: night ? MOON.top : SUN.top,
                        right: night ? MOON.right : SUN.right,
                        width: theme => theme.spacing(night ? MOON.size : SUN.size),
                        height: theme => theme.spacing(night ? MOON.size : SUN.size)
                    }}
                >
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: theme => theme.spacing(shine.size),
                            height: theme => theme.spacing(shine.size),
                            borderRadius: "50%",
                            background: theme => theme.vars.palette.weather[shine.colour],
                            opacity: state === "partly" ? SUNSHINE_THROUGH_CLOUD : 1,
                            pointerEvents: "none"
                        }}
                    />
                    {night ? (
                        <Box
                            component="svg"
                            viewBox={MOON_BOX}
                            aria-hidden="true"
                            sx={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, width: "100%", height: "100%", display: "block" }}
                        >
                            <Moon cx={MOON_CENTRE} cy={MOON_CENTRE} r={MOON_CENTRE} />
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                position: "absolute",
                                top: 0,
                                right: 0,
                                bottom: 0,
                                left: 0,
                                borderRadius: "50%",
                                backgroundColor: theme => theme.vars.palette.weather.sun
                            }}
                        />
                    )}
                </Box>
            )}
            {clouds.map(cloud => (
                <Box
                    component="svg"
                    key={cloud.top}
                    viewBox={CLOUD_BOX}
                    aria-hidden="true"
                    sx={{
                        position: "absolute",
                        top: cloud.top,
                        width: theme => theme.spacing(cloud.width),
                        height: "auto",
                        display: "block",
                        fill: theme => theme.vars.palette.sky[tone].cloud,
                        opacity: night ? cloud.opacity * CLOUD_NIGHT_FADE : cloud.opacity,
                        animation: `${drift} ${cloud.duration}s linear -${cloud.started}s infinite`
                    }}
                >
                    <path d={CLOUD_PATH} />
                </Box>
            ))}
            <FallingWeather state={state} />
            <Box sx={{ position: "relative" }}>{children}</Box>
        </Box>
    );
}
