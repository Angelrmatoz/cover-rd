# 🤖 AGENTS.md — Global System Guidelines & Architecture Rules

Este archivo contiene las directrices obligatorias para cualquier Agente de Inteligencia Artificial que opere sobre el repositorio **COVER.RD**.

---

## 🏛️ 1. Principios de Arquitectura

1. **Stack Tecnológico Principal:**
   - **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Webpack (`--webpack`), Node 24 Alpine.
   - **Backend:** Odoo 19.0 Community, Python 3.12, Werkzeug, PyJWT, PostgreSQL 18.
   - **Contenedores:** Docker Compose raíz (`docker-compose.yml`) y compose específico de frontend (`docker-compose.dev.yml`).
   - **CI/CD:** GitHub Actions workflow en [`.github/workflows/ci.yml`](file:///.github/workflows/ci.yml).

2. **Mitigación Permanente de CORS:**
   - Todo llamado frontend a la API debe realizarse mediante rutas relativas `/cover/api/*` en el cliente.
   - `next.config.ts` utiliza `rewrites()` para redirigir hacia `ODOO_INTERNAL_URL` (`http://backend:8069` en Docker o `http://localhost:8069` en host).
   - En el backend Odoo, todos los controladores (`CoverApiController`) deben incluir decoradores `cors='*'` y headers CORS permissivos en `json_response()`.

3. **Billetera Digital en RD$:**
   - Cada usuario registrado recibe un balance de cortesía de **RD$ 20,000.00** en `res_users.wallet_balance`.
   - Durante el checkout, el saldo se descuenta de forma atómica en el backend antes de emitir el boleto.
   - Recargas virtuales disponibles mediante `POST /cover/api/v1/user/topup`.

4. **Ciclo de Vida de Códigos QR y Anti-Fraude:**
   - Al crear un `event.registration`, se calcula un token SHA256 único e indexado.
   - El escaneo se procesa en `POST /cover/api/v1/scan`. Al ser validado por primera vez, el estado pasa a `attended` (`state = 'done'`).
   - Todo escaneo posterior del mismo token o de tokens inexistentes debe ser rechazado inmediatamente con alerta visual de alta visibilidad.

---

## 🐳 2. Reglas para Docker y Entornos

- **Node.js 24 LTS:** El frontend debe ejecutarse siempre sobre `node:24-alpine` con `pnpm@11.24.0` e `--ignore-scripts`.
- **Caché y Persistencia:** En `docker-compose.yml` y `docker-compose.dev.yml`, utilizar siempre los named volumes (`cover_root_frontend_node_modules`, `cover_root_pnpm_store_cache`) para evitar descargas innecesarias.
- **`.dockerignore`:** Mantener siempre excluidos `node_modules`, `.next`, `.git` y artefactos de testing para conservar el build context en < 10 KB.

---

## 🧪 3. Requisitos de Testing & Calidad (CI/CD)

Antes de dar por completada cualquier tarea o abrir un Pull Request:
1. Ejecutar **`pnpm test`** en `frontend/` y asegurar que el 100% de las suites Jest pasen en verde (14 tests).
2. Ejecutar **`pnpm test:e2e`** en `frontend/` y validar que los 10 tests de Playwright pasen en Chromium y WebKit.
3. Ejecutar **`pnpm build`** y verificar que la compilación con Webpack no arroje errores de TypeScript ni de módulos.
4. Asegurar que el pipeline de GitHub Actions [`.github/workflows/ci.yml`](file:///.github/workflows/ci.yml) compile y valide en verde.

---

## 📄 4. Documentación Sincronizada

- Cualquier nuevo endpoint debe agregarse a `OPENAPI_SPEC` en [`controllers/api.py`](file:///C:/Dev/cover-rd/backend/custom_addons/cover_events/controllers/api.py).
- La documentación interactiva reside en `/cover/api/docs` (Swagger UI).
- La colección oficial de Postman se encuentra en Postman Cloud bajo `COVER.RD — Nightlife, Tickets & Gate Control API`.
