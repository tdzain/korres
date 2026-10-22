import { expect, test } from '@playwright/test'
import { acceptCookies, mockExternal } from './helpers'

// O Chromium do Playwright não decodifica H.264: usa o Chrome instalado para o vídeo tocar de verdade.
test.use({ channel: 'chrome' })

const PDP = '/produto/greek-yoghurt-serum-gel-anti-fadiga-para-olhos/'

async function open(page: import('@playwright/test').Page, qs = '?live=1') {
  await mockExternal(page)
  await page.goto(PDP + qs)
  await acceptCookies(page)
  await expect(page.getByTestId('live-player')).toHaveAttribute('data-mode', 'mini', { timeout: 8000 })
}
const time = (page: import('@playwright/test').Page) => page.getByTestId('live-video').evaluate((v: HTMLVideoElement) => ({ t: v.currentTime, paused: v.paused }))

test('mini aparece, expande sem reiniciar o vídeo e minimiza sem pausar', async ({ page }) => {
  await open(page)
  await expect.poll(async () => (await time(page)).t, { timeout: 8000 }).toBeGreaterThan(0.5)
  const before = (await time(page)).t
  await page.getByTestId('live-expand').click()
  await expect(page.getByTestId('live-player')).toHaveAttribute('data-mode', 'full')
  await expect(page.getByTestId('live-overlay')).toBeVisible()
  const after = await time(page)
  expect(after.t).toBeGreaterThanOrEqual(before)
  expect(after.paused).toBe(false)
  await page.getByRole('button', { name: 'Minimizar a live' }).click()
  await expect(page.getByTestId('live-player')).toHaveAttribute('data-mode', 'mini')
  expect((await time(page)).paused).toBe(false)
})

test('adicionar na live entra no carrinho do site, e o sheet de compra não pausa o vídeo', async ({ page }) => {
  await open(page)
  await page.getByTestId('live-expand').click()
  await page.getByTestId('live-products').getByTestId('quick-add').first().click()
  await expect(page.getByTestId('live-bag-count')).toHaveText('1')
  await page.getByTestId('live-checkout').click()
  await expect(page.getByTestId('live-sheet')).toHaveAttribute('data-step', 'bag')
  expect((await time(page)).paused).toBe(false)
  await page.getByTestId('live-go-pay').click()
  await page.getByTestId('live-confirm').click()
  await expect(page.getByTestId('live-sheet')).toHaveAttribute('data-step', 'done', { timeout: 10_000 })
  await expect(page.getByTestId('live-order-id')).toContainText('KR')
  await page.getByTestId('live-continue').click()
  await expect(page.getByTestId('live-sheet')).toHaveCount(0)
  expect((await time(page)).paused).toBe(false)
})

test('X fecha e não volta na sessão; chip reabre', async ({ page }) => {
  await open(page)
  await page.getByTestId('live-close').click()
  await expect(page.getByTestId('live-reopen')).toBeVisible()
  await page.reload()
  await acceptCookies(page).catch(() => {})
  await expect(page.getByTestId('live-reopen')).toBeVisible({ timeout: 8000 })
  await page.getByTestId('live-reopen').click()
  await expect(page.getByTestId('live-player')).toHaveAttribute('data-mode', 'mini')
})

test('?live=off não renderiza', async ({ page }) => {
  await mockExternal(page)
  await page.goto(PDP + '?live=off')
  await acceptCookies(page)
  await page.waitForTimeout(2500)
  await expect(page.getByTestId('live-player')).toHaveCount(0)
})

test('sem rolagem horizontal com o mini player', async ({ page }) => {
  await open(page)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
