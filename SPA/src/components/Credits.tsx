import { Box, Link, Typography } from "@mui/material";
import { CREDIT_LEAD, CREDIT_LICENCE, CREDIT_SOURCE, CREDIT_SOURCE_URL } from "../core/constants";

export function Credits() {
    return (
        <Box component="footer" sx={{ mt: 4 }}>
            <Typography variant="body2" sx={{ color: "text.disabled" }}>
                {`${CREDIT_LEAD} `}
                <Link href={CREDIT_SOURCE_URL} target="_blank" rel="noopener" color="inherit" underline="always">{CREDIT_SOURCE}</Link>
                {CREDIT_LICENCE}
            </Typography>
        </Box>
    );
}
