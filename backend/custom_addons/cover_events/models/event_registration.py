# -*- coding: utf-8 -*-
import hashlib
import uuid
from odoo import api, fields, models


class EventRegistration(models.Model):
    _inherit = 'event.registration'

    user_id = fields.Many2one('res.users', string='Comprador / Usuario', index=True)
    qr_token = fields.Char(string='QR Token', copy=False, readonly=True, index=True)

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if not vals.get('qr_token'):
                seed = f"{uuid.uuid4()}-{vals.get('event_id', '')}-{vals.get('email', '')}"
                vals['qr_token'] = hashlib.sha256(seed.encode('utf-8')).hexdigest()[:24]
        return super().create(vals_list)

    def action_validate_qr(self):
        """Valida ticket en puerta y previene reuso."""
        self.ensure_one()
        if self.state == 'done':
            return {'success': False, 'message': 'Entrada ya utilizada'}
        if self.state == 'cancel':
            return {'success': False, 'message': 'Entrada cancelada'}

        self.write({'state': 'done'})
        return {
            'success': True,
            'message': 'Acceso concedido',
            'attendee_name': self.name,
            'ticket_name': self.event_ticket_id.name if self.event_ticket_id else 'General',
        }
