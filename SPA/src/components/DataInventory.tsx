import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { COVERS_COLUMN, EXPLORE_FILES, EXPLORE_HEADING, EXPLORE_LEAD, EXPLORE_ROWS, FILES_COLUMN, ROWS_COLUMN, TABLE_COLUMN, TABLE_COVERS } from "../core/constants";
import type { StoredTable } from "../core/models/summary";
import { formatCount } from "../core/utils/format";

export function DataInventory({ tables }: { tables?: StoredTable[]; }) {
    if (!tables?.length) {
        return null;
    }

    const rows = tables.reduce((total, table) => total + table.rows, 0);
    const files = tables.reduce((total, table) => total + table.files, 0);

    return (
        <Box component="section" sx={{ mt: 4 }}>
            <Typography variant="overline" component="p" color="text.secondary">
                {`${formatCount(rows)} ${EXPLORE_ROWS} \u00b7 ${formatCount(files)} ${EXPLORE_FILES}`}
            </Typography>
            <Typography variant="h2" sx={{ mb: 2 }}>{EXPLORE_HEADING}</Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{EXPLORE_LEAD}</Typography>
                <TableContainer>
                    <Table size="small" aria-label={EXPLORE_HEADING}>
                        <TableHead>
                            <TableRow>
                                <TableCell>{TABLE_COLUMN}</TableCell>
                                <TableCell align="right">{ROWS_COLUMN}</TableCell>
                                <TableCell align="right">{FILES_COLUMN}</TableCell>
                                <TableCell>{COVERS_COLUMN}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tables.map(table => (
                                <TableRow key={table.name}>
                                    <TableCell component="th" scope="row">{table.name}</TableCell>
                                    <TableCell align="right">{formatCount(table.rows)}</TableCell>
                                    <TableCell align="right">{formatCount(table.files)}</TableCell>
                                    <TableCell sx={{ color: "text.secondary" }}>{TABLE_COVERS[table.name] ?? ""}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
}
