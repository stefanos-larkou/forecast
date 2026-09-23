import { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { CHART_HEIGHT } from "../core/constants";
import { BarController, BarElement, CategoryScale, Chart, Filler, Legend, LinearScale, LineController, LineElement, PointElement, Tooltip, type ChartConfiguration, type ChartType } from "chart.js";

Chart.register(CategoryScale, LinearScale, LineController, LineElement, PointElement, BarController, BarElement, Filler, Legend, Tooltip);

export function ChartCanvas<TType extends ChartType>({ config, label }: { config: ChartConfiguration<TType>, label: string; }) {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas || canvas.getContext("2d") === null) {
            return;
        }

        const chart = new Chart(canvas, config);
        return () => chart.destroy();
    }, [config]);

    return (
        <Box sx={{ position: "relative", height: theme => theme.spacing(CHART_HEIGHT) }}>
            <canvas ref={ref} role="img" aria-label={label} />
        </Box>
    );
}
