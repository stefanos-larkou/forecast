import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LOAD_MARGIN, SHOW_MARGIN } from "../core/constants";
import { Reveal } from "./Reveal";

interface Watcher {
    margin: string;
    enter: () => void;
}

const watchers: Watcher[] = [];

function observing() {
    class Stub {
        constructor(notify: IntersectionObserverCallback, options?: IntersectionObserverInit) {
            watchers.push({
                margin: options?.rootMargin ?? "",
                enter: () => notify([{ isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
            });
        }

        observe() { }
        unobserve() { }
        disconnect() { }
    }

    vi.stubGlobal("IntersectionObserver", Stub);
}

function watcherFor(margin: string): Watcher | undefined {
    return watchers.find(watcher => watcher.margin === margin);
}

function revealed(): HTMLElement | null {
    return screen.getByText("the section").parentElement;
}

afterEach(() => {
    vi.unstubAllGlobals();
    watchers.length = 0;
});

describe("Reveal", () => {
    it("holds the fallback's place until the section is worth downloading", () => {
        observing();
        render(<Reveal fallback={<p>waiting</p>}><p>the section</p></Reveal>);

        expect(screen.getByText("waiting")).toBeInTheDocument();
        expect(screen.queryByText("the section")).not.toBeInTheDocument();
    });

    it("swaps the fallback for the section once the load margin is reached", () => {
        observing();
        render(<Reveal fallback={<p>waiting</p>}><p>the section</p></Reveal>);

        act(() => watcherFor(LOAD_MARGIN)?.enter());

        expect(screen.getByText("the section")).toBeInTheDocument();
        expect(screen.queryByText("waiting")).not.toBeInTheDocument();
    });

    it("keeps the section out of sight until it is properly on screen", () => {
        observing();
        render(<Reveal fallback={<p>waiting</p>}><p>the section</p></Reveal>);
        act(() => watcherFor(LOAD_MARGIN)?.enter());

        expect(revealed()).toHaveStyle({ opacity: "0" });
    });

    it("brings the section in when the show margin is reached", () => {
        observing();
        render(<Reveal fallback={<p>waiting</p>}><p>the section</p></Reveal>);
        act(() => watcherFor(LOAD_MARGIN)?.enter());
        act(() => watcherFor(SHOW_MARGIN)?.enter());

        expect(revealed()).toHaveStyle({ opacity: "1", transform: "none" });
    });

    it("renders a section that is already loaded without waiting to download it", () => {
        observing();
        render(<Reveal><p>the section</p></Reveal>);

        expect(screen.getByText("the section")).toBeInTheDocument();
    });

    it("watches for downloading and for showing separately", () => {
        observing();
        render(<Reveal fallback={<p>waiting</p>}><p>the section</p></Reveal>);

        expect(watchers.map(watcher => watcher.margin).sort()).toEqual([LOAD_MARGIN, SHOW_MARGIN].sort());
    });
});
