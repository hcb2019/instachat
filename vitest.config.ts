import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    env: { DEMO_MODE: "true" },
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/test/setup.ts"],
    coverage: { reporter: ["text", "json-summary"] },
  },
  resolve: { alias: { "@": path.resolve(__dirname, "src"), "server-only": path.resolve(__dirname, "src/test/server-only.ts") } },
});
