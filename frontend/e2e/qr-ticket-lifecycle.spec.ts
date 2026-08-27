import { test, expect } from '@playwright/test';

test.describe('Cover RD - Full QR Ticket Lifecycle & Gate Validation E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('complete flow: buy ticket with wallet -> generate QR -> promoter scan success -> anti-fraud double scan rejection', async ({ page }) => {
    // 1. Iniciar sesión como Cliente
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();
    await expect(page.getByText('Bienvenido a Cover.do')).toBeVisible();

    await page.fill('input[type="email"]', 'cliente@cover.do');
    await page.fill('input[type="password"]', 'password123');
    await page.getByRole('button', { name: /Entrar a Cover/i }).click();

    // Validar que se muestra el botón "Mis Flyers" tras autenticarse
    await expect(page.getByRole('button', { name: /Mis Flyers/i })).toBeVisible({ timeout: 10000 });

    // 2. Seleccionar el primer evento disponible para comprar entrada
    const buyButton = page.getByRole('button', { name: /Comprar Entrada/i }).first();
    await buyButton.click();

    // Verificar modal de checkout con billetera
    await expect(page.getByText(/Pago con Billetera Digital/i)).toBeVisible();
    await expect(page.getByText(/Tu Billetera Cover/i)).toBeVisible();

    // Confirmar y pagar
    await page.getByRole('button', { name: /Confirmar y Pagar/i }).click();

    // 3. Verificar pantalla de confirmación con código QR
    await expect(page.getByText(/¡Entrada Pagada y Confirmada!/i)).toBeVisible({ timeout: 15000 });

    // Cerrar modal de confirmación
    await page.getByRole('button', { name: /Listo \/ Ir a Mis Flyers/i }).click();

    // 4. Abrir "Mis Flyers" y verificar la entrada
    await page.getByRole('button', { name: /Mis Flyers/i }).click();
    await expect(page.getByText(/Mis Flyers & Tickets/i)).toBeVisible({ timeout: 10000 });
    
    // Cerrar modal de Mis Flyers
    await page.getByLabel('Cerrar Mis Flyers').click();

    // 5. Cerrar sesión del Cliente
    const logoutBtn = page.getByTitle('Cerrar sesión');
    await expect(logoutBtn).toBeVisible({ timeout: 10000 });
    await logoutBtn.click();
    await expect(page.getByRole('button', { name: /Iniciar Sesión/i })).toBeVisible({ timeout: 10000 });

    // 6. Iniciar sesión como Promotor / Empresa
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();
    await page.fill('input[type="email"]', 'promotor@cover.do');
    await page.fill('input[type="password"]', 'password123');
    await page.getByRole('button', { name: /Entrar a Cover/i }).click();

    // 7. Abrir Escáner de Puerta
    const scannerBtn = page.getByTitle('Escanear entradas en puerta');
    await expect(scannerBtn).toBeVisible({ timeout: 10000 });
    await scannerBtn.click();
    await expect(page.getByText('Escáner de Puerta')).toBeVisible({ timeout: 10000 });

    // 8. Generar una entrada fresca vía API para validar el token exacto
    const eventsRes = await page.request.get('/cover/api/v1/events');
    const eventsJson = await eventsRes.json();
    expect(eventsJson.data.length).toBeGreaterThan(0);

    const clientLogin = await page.request.post('/cover/api/v1/auth/login', {
      data: { email: 'cliente@cover.do', password: 'password123' },
    });
    const clientData = await clientLogin.json();

    const directBuy = await page.request.post('/cover/api/v1/checkout', {
      headers: { Authorization: `Bearer ${clientData.token}` },
      data: {
        event_id: eventsJson.data[0].id,
        name: 'Carlos Gomez E2E',
        email: 'cliente@cover.do',
      },
    });
    const directJson = await directBuy.json();
    const validToken = directJson.data.qr_token;
    expect(validToken).toBeTruthy();

    const tokenInput = page.getByPlaceholder('Pegar token SHA256...');
    await tokenInput.fill(validToken);
    await page.getByRole('button', { name: /^Validar$/i }).click();

    // 9. Primer escaneo -> ACCESO PERMITIDO (200 OK)
    await expect(page.getByText(/¡ACCESO PERMITIDO!/i)).toBeVisible({ timeout: 10000 });

    // 10. Validar protección anti-fraude: Intentar escanear el MISMO token por segunda vez
    await page.getByRole('button', { name: /Escanear Siguiente Entrada/i }).click();
    await tokenInput.fill(validToken);
    await page.getByRole('button', { name: /^Validar$/i }).click();

    // Debe ser rechazado porque ya fue utilizado
    await expect(page.getByText(/Ticket no válido o ya utilizado|YA UTILIZADA|Rechazado/i)).toBeVisible({ timeout: 10000 });
  });
});
