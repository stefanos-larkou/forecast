import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import { MUTED_ON_SKY, RAIN_WORTH_SHOWING } from "../core/constants";
import type { Coordinates, Forecast, HourlyRow } from "../core/models/summary";
import { hourlyRows, upcomingRows } from "../core/utils/forecast";
import { formatMeasurement, formatTime } from "../core/utils/format";
import { isNight, weatherState } from "../core/utils/weather";
import { WeatherIcon } from "./WeatherIcon";

const PAGE_SHARE = 0.8;
const EDGE_TOLERANCE = 8;
const PRIMARY_BUTTON = 0;
const EDGE_SPACE = 5;
const CHEVRONS = { back: "M15 5l-7 7 7 7", forward: "M9 5l7 7-7 7" };
const CHEVRON_SIZE = 18;
const CHEVRON_STROKE = 2;
const BUTTON_SIZE = 34;
const BUTTON_BLUR = "blur(6px)";
const EDGE_BUTTON = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    color: "inherit",
    border: "1px solid",
    borderColor: "glass.edge",
    backgroundColor: "glass.fill",
    backdropFilter: BUTTON_BLUR,
    "&:hover": { backgroundColor: "glass.hover" },
    "&.Mui-disabled": { opacity: 0, pointerEvents: "none" }
};

function Chevron({ facing }: { facing: keyof typeof CHEVRONS; }) {
    return (
        <Box component="svg" viewBox="0 0 24 24" width={CHEVRON_SIZE} height={CHEVRON_SIZE} aria-hidden="true" sx={{ display: "block" }}>
            <Box
                component="path"
                d={CHEVRONS[facing]}
                sx={{ fill: "none", stroke: "currentColor", strokeWidth: CHEVRON_STROKE, strokeLinecap: "round", strokeLinejoin: "round" }}
            />
        </Box>
    );
}

function scroll(strip: HTMLOListElement | null, direction: 1 | -1): void {
    strip?.scrollBy({ left: direction * strip.clientWidth * PAGE_SHARE, behavior: "smooth" });
}

function reachOf(strip: HTMLOListElement): { start: boolean, end: boolean; } {
    const room = strip.scrollWidth - strip.clientWidth;
    return { start: strip.scrollLeft <= EDGE_TOLERANCE, end: strip.scrollLeft >= room - EDGE_TOLERANCE };
}

export function HourlyStrip({ forecast, where }: { forecast: Forecast, where: Coordinates; }) {
    const rows = useMemo(() => hourlyRows(forecast), [forecast]);
    const hours = upcomingRows(rows, new Date());
    const strip = useRef<HTMLOListElement>(null);
    const [reach, setReach] = useState({ start: true, end: true });
    const wet = (hour: HourlyRow) => hour.rain >= RAIN_WORTH_SHOWING;

    const drag = useRef<{ x: number, from: number, to: number, frame: number | null; } | null>(null);

    function beginDrag(event: PointerEvent<HTMLOListElement>) {
        if (event.pointerType !== "mouse" || event.button !== PRIMARY_BUTTON) {
            return;
        }

        const strip = event.currentTarget;
        drag.current = { x: event.clientX, from: strip.scrollLeft, to: strip.scrollLeft, frame: null };
        strip.setPointerCapture(event.pointerId);
        event.preventDefault();
    }

    // Pointer moves arrive faster than the screen redraws, so the position is
    // kept and written once a frame.
    function continueDrag(event: PointerEvent<HTMLOListElement>) {
        const started = drag.current;
        if (!started) {
            return;
        }

        const strip = event.currentTarget;
        started.to = started.from - (event.clientX - started.x);
        started.frame ??= requestAnimationFrame(() => {
            strip.scrollLeft = started.to;
            started.frame = null;
        });
    }

    function endDrag(event: PointerEvent<HTMLOListElement>) {
        if (!drag.current) {
            return;
        }

        if (drag.current.frame !== null) {
            cancelAnimationFrame(drag.current.frame);
            event.currentTarget.scrollLeft = drag.current.to;
        }

        drag.current = null;
        event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const measure = useCallback(() => {
        if (!strip.current) return;
        const next = reachOf(strip.current);
        setReach(current => current.start === next.start && current.end === next.end ? current : next);
    }, []);

    useEffect(() => {
        const node = strip.current;
        if (!node) {
            return;
        }

        measure();
        node.addEventListener("scroll", measure, { passive: true });
        window.addEventListener("resize", measure);
        return () => {
            node.removeEventListener("scroll", measure);
            window.removeEventListener("resize", measure);
        };
    }, [measure, hours.length]);

    if (hours.length === 0) {
        return null;
    }

    return (
        <Box sx={{ position: "relative", mt: 3, px: EDGE_SPACE }}>
            <Stack
                component="ol"
                ref={strip}
                direction="row"
                spacing={1}
                onPointerDown={beginDrag}
                onPointerMove={continueDrag}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                sx={{
                    listStyle: "none",
                    p: 0,
                    m: 0,
                    overflowX: "auto",
                    scrollbarWidth: "none",
                    cursor: "grab",
                    "&:active": { cursor: "grabbing" },
                    "&::-webkit-scrollbar": { display: "none" }
                }}
            >
                {hours.map(hour => (
                    <Stack
                        component="li"
                        key={hour.at}
                        spacing={0.5}
                        sx={{
                            alignItems: "center",
                            flex: "0 0 auto",
                            width: theme => theme.spacing(8),
                            py: 1,
                            borderRadius: 1,
                            "&:hover": { backgroundColor: "glass.fill" }
                        }}
                    >
                        <Typography variant="caption" sx={{ opacity: MUTED_ON_SKY }}>{formatTime(hour.at)}</Typography>
                        <WeatherIcon state={weatherState(hour)} night={isNight(hour.at, where)} />
                        <Typography variant="body2" sx={{ fontWeight: "medium" }}>{formatMeasurement("temperature_2m", hour.temperature)}</Typography>
                        <Typography variant="caption" sx={{ opacity: MUTED_ON_SKY, visibility: wet(hour) ? "visible" : "hidden" }}>
                            {formatMeasurement("rain_probability", hour.rain)}
                        </Typography>
                    </Stack>
                ))}
            </Stack>
            <IconButton aria-label="Earlier hours" disabled={reach.start} onClick={() => scroll(strip.current, -1)} sx={{ ...EDGE_BUTTON, left: 0 }}>
                <Chevron facing="back" />
            </IconButton>
            <IconButton aria-label="Later hours" disabled={reach.end} onClick={() => scroll(strip.current, 1)} sx={{ ...EDGE_BUTTON, right: 0 }}>
                <Chevron facing="forward" />
            </IconButton>
        </Box>
    );
}
