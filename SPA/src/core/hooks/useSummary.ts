import { useEffect, useState } from "react";
import { SUMMARY_URL } from "../constants";
import type { Summary } from "../models/summary";
import { isSummary } from "../utils/guards";
import { failed, loading, succeeded, type QueryState } from "../utils/query-state";

async function fetchSummary(): Promise<Summary> {
    const response = await fetch(new URL(SUMMARY_URL, window.location.href));
    if (!response.ok) {
        throw new Error(`${SUMMARY_URL} answered ${response.status}.`);
    }

    const body: unknown = await response.json();
    if (!isSummary(body)) {
        throw new Error(`${SUMMARY_URL} does not have the shape this page expects.`);
    }

    return body;
}

export function useSummary(): QueryState<Summary> {
    const [state, setState] = useState<QueryState<Summary>>(loading);

    useEffect(() => {
        let current = true;
        fetchSummary()
            .then(summary => {
                if (current) setState(succeeded(summary));
            })
            .catch((error: unknown) => {
                if (current) setState(failed(error));
            });

        return () => {
            current = false;
        };
    }, []);

    return state;
}
