import type { ReactNode } from "react";
import { Box } from "@mui/material";
import { keyframes } from "@mui/system";
import type { SkyPalette } from "../core/theme";
import type { WeatherState } from "../core/utils/weather";

// Each cloud starts off the left edge and drifts across. A negative delay starts
// it part-way through, so the sky already has clouds in it when the page loads.
const CLOUDS = [
    { top: "14%", width: 11, height: 4, duration: 90, started: 24, opacity: 0.9 },
    { top: "42%", width: 7, height: 2.6, duration: 130, started: 74, opacity: 0.7 },
    { top: "6%", width: 5, height: 2, duration: 170, started: 132, opacity: 0.55 }
];

const DROPS = [8, 21, 34, 47, 60, 73, 86, 95];
const SUNSHINE_SIZE = 50;
const SUNSHINE_THROUGH_CLOUD = 0.3;

const drift = keyframes({
    from: { transform: "translateX(0)" },
    to: { transform: "translateX(140vw)" }
});

const fall = keyframes({
    from: { transform: "translateY(-20%)", opacity: 0 },
    "10%": { opacity: 0.55 },
    to: { transform: "translateY(120%)", opacity: 0 }
});

function skyKey(state: WeatherState, night: boolean): keyof SkyPalette {
    if (!night) return state;
    const dull = state === "overcast" || state === "showers" || state === "rain";
    return dull ? "dullNight" : "night";
}

export function Sky({ state, night, children }: { state: WeatherState, night: boolean, children: ReactNode; }) {
    const clouds = state === "clear" ? [] : CLOUDS.slice(0, state === "partly" ? 2 : 3);
    const raining = state === "rain" || state === "showers";
    const tone = skyKey(state, night);

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
            {state !== "overcast" && !raining && (
                <Box
                    sx={{
                        position: "absolute",
                        top: night ? "18%" : "12%",
                        right: "12%",
                        width: theme => theme.spacing(night ? 7 : 10),
                        height: theme => theme.spacing(night ? 7 : 10)
                    }}
                >
                    {!night && (
                        <Box
                            sx={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                width: theme => theme.spacing(SUNSHINE_SIZE),
                                height: theme => theme.spacing(SUNSHINE_SIZE),
                                borderRadius: "50%",
                                background: theme => theme.vars.palette.weather.sunshine,
                                opacity: state === "partly" ? SUNSHINE_THROUGH_CLOUD : 1,
                                pointerEvents: "none"
                            }}
                        />
                    )}
                    <Box
                        sx={{
                            position: "absolute",
                            inset: 0,
                            borderRadius: "50%",
                            backgroundColor: theme => night ? theme.vars.palette.weather.moon : theme.vars.palette.weather.sun
                        }}
                    />
                </Box>
            )}
            {clouds.map(cloud => (
                <Box
                    key={cloud.top}
                    sx={{
                        position: "absolute",
                        top: cloud.top,
                        left: theme => `-${theme.spacing(cloud.width)}`,
                        width: theme => theme.spacing(cloud.width),
                        height: theme => theme.spacing(cloud.height),
                        borderRadius: 999,
                        backgroundColor: "#ffffff",
                        opacity: night ? cloud.opacity * 0.4 : cloud.opacity,
                        filter: "blur(0.5px)",
                        animation: `${drift} ${cloud.duration}s linear -${cloud.started}s infinite`,
                        "&::before, &::after": {
                            content: '""',
                            position: "absolute",
                            backgroundColor: "inherit",
                            borderRadius: "50%"
                        },
                        "&::before": { width: "45%", height: "190%", left: "12%", bottom: "35%" },
                        "&::after": { width: "32%", height: "150%", right: "16%", bottom: "30%" }
                    }}
                />
            ))}
            {raining && DROPS.map(left => (
                <Box
                    key={left}
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: `${left}%`,
                        width: "1.5px",
                        height: theme => theme.spacing(2.5),
                        borderRadius: 999,
                        backgroundColor: "#e0f2fe",
                        animation: `${fall} ${state === "rain" ? 0.9 : 1.6}s linear ${left / 100}s infinite`
                    }}
                />
            ))}
            <Box sx={{ position: "relative" }}>{children}</Box>
        </Box>
    );
}
