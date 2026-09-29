import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SUMMARY } from "../test-fixtures";
import { renderWithProviders } from "../test-utils";
import { LiveScoreboard } from "./LiveScoreboard";
import { LIVE_ABOUT, LIVE_HEADING, LIVE_RAIN_LABEL } from "../core/constants";
import type { LiveLeaderboard, LiveRain, LiveRecord } from "../core/models/summary";

const LEADERBOARD: LiveLeaderboard = {
    leads: [1, 6, 72],
    forecasts: 1476,
    counts: [15, 14, 4],
    mae: {
        temperature_2m: { gbm_blend: [0.77, 0.97, 0.98], ecmwf_ifs025: [1.2, 1.49, 1.43] },
        cloud_cover: { gbm_blend: [2.21, 9.82, 4.4], ecmwf_ifs025: [1.75, 13, 1] }
    }
};

const RAIN: LiveRain = { leads: [1, 6], forecasts: 40, wet_share: 0.05, counts: [10, 9], brier: [0.02, 0.04] };

function record(over: Partial<LiveRecord>): LiveRecord {
    return { ...SUMMARY.live, leaderboard: LEADERBOARD, ...over };
}

describe("LiveScoreboard", () => {
    it("gives every scored variable its own chart", () => {
        renderWithProviders(<LiveScoreboard live={record({})} />);

        expect(screen.getByRole("heading", { level: 2, name: LIVE_HEADING })).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 3, name: "Temperature" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 3, name: "Cloud Cover" })).toBeInTheDocument();
    });

    it("scores the chance of rain beside the variables it measures", () => {
        renderWithProviders(<LiveScoreboard live={record({ rain: RAIN })} />);

        expect(screen.getByRole("heading", { level: 3, name: LIVE_RAIN_LABEL })).toBeInTheDocument();
        expect(screen.getAllByRole("img")).toHaveLength(3);
    });

    it("leaves the rain chart out until a chance of rain has been graded", () => {
        renderWithProviders(<LiveScoreboard live={record({ rain: null })} />);

        expect(screen.queryByRole("heading", { level: 3, name: LIVE_RAIN_LABEL })).not.toBeInTheDocument();
        expect(screen.getAllByRole("img")).toHaveLength(2);
    });

    it("states how much has been graded without being asked", () => {
        renderWithProviders(<LiveScoreboard live={record({})} />);

        expect(screen.getByText(/1,476 graded/)).toBeInTheDocument();
    });

    it("keeps the explanation out of the way until it is asked for", () => {
        renderWithProviders(<LiveScoreboard live={record({})} />);

        expect(screen.queryByText(/ERA5 runs about six days behind/)).not.toBeInTheDocument();
    });

    it("explains what the section measures when asked", async () => {
        renderWithProviders(<LiveScoreboard live={record({})} />);

        await userEvent.click(screen.getByRole("button", { name: LIVE_ABOUT }));

        expect(await screen.findByText(/the mean absolute error over every hour graded so far at that lead/)).toBeInTheDocument();
        expect(screen.getByText(/ERA5 runs about six days behind/)).toBeInTheDocument();
    });

    it("stays out of the page until something has been graded", () => {
        const { container } = renderWithProviders(<LiveScoreboard live={record({ leaderboard: null })} />);

        expect(container).toBeEmptyDOMElement();
    });
});
