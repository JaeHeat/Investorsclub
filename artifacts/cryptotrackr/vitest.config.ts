import { defineConfig } from "vitest/config";
import path from "node:path";

// Standalone test config (the vite config requires PORT/BASE_PATH, which tests
// don't need). Pure-logic tests run in node — no DOM required.
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
