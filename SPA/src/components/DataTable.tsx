import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { CHART_HEIGHT } from "../core/constants";
import type { ChartTable } from "../core/models/charts";

export function DataTable({ table, label }: { table: ChartTable, label: string; }) {
    return (
        <TableContainer sx={{ mt: 2, maxHeight: theme => theme.spacing(CHART_HEIGHT) }}>
            <Table size="small" stickyHeader aria-label={label}>
                <TableHead>
                    <TableRow>
                        <TableCell>{table.rowHeader}</TableCell>
                        {table.columns.map(column => <TableCell key={column} align="right">{column}</TableCell>)}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {table.rows.map(row => (
                        <TableRow key={row.header}>
                            <TableCell component="th" scope="row">{row.header}</TableCell>
                            {row.values.map((value, index) => <TableCell key={table.columns[index] ?? index} align="right">{value}</TableCell>)}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
