import { createTheme } from "@mui/material/styles";

interface ThemeIconPalette {
    main: string;
    hover: string;
}

interface BrandPalette {
    main: string;
    soft: string;
}

export interface SkyTone {
    background: string;
    ink: string;
    cloud: string;
}

export interface SkyPalette {
    clear: SkyTone;
    partly: SkyTone;
    overcast: SkyTone;
    drizzle: SkyTone;
    showers: SkyTone;
    rain: SkyTone;
    downpour: SkyTone;
    snow: SkyTone;
    heavySnow: SkyTone;
    night: SkyTone;
    dullNight: SkyTone;
}

export interface GlassPalette {
    fill: string;
    hover: string;
    edge: string;
}

export interface WeatherPalette {
    sun: string;
    sunshine: string;
    moon: string;
    snow: string;
    cloud: string;
    rainCloud: string;
    rain: string;
}

export interface SeriesPalette {
    ours: string;
    band: string;
    ecmwf: string;
    gfs: string;
    icon: string;
    reference: string;
}

declare module "@mui/material/styles" {
    interface Palette {
        themeIcon: ThemeIconPalette;
        brand: BrandPalette;
        series: SeriesPalette;
        weather: WeatherPalette;
        sky: SkyPalette;
        glass: GlassPalette;
    }

    interface PaletteOptions {
        themeIcon?: ThemeIconPalette;
        brand?: BrandPalette;
        series?: SeriesPalette;
        weather?: WeatherPalette;
        sky?: SkyPalette;
        glass?: GlassPalette;
    }

    interface CssThemeVariables {
        enabled: true;
    }
}

