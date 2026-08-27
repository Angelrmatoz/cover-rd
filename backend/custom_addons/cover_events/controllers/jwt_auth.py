# -*- coding: utf-8 -*-
import base64
import hashlib
import hmac
import json
import os
import time

JWT_SECRET = os.environ.get('JWT_SECRET', 'cover_rd_super_secret_jwt_key_2026_x99')
JWT_EXPIRATION_SECONDS = 60 * 60 * 24 * 7  # 7 days


def _b64_encode(data_bytes):
    return base64.urlsafe_b64encode(data_bytes).decode('utf-8').rstrip('=')


def _b64_decode(data_str):
    padding = '=' * (-len(data_str) % 4)
    return base64.urlsafe_b64decode((data_str + padding).encode('utf-8'))


def generate_jwt(payload_data):
    """Genera token JWT firmado con HS256."""
    header = {'alg': 'HS256', 'typ': 'JWT'}
    payload = {
        **payload_data,
        'iat': int(time.time()),
        'exp': int(time.time()) + JWT_EXPIRATION_SECONDS,
    }

    header_b64 = _b64_encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))
    payload_b64 = _b64_encode(json.dumps(payload, separators=(',', ':')).encode('utf-8'))

    signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
    signature = hmac.new(JWT_SECRET.encode('utf-8'), signing_input, hashlib.sha256).digest()
    signature_b64 = _b64_encode(signature)

    return f"{header_b64}.{payload_b64}.{signature_b64}"


def verify_jwt(token):
    """Verifica token JWT y retorna el payload o None si es inválido/expirado."""
    if not token or not isinstance(token, str):
        return None

    parts = token.strip().split('.')
    if len(parts) != 3:
        return None

    header_b64, payload_b64, signature_b64 = parts
    signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
    expected_sig = hmac.new(JWT_SECRET.encode('utf-8'), signing_input, hashlib.sha256).digest()
    expected_sig_b64 = _b64_encode(expected_sig)

    if not hmac.compare_digest(signature_b64, expected_sig_b64):
        return None

    try:
        payload = json.loads(_b64_decode(payload_b64).decode('utf-8'))
        if payload.get('exp', 0) < int(time.time()):
            return None
        return payload
    except Exception:
        return None


def get_authenticated_user(request):
    """Extrae y valida el usuario a partir del Header Authorization: Bearer <token>."""
    auth_header = request.httprequest.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None

    token = auth_header[7:].strip()
    payload = verify_jwt(token)
    if not payload or not payload.get('user_id'):
        return None

    user = request.env['res.users'].sudo().browse(payload['user_id'])
    return user if user.exists() else None
