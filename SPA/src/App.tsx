import { Suspense, lazy, useState } from "react";
import { Alert, Box, Skeleton, Typography } from "@mui/material";
import { BacktestLoading } from "./components/BacktestLoading";
import { CurrentConditions } from "./components/CurrentConditions";
import { PreviewBar } from "./components/PreviewBar";
import { StatusStrip } from "./components/StatusStrip";
import { PAGE_MAX_WIDTH, PLACE } from "./core/constants";
import { useSummary } from "./core/hooks/useSummary";
import { withPreview } from "./core/utils/preview";
import type { WeatherState } from "./core/models/weather";
import { isError, isLoading, isSuccess } from "./core/utils/query-state";
import { DailyOutlook } from "./components/DailyOutlook";

const backtestSection = import("./components/BacktestSection");
const BacktestSection = lazy(() => backtestSection);

export function App() {
    const summary = useSummary();
    const [preview, setPreview] = useState<WeatherState | null>(null);
    const loaded = isSuccess(summary) ? summary.data : null;
    const previewing = import.meta.env.DEV && loaded !== null && preview !== null;
    const shown = previewing ? withPreview(loaded, preview) : loaded;

    return (
        <Box component="main" sx={{ p: 2, maxWidth: PAGE_MAX_WIDTH, mx: "auto" }}>
            <Typography variant="h1" sx={{ mb: 2 }}>{PLACE}</Typography>
            {isLoading(summary) && <Skeleton variant="rounded" sx={{ height: theme => theme.spacing(10) }} />}
            {isError(summary) && <Alert severity="error">The latest figures could not be loaded. Try again later.</Alert>}
            {shown !== null && (
                <>
                    {import.meta.env.DEV && <PreviewBar showing={preview} onShow={setPreview} />}
                    {shown.forecast && (
                        <>
                            <CurrentConditions forecast={shown.forecast} where={shown.coordinates} />
                            <DailyOutlook forecast={shown.forecast} />
                        </>
                    )}
                    <StatusStrip summary={shown} />
                    <Suspense fallback={<BacktestLoading />}>
                        <BacktestSection backtest={shown.backtest} />
                    </Suspense>
                </>
            )}
        </Box>
    );
}
