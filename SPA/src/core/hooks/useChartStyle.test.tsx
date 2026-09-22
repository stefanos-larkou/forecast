import type { ReactNode } from "react";
import { ThemeProvider } from "@mui/material";
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { theme } from "../theme";
import { useChartStyle } from "./useChartStyle";

function inMode(mode: "light" | "dark") {
    return ({ children }: { children: ReactNode; }) => (
        <ThemeProvider theme={theme} defaultMode={mode} noSsr>
            {children}
        </ThemeProvider>

    );
}

describe("useChartStyle", () => {
    it("gives the light palette's colours in light mode", () => {
        const { result } = renderHook(() => useChartStyle(), { wrapper: inMode("light") });
        expect(result.current.series.ours).toBe("#c2410c");
    });

    it("gives the dark palette's colours in dark mode", () => {
        const { result } = renderHook(() => useChartStyle(), { wrapper: inMode("dark") });
        expect(result.current.series.ours).toBe("#e2690f");
    });

    it("sets chart text in the theme's font at its base size", () => {
        const { result } = renderHook(() => useChartStyle(), { wrapper: inMode("light") });
        expect(result.current.font).toEqual({ family: theme.typography.fontFamily, size: theme.typography.fontSize });
    });
});
