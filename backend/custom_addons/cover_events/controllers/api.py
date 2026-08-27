# -*- coding: utf-8 -*-
import json
from odoo import http, fields
from odoo.http import request, Response
from .jwt_auth import generate_jwt, get_authenticated_user


def json_response(data, status=200):
    headers = [
        ('Access-Control-Allow-Origin', '*'),
        ('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE, PATCH'),
        ('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin'),
    ]
    return Response(
        json.dumps(data),
        content_type='application/json;charset=utf-8',
        status=status,
        headers=headers,
    )


def get_json_body(req):
    """Extrae parámetros JSON de forma robusta."""
    try:
        if req.httprequest.data:
            return json.loads(req.httprequest.data.decode('utf-8'))
    except Exception:
        pass
    return req.params if hasattr(req, 'params') and req.params else {}


def serialize_user(user):
    balance = getattr(user, 'wallet_balance', 20000.0)
    if balance is False or balance is None:
        balance = 20000.0
    return {
        'id': user.id,
        'name': user.name,
        'email': user.email or user.login,
        'role': getattr(user, 'user_role', 'client') or 'client',
        'rnc': getattr(user, 'rnc', '') or '',
        'business_name': getattr(user, 'business_name', '') or '',
        'wallet_balance': float(balance),
    }


