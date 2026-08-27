# -*- coding: utf-8 -*-
import json
from odoo import fields, models


class EventEvent(models.Model):
    _inherit = 'event.event'

    image_urls = fields.Text(
        string='Image URLs',
        default='[]',
        help='JSON string with array of image paths for the carousel',
    )

    def get_images(self):
        """Devuelve lista de URLs de imágenes."""
        self.ensure_one()
        try:
            images = json.loads(self.image_urls or '[]')
            return images if isinstance(images, list) else []
        except Exception:
            return []
