import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { SUMMARY_URL } from "../constants";
import { useSummary } from "./useSummary";
import { SUMMARY } from "../../test-fixtures";

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
