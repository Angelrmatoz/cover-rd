# 🤖 AGENTS.md — Frontend Architecture & Testing Guidelines

Directrices para agentes de IA que desarrollen o modifiquen código en la carpeta **`frontend/`**.

---

## 🎨 1. Estándares de Frontend

- **Bundler:** Utilizar **Webpack** (`next dev --webpack` y `next build --webpack`).
- **Node.js & Base Image:** **Node 24 LTS Alpine** (`node:24-alpine`) con `pnpm@11.24.0`.
- **Estilos:** Tailwind CSS v4 con paleta oscura neón (`zinc-950`, `fuchsia-600`, `amber-400`).
- **Proxy Same-Origin:** Todas las llamadas hacia la API de Odoo deben realizarse con endpoints relativos `/cover/api/*`. No quemar URLs absolutas con puertos `8069` en los componentes.

---

## 🛡️ 2. Manejo de Estado y Contextos

- **`AuthContext`:** Mantiene sincronizado el estado del usuario autenticado, rol (`client` o `promoter`), token JWT y `wallet_balance`.
- **Topup de Billetera:** Las recargas de saldo se ejecutan vía `api.topupWallet()` y actualizan reactivamente el estado en el contexto.

---

## 🧪 3. Protocolo de Testing Obligatorio

1. **Jest + React Testing Library:**
   - Ubicación: `src/__tests__/`.
   - Cobertura actual: **14 tests pasando**.
   - Incluye pruebas para `Navbar`, `PartyCarousel`, `EventCard`, `AuthModal`, `CheckoutModal`, `UserTicketsModal` y `DoorScannerModal` (incluyendo detección de QR falsos y usados).
   - Comando: `pnpm test`.

2. **Playwright E2E:**
   - Ubicación: `e2e/`.
   - Cobertura actual: **10 tests pasando** en **Chromium** y **WebKit**.
   - Incluye flujo completo de ciclo de vida: *Compra con Billetera $\rightarrow$ Emisión QR $\rightarrow$ Escaneo de Portero $\rightarrow$ Rechazo anti-fraude de doble escaneo*.
   - Comando: `pnpm test:e2e`.

3. **Compilación:**
   - Verificar siempre que `pnpm build` compile limpiamente con Webpack y genere la traza standalone para Docker.
