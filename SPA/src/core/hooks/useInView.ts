import { useEffect, useState } from "react";
import type { RefObject } from "react";

export function useInView(watched: RefObject<HTMLDivElement | null>, margin: string): boolean {
    const [seen, setSeen] = useState(typeof IntersectionObserver === "undefined");

    useEffect(() => {
        const node = watched.current;
        if (seen || node === null) {
            return;
        }

        const observer = new IntersectionObserver(entries => {
            if (entries.some(entry => entry.isIntersecting)) {
                setSeen(true);
            }
        }, { rootMargin: margin });

        observer.observe(node);

        return () => observer.disconnect();
    }, [watched, margin, seen]);

    return seen;
}
