# 🎨 COVER.RD — Frontend (Next.js 16, React 19 & Tailwind CSS)

Aplicación web moderna y ultra-rápida para la plataforma nocturna COVER.RD, desarrollada con **Next.js 16.3.3 (Webpack Bundler)**, **React 19**, **TypeScript 5**, **Node 24 LTS** y **Tailwind CSS**.

---

## 🚀 Arquitectura y Componentes Clave

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx               # Cartelera principal, carrusel y filtros por región
│   │   ├── layout.tsx             # Layout global con AuthProvider y Navbar
│   │   └── globals.css            # Estilos con tema oscuro neón
│   ├── components/
│   │   ├── Navbar.tsx             # Navegación, saldo de Billetera y selector de rol
│   │   ├── PartyCarousel.tsx      # Carrusel interactivo de fiestas destacadas
│   │   ├── EventCard.tsx          # Tarjeta de evento con precio, fecha y compra
│   │   ├── AuthModal.tsx          # Modal de inicio de sesión y registro (Cliente / Empresa)
│   │   ├── CheckoutModal.tsx      # Pasarela de pago con débito de Billetera Digital
│   │   ├── UserTicketsModal.tsx   # "Mis Flyers" con visualizador de códigos QR
│   │   └── DoorScannerModal.tsx   # Escáner de boletos en puerta (Cámara + Manual)
│   ├── context/
│   │   └── AuthContext.tsx        # Estado global de sesión, JWT, rol y saldo de billetera
│   ├── lib/
│   │   └── api.ts                 # Cliente HTTP con endpoints relativos anti-CORS
│   └── __tests__/                 # Pruebas unitarias con Jest + RTL (14 tests)
├── public/
│   └── events/                    # 20 Flyers locales WebP de alta fidelidad
├── e2e/                           # Pruebas End-to-End con Playwright (10 tests)
├── Dockerfile                     # Multi-stage build (deps -> dev -> builder -> runner) en Node 24
├── docker-compose.dev.yml         # Entorno Docker con Hot Reload y persistencia de node_modules
├── .dockerignore                  # Exclusión de node_modules y .next para builds rápidos
├── jest.config.mjs                # Configuración de Jest con SWC
├── playwright.config.ts           # Configuración de Playwright (Chromium & WebKit)
├── next.config.ts                 # Standalone output, polling Webpack y proxy rewrites
├── README.md                      # Documentación del Frontend
└── AGENTS.md                      # Guía para agentes de IA en Frontend
```

---

## ⚡ Comandos Disponibles

### Desarrollo Local
```bash
# Instalar dependencias
pnpm install

# Servidor de desarrollo con Webpack
pnpm dev

# Compilación para producción
pnpm build

# Ejecutar pruebas unitarias (Jest)
pnpm test

# Ejecutar pruebas End-to-End (Playwright en Chromium y WebKit)
pnpm test:e2e
```

### Desarrollo con Docker Compose (Hot Reload & Cache Persistente)
```bash
cd frontend

# Levantar contenedor en modo dev con Hot Reload
docker compose -f docker-compose.dev.yml up -d

# Ver logs
docker compose -f docker-compose.dev.yml logs -f
```

---

## 🐳 Persistencia de Dependencias y Cache en Docker

1. **Named Volumes (`cover_frontend_node_modules` & `cover_pnpm_store_cache`):**
   - Evita re-descargar o reinstalar paquetes en cada inicio de contenedor.
2. **BuildKit Cache Mount (`--mount=type=cache`):**
   - Acelera las reconstrucciones utilizando el almacén virtual de pnpm local.
3. **Polling Activo en Webpack:**
   - Detecta cambios en tiempo real dentro de `./src` y `./public` a través del sistema de archivos de Docker (`WATCHPACK_POLLING=true`).
