import { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { CategoryScale, Chart, Legend, LinearScale, LineController, LineElement, PointElement, Tooltip, type ChartConfiguration } from "chart.js";

Chart.register(CategoryScale, LinearScale, LineController, LineElement, PointElement, Legend, Tooltip);

export function ChartCanvas({ config, label }: { config: ChartConfiguration, label: string; }) {
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
        <Box sx={{ position: "relative", height: theme => theme.spacing(40) }}>
            <canvas ref={ref} role="img" aria-label={label} />
        </Box>
    );
}
