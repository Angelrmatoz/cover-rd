# 🤖 AGENTS.md — Backend Architecture & Development Guidelines

Directrices específicas para el desarrollo y mantenimiento del módulo Odoo **`cover_events`**.

---

## 🔒 1. Seguridad & Autenticación

- **Contraseñas:** Las contraseñas de los usuarios no se almacenan en texto plano; se utiliza PBKDF2 HMAC SHA-256 con salt dinámico mediante `res.users.set_cover_password()` y `verify_cover_password()`.
- **JWT:** Los tokens se firman con la clave secreta `JWT_SECRET` definida en `backend/.env`. La validez predeterminada es de 7 días.
- **Roles:** El modelo `res.users` soporta roles `'client'` y `'promoter'`. Para empresas/promotores el campo `rnc` es obligatorio.

---

## 💰 2. Lógica de Billetera Digital

- Cada usuario posee el campo `wallet_balance` en `res.users` con valor inicial de `20000.0`.
- En el endpoint `POST /cover/api/v1/checkout`:
  - Se verifica que el saldo sea suficiente para cubrir el precio del boleto.
  - Se descuenta el balance de manera atómica antes de crear el registro de entrada.
- El endpoint `POST /cover/api/v1/user/topup` incrementa el balance y retorna el saldo actualizado.

---

## 🎫 3. Ciclo de Vida de Códigos QR

- Cada `event.registration` genera un `qr_token` SHA256 único al crearse.
- En `POST /cover/api/v1/scan`:
  - Si el token no existe $\rightarrow$ Retorna `404 Not Found`.
  - Si el estado es `'done'` (ya asistió) $\rightarrow$ Retorna `400 Bad Request` con mensaje de entrada ya utilizada.
  - Si el token es válido $\rightarrow$ Cambia el estado a `'done'` y retorna `200 OK` con el nombre del asistente y tipo de entrada.

---

## 📖 4. Mantenimiento de OpenAPI y Swagger

- Al modificar o añadir endpoints en [`controllers/api.py`](file:///C:/Dev/cover-rd/backend/custom_addons/cover_events/controllers/api.py), actualizar inmediatamente el diccionario `OPENAPI_SPEC`.
- Swagger UI se sirve directamente en `/cover/api/docs`.
