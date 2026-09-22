import { Suspense, lazy } from "react";
import { Alert, Box, Skeleton, Typography } from "@mui/material";
import { BacktestLoading } from "./components/BacktestLoading";
import { CurrentConditions } from "./components/CurrentConditions";
import { StatusStrip } from "./components/StatusStrip";
import { PLACE } from "./core/constants";
import { useSummary } from "./core/hooks/useSummary";
import { isError, isLoading, isSuccess } from "./core/utils/query-state";

const backtestSection = import("./components/BacktestSection");
const BacktestSection = lazy(() => backtestSection);

export function App() {
    const summary = useSummary();

    return (
        <Box component="main" sx={{ p: 2 }}>
            <Typography variant="h1" sx={{ mb: 2 }}>{PLACE}</Typography>
            {isLoading(summary) && <Skeleton variant="rounded" sx={{ height: theme => theme.spacing(10) }} />}
            {isError(summary) && <Alert severity="error">The latest figures could not be loaded. Try again later.</Alert>}
            {isSuccess(summary) && (
                <>
                    {summary.data.forecast && <CurrentConditions forecast={summary.data.forecast} />}
                    <StatusStrip summary={summary.data} />
                    <Suspense fallback={<BacktestLoading />}>
                        <BacktestSection backtest={summary.data.backtest} />
                    </Suspense>
                </>
            )}
        </Box>
    );
}
