import { useMemo } from "react";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { dayDetailConfig, dayDetailTable } from "../core/charts/day-detail";
import { useChartStyle } from "../core/hooks/useChartStyle";
import type { HourlyRow } from "../core/models/summary";
import { formatDate, formatWeekday } from "../core/utils/format";
import { ChartPanel } from "./ChartPanel";

export default function DayDetail({ hours, onClose }: { hours: HourlyRow[], onClose: () => void; }) {
    const style = useChartStyle();
    const config = useMemo(() => dayDetailConfig(hours, style), [hours, style]);
    const table = useMemo(() => dayDetailTable(hours), [hours]);
    const first = hours[0];

    if (!first) {
        return null;
    }

    return (
        <Dialog open onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {`${formatWeekday(first.at)} ${formatDate(first.at)}`}
                <IconButton onClick={onClose} aria-label="Close" size="small">{"\u00d7"}</IconButton>
            </DialogTitle>
            <DialogContent>
                <ChartPanel
                    title="Hour by hour"
                    label={`Temperature with its 90% band, and the chance of rain, hour by hour on ${formatDate(first.at)}`}
                    config={config}
                    table={table}
                />
            </DialogContent>
        </Dialog>
    );
}
