import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { App } from "./App";
import { BACKTEST_HEADING, PLACE, SUMMARY_URL } from "./core/constants";
import { SUMMARY } from "./test-fixtures";
import { renderWithProviders } from "./test-utils";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function serve(response: () => Response) {
    server.use(http.get(`*${SUMMARY_URL}`, response));
}

describe("App", () => {
    it("names the place it forecasts as the page heading", async () => {
        serve(() => HttpResponse.json(SUMMARY));
        renderWithProviders(<App />);

        expect(await screen.findByRole("heading", { level: 1, name: PLACE })).toBeInTheDocument();
        expect(await screen.findByText("Snapshots")).toBeInTheDocument();
        expect(await screen.findByRole("heading", { level: 2, name: BACKTEST_HEADING })).toBeInTheDocument();
    });

    it("tells the reader when the latest figures could not be loaded", async () => {
        serve(() => HttpResponse.json(SUMMARY, { status: 503 }));
        renderWithProviders(<App />);

        expect(await screen.findByRole("alert")).toBeInTheDocument();
        expect(screen.queryByText("Snapshots")).not.toBeInTheDocument();
    });
});
