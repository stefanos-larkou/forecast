import { useMemo } from "react";
import { useColorScheme, useTheme } from "@mui/material";
import type { ChartStyle } from "../models/charts";

export function useChartStyle(): ChartStyle {
    const theme = useTheme();
    const { mode, systemMode } = useColorScheme();
    const scheme = (mode === "system" ? systemMode : mode) ?? "light";

    return useMemo(() => {
        const palette = theme.colorSchemes[scheme]?.palette ?? theme.palette;
        return {
            series: palette.series,
            band: palette.series.band,
            text: palette.text.secondary,
            grid: palette.divider,
            font: { family: theme.typography.fontFamily ?? "", size: theme.typography.fontSize }
        };
    }, [theme, scheme]);
}
