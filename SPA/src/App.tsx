import { lazy, useState } from "react";
import { Alert, Box, Skeleton } from "@mui/material";
import { BacktestLoading } from "./components/BacktestLoading";
import { Credits } from "./components/Credits";
import { CurrentConditions } from "./components/CurrentConditions";
import { DataInventory } from "./components/DataInventory";
import { LiveLoading } from "./components/LiveLoading";
import { PreviewBar } from "./components/PreviewBar";
import { Reveal } from "./components/Reveal";
import { StatusStrip } from "./components/StatusStrip";
import { PAGE_MAX_WIDTH } from "./core/constants";
import { useSummary } from "./core/hooks/useSummary";
import { withPreview } from "./core/utils/preview";
import type { WeatherState } from "./core/models/weather";
import { isError, isLoading, isSuccess } from "./core/utils/query-state";
import { DailyOutlook } from "./components/DailyOutlook";

const BacktestSection = lazy(() => import("./components/BacktestSection"));
const LiveScoreboard = lazy(() => import("./components/LiveScoreboard"));

const COLUMN = { maxWidth: PAGE_MAX_WIDTH, mx: "auto", px: 2 };

export function App() {
    const summary = useSummary();
    const [preview, setPreview] = useState<WeatherState | null>(null);
    const loaded = isSuccess(summary) ? summary.data : null;
    const previewing = import.meta.env.DEV && loaded !== null && preview !== null;
    const shown = previewing ? withPreview(loaded, preview) : loaded;

    return (
        <>
            <Box component="main">
                <Box sx={COLUMN}>
                    {isLoading(summary) && <Skeleton variant="rounded" sx={{ height: theme => theme.spacing(10) }} />}
                    {isError(summary) && <Alert severity="error">The latest figures could not be loaded. Try again later.</Alert>}
                </Box>
                {shown !== null && (
                    <>
                        {shown.forecast && <CurrentConditions forecast={shown.forecast} where={shown.coordinates} />}
                        <Box sx={COLUMN}>
                            {import.meta.env.DEV && <PreviewBar showing={preview} onShow={setPreview} />}
                            {shown.forecast && <DailyOutlook forecast={shown.forecast} />}
                            <StatusStrip summary={shown} />
                            <Reveal fallback={<LiveLoading />}>
                                <LiveScoreboard live={shown.live} />
                            </Reveal>
                            <Reveal fallback={<BacktestLoading />}>
                                <BacktestSection backtest={shown.backtest} />
                            </Reveal>
                            <Reveal>
                                <DataInventory tables={shown.tables} />
                            </Reveal>
                        </Box>
                    </>
                )}
            </Box>
            <Box sx={{ ...COLUMN, pb: 2 }}>
                <Credits />
            </Box>
        </>
    );
}
