import { Box, Paper, Typography } from "@mui/material";
import { TWO_COLUMNS_FROM } from "../core/constants";
import type { Summary } from "../core/models/summary";
import { formatCount, formatDate, formatDateTime } from "../core/utils/format";

const THREE_COLUMNS_FROM = 540;
const ALL_COLUMNS_FROM = 980;

export function StatusStrip({ summary }: { summary: Summary; }) {
    const items = [
        { label: "Updated", value: formatDateTime(summary.generated_at) },
        { label: "Live since", value: formatDate(summary.live.from) },
        { label: "Snapshots", value: formatCount(summary.live.snapshots) },
        { label: "Forecasts saved", value: formatCount(summary.live.forecasts) },
        { label: "Graded so far", value: formatCount(summary.live.graded) },
        { label: "Model", value: summary.model.version }
    ];

    return (
        <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
            <Box
                component="dl"
                sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    [`@media (min-width: ${TWO_COLUMNS_FROM}px)`]: { gridTemplateColumns: "repeat(2, 1fr)" },
                    [`@media (min-width: ${THREE_COLUMNS_FROM}px)`]: { gridTemplateColumns: "repeat(3, 1fr)" },
                    [`@media (min-width: ${ALL_COLUMNS_FROM}px)`]: { gridTemplateColumns: `repeat(${items.length}, auto)` },
                    justifyContent: "space-between",
                    gap: 3,
                    m: 0
                }}
            >
                {items.map(({ label, value }) => (
                    <div key={label}>
                        <Typography variant="overline" component="dt" color="text.secondary">{label}</Typography>
                        <Typography component="dd" sx={{ m: 0 }}>{value}</Typography>
                    </div>
                ))}
            </Box>
        </Paper>
    );
}
