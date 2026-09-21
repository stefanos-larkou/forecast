import { Paper, Stack, Typography } from "@mui/material";
import type { Summary } from "../core/models/summary";
import { formatCount, formatDate, formatDateTime } from "../core/utils/format";

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
        <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack component="dl" direction="row" spacing={3} useFlexGap sx={{ flexWrap: "wrap", m: 0 }}>
                {items.map(({ label, value }) => (
                    <div key={label}>
                        <Typography variant="overline" component="dt" color="text.secondary">{label}</Typography>
                        <Typography component="dd" sx={{ m: 0 }}>{value}</Typography>
                    </div>
                ))}
            </Stack>
        </Paper>
    );
}
