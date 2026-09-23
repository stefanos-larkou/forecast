import { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import type { WeatherState } from "../core/models/weather";

interface Settings {
    spacing: number;
    speed: [number, number];
    length: [number, number];
    size: [number, number];
    alpha: [number, number];
    slant: number;
    sway: number;
    flakes: boolean;
}

interface Particle {
    x: number;
    y: number;
    speed: number;
    length: number;
    size: number;
    alpha: number;
    phase: number;
    drift: number;
}

const FALLING: Partial<Record<WeatherState, Settings>> = {
    drizzle: { spacing: 14, speed: [180, 300], length: [4, 9], size: [0.6, 1.1], alpha: [0.18, 0.4], slant: 0.05, sway: 0, flakes: false },
    showers: { spacing: 11, speed: [300, 620], length: [6, 16], size: [0.8, 1.6], alpha: [0.22, 0.55], slant: 0.09, sway: 0, flakes: false },
    rain: { spacing: 9, speed: [420, 940], length: [8, 24], size: [1, 2.2], alpha: [0.25, 0.7], slant: 0.12, sway: 0, flakes: false },
    downpour: { spacing: 5, speed: [700, 1400], length: [16, 40], size: [1.4, 3], alpha: [0.35, 0.85], slant: 0.2, sway: 0, flakes: false },
    snow: { spacing: 16, speed: [26, 68], length: [0, 0], size: [1, 2.8], alpha: [0.45, 0.95], slant: 0, sway: 14, flakes: true },
    heavySnow: { spacing: 9, speed: [48, 120], length: [0, 0], size: [1.2, 3.4], alpha: [0.5, 1], slant: 0.06, sway: 40, flakes: true }
};

const STREAK = "206, 228, 246";
const FLAKE = "255, 255, 255";
const LONGEST_FRAME = 0.05;
const MS_PER_SECOND = 1000;
const STREAK_WIDTH = 0.7;
const FLAKE_BRIGHTER = 0.2;
const RESET_SCATTER = 40;
const WRAP_MARGIN = 20;
const DRIFT = [0.4, 1.5] as const;

function between([low, high]: readonly [number, number]): number {
    return low + Math.random() * (high - low);
}

function seed(settings: Settings, width: number, height: number): Particle[] {
    return Array.from({ length: Math.round(width / settings.spacing) }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: between(settings.speed),
        length: between(settings.length),
        size: between(settings.size),
        alpha: between(settings.alpha),
        phase: Math.random() * Math.PI * 2,
        drift: between(DRIFT)
    }));
}

function paint(context: CanvasRenderingContext2D, particles: Particle[], settings: Settings, elapsed: number, width: number, height: number): void {
    context.clearRect(0, 0, width, height);

    for (const particle of particles) {
        particle.y += particle.speed * elapsed;

        if (!settings.flakes) {
            particle.x += particle.speed * elapsed * settings.slant;
            context.strokeStyle = `rgba(${STREAK}, ${particle.alpha})`;
            context.lineWidth = particle.size * STREAK_WIDTH;
            context.beginPath();
            context.moveTo(particle.x, particle.y);
            context.lineTo(particle.x - particle.length * settings.slant, particle.y - particle.length);
            context.stroke();
        }
        else {
            particle.phase += elapsed * particle.drift;
            particle.x += Math.sin(particle.phase) * settings.sway * elapsed;
            context.fillStyle = `rgba(${FLAKE}, ${particle.alpha + FLAKE_BRIGHTER})`;
            context.beginPath();
            context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            context.fill();
        }

        if (particle.y - particle.length > height) {
            particle.y = -particle.length - Math.random() * RESET_SCATTER;
            particle.x = Math.random() * width;
        }

        if (particle.x > width + WRAP_MARGIN) particle.x = -WRAP_MARGIN;
        if (particle.x < -WRAP_MARGIN) particle.x = width + WRAP_MARGIN;
    }
}

export function FallingWeather({ state }: { state: WeatherState; }) {
    const canvas = useRef<HTMLCanvasElement>(null);
    const settings = FALLING[state];

    useEffect(() => {
        const node = canvas.current;
        if (!node || settings === undefined) {
            return;
        }

        const context = node.getContext("2d");
        if (context === null) {
            return;
        }

        let particles: Particle[] = [];
        let width = 0;
        let height = 0;

        const measure = () => {
            const box = node.getBoundingClientRect();
            const ratio = window.devicePixelRatio || 1;
            width = box.width;
            height = box.height;
            node.width = Math.round(width * ratio);
            node.height = Math.round(height * ratio);
            context.setTransform(ratio, 0, 0, ratio, 0, 0);
            particles = seed(settings, width, height);
        };

        measure();
        window.addEventListener("resize", measure);

        const still = window.matchMedia("(prefers-reduced-motion: reduce)");
        if (still.matches) {
            paint(context, particles, settings, 0, width, height);
            return () => window.removeEventListener("resize", measure);
        }

        let frame = 0;
        let previous = performance.now();
        const step = (now: number) => {
            paint(context, particles, settings, Math.min((now - previous) / MS_PER_SECOND, LONGEST_FRAME), width, height);
            previous = now;
            frame = requestAnimationFrame(step);
        };

        frame = requestAnimationFrame(step);

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("resize", measure);
        };
    }, [settings]);

    if (settings === undefined) {
        return null;
    }

    return (
        <Box
            component="canvas"
            ref={canvas}
            aria-hidden="true"
            sx={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, width: "100%", height: "100%", display: "block", pointerEvents: "none" }}
        />
    );
}
