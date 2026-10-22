import { defineConfig, devices } from '@playwright/test'

const PORT = 8788
const REMOTE = process.env.BASE_URL // ex.: BASE_URL=https://korres-brasil.pages.dev npx playwright test

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 1,
  reporter: [['list']],
  use: { baseURL: REMOTE ?? `http://localhost:${PORT}`, locale: 'pt-BR', timezoneId: 'America/Sao_Paulo', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
  ],
  // Serve o build estático com as Pages Functions (rode `npm run build` antes).
  webServer: REMOTE ? undefined : { command: `npx wrangler pages dev --port ${PORT}`, url: `http://localhost:${PORT}`, reuseExistingServer: true, timeout: 120_000 },
})
