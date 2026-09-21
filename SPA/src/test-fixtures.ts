import type { Summary } from "./core/models/summary";

export const SUMMARY: Summary = {
    generated_at: "2026-09-21T12:00:00+00:00",
    location: "larnaca",
    model: { version: "2026-09-20", trained_at: "2026-09-20T09:12:33+00:00", commit: "90f5ea2" },
    live: {
        from: "2026-09-17T12:00:00+00:00",
        to: "2026-09-21T12:00:00+00:00",
        truth_until: "2026-09-14T23:00:00+00:00",
        snapshots: 14,
        forecasts: 33000,
        predictions: 5400,
        intervals: 1152,
        graded: 0
    }
};
