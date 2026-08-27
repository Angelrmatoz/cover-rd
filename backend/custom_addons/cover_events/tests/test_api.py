# -*- coding: utf-8 -*-
from datetime import timedelta
from odoo.tests.common import HttpCase, tagged
from odoo import fields


@tagged('post_install', '-at_install')
class TestCoverApi(HttpCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.party = cls.env['event.event'].create({
            'name': 'Party API Test',
            'date_begin': fields.Datetime.now() + timedelta(days=1),
            'date_end': fields.Datetime.now() + timedelta(days=1, hours=4),
            'image_urls': '["/events/test_1.webp", "/events/test_2.webp"]',
        })

    def test_01_auth_register_and_login_flow(self):
        """Prueba registro de cliente, promotor con RNC y login con JWT."""
        # 1. Registro de Cliente
        client_res = self.opener.post(
            f"{self.base_url()}/cover/api/v1/auth/register",
            json={
                'name': 'Juan Cliente',
                'email': 'juan.cliente@test.com',
                'password': 'password123',
                'role': 'client',
            },
            headers={'Content-Type': 'application/json'},
        )
        self.assertEqual(client_res.status_code, 201)
        client_data = client_res.json()
        self.assertEqual(client_data['status'], 'success')
        self.assertEqual(client_data['user']['role'], 'client')
        token = client_data['token']
        self.assertTrue(token)

        # 2. Registro de Promotor (Empresa con RNC)
        promoter_res = self.opener.post(
            f"{self.base_url()}/cover/api/v1/auth/register",
            json={
                'name': 'Club Euphoria SRL',
                'email': 'admin@euphoria.do',
                'password': 'password123',
                'role': 'promoter',
                'rnc': '131-45678-9',
                'business_name': 'Euphoria Nightclub',
            },
            headers={'Content-Type': 'application/json'},
        )
        self.assertEqual(promoter_res.status_code, 201)
        promoter_data = promoter_res.json()
        self.assertEqual(promoter_data['user']['role'], 'promoter')
        self.assertEqual(promoter_data['user']['rnc'], '131-45678-9')

        # 3. Login
        login_res = self.opener.post(
            f"{self.base_url()}/cover/api/v1/auth/login",
            json={
                'email': 'juan.cliente@test.com',
                'password': 'password123',
            },
            headers={'Content-Type': 'application/json'},
        )
        self.assertEqual(login_res.status_code, 200)
        self.assertTrue(login_res.json().get('token'))

        # 4. Perfil /me
        me_res = self.opener.get(
            f"{self.base_url()}/cover/api/v1/auth/me",
            headers={'Authorization': f"Bearer {token}"},
        )
        self.assertEqual(me_res.status_code, 200)
        self.assertEqual(me_res.json()['user']['email'], 'juan.cliente@test.com')

    def test_02_user_tickets_and_scan_flow(self):
        """Prueba compra autenticada, consulta de flyers con QR y escaneo en puerta."""
        # 1. Registrar usuario
        reg_res = self.opener.post(
            f"{self.base_url()}/cover/api/v1/auth/register",
            json={
                'name': 'Carlos Partygoer',
                'email': 'carlos.party@test.com',
                'password': 'password123',
                'role': 'client',
            },
            headers={'Content-Type': 'application/json'},
        )
        token = reg_res.json()['token']

        # 2. Checkout con token
        checkout_res = self.opener.post(
            f"{self.base_url()}/cover/api/v1/checkout",
            json={
                'event_id': self.party.id,
                'name': 'Carlos Partygoer',
                'email': 'carlos.party@test.com',
            },
            headers={
                'Content-Type': 'application/json',
                'Authorization': f"Bearer {token}",
            },
        )
        self.assertEqual(checkout_res.status_code, 201)
        qr_token = checkout_res.json()['data']['qr_token']
        self.assertTrue(qr_token)

        # 3. Consultar /user/tickets (mis flyers con QR)
        tickets_res = self.opener.get(
            f"{self.base_url()}/cover/api/v1/user/tickets",
            headers={'Authorization': f"Bearer {token}"},
        )
        self.assertEqual(tickets_res.status_code, 200)
        user_tickets = tickets_res.json()['data']
        self.assertEqual(len(user_tickets), 1)
        self.assertEqual(user_tickets[0]['qr_token'], qr_token)
        self.assertEqual(user_tickets[0]['flyer_image'], '/events/test_1.webp')

        # 4. Validar escaneo en puerta
        scan_res = self.opener.post(
            f"{self.base_url()}/cover/api/v1/scan",
            json={'qr_token': qr_token},
            headers={'Content-Type': 'application/json'},
        )
        self.assertEqual(scan_res.status_code, 200)
        self.assertTrue(scan_res.json()['data']['success'])
