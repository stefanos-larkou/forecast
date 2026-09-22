import { Box, CircularProgress, Paper, Skeleton, Stack, Typography } from "@mui/material";
import { BACKTEST_CAPTION, BACKTEST_HEADING, VARIABLES } from "../core/constants";
import { ChartGrid } from "./ChartGrid";

export function BacktestLoading() {
    return (
        <Box component="section" sx={{ mt: 4 }}>
            <Typography variant="overline" component="p" color="text.secondary"><Skeleton width={280} /></Typography>
            <Typography variant="h2" sx={{ mb: 2 }}>{BACKTEST_HEADING}</Typography>
            <ChartGrid>
                {VARIABLES.map(variable => (
                    <Paper key={variable.key} variant="outlined" sx={{ p: 2 }}>
                        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                            <Typography variant="h6" component="p"><Skeleton width={120} /></Typography>
                            <Skeleton variant="rounded" width={96} height={30} />
                        </Stack>
                        <Box sx={{ height: theme => theme.spacing(40), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
                            <CircularProgress size={64} disableShrink />
                            <Typography variant="body1" color="text.secondary">{variable.label}</Typography>
                        </Box>
                    </Paper>
                ))}
            </ChartGrid>
            <Skeleton sx={{ mt: 2 }}><Typography variant="body2">{BACKTEST_CAPTION}</Typography></Skeleton>
        </Box>
    );
}
