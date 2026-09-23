import { useState } from "react";
import { Button, Collapse, Paper, Stack, Typography } from "@mui/material";
import type { ChartConfiguration, ChartType } from "chart.js";
import type { ChartTable } from "../core/models/charts";
import { ChartCanvas } from "./ChartCanvas";
import { DataTable } from "./DataTable";

export function ChartPanel<TType extends ChartType>({ title, label, config, table }: { title: string, label: string, config: ChartConfiguration<TType>, table: ChartTable; }) {
    const [tableShown, setTableShown] = useState(false);

    return (
        <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="h6" component="h3">{title}</Typography>
                <Button size="small" onClick={() => setTableShown(shown => !shown)}>
                    {tableShown ? "Show as chart" : "Show as table"}
                </Button>
            </Stack>
            <Collapse in={!tableShown} unmountOnExit>
                <ChartCanvas config={config} label={label} />
            </Collapse>
            <Collapse in={tableShown} unmountOnExit>
                <DataTable table={table} label={label} />
            </Collapse>
        </Paper>
    );
}