OPENAPI_SPEC = {
    "openapi": "3.0.3",
    "info": {
        "title": "COVER.RD API — Nightlife, Tickets & Gate Control",
        "description": "API REST oficial de COVER.RD sobre Odoo 19.0 Community & PostgreSQL 18 para gestión de eventos, boletos QR con firma criptográfica SHA256 y Billetera Digital en RD$.",
        "version": "1.0.0",
        "contact": {
            "name": "Cover RD Tech Team",
            "email": "soporte@cover.do"
        }
    },
    "servers": [
        {"url": "http://localhost:8069", "description": "Servidor Odoo Backend"},
        {"url": "http://localhost:3000", "description": "Frontend Proxy Rewrite"}
    ],
    "components": {
        "securitySchemes": {
            "BearerAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT",
                "description": "Introduce el token JWT obtenido en /cover/api/v1/auth/login"
            }
        }
    },
    "paths": {
        "/cover/api/v1/auth/register": {
            "post": {
                "tags": ["Autenticación"],
                "summary": "Registro de usuario (Cliente o Empresa)",
                "description": "Crea una cuenta con saldo inicial de cortesía de RD$ 20,000.00 y password PBKDF2 SHA-256.",
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "required": ["name", "email", "password"],
                                "properties": {
                                    "name": {"type": "string", "example": "Carlos Gomez"},
                                    "email": {"type": "string", "example": "cliente@cover.do"},
                                    "password": {"type": "string", "example": "password123"},
                                    "role": {"type": "string", "enum": ["client", "promoter"], "example": "client"},
                                    "phone": {"type": "string", "example": "809-555-0101"},
                                    "rnc": {"type": "string", "example": "131-45678-9"},
                                    "business_name": {"type": "string", "example": "Euphoria Nightclub SRL"}
                                }
                            }
                        }
                    }
                },
                "responses": {
                    "201": {"description": "Usuario creado exitosamente con JWT"},
                    "400": {"description": "Datos inválidos o incompletos"}
                }
            }
        },
        "/cover/api/v1/auth/login": {
            "post": {
                "tags": ["Autenticación"],
                "summary": "Inicio de sesión",
                "description": "Valida las credenciales contra el hash PBKDF2 y devuelve token JWT con 7 días de validez.",
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "required": ["email", "password"],
                                "properties": {
                                    "email": {"type": "string", "example": "cliente@cover.do"},
                                    "password": {"type": "string", "example": "password123"}
                                }
                            }
                        }
                    }
                },
                "responses": {
                    "200": {"description": "Token JWT generado"},
                    "401": {"description": "Credenciales inválidas"}
                }
            }
        },
        "/cover/api/v1/auth/me": {
            "get": {
                "tags": ["Autenticación"],
                "summary": "Perfil del usuario autenticado",
                "security": [{"BearerAuth": []}],
                "responses": {
                    "200": {"description": "Información del usuario y balance de billetera"},
                    "401": {"description": "No autorizado o token expirado"}
                }
            }
        },
        "/cover/api/v1/user/topup": {
            "post": {
                "tags": ["Billetera Digital"],
                "summary": "Recargar saldo a la Billetera Cover",
                "security": [{"BearerAuth": []}],
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "amount": {"type": "number", "example": 5000}
                                }
                            }
                        }
                    }
                },
                "responses": {
                    "200": {"description": "Saldo recargado exitosamente"}
                }
            }
        },
        "/cover/api/v1/events": {
            "get": {
                "tags": ["Eventos"],
                "summary": "Lista de fiestas y eventos activos",
                "responses": {
                    "200": {"description": "Lista de eventos con precios e imágenes"}
                }
            }
        },
        "/cover/api/v1/events/{event_id}": {
            "get": {
                "tags": ["Eventos"],
                "summary": "Detalle de evento",
                "parameters": [
                    {"name": "event_id", "in": "path", "required": True, "schema": {"type": "integer"}}
                ],
                "responses": {
                    "200": {"description": "Detalles del evento y tipos de boletos"}
                }
            }
        },
        "/cover/api/v1/checkout": {
            "post": {
                "tags": ["Checkout & Boletos"],
                "summary": "Comprar boleto con Billetera Digital y generar QR",
                "security": [{"BearerAuth": []}],
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "required": ["event_id", "name", "email"],
                                "properties": {
                                    "event_id": {"type": "integer", "example": 6},
                                    "ticket_id": {"type": "integer", "example": 1},
                                    "name": {"type": "string", "example": "Carlos Gomez"},
                                    "email": {"type": "string", "example": "cliente@cover.do"},
                                    "phone": {"type": "string", "example": "809-555-0101"}
                                }
                            }
                        }
                    }
                },
                "responses": {
                    "201": {"description": "Boleto generado con token QR criptográfico"},
                    "400": {"description": "Saldo insuficiente o datos faltantes"}
                }
            }
        },
        "/cover/api/v1/user/tickets": {
            "get": {
                "tags": ["Checkout & Boletos"],
                "summary": "Listar boletos / flyers comprados por el usuario",
                "security": [{"BearerAuth": []}],
                "responses": {
                    "200": {"description": "Listado de boletos y tokens QR"}
                }
            }
        },
        "/cover/api/v1/scan": {
            "post": {
                "tags": ["Control de Acceso en Puerta"],
                "summary": "Validación en puerta de token QR",
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "required": ["qr_token"],
                                "properties": {
                                    "qr_token": {"type": "string", "example": "2e70a5b2c8ab8e10dd5739e1"}
                                }
                            }
                        }
                    }
                },
                "responses": {
                    "200": {"description": "Token válido y marcado como 'attended'"},
                    "400": {"description": "Token ya utilizado o no válido"}
                }
            }
        }
    }
}


SWAGGER_UI_HTML = """<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>COVER.RD — Swagger API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23d946ef'><path d='M12 2c1.1 0 2 .9 2 2v1.1c3.9 1 6.8 4.4 7 8.5.2 5-3.8 9.4-8.8 9.4-5.2 0-9.4-4.2-9.4-9.4 0-4.1 2.8-7.7 6.8-8.6V4c0-1.1.9-2 2-2z'/></svg>" />
  <style>
    body { margin: 0; background: #09090b; }
    .swagger-ui .topbar { display: none; }
    .swagger-ui {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
      filter: invert(88%) hue-rotate(180deg);
    }
    .swagger-ui .info h2 { color: #d946ef !important; }
    .swagger-ui .opblock .opblock-summary-method { font-weight: bold; border-radius: 6px; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" crossorigin></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/cover/api/v1/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout"
      });
    };
  </script>
</body>
</html>
"""


