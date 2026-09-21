import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

class MediaQueryListStub extends EventTarget {
    readonly media: string;
    readonly matches = false;
    onchange = null;

    constructor(media: string) {
        super();
        this.media = media;
    }

    addListener() { }
    removeListener() { }
}

class ResizeObserverStub {
    observe() { }
    unobserve() { }
    disconnect() { }
}

globalThis.matchMedia = query => new MediaQueryListStub(query);
globalThis.ResizeObserver = ResizeObserverStub;
globalThis.scrollTo = () => { };

HTMLCanvasElement.prototype.getContext = () => null;

afterEach(() => {
    cleanup();
    localStorage.clear();
});
