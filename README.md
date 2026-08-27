# 🍾 COVER.RD — Nightlife, Ticketing & Gate Control Platform

> Plataforma integral de descubrimiento de eventos nocturnos, compra de entradas mediante Billetera Digital en RD$, generación de boletos con códigos QR criptográficos y validación de acceso en puerta para promotores y discotecas en República Dominicana.

---

## 🏗️ Arquitectura del Sistema

```
                      ┌────────────────────────────────────────┐
                      │        CLIENTE / NAVEGADOR WEB         │
                      │  Next.js 16 • React 19 • Tailwind CSS  │
                      └───────────────────┬────────────────────┘
                                          │
                   Proxy Rewrite (Same-Origin /cover/api/*)
                                          │
                      ┌───────────────────▼────────────────────┐
                      │          BACKEND API (ODOO 19)         │
                      │  Python 3.12 • Werkzeug • JWT PBKDF2   │
                      │  Swagger UI • OpenAPI 3.0 • CORS       │
                      └───────────────────┬────────────────────┘
                                          │
                                   TCP / SQL (5432)
                                          │
                      ┌───────────────────▼────────────────────┐
                      │        BASE DE DATOS RELACIONAL        │
                      │             PostgreSQL 18              │
                      └────────────────────────────────────────┘
```

---

## 🚀 Características Principales

1. **Cartelera y Descubrimiento Nocturno:**
   - Carrusel interactivo y catálogo por regiones (Santo Domingo, Punta Cana, Santiago, VIP & Lounge).
   - 20 flyers locales en formato WebP optimizado de alta resolución.
2. **Autenticación con Control de Acceso por Roles (RBAC):**
   - **Clientes:** Compran boletos, administran su billetera y visualizan sus entradas bajo *"Mis Flyers"*.
   - **Empresas / Promotores (Discotecas con RNC):** Acceso exclusivo al **Escáner de Puerta** en tiempo real.
3. **Billetera Digital Cover (RD$):**
   - Saldo inicial de cortesía de **RD$ 20,000.00** para cada usuario.
   - Flujo de compra con débito automático en 1 clic y botón de recarga instantánea (+RD$ 5,000).
4. **Seguridad, Criptografía y Validación Anti-Fraude:**
   - Contraseñas con hashing **PBKDF2 HMAC SHA-256** y salt aleatorio.
   - Boletos firmados con tokens únicos SHA256 anti-duplicados y renderizado QR en SVG de alta resolución.
   - Escaneo con cámara o validación manual: rechazo automático de entradas falsas o tickets ya utilizados (`attended`).
5. **Documentación & Pruebas Automatizadas:**
   - **Swagger UI interactivo & OpenAPI 3.0** en `/cover/api/docs`.
   - **Colección Oficial de Postman Cloud** con inyección automática de JWT.
   - **Testing Automatizado:** 100% de cobertura en Jest (unitario/integración) y Playwright (E2E en Chromium y WebKit).
   - **CI/CD Automatizado con GitHub Actions:** Flujo continuo que ejecuta linters, build de Webpack, Jest y Playwright E2E en cada commit/PR.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
|---|---|
| **Frontend** | Next.js 16.3.3 (Webpack), React 19, TypeScript 5, Tailwind CSS, Lucide Icons, QRCode.react, Html5-QRCode, Node 24 LTS |
| **Backend** | Odoo 19.0 Community, Python 3.12, Werkzeug, PyJWT, Docker Compose |
| **Base de Datos** | PostgreSQL 18 Relacional |
| **Testing & CI/CD** | Jest 29, React Testing Library, Playwright (Chromium & WebKit), GitHub Actions (`.github/workflows/ci.yml`) |
| **Documentación** | OpenAPI 3.0, Swagger UI, Postman Collection |

---

## ⚡ Inicio Rápido con Docker Compose

### Levantar Todo el Stack (1 solo comando)
```bash
docker compose up -d
```

| Servicio | Contenedor | URL / Puerto | Descripción |
|---|---|---|---|
| **Frontend** | `cover_nextjs_frontend` | [http://localhost:3000](http://localhost:3000) | App Next.js con Webpack y Hot Reload |
| **Backend** | `cover_odoo_backend` | [http://localhost:8069](http://localhost:8069) | Servidor Odoo y API REST |
| **Swagger UI** | `cover_odoo_backend` | [http://localhost:8069/cover/api/docs](http://localhost:8069/cover/api/docs) | Documentación interactiva de la API |
| **OpenAPI Spec**| `cover_odoo_backend` | [http://localhost:8069/cover/api/v1/openapi.json](http://localhost:8069/cover/api/v1/openapi.json) | Especificación JSON OpenAPI 3.0 |
| **Base de Datos**| `cover_postgres_db` | `localhost:5432` | PostgreSQL 18 |

---

## 🧪 Pruebas Automatizadas & CI/CD

```bash
cd frontend

# Pruebas unitarias e integración (Jest)
pnpm test

# Pruebas End-to-End (Playwright en Chromium y WebKit)
pnpm test:e2e
```

### 🤖 Pipeline de GitHub Actions ([`.github/workflows/ci.yml`](file:///.github/workflows/ci.yml)):
1. **Job 1 (`unit-and-build`):** Ejecuta Jest (14 unit/integration tests) y compilación de producción con Webpack en Node 24 LTS.
2. **Job 2 (`e2e-tests`):** Despliega Odoo 19 + PostgreSQL 18 en contenedor y ejecuta los 10 tests de Playwright (flujo de compra $\rightarrow$ QR $\rightarrow$ escaneo $\rightarrow$ protección anti-fraude).

---

## 🔑 Credenciales Demo Disponibles

| Rol | Correo | Contraseña | Balance Inicial | Permisos |
|---|---|---|---|---|
| **Cliente Asistente** | `cliente@cover.do` | `password123` | RD$ 20,000.00 | Comprar entradas, ver "Mis Flyers" con QR |
| **Empresa / Promotor** | `promotor@cover.do` | `password123` | RD$ 20,000.00 | Escáner de Puerta con cámara / manual |

---

## 📂 Estructura del Repositorio

```
cover-rd/
├── .github/
│   └── workflows/
│       └── ci.yml            # Pipeline CI/CD con Jest, Build y Playwright E2E
├── backend/                  # Servidor Odoo 19, Addon cover_events, PostgreSQL
│   ├── custom_addons/        # Módulo cover_events (Modelos, Controladores, Datos)
│   ├── config/               # Configuración odoo.conf para PostgreSQL
│   ├── docker-compose.yml    # Orquestación aislada de backend
│   ├── .env                  # Variables de entorno seguras
│   ├── README.md             # Documentación específica del Backend
│   └── AGENTS.md             # Instrucciones para agentes de IA en Backend
├── frontend/                 # Aplicación Next.js 16 + React 19 + Tailwind
│   ├── src/                  # Componentes, Contextos, Lib API y Vistas
│   ├── public/events/        # 20 Flyers WebP optimizados
│   ├── e2e/                  # Pruebas E2E Playwright (Chromium & WebKit)
│   ├── Dockerfile            # Multi-stage build con Node 24 Alpine y Webpack
│   ├── docker-compose.dev.yml# Entorno dev aislado para Frontend
│   ├── README.md             # Documentación específica del Frontend
│   └── AGENTS.md             # Instrucciones para agentes de IA en Frontend
├── docker-compose.yml        # Orquestación unificada de todo el stack (DB + Backend + Frontend)
├── README.md                 # Documentación general de la solución
└── AGENTS.md                 # Reglas globales para agentes de IA
```
