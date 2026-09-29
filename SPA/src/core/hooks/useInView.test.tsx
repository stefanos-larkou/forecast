import { useRef } from "react";
import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useInView } from "./useInView";

const MARGIN = "100px";

interface Watcher {
    margin: string;
    enter: () => void;
    leave: () => void;
    disconnected: boolean;
}

const watchers: Watcher[] = [];

function observing() {
    class Stub {
        readonly watcher: Watcher;

        constructor(notify: IntersectionObserverCallback, options?: IntersectionObserverInit) {
            const report = (isIntersecting: boolean) => notify(
                [{ isIntersecting } as IntersectionObserverEntry],
                this as unknown as IntersectionObserver
            );

            this.watcher = {
                margin: options?.rootMargin ?? "",
                enter: () => report(true),
                leave: () => report(false),
                disconnected: false
            };
            watchers.push(this.watcher);
        }

        observe() { }
        unobserve() { }
        disconnect() {
            this.watcher.disconnected = true;
        }
    }

    vi.stubGlobal("IntersectionObserver", Stub);
}

function Probe({ margin }: { margin: string; }) {
    const watched = useRef<HTMLDivElement>(null);
    const seen = useInView(watched, margin);

    return <div ref={watched}>{seen ? "seen" : "waiting"}</div>;
}

afterEach(() => {
    vi.unstubAllGlobals();
    watchers.length = 0;
});

describe("useInView", () => {
    it("waits until the node it watches comes into view", () => {
        observing();
        render(<Probe margin={MARGIN} />);
        expect(screen.getByText("waiting")).toBeInTheDocument();

        act(() => watchers[0]?.enter());

        expect(screen.getByText("seen")).toBeInTheDocument();
    });

    it("watches with the margin it was given, so a caller can load early and reveal late", () => {
        observing();
        render(<Probe margin={MARGIN} />);

        expect(watchers[0]?.margin).toBe(MARGIN);
    });

    it("stays seen after it scrolls back out, so a section never fades away again", () => {
        observing();
        render(<Probe margin={MARGIN} />);
        act(() => watchers[0]?.enter());
        act(() => watchers.forEach(watcher => watcher.leave()));

        expect(screen.getByText("seen")).toBeInTheDocument();
    });

    it("gives up watching once it has been seen", () => {
        observing();
        render(<Probe margin={MARGIN} />);
        act(() => watchers[0]?.enter());

        expect(watchers[0]?.disconnected).toBe(true);
    });

    it("shows everything at once where the browser cannot observe", () => {
        vi.stubGlobal("IntersectionObserver", undefined);
        render(<Probe margin={MARGIN} />);

        expect(screen.getByText("seen")).toBeInTheDocument();
    });
});
