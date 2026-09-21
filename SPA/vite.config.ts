import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { extname, relative, resolve } from "node:path";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";

const BASE = "/forecast/";
const DATA = "data";
const DATA_FOLDER = resolve(import.meta.dirname, "..", DATA);
const DATA_PATH = `${BASE}${DATA}`;
const NOT_FOUND = 404;
const BINARY = "application/octet-stream";
const CONTENT_TYPES: Record<string, string> = {
    ".json": "application/json",
    ".parquet": BINARY
};
const CERTIFICATES = resolve(import.meta.dirname, "certs");
const CERTIFICATE = resolve(CERTIFICATES, "localhost.pem");
const PRIVATE_KEY = resolve(CERTIFICATES, "localhost.key");
const EXPORT_COMMAND = "dotnet dev-certs https --export-path certs/localhost.pem --format PEM --no-password";

function serveData(): Plugin {
    return {
        name: "serve-data",
        apply: "serve",
        configureServer(server) {
            server.middlewares.use(DATA_PATH, (request, response) => {
                const file = resolve(DATA_FOLDER, `.${decodeURIComponent((request.url ?? "/").split("?")[0] ?? "/")}`);
                const inside = !relative(DATA_FOLDER, file).startsWith("..");
                if (!inside || !existsSync(file) || !statSync(file).isFile()) {
                    response.statusCode = NOT_FOUND;
                    response.end();
                    return;
                }

                response.setHeader("Content-Type", CONTENT_TYPES[extname(file)] ?? BINARY);
                createReadStream(file).pipe(response);
            });
        }
    };
}

function localCertificate(): { cert: Buffer, key: Buffer; } {
    if (!existsSync(CERTIFICATE) || !existsSync(PRIVATE_KEY)) {
        throw new Error(`No local HTTPS certificate in SPA/certs. From SPA/, run: ${EXPORT_COMMAND}`);
    }

    return { cert: readFileSync(CERTIFICATE), key: readFileSync(PRIVATE_KEY) };
}

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => ({
    base: BASE,
    plugins: [react(), serveData()],
    server: command === "serve" && mode !== "test" ? { https: localCertificate() } : {},
    test: {
        environment: "jsdom",
        setupFiles: "./src/test-setup.ts"
    }
}));
