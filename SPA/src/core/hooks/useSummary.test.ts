import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { SUMMARY_URL } from "../constants";
import { useSummary } from "./useSummary";

const SUMMARY = {
    generated_at: "2026-09-21T03:20:00+00:00",
    location: "larnaca",
    model: { version: "2026-09-20", trained_at: "2026-09-20T09:12:33+00:00", commit: "90f5ea2" },
    live: {
        from: "2026-09-17T21:00:00+00:00",
        to: "2026-09-21T12:00:00+00:00",
        truth_until: "2026-09-14T23:00:00+00:00",
        snapshots: 14,
        forecasts: 33000,
        predictions: 5400,
        intervals: 1152,
        graded: 0
    }
};

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function serve(response: () => Response) {
    server.use(http.get(`*${SUMMARY_URL}`, response));
}

describe("useSummary", () => {
    it("starts loading and then hands over the summary it was served", async () => {
        serve(() => HttpResponse.json(SUMMARY));
        const { result } = renderHook(() => useSummary());

        expect(result.current.status).toBe("loading");
        await waitFor(() => expect(result.current).toEqual({ status: "success", data: SUMMARY }));
    });

    it("reports an error when the server answers with a failure, even with a well-formed body", async () => {
        serve(() => HttpResponse.json(SUMMARY, { status: 503 }));
        const { result } = renderHook(() => useSummary());

        await waitFor(() => expect(result.current.status).toBe("error"));
    });

    it("reports an error when the file does not have the expected shape", async () => {
        serve(() => HttpResponse.json({ ...SUMMARY, live: { ...SUMMARY.live, graded: "none" } }));
        const { result } = renderHook(() => useSummary());

        await waitFor(() => expect(result.current.status).toBe("error"));
    });
});
