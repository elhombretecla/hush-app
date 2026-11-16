/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// @ts-expect-error — plain ESM server module shared with the production server
import { apiHandler } from "./server/api.mjs";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "hush-api",
      configureServer(server) {
        server.middlewares.use(apiHandler);
      },
      configurePreviewServer(server) {
        server.middlewares.use(apiHandler);
      },
    },
  ],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    css: false,
    globals: true,
  },
});
