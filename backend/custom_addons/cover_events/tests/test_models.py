# -*- coding: utf-8 -*-
from odoo.tests.common import TransactionCase, tagged
from odoo import fields
from datetime import timedelta


@tagged('post_install', '-at_install')
class TestCoverModels(TransactionCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.party = cls.env['event.event'].create({
            'name': 'Party Test',
            'date_begin': fields.Datetime.now() + timedelta(days=1),
            'date_end': fields.Datetime.now() + timedelta(days=1, hours=4),
            'image_urls': '["/events/party_01_1.webp", "/events/party_01_2.webp"]',
        })

    def test_image_urls_helper(self):
        """Prueba parser de imágenes para carrusel."""
        images = self.party.get_images()
        self.assertEqual(len(images), 2)
        self.assertEqual(images[0], '/events/party_01_1.webp')

    def test_qr_generation_and_validation(self):
        """Prueba generación de QR y prevención de doble entrada."""
        reg = self.env['event.registration'].create({
            'name': 'Pedro Test',
            'email': 'pedro@test.com',
            'event_id': self.party.id,
        })
        self.assertTrue(reg.qr_token)

        # 1er escaneo: éxito
        res1 = reg.action_validate_qr()
        self.assertTrue(res1['success'])
        self.assertEqual(reg.state, 'done')

        # 2do escaneo: rechazado
        res2 = reg.action_validate_qr()
        self.assertFalse(res2['success'])
