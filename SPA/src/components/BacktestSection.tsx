import { Box, Typography } from "@mui/material";
import { AMOUNT_CAPTION, BACKTEST_CAPTION, BACKTEST_HEADING, COVERAGE_CAPTION, COVERAGE_SECTION, RAIN_HEADING, RAIN_SECTION, RAIN_SKILL_CAPTION, RAIN_WET_SHARE, RELIABILITY_CAPTION, VARIABLES } from "../core/constants";
import type { Backtest } from "../core/models/summary";
import { formatCount, formatMonth, formatShare } from "../core/utils/format";
import { ChartGrid } from "./ChartGrid";
import { CoverageChart } from "./CoverageChart";
import { ErrorByLeadChart } from "./ErrorByLeadChart";
import { RainAmountChart } from "./RainAmountChart";
import { RainSkillChart } from "./RainSkillChart";
import { ReliabilityChart } from "./ReliabilityChart";
import { SkillHorizon } from "./SkillHorizon";

export default function BacktestSection({ backtest }: { backtest: Backtest; }) {
    return (
        <Box component="section" sx={{ mt: 4 }}>
            <Typography variant="overline" component="p" sx={{ color: "text.secondary" }}>
                {`Backtest \u00b7 ${formatCount(backtest.forecasts)} forecasts, ${formatMonth(backtest.from)} - ${formatMonth(backtest.to)}`}
            </Typography>
            <Typography variant="h2" sx={{ mb: 2 }}>{BACKTEST_HEADING}</Typography>
            <ChartGrid>
                {VARIABLES.map(variable => <ErrorByLeadChart key={variable.key} backtest={backtest} variable={variable} />)}
            </ChartGrid>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 2 }}>{BACKTEST_CAPTION}</Typography>
            <Box sx={{ mt: 4 }}>
                <Typography variant="overline" component="p" sx={{ color: "text.secondary" }}>
                    {`${RAIN_SECTION} \u00b7 ${formatShare(backtest.rain.wet_share)} ${RAIN_WET_SHARE}`}
                </Typography>
                <Typography variant="h2" sx={{ mb: 2 }}>{RAIN_HEADING}</Typography>
                <Box sx={{ mb: 2 }}>
                    <RainSkillChart rain={backtest.rain} />
                    <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>{RAIN_SKILL_CAPTION}</Typography>
                </Box>
                <ChartGrid>
                    <Box>
                        <ReliabilityChart rain={backtest.rain} />
                        <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>{RELIABILITY_CAPTION}</Typography>
                    </Box>
                    <Box>
                        <RainAmountChart amount={backtest.rain.amount} />
                        <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>{AMOUNT_CAPTION}</Typography>
                    </Box>
                </ChartGrid>
            </Box>
            <SkillHorizon backtest={backtest} />
            <Box sx={{ mt: 4 }}>
                <Typography variant="overline" component="p" sx={{ color: "text.secondary" }}>
                    {`${formatCount(backtest.coverage.forecasts)} forecasts, ${formatMonth(backtest.coverage.from)} - ${formatMonth(backtest.coverage.to)}`}
                </Typography>
                <Typography variant="h2" sx={{ mb: 2 }}>{COVERAGE_SECTION}</Typography>
                <CoverageChart coverage={backtest.coverage} />
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 2 }}>{COVERAGE_CAPTION}</Typography>
            </Box>
        </Box>
    );
}
