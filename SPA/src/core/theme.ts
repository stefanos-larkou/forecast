import { createTheme } from "@mui/material/styles";

interface ThemeIconPalette {
    main: string;
    hover: string;
}

interface BrandPalette {
    main: string;
    soft: string;
}

declare module "@mui/material/styles" {
    interface Palette {
        themeIcon: ThemeIconPalette;
        brand: BrandPalette;
    }

    interface PaletteOptions {
        themeIcon?: ThemeIconPalette;
        brand?: BrandPalette;
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
        MuiLink: {
            defaultProps: {
                underline: "hover"
            }
        }
    }
});