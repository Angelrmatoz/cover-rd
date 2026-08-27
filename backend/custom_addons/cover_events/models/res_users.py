# -*- coding: utf-8 -*-
import hashlib
import os
from odoo import fields, models


class ResUsers(models.Model):
    _inherit = 'res.users'

    user_role = fields.Selection(
        [
            ('client', 'Cliente Asistente'),
            ('promoter', 'Empresa / Promotor'),
        ],
        string='Rol de Usuario',
        default='client',
        required=True,
    )
    rnc = fields.Char(string='RNC (Empresa)', help='Registro Nacional de Contribuyentes')
    business_name = fields.Char(string='Nombre Comercial / Discoteca')
    cover_password_hash = fields.Char(string='Cover Password Hash')
    wallet_balance = fields.Float(
        string='Saldo Billetera Cover (RD$)',
        default=20000.0,
        digits=(16, 2),
        help='Saldo virtual disponible para compra de entradas',
    )

    def set_cover_password(self, raw_password):
        """Hashea contraseña con PBKDF2 HMAC SHA-256 y salt aleatorio."""
        salt = os.urandom(16).hex()
        key = hashlib.pbkdf2_hmac('sha256', raw_password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()
        self.cover_password_hash = f"{salt}${key}"

    def verify_cover_password(self, raw_password):
        """Verifica contraseña hasheada de manera segura."""
        self.ensure_one()
        if not self.cover_password_hash or '$' not in self.cover_password_hash:
            return False
        salt, expected_key = self.cover_password_hash.split('$', 1)
        actual_key = hashlib.pbkdf2_hmac('sha256', raw_password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()
        return hashlib.sha256(expected_key.encode()).hexdigest() == hashlib.sha256(actual_key.encode()).hexdigest()