export const theme = createTheme({
    cssVariables: {
        colorSchemeSelector: "class"
    },
    colorSchemes: {
        light: {
            palette: {
                primary: { main: "#1f6feb" },
                background: {
                    default: "#f5f4fa",
                    paper: "#ffffff"
                },
                themeIcon: {
                    main: "#0a6f88",
                    hover: "rgba(10, 111, 136, 0.12)"
                },
                brand: {
                    main: "#6a54b0",
                    soft: "rgba(106, 84, 176, 0.32)"
                },
                sky: {
                    clear: { background: "linear-gradient(175deg, #4e9bdd, #d8ecfa)", ink: "#0a2032", cloud: "#ffffff" },
                    partly: { background: "linear-gradient(175deg, #5c9ed4, #cfe2f0)", ink: "#0a2032", cloud: "#ffffff" },
                    overcast: { background: "linear-gradient(175deg, #7b8b9c, #bfcbd5)", ink: "#16222c", cloud: "#f0f4f8" },
                    drizzle: { background: "linear-gradient(175deg, #77879a, #a7b4c0)", ink: "#16222c", cloud: "#5a6773" },
                    showers: { background: "linear-gradient(175deg, #728495, #93a1ad)", ink: "#0f1821", cloud: "#505d69" },
                    rain: { background: "linear-gradient(175deg, #48586a, #5e7283)", ink: "#f3f8fc", cloud: "#46535f" },
                    downpour: { background: "linear-gradient(175deg, #333f4d, #61717f)", ink: "#f3f8fc", cloud: "#2c3742" },
                    snow: { background: "linear-gradient(175deg, #7c8a9c, #d9e2ea)", ink: "#17212b", cloud: "#e9eff5" },
                    heavySnow: { background: "linear-gradient(175deg, #5e6a78, #aeb9c4)", ink: "#121a22", cloud: "#e9eff5" },
                    night: { background: "linear-gradient(170deg, #0b1220 0%, #1e293b 55%, #334155 100%)", ink: "#f8fafc", cloud: "#ffffff" },
                    dullNight: { background: "linear-gradient(170deg, #0f172a 0%, #1f2937 55%, #475569 100%)", ink: "#f8fafc", cloud: "#c8d2dc" }
                },
                glass: {
                    fill: "rgba(255, 255, 255, 0.22)",
                    hover: "rgba(255, 255, 255, 0.34)",
                    edge: "rgba(255, 255, 255, 0.35)"
                },
                weather: {
                    sun: "#eab308",
                    moon: "#e2e8f0",
                    snow: "#64748b",
                    sunshine: "radial-gradient(circle, rgba(255, 226, 168, 0.55), rgba(255, 214, 130, 0.22) 32%, rgba(255, 200, 110, 0.06) 52%, transparent 70%)",
                    cloud: "#cbd5e1",
                    rainCloud: "#7d8ea3",
                    rain: "#2563eb"
                },
                series: {
                    ours: "#c2410c",
                    band: "rgba(194, 65, 12, 0.18)",
                    ecmwf: "#1d4ed8",
                    gfs: "#047857",
                    icon: "#7c3aed",
                    reference: "#64748b"
                }
            }
        },
        dark: {
            palette: {
                primary: { main: "#589dff" },
                background: {
                    default: "#110f16",
                    paper: "#1a1722"
                },
                themeIcon: {
                    main: "#fbbf24",
                    hover: "rgba(251, 191, 36, 0.12)"
                },
                brand: {
                    main: "#a794e8",
                    soft: "rgba(167, 148, 232, 0.32)"
                },
                sky: {
                    clear: { background: "linear-gradient(175deg, #12456e, #2b77a3)", ink: "#f2faff", cloud: "#ffffff" },
                    partly: { background: "linear-gradient(175deg, #123f63, #2a6b92)", ink: "#f2faff", cloud: "#ffffff" },
                    overcast: { background: "linear-gradient(175deg, #263440, #47596a)", ink: "#eef5fa", cloud: "#8fa0b0" },
                    drizzle: { background: "linear-gradient(175deg, #24313d, #46596a)", ink: "#eef5fa", cloud: "#7d8b99" },
                    showers: { background: "linear-gradient(175deg, #202c37, #3f5161)", ink: "#eef5fa", cloud: "#75828f" },
                    rain: { background: "linear-gradient(175deg, #1b2732, #3a4b5b)", ink: "#eef5fa", cloud: "#6b7886" },
                    downpour: { background: "linear-gradient(175deg, #141d26, #2f3e4c)", ink: "#eef5fa", cloud: "#5c6875" },
                    snow: { background: "linear-gradient(175deg, #2a3744, #55677a)", ink: "#f4faff", cloud: "#e9eff5" },
                    heavySnow: { background: "linear-gradient(175deg, #222e39, #47586a)", ink: "#f4faff", cloud: "#e9eff5" },
                    night: { background: "linear-gradient(170deg, #060b16 0%, #131c2e 55%, #26334a 100%)", ink: "#f8fafc", cloud: "#ffffff" },
                    dullNight: { background: "linear-gradient(170deg, #080d17 0%, #161e2b 55%, #303c4f 100%)", ink: "#f8fafc", cloud: "#c8d2dc" }
                },
                glass: {
                    fill: "rgba(255, 255, 255, 0.18)",
                    hover: "rgba(255, 255, 255, 0.28)",
                    edge: "rgba(255, 255, 255, 0.28)"
                },
                weather: {
                    sun: "#facc15",
                    moon: "#e2e8f0",
                    snow: "#e2e8f0",
                    sunshine: "radial-gradient(circle, rgba(255, 226, 168, 0.55), rgba(255, 214, 130, 0.22) 32%, rgba(255, 200, 110, 0.06) 52%, transparent 70%)",
                    cloud: "#dbe3ec",
                    rainCloud: "#8fa1b5",
                    rain: "#60a5fa"
                },
                series: {
                    ours: "#e2690f",
                    band: "rgba(226, 105, 15, 0.26)",
                    ecmwf: "#3b82f6",
                    gfs: "#0fa574",
                    icon: "#a855f7",
                    reference: "#8296a8"
                }
            }
        }
    },
    typography: {
        fontFamily: "Roboto, system-ui, sans-serif",
        h1: {
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.02em"
        },
        h2: {
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            fontWeight: 600,
            lineHeight: 1.2
        },
        overline: {
            fontWeight: 600,
            letterSpacing: "0.12em"
        },
        body1: {
            lineHeight: 1.7
        }
    },
    components: {
        MuiSkeleton: {
            defaultProps: {
                animation: "wave"
            }
        },
        MuiLink: {
            defaultProps: {
                underline: "hover"
            }
        }
    }
});