class CoverApiController(http.Controller):

    # ==========================================
    # SWAGGER & OPENAPI DOCS
    # ==========================================

    @http.route('/cover/api/docs', type='http', auth='public', methods=['GET'], cors='*', csrf=False)
    def swagger_ui(self, **kwargs):
        """Renderiza la interfaz interactiva de Swagger UI."""
        return Response(SWAGGER_UI_HTML, content_type='text/html;charset=utf-8')

    @http.route('/cover/api/v1/openapi.json', type='http', auth='public', methods=['GET'], cors='*', csrf=False)
    def openapi_spec(self, **kwargs):
        """Retorna el esquema OpenAPI 3.0 en formato JSON."""
        return json_response(OPENAPI_SPEC)

    # ==========================================
    # CORS PREFLIGHT (OPTIONS 200)
    # ==========================================

    @http.route([
        '/cover/api/v1/<path:subpath>',
        '/cover/api/v1/auth/login',
        '/cover/api/v1/auth/register',
        '/cover/api/v1/auth/me',
        '/cover/api/v1/user/tickets',
        '/cover/api/v1/user/topup',
        '/cover/api/v1/events',
        '/cover/api/v1/events/<int:event_id>',
        '/cover/api/v1/checkout',
        '/cover/api/v1/scan',
    ], type='http', auth='public', methods=['OPTIONS'], cors='*', csrf=False)
    def cors_options_all(self, **kwargs):
        headers = [
            ('Access-Control-Allow-Origin', '*'),
            ('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE, PATCH'),
            ('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin'),
        ]
        return Response('OK', status=200, headers=headers)

    # ==========================================
    # AUTHENTICATION
    # ==========================================

    @http.route('/cover/api/v1/auth/register', type='http', auth='public', methods=['POST'], cors='*', csrf=False)
    def register(self, **kwargs):
        """Registro de clientes o empresas/promotores con saldo de bienvenida RD$ 20,000."""
        params = get_json_body(request)

        name = params.get('name')
        email = params.get('email', '').strip().lower() if params.get('email') else ''
        password = params.get('password')
        role = params.get('role', 'client')  # 'client' o 'promoter'
        phone = params.get('phone', '')
        rnc = params.get('rnc', '').strip() if params.get('rnc') else ''
        business_name = params.get('business_name', '').strip() if params.get('business_name') else ''

        if not (name and email and password):
            return json_response({'status': 'error', 'message': 'Nombre, correo y contraseña son obligatorios'}, status=400)

        if role == 'promoter' and not rnc:
            return json_response({'status': 'error', 'message': 'El RNC es obligatorio para empresas/promotores'}, status=400)

        # Validar usuario existente
        existing = request.env['res.users'].sudo().search([('login', '=', email)], limit=1)
        if existing:
            return json_response({'status': 'error', 'message': 'El correo electrónico ya está registrado'}, status=409)

        # Crear usuario en Odoo con rol, saldo inicial y contraseña activada
        user_vals = {
            'name': name,
            'login': email,
            'email': email,
            'password': password,
            'phone': phone,
            'user_role': role if role in ['client', 'promoter'] else 'client',
            'rnc': rnc if role == 'promoter' else '',
            'business_name': business_name if role == 'promoter' else '',
            'wallet_balance': 20000.0,
            'active': True,
        }

        user = request.env['res.users'].sudo().with_context(
            no_reset_password=True,
            signup_valid=False,
            mail_create_nolog=True,
            mail_create_nosubscribe=True,
        ).create(user_vals)

        user.set_cover_password(password)

        token = generate_jwt({'user_id': user.id, 'role': user.user_role, 'email': user.email})

        return json_response({
            'status': 'success',
            'token': token,
            'user': serialize_user(user),
        }, status=201)

    @http.route('/cover/api/v1/auth/login', type='http', auth='public', methods=['POST'], cors='*', csrf=False)
    def login(self, **kwargs):
        """Inicio de sesión con validación de hash PBKDF2 y retorno de JWT."""
        params = get_json_body(request)

        email = params.get('email', '').strip().lower() if params.get('email') else ''
        password = params.get('password', '')

        if not (email and password):
            return json_response({'status': 'error', 'message': 'Correo y contraseña requeridos'}, status=400)

        user = request.env['res.users'].sudo().search([('login', '=', email)], limit=1)
        if not user or not user.verify_cover_password(password):
            return json_response({'status': 'error', 'message': 'Credenciales inválidas'}, status=401)

        token = generate_jwt({'user_id': user.id, 'role': user.user_role, 'email': user.email})

        return json_response({
            'status': 'success',
            'token': token,
            'user': serialize_user(user),
        })

    @http.route('/cover/api/v1/auth/me', type='http', auth='public', methods=['GET'], cors='*', csrf=False)
    def get_profile(self, **kwargs):
        """Retorna perfil del usuario autenticado."""
        user = get_authenticated_user(request)
        if not user:
            return json_response({'status': 'error', 'message': 'No autorizado o token expirado'}, status=401)

        return json_response({'status': 'success', 'user': serialize_user(user)})

    # ==========================================
    # BILLETERA / TOPUP
    # ==========================================

    @http.route('/cover/api/v1/user/topup', type='http', auth='public', methods=['POST'], cors='*', csrf=False)
    def topup_wallet(self, **kwargs):
        """Recarga saldo en la billetera virtual del usuario."""
        user = get_authenticated_user(request)
        if not user:
            return json_response({'status': 'error', 'message': 'No autorizado'}, status=401)

        params = get_json_body(request)
        amount = float(params.get('amount', 5000.0))
        if amount <= 0:
            return json_response({'status': 'error', 'message': 'Monto de recarga inválido'}, status=400)

        current_balance = getattr(user, 'wallet_balance', 0.0) or 0.0
        new_balance = current_balance + amount
        user.sudo().write({'wallet_balance': new_balance})

        return json_response({
            'status': 'success',
            'message': f'Se han recargado RD$ {amount:,.2f} a tu cuenta',
            'user': serialize_user(user),
        })

    # ==========================================
    # FLYERS / TICKETS COMPRADOS (USUARIO)
    # ==========================================

    @http.route('/cover/api/v1/user/tickets', type='http', auth='public', methods=['GET'], cors='*', csrf=False)
    def get_user_tickets(self, **kwargs):
        """Retorna la lista de flyers/tickets comprados con sus códigos QR."""
        user = get_authenticated_user(request)
        if not user:
            return json_response({'status': 'error', 'message': 'No autorizado'}, status=401)

        # Buscar por user_id o por email de la cuenta
        regs = request.env['event.registration'].sudo().search([
            '|',
            ('user_id', '=', user.id),
            ('email', '=', user.email),
        ], order='create_date desc')

        tickets_data = []
        for r in regs:
            ev = r.event_id
            images = ev.get_images() if hasattr(ev, 'get_images') else []
            tickets_data.append({
                'registration_id': r.id,
                'event_id': ev.id,
                'event_name': ev.name,
                'date_begin': ev.date_begin.isoformat() if ev.date_begin else None,
                'date_end': ev.date_end.isoformat() if ev.date_end else None,
                'ticket_name': r.event_ticket_id.name if r.event_ticket_id else 'General Admission',
                'attendee_name': r.name,
                'qr_token': r.qr_token,
                'flyer_image': images[0] if images else None,
                'state': r.state,
                'purchase_date': r.create_date.isoformat() if r.create_date else None,
            })

        return json_response({'status': 'success', 'data': tickets_data})

    # ==========================================
    # EVENTOS & CHECKOUT
    # ==========================================

    @http.route('/cover/api/v1/events', type='http', auth='public', methods=['GET'], cors='*', csrf=False)
    def get_events(self, **kwargs):
        """Lista de eventos activos con imágenes y tickets."""
        events = request.env['event.event'].sudo().search([
            ('stage_id.pipe_end', '=', False),
            ('date_end', '>=', fields.Datetime.now()),
        ], order='date_begin asc')

        data = [{
            'id': ev.id,
            'name': ev.name,
            'date_begin': ev.date_begin.isoformat() if ev.date_begin else None,
            'date_end': ev.date_end.isoformat() if ev.date_end else None,
            'seats_available': ev.seats_available,
            'images': ev.get_images() if hasattr(ev, 'get_images') else [],
            'tickets': [{
                'id': t.id,
                'name': t.name,
                'price': t.price,
                'seats_available': t.seats_available,
            } for t in ev.event_ticket_ids],
        } for ev in events]

        return json_response({'status': 'success', 'data': data})

    @http.route('/cover/api/v1/events/<int:event_id>', type='http', auth='public', methods=['GET'], cors='*', csrf=False)
    def get_event_detail(self, event_id, **kwargs):
        """Detalle de un evento con su galería completa y tickets."""
        event = request.env['event.event'].sudo().browse(event_id)
        if not event.exists():
            return json_response({'status': 'error', 'message': 'Evento no encontrado'}, status=404)

        return json_response({
            'status': 'success',
            'data': {
                'id': event.id,
                'name': event.name,
                'date_begin': event.date_begin.isoformat() if event.date_begin else None,
                'date_end': event.date_end.isoformat() if event.date_end else None,
                'seats_available': event.seats_available,
                'images': event.get_images() if hasattr(event, 'get_images') else [],
                'tickets': [{
                    'id': t.id,
                    'name': t.name,
                    'price': t.price,
                    'seats_available': t.seats_available,
                } for t in event.event_ticket_ids],
            }
        })

    @http.route('/cover/api/v1/checkout', type='http', auth='public', methods=['POST'], cors='*', csrf=False)
    def checkout_ticket(self, **kwargs):
        """Genera registro, descuenta saldo de la billetera y retorna el token QR."""
        params = get_json_body(request)

        user = get_authenticated_user(request)
        event_id = params.get('event_id')
        ticket_id = params.get('ticket_id')
        name = params.get('name') or (user.name if user else None)
        email = params.get('email') or (user.email if user else None)
        phone = params.get('phone', '')

        if not (event_id and name and email):
            return json_response({'status': 'error', 'message': 'Faltan campos requeridos: event_id, name, email'}, status=400)

        event = request.env['event.event'].sudo().browse(int(event_id))
        if not event.exists():
            return json_response({'status': 'error', 'message': 'Evento no encontrado'}, status=404)

        # Determinar precio del boleto
        ticket = None
        ticket_price = 0.0
        if ticket_id:
            ticket = request.env['event.event.ticket'].sudo().browse(int(ticket_id))
            if ticket.exists():
                ticket_price = float(ticket.price)

        # Validación y descuento de saldo de billetera
        if user:
            current_balance = float(getattr(user, 'wallet_balance', 20000.0) or 0.0)
            if current_balance < ticket_price:
                return json_response({
                    'status': 'error',
                    'message': f'Saldo insuficiente en tu Billetera Cover. Balance: RD$ {current_balance:,.2f}, Total requerido: RD$ {ticket_price:,.2f}',
                }, status=400)

            # Descontar del balance
            new_balance = current_balance - ticket_price
            user.sudo().write({'wallet_balance': new_balance})

        reg_vals = {
            'event_id': event.id,
            'name': name,
            'email': email,
            'phone': phone,
            'user_id': user.id if user else False,
        }
        if ticket:
            reg_vals['event_ticket_id'] = ticket.id

        reg = request.env['event.registration'].sudo().create(reg_vals)

        return json_response({
            'status': 'success',
            'data': {
                'registration_id': reg.id,
                'qr_token': reg.qr_token,
                'attendee_name': reg.name,
                'event_name': event.name,
                'wallet_balance': float(user.wallet_balance) if user else None,
            }
        }, status=201)

    # ==========================================
    # ESCANEO EN PUERTA
    # ==========================================

    @http.route('/cover/api/v1/scan', type='http', auth='public', methods=['POST'], cors='*', csrf=False)
    def scan_validate(self, **kwargs):
        """Valida token QR en puerta (REST)."""
        params = get_json_body(request)
        qr_token = params.get('qr_token')

        if not qr_token:
            return json_response({'status': 'error', 'message': 'QR token requerido'}, status=400)

        reg = request.env['event.registration'].sudo().search([('qr_token', '=', qr_token)], limit=1)
        if not reg:
            return json_response({'status': 'error', 'message': 'Token no encontrado'}, status=404)

        result = reg.action_validate_qr()
        status_code = 200 if result['success'] else 400
        return json_response({
            'status': 'success' if result['success'] else 'rejected',
            'data': result,
        }, status=status_code)
