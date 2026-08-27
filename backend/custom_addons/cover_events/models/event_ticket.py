# -*- coding: utf-8 -*-
from odoo import fields, models


class EventTicket(models.Model):
    _inherit = 'event.event.ticket'

    price = fields.Float(string='Price', default=0.0)
