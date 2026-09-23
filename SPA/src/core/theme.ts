import { createTheme } from "@mui/material/styles";

interface ThemeIconPalette {
    main: string;
    hover: string;
}

interface BrandPalette {
    main: string;
    soft: string;
}

export interface SkyPalette {
    day: string;
    night: string;
    dull: string;
    dullNight: string;
}

export interface WeatherPalette {
    sun: string;
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
    }

    interface PaletteOptions {
        themeIcon?: ThemeIconPalette;
        brand?: BrandPalette;
        series?: SeriesPalette;
        weather?: WeatherPalette;
        sky?: SkyPalette;
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
                    day: "linear-gradient(170deg, #38bdf8 0%, #7dd3fc 45%, #e0f2fe 100%)",
                    night: "linear-gradient(170deg, #0b1220 0%, #1e293b 55%, #334155 100%)",
                    dull: "linear-gradient(170deg, #64748b 0%, #94a3b8 55%, #cbd5e1 100%)",
                    dullNight: "linear-gradient(170deg, #0f172a 0%, #1f2937 55%, #475569 100%)"
                },
                weather: {
                    sun: "#eab308",
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
                    day: "linear-gradient(170deg, #0284c7 0%, #0ea5e9 45%, #7dd3fc 100%)",
                    night: "linear-gradient(170deg, #060b16 0%, #131c2e 55%, #26334a 100%)",
                    dull: "linear-gradient(170deg, #475569 0%, #64748b 55%, #94a3b8 100%)",
                    dullNight: "linear-gradient(170deg, #080d17 0%, #161e2b 55%, #303c4f 100%)"
                },
                weather: {
                    sun: "#facc15",
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