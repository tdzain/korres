import { expect, test } from '@playwright/test'
import { acceptCookies, mockExternal, watchConsole } from './helpers'

const ARRIVAL = /Chegará entre \S+, \d+ \S+ e \S+, \d+ \S+/

test.describe('caminho feliz: home → PDP → sacola → checkout Pix → confirmação', () => {
  test('compra completa com Pix', async ({ page, isMobile }) => {
    const errors = watchConsole(page)
    await mockExternal(page)
    await page.goto('/?demo=1')
    await acceptCookies(page)

    // Home
    await expect(page.getByTestId('hero')).toBeVisible()
    await expect(page.getByTestId('site-header')).toBeVisible()
    if (!isMobile) {
      await page.getByRole('button', { name: 'Comprar', exact: true }).hover()
      await expect(page.getByTestId('mega-menu')).toBeVisible()
      await expect(page.getByText('Por necessidade da pele')).toBeVisible()
      await page.keyboard.press('Escape')
    }

    // PDP (creme de mãos R$ 47,80: abaixo do limite de frete grátis)
    await page.goto('/produto/creme-hidratante-deo-para-maos-oliva-e-bergamota/')
    await expect(page.getByTestId('pdp-title')).toContainText('Creme Hidratante Deo para Mãos Oliva e Bergamota')
    const block = page.getByTestId('delivery-block')
    await expect(block.getByTestId('delivery-dates')).toContainText(ARRIVAL)
    await expect(block).toContainText('Curitiba – PR')
    await expect(block.getByTestId('delivery-price')).toContainText('R$ 19,90') // Sul/Sudeste, Econômica

    // Troca de cidade em tempo real (modo demo)
    const demo = page.getByTestId('demo-panel')
    if (isMobile) await demo.getByRole('button', { name: 'Demo' }).click()
    await demo.getByRole('button', { name: 'Manaus–AM' }).click()
    await expect(block).toContainText('Manaus – AM')
    await expect(block.getByTestId('delivery-price')).toContainText('R$ 39,90') // Norte, Econômica
    await demo.getByRole('button', { name: 'Curitiba–PR' }).click()
    await expect(block.getByTestId('delivery-price')).toContainText('R$ 19,90')

    // Quantidade muda o valor: 7 x 47,80 = 334,60 passa de R$ 299 → frete grátis
    for (let i = 0; i < 6; i++) await page.getByRole('button', { name: 'Aumentar quantidade' }).first().click()
    await expect(block.getByTestId('delivery-price')).toContainText('Frete grátis')
    for (let i = 0; i < 6; i++) await page.getByRole('button', { name: 'Diminuir quantidade' }).first().click()
    await expect(block.getByTestId('delivery-price')).toContainText('R$ 19,90')

    // Sacola
    await page.getByTestId('add-to-bag').click()
    const drawer = page.getByRole('dialog', { name: 'Sacola de compras' })
    await expect(drawer).toBeVisible()
    await expect(drawer.getByTestId('cart-line')).toHaveCount(1)
    await expect(drawer.getByTestId('free-shipping-bar')).toContainText('para o frete grátis')
    await expect(drawer.getByTestId('cart-estimate')).toContainText(/Chegará entre/)
    await drawer.getByRole('link', { name: /Prosseguir com sua compra/i }).click()

    // Checkout em uma página
    await expect(page).toHaveURL(/\/checkout\/$/)
    await page.getByLabel('E-mail').fill('maria@example.com')
    await page.getByLabel('Celular com DDD').fill('41999990000')
    await expect(page.getByLabel('CEP')).toHaveValue('80010-000') // vem da cidade (geolocalização)
    await expect(page.getByLabel('Rua')).toHaveValue('Rua José Loureiro')
    await page.getByLabel('CEP').fill('')
    await page.getByLabel('CEP').fill('80010000')
    await expect(page.getByLabel('Rua')).toHaveValue('Rua José Loureiro') // autopreenchimento
    await expect(page.getByLabel('Número', { exact: true })).toBeFocused()
    await page.getByLabel('Número', { exact: true }).fill('100')
    await page.getByLabel('Nome', { exact: true }).fill('Maria')
    await page.getByLabel('Sobrenome').fill('Teste')
    await page.getByLabel('CPF').fill('52998224725')
    await expect(page.getByTestId('shipping-options')).toContainText('Econômica')
    await expect(page.getByTestId('shipping-options')).toContainText(ARRIVAL)

    // Cupom
    const coupon = isMobile ? null : page.getByLabel('Código de desconto')
    if (coupon) {
      await coupon.fill('BEMVINDO15')
      await page.getByRole('button', { name: 'Aplicar' }).click()
      await expect(page.getByText('15% na primeira compra')).toBeVisible()
    }
    await expect(page.locator('[data-testid="place-order"]:visible')).toContainText('R$')

    await page.locator('[data-testid="place-order"]:visible').click()

    // Confirmação com Pix
    await expect(page).toHaveURL(/\/pedido\/KR[A-Z0-9]{8}\/$/)
    await expect(page.getByTestId('order-id')).toHaveText(/^KR[A-Z0-9]{8}$/)
    await expect(page.getByTestId('pix-qr')).toBeVisible()
    await expect(page.getByTestId('copy-value')).toContainText('br.gov.bcb.pix')
    await expect(page.getByTestId('pix-status')).toContainText('Aguardando pagamento')
    await page.getByTestId('simulate-pix').click()
    await expect(page.getByTestId('pix-status')).toContainText('Pagamento aprovado')
    await expect(page.getByTestId('order-eta')).toContainText(/Chegará/)
    expect(errors, errors.join('\n')).toEqual([])
  })

  test('validações do checkout: CPF inválido e foco no primeiro erro', async ({ page }) => {
    await mockExternal(page)
    await page.goto('/produto/sabonete-em-barra-jasmim/')
    await acceptCookies(page)
    await page.getByTestId('add-to-bag').click()
    await expect(page.getByRole('dialog', { name: 'Sacola de compras' }).getByTestId('cart-line')).toHaveCount(1)
    await page.goto('/checkout/')
    await expect(page.getByLabel('CPF')).toHaveCount(0) // campos de endereço só aparecem depois do CEP
    await page.getByLabel('CEP').fill('80010000')
    await expect(page.getByLabel('Rua')).toHaveValue('Rua José Loureiro')
    await page.getByLabel('CPF').fill('11111111111')
    await page.getByLabel('CPF').blur()
    await expect(page.getByText('CPF inválido')).toBeVisible()
    await page.locator('[data-testid="place-order"]:visible').click()
    await expect(page.getByLabel('E-mail')).toBeFocused()
    await expect(page.getByText('Informe seu e-mail')).toBeVisible()
  })
})
