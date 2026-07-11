// Lane 7 — Vitest config. Scope to the offline unit suite ONLY; the e2e/ specs
// are Playwright and run under a separate runner (npm run e2e), not Vitest.
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["unit/**/*.test.mjs"],
    exclude: ["node_modules/**", "e2e/**"],
    environment: "node",
  },
});
