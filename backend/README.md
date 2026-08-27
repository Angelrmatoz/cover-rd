# ⚙️ COVER.RD — Backend (Odoo 19.0 & PostgreSQL 18)

Módulo y servidor backend para la plataforma nocturna COVER.RD, desarrollado sobre **Odoo 19.0 Community**, **Python 3.12** y **PostgreSQL 18**.

---

## 🏛️ Estructura del Backend

```
backend/
├── custom_addons/
│   └── cover_events/
│       ├── controllers/
│       │   ├── api.py             # Endpoints REST, Swagger UI & OpenAPI Spec
│       │   └── jwt_auth.py        # Generación y validación de tokens JWT
│       ├── models/
│       │   ├── event_event.py     # Modelo de eventos e imágenes WebP
│       │   ├── event_registration.py # Registros, tokens QR y validación de acceso
│       │   └── res_users.py       # Roles, RNC, Billetera RD$ y contraseñas PBKDF2
│       ├── data/
│       │   └── demo_events.xml    # Datos iniciales con 20 fiestas de RD
│       ├── security/
│       │   └── ir.model.access.csv# Reglas de acceso
│       └── __manifest__.py        # Manifiesto del addon Odoo
├── config/
│   └── odoo.conf                  # Configuración de base de datos y addons path
├── docker-compose.yml             # Orquestación aislada de backend + PostgreSQL
├── .env                           # Variables de entorno y secretos
├── README.md                      # Documentación del Backend
└── AGENTS.md                      # Guía para agentes de IA en Backend
```

---

## 🚀 Endpoints Principales & Swagger UI

- **Swagger UI Interactivo:** [http://localhost:8069/cover/api/docs](http://localhost:8069/cover/api/docs)
- **Esquema OpenAPI 3.0:** [http://localhost:8069/cover/api/v1/openapi.json](http://localhost:8069/cover/api/v1/openapi.json)

| Método | Endpoint | Autenticación | Descripción |
|---|---|---|---|
| `POST` | `/cover/api/v1/auth/register` | Pública | Registro de usuario con balance RD$ 20,000 |
| `POST` | `/cover/api/v1/auth/login` | Pública | Login y emisión de token JWT (7 días) |
| `GET` | `/cover/api/v1/auth/me` | Bearer JWT | Perfil del usuario y balance de billetera |
| `POST` | `/cover/api/v1/user/topup` | Bearer JWT | Recarga de saldo a la Billetera Digital |
| `GET` | `/cover/api/v1/events` | Pública | Cartelera de eventos activos con imágenes |
| `POST` | `/cover/api/v1/checkout` | Bearer JWT | Compra con débito en billetera y generación de QR |
| `GET` | `/cover/api/v1/user/tickets` | Bearer JWT | Lista de flyers comprados con sus códigos QR |
| `POST` | `/cover/api/v1/scan` | Pública | Validación en puerta de token QR |

---

## ⚡ Comandos para Backend

```bash
# Levantar servidor Odoo y PostgreSQL aislado
cd backend
docker compose up -d

# Actualizar el módulo cover_events en la base de datos
docker exec cover_odoo_backend odoo --db_host=db --db_user=odoo --db_password=odoo -d postgres -u cover_events --stop-after-init
```
