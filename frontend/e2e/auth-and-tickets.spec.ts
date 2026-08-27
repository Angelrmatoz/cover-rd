import { test, expect } from '@playwright/test';

test.describe('Cover RD - Auth and Modal Interactions E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should open auth modal, switch to register, and display RNC for promoter role', async ({ page }) => {
    // Open login modal
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();
    await expect(page.getByText('Bienvenido a Cover.do')).toBeVisible();

    // Click register link
    await page.getByRole('button', { name: /Regístrate aquí/i }).click();
    await expect(page.getByText('Crear Cuenta')).toBeVisible();

    // Select Empresa / Discoteca
    await page.getByRole('button', { name: /Empresa \/ Discoteca/i }).click();

    // Verify RNC and Business name fields appear
    await expect(page.getByPlaceholder('Ej. 131-45678-9')).toBeVisible();
    await expect(page.getByPlaceholder('Ej. Euphoria Nightclub SRL')).toBeVisible();
  });

  test('should log in as promoter and open door scanner modal', async ({ page }) => {
    // Open login modal
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();
    await expect(page.getByText('Bienvenido a Cover.do')).toBeVisible();

    // Fill promoter demo credentials
    await page.fill('input[type="email"]', 'promotor@cover.do');
    await page.fill('input[type="password"]', 'password123');
    await page.getByRole('button', { name: /Entrar a Cover/i }).click();

    // Verify promoter badge in navbar
    await expect(page.getByText('Promotor')).toBeVisible();

    // Door scanner button should be visible for promoter
    const scannerBtn = page.getByTitle('Escanear entradas en puerta');
    await expect(scannerBtn).toBeVisible();

    await scannerBtn.click();
    await expect(page.getByText('Escáner de Puerta')).toBeVisible();
    await expect(page.getByPlaceholder('Pegar token SHA256...')).toBeVisible();
  });
});
