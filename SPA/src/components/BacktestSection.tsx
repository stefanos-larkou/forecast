import { Box, Typography } from "@mui/material";
import { AMOUNT_CAPTION, BACKTEST_CAPTION, BACKTEST_HEADING, COVERAGE_CAPTION, COVERAGE_EYEBROW, VARIABLES } from "../core/constants";
import type { Backtest } from "../core/models/summary";
import { formatCount, formatMonth } from "../core/utils/format";
import { ChartGrid } from "./ChartGrid";
import { CoverageChart } from "./CoverageChart";
import { ErrorByLeadChart } from "./ErrorByLeadChart";
import { RainAmountChart } from "./RainAmountChart";
import { SkillHorizon } from "./SkillHorizon";

export default function BacktestSection({ backtest }: { backtest: Backtest; }) {
    return (
        <Box component="section" sx={{ mt: 4 }}>
            <Typography variant="overline" component="p" color="text.secondary">
                {`Backtest \u00b7 ${formatCount(backtest.forecasts)} forecasts, ${formatMonth(backtest.from)} - ${formatMonth(backtest.to)}`}
            </Typography>
            <Typography variant="h2" sx={{ mb: 2 }}>{BACKTEST_HEADING}</Typography>
            <ChartGrid>
                {VARIABLES.map(variable => <ErrorByLeadChart key={variable.key} backtest={backtest} variable={variable} />)}
            </ChartGrid>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>{BACKTEST_CAPTION}</Typography>
            <Box sx={{ mt: 4 }}>
                <RainAmountChart amount={backtest.rain.amount} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>{AMOUNT_CAPTION}</Typography>
            </Box>
            <SkillHorizon backtest={backtest} />
            <Box sx={{ mt: 4 }}>
                <Typography variant="overline" component="p" color="text.secondary">
                    {`${COVERAGE_EYEBROW} \u00b7 ${formatCount(backtest.coverage.forecasts)} forecasts, ${formatMonth(backtest.coverage.from)} - ${formatMonth(backtest.coverage.to)}`}
                </Typography>
                <CoverageChart coverage={backtest.coverage} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>{COVERAGE_CAPTION}</Typography>
            </Box>
        </Box>
    );
}
