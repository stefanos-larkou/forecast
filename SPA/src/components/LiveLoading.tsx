import { Box, Paper, Skeleton, Stack, Typography } from "@mui/material";
import { CHART_HEIGHT, LIVE_HEADING, LIVE_WIDE_VARIABLE, VARIABLES } from "../core/constants";
import { ChartGrid } from "./ChartGrid";

const WHOLE_ROW = { gridColumn: "1 / -1" };

export function LiveLoading() {
    return (
        <Box component="section" sx={{ mt: 4 }}>
            <Typography variant="overline" component="p" sx={{ color: "text.secondary" }}><Skeleton width={220} /></Typography>
            <Typography variant="h2" sx={{ mb: 2 }}>{LIVE_HEADING}</Typography>
            <ChartGrid>
                {VARIABLES.map(variable => (
                    <Box key={variable.key} sx={variable.key === LIVE_WIDE_VARIABLE ? WHOLE_ROW : undefined}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                                <Typography variant="h6" component="p"><Skeleton width={120} /></Typography>
                                <Skeleton variant="rounded" width={96} height={30} />
                            </Stack>
                            <Skeleton variant="rounded" sx={{ height: theme => theme.spacing(CHART_HEIGHT) }} />
                        </Paper>
                    </Box>
                ))}
            </ChartGrid>
        </Box>
    );
}
