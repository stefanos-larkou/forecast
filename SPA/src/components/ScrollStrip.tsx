import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent, PointerEvent, ReactNode } from "react";
import { Box, IconButton, Stack } from "@mui/material";

const SCROLL_STEP_SHARE = 0.8;
const EDGE_TOLERANCE = 8;
const PRIMARY_BUTTON = 0;
const DRAG_SLOP = 4;
const BUTTON_GUTTER = 5;
const CHEVRON_BOX = "0 0 24 24";
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
        <Box component="svg" viewBox={CHEVRON_BOX} width={CHEVRON_SIZE} height={CHEVRON_SIZE} aria-hidden="true" sx={{ display: "block" }}>
            <Box
                component="path"
                d={CHEVRONS[facing]}
                sx={{ fill: "none", stroke: "currentColor", strokeWidth: CHEVRON_STROKE, strokeLinecap: "round", strokeLinejoin: "round" }}
            />
        </Box>
    );
}

function scroll(strip: HTMLOListElement | null, direction: 1 | -1): void {
    strip?.scrollBy({ left: direction * strip.clientWidth * SCROLL_STEP_SHARE, behavior: "smooth" });
}

function reachOf(strip: HTMLOListElement): { start: boolean, end: boolean; } {
    const room = strip.scrollWidth - strip.clientWidth;
    return { start: strip.scrollLeft <= EDGE_TOLERANCE, end: strip.scrollLeft >= room - EDGE_TOLERANCE };
}

export function ScrollStrip({ back, forward, spacing = 1, children }: { back: string, forward: string, spacing?: number, children: ReactNode; }) {
    const strip = useRef<HTMLOListElement>(null);
    const [reach, setReach] = useState({ start: true, end: true });
    const drag = useRef<{ x: number, from: number, to: number, frame: number | null, moved: boolean; } | null>(null);
    const dragged = useRef(false);
    const fits = reach.start && reach.end;

    function beginDrag(event: PointerEvent<HTMLOListElement>) {
        if (event.pointerType !== "mouse" || event.button !== PRIMARY_BUTTON) {
            return;
        }

        drag.current = { x: event.clientX, from: event.currentTarget.scrollLeft, to: event.currentTarget.scrollLeft, frame: null, moved: false };
    }

    function continueDrag(event: PointerEvent<HTMLOListElement>) {
        const started = drag.current;
        if (!started) {
            return;
        }

        const node = event.currentTarget;
        if (!started.moved && Math.abs(event.clientX - started.x) > DRAG_SLOP) {
            started.moved = true;
            node.setPointerCapture(event.pointerId);
        }

        if (!started.moved) {
            return;
        }

        started.to = started.from - (event.clientX - started.x);
        started.frame ??= requestAnimationFrame(() => {
            node.scrollLeft = started.to;
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

        dragged.current = drag.current.moved;
        if (drag.current.moved) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }

        drag.current = null;
    }

    function swallowDraggedClick(event: MouseEvent<HTMLOListElement>) {
        if (dragged.current) {
            event.preventDefault();
            event.stopPropagation();
            dragged.current = false;
        }
    }

    const measure = useCallback(() => {
        if (!strip.current) return;
        const next = reachOf(strip.current);
        setReach(current => current.start === next.start && current.end === next.end ? current : next);
    }, []);

    useEffect(measure);

    useEffect(() => {
        const node = strip.current;
        if (!node) {
            return;
        }

        node.addEventListener("scroll", measure, { passive: true });
        window.addEventListener("resize", measure);
        return () => {
            node.removeEventListener("scroll", measure);
            window.removeEventListener("resize", measure);
        };
    }, [measure]);

    return (
        <Box sx={{ position: "relative", px: fits ? 0 : BUTTON_GUTTER }}>
            <Stack
                component="ol"
                ref={strip}
                direction="row"
                spacing={spacing}
                onPointerDown={beginDrag}
                onPointerMove={continueDrag}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onClickCapture={swallowDraggedClick}
                sx={{
                    listStyle: "none",
                    p: 0,
                    m: 0,
                    overflowX: "auto",
                    justifyContent: fits ? "center" : "flex-start",
                    scrollbarWidth: "none",
                    cursor: fits ? "default" : "grab",
                    userSelect: "none",
                    "&:active": { cursor: "grabbing" },
                    "&::-webkit-scrollbar": { display: "none" }
                }}
            >
                {children}
            </Stack>
            <IconButton aria-label={back} disabled={reach.start} onClick={() => scroll(strip.current, -1)} sx={{ ...EDGE_BUTTON, left: 0 }}>
                <Chevron facing="back" />
            </IconButton>
            <IconButton aria-label={forward} disabled={reach.end} onClick={() => scroll(strip.current, 1)} sx={{ ...EDGE_BUTTON, right: 0 }}>
                <Chevron facing="forward" />
            </IconButton>
        </Box>
    );
}
