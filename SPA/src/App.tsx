import { Alert, Box, Skeleton, Typography } from "@mui/material";
import { StatusStrip } from "./components/StatusStrip";
import { PLACE } from "./core/constants";
import { useSummary } from "./core/hooks/useSummary";
import { isError, isLoading, isSuccess } from "./core/utils/query-state";

export function App() {
    const summary = useSummary();

    return (
        <Box component="main" sx={{ p: 2 }}>
            <Typography variant="h1" sx={{ mb: 2 }}>{PLACE}</Typography>
            {isLoading(summary) && <Skeleton variant="rounded" sx={{ height: theme => theme.spacing(10) }} />}
            {isError(summary) && <Alert severity="error">The latest figures could not be loaded. Try again later.</Alert>}
            {isSuccess(summary) && <StatusStrip summary={summary.data} />}
        </Box>
    );
}
