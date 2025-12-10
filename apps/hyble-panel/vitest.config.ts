import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@hyble/db": path.resolve(__dirname, "../../packages/db/src"),
      "@hyble/ui": path.resolve(__dirname, "../../packages/ui/src"),
      "@hyble/email": path.resolve(__dirname, "../../packages/email/src"),
    },
  },
});
