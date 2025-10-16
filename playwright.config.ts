import { defineConfig } from "@playwright/test";

const SUPABASE_STUB_PORT = Number.parseInt(process.env.SUPABASE_STUB_PORT || "4545", 10);

export default defineConfig({
  testDir: "tests/e2e",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: "node tests/fixtures/supabase-stub.cjs",
      port: SUPABASE_STUB_PORT,
      reuseExistingServer: !process.env.CI,
      stdout: "pipe",
      stderr: "pipe",
    },
    {
      command: "npm run dev -- --hostname 0.0.0.0 --port 3000",
      port: 3000,
      reuseExistingServer: !process.env.CI,
      env: {
        SUPABASE_URL: `http://127.0.0.1:${SUPABASE_STUB_PORT}`,
        NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${SUPABASE_STUB_PORT}`,
        SUPABASE_ANON_KEY: "playwright-test",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "playwright-test",
        SUPABASE_SERVICE_ROLE_KEY: "playwright-service-role",
        BLOG_INDEX_FORCE_FALLBACK: "0",
        BLOG_PAGE_SIZE: "2",
        NEXT_PUBLIC_BLOG_PAGE_SIZE: "2",
        NODE_ENV: "development",
        PORT: "3000",
        ADMIN_SESSION_SECRET: "playwright-session-secret",
        ADMIN_AUTH_USERS: JSON.stringify([
          {
            id: "moderator",
            name: "Queue Moderator",
            token: "moderator-token",
            roles: ["moderator"],
          },
          {
            id: "viewer",
            name: "Viewer",
            token: "viewer-token",
            roles: ["viewer"],
          },
        ]),
      },
      stdout: "pipe",
      stderr: "pipe",
    },
  ],
  timeout: 120_000,
  expect: {
    timeout: 10_000,
  },
});
