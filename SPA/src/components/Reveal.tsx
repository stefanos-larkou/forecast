import { Suspense, useRef } from "react";
import { Box } from "@mui/material";
import { LOAD_MARGIN, REVEAL_MS, REVEAL_RISE, SHOW_MARGIN } from "../core/constants";
import { useInView } from "../core/hooks/useInView";

export function Reveal({ fallback, children }: { fallback?: React.ReactNode, children: React.ReactNode; }) {
    const watched = useRef<HTMLDivElement>(null);
    const loading = useInView(watched, LOAD_MARGIN);
    const shown = useInView(watched, SHOW_MARGIN);

    return (
        <Box ref={watched}>
            {fallback === undefined || loading
                ? (
                    <Box
                        sx={theme => ({
                            opacity: shown ? 1 : 0,
                            transform: shown ? "none" : `translateY(${REVEAL_RISE})`,
                            transition: theme.transitions.create(["opacity", "transform"], { duration: REVEAL_MS })
                        })}
                    >
                        <Suspense fallback={fallback}>{children}</Suspense>
                    </Box>
                )
                : fallback}
        </Box>
    );
}
