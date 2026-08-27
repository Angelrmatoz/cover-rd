import { test, expect } from '@playwright/test';

test.describe('Cover RD - Home and Discovery E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display navbar with brand and guest controls (no scanner for guests)', async ({ page }) => {
    // Brand
    await expect(page.locator('header')).toContainText('COVER');
    await expect(page.locator('header')).toContainText('.RD');

    // Guest Auth Button is visible
    const authBtn = page.getByRole('button', { name: /Iniciar Sesión/i });
    await expect(authBtn).toBeVisible();

    // Door Scanner is NOT visible for guest
    const scannerBtn = page.getByRole('button', { name: /Escáner Puerta/i });
    await expect(scannerBtn).toHaveCount(0);
  });

  test('should display featured events section and cartelera', async ({ page }) => {
    await expect(page.getByText('Eventos Destacados de la Semana')).toBeVisible();
    await expect(page.getByText('Próximas Fiestas en RD')).toBeVisible();

    // Category pills
    await expect(page.getByRole('button', { name: 'Todos los Parties' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Santo Domingo' })).toBeVisible();
  });
});
