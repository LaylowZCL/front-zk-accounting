# Formatos de Resposta da API - ZK Accounting

## 🔓 Autenticação (Pública)

### POST /auth/register
```json
{
  "ok": true,
  "token": "1|abc123def456ghi789jkl012mno345pqr678stu901vwx",
  "user": {
    "id": 1,
    "name": "Fernando Zucula",
    "email": "fernando.zucula@gmail.com",
    "account_id": 1
  },
  "account": {
    "id": 1,
    "name": "ZK Interactive",
    "status": "trial"
  }
}
```

### POST /auth/login
```json
{
  "ok": true,
  "token": "1|abc123def456ghi789jkl012mno345pqr678stu901vwx",
  "user": {
    "id": 1,
    "name": "Fernando Zucula",
    "email": "fernando.zucula@gmail.com",
    "account_id": 1,
    "is_platform_admin": false,
    "roles": ["subscriber_owner"],
    "permissions": [
      "view_dashboard",
      "manage_clients",
      "manage_products",
      "manage_documents"
    ]
  }
}
```

---

## 💰 Billing (Público)

### GET /billing/plans
```json
{
  "ok": true,
  "data": [
    {
      "id": 1,
      "name": "Plano Starter",
      "price": 29.99,
      "billing_cycle": "monthly",
      "features": [
        "10 clients",
        "100 documents/month",
        "Basic support"
      ],
      "status": "active",
      "created_at": "2026-03-01T10:00:00.000000Z",
      "updated_at": "2026-03-01T10:00:00.000000Z"
    },
    {
      "id": 2,
      "name": "Plano Professional",
      "price": 99.99,
      "billing_cycle": "monthly",
      "features": [
        "Unlimited clients",
        "Unlimited documents",
        "Priority support",
        "Advanced analytics"
      ],
      "status": "active",
      "created_at": "2026-03-01T10:00:00.000000Z",
      "updated_at": "2026-03-01T10:00:00.000000Z"
    }
  ]
}
```

### POST /billing/bim/callback
```json
{
  "ok": true,
  "message": "Callback processed successfully",
  "transaction": {
    "id": "txn_123456789",
    "status": "completed",
    "amount": 99.99,
    "currency": "BRL",
    "processed_at": "2026-03-08T15:30:00.000000Z"
  }
}
```

---

## 👑 Admin

### GET /admin/dashboard
```json
{
  "ok": true,
  "data": {
    "total_users": 1250,
    "active_users": 890,
    "total_companies": 342,
    "active_companies": 298,
    "monthly_revenue": 45678.90,
    "new_registrations_today": 12,
    "top_plans": [
      {
        "plan_name": "Professional",
        "subscriptions": 156
      },
      {
        "plan_name": "Starter",
        "subscriptions": 89
      }
    ]
  }
}
```

### GET /admin/users
```json
{
  "ok": true,
  "data": [
    {
      "id": 1,
      "name": "Fernando Zucula",
      "email": "fernando.zucula@gmail.com",
      "account_id": 1,
      "status": "active",
      "is_platform_admin": false,
      "last_seen_at": "2026-03-08T14:30:00.000000Z",
      "created_at": "2026-02-15T10:00:00.000000Z",
      "account": {
        "id": 1,
        "name": "ZK Interactive",
        "status": "active"
      }
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1250,
    "last_page": 63
  }
}
```

### POST /admin/users
```json
{
  "ok": true,
  "data": {
    "id": 1251,
    "name": "Novo Usuário",
    "email": "novo@exemplo.com",
    "account_id": 1,
    "status": "active",
    "is_platform_admin": false,
    "created_at": "2026-03-08T15:45:00.000000Z",
    "updated_at": "2026-03-08T15:45:00.000000Z"
  }
}
```

---

## 🔐 Autenticação (Autenticada)

### POST /auth/logout
```json
{
  "ok": true,
  "message": "Logged out successfully"
}
```

### GET /auth/me
```json
{
  "ok": true,
  "user": {
    "id": 1,
    "name": "Fernando Zucula",
    "email": "fernando.zucula@gmail.com",
    "account_id": 1,
    "is_platform_admin": false,
    "status": "active",
    "roles": ["subscriber_owner"],
    "permissions": [
      "view_dashboard",
      "manage_clients",
      "manage_products",
      "manage_documents",
      "manage_team",
      "manage_settings"
    ]
  }
}
```

---

## 🏢 Workspace

### GET /workspace/dashboard
```json
{
  "ok": true,
  "data": {
    "total_revenue": 15234.56,
    "pending_invoices": 8,
    "total_clients": 45,
    "paid_this_month": 3456.78,
    "recent_invoices": [
      {
        "id": 123,
        "number": "INV-2026-001",
        "client_name": "Cliente Exemplo Ltda",
        "total_cents": 150000,
        "status": "paid",
        "due_date": "2026-03-15",
        "created_at": "2026-03-01T10:00:00.000000Z"
      }
    ]
  }
}
```

---

## 👥 Clientes

### GET /workspace/clients
```json
{
  "ok": true,
  "data": [
    {
      "id": 1,
      "name": "Cliente Exemplo Ltda",
      "email": "contato@exemplo.com",
      "phone": "+55 11 99999-8888",
      "address": "Av. Paulista, 1000 - São Paulo/SP",
      "status": "active",
      "account_id": 1,
      "created_at": "2026-02-20T14:30:00.000000Z",
      "updated_at": "2026-03-08T10:15:00.000000Z",
      "documents_count": 5,
      "total_purchased": 12500.00
    },
    {
      "id": 2,
      "name": "Outro Cliente SA",
      "email": "financeiro@outrocliente.com",
      "phone": "+55 21 88888-7777",
      "address": "Rua das Flores, 123 - Rio de Janeiro/RJ",
      "status": "active",
      "account_id": 1,
      "created_at": "2026-02-25T09:00:00.000000Z",
      "updated_at": "2026-03-05T16:20:00.000000Z",
      "documents_count": 3,
      "total_purchased": 8900.00
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 45,
    "last_page": 3
  }
}
```

### POST /workspace/clients
```json
{
  "ok": true,
  "data": {
    "id": 46,
    "name": "Novo Cliente Ltda",
    "email": "novo@cliente.com",
    "phone": "+55 11 77777-6666",
    "address": "Rua Nova, 456 - São Paulo/SP",
    "status": "active",
    "account_id": 1,
    "created_at": "2026-03-08T16:00:00.000000Z",
    "updated_at": "2026-03-08T16:00:00.000000Z",
    "documents_count": 0,
    "total_purchased": 0.00
  }
}
```

---

## 📦 Produtos

### GET /workspace/products
```json
{
  "ok": true,
  "data": [
    {
      "id": 1,
      "name": "Serviço de Consultoria",
      "description": "Consultoria especializada em desenvolvimento de software",
      "price_cents": 50000,
      "price": 500.00,
      "type": "service",
      "status": "active",
      "account_id": 1,
      "created_at": "2026-02-15T10:00:00.000000Z",
      "updated_at": "2026-03-01T14:30:00.000000Z",
      "usage_count": 15
    },
    {
      "id": 2,
      "name": "Licença de Software",
      "description": "Licença anual de uso do sistema",
      "price_cents": 120000,
      "price": 1200.00,
      "type": "subscription",
      "status": "active",
      "account_id": 1,
      "created_at": "2026-02-20T09:00:00.000000Z",
      "updated_at": "2026-03-05T11:20:00.000000Z",
      "usage_count": 8
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 12,
    "last_page": 1
  }
}
```

### POST /workspace/products
```json
{
  "ok": true,
  "data": {
    "id": 13,
    "name": "Serviço de Desenvolvimento",
    "description": "Desenvolvimento customizado de aplicações web",
    "price_cents": 75000,
    "price": 750.00,
    "type": "service",
    "status": "active",
    "account_id": 1,
    "created_at": "2026-03-08T16:30:00.000000Z",
    "updated_at": "2026-03-08T16:30:00.000000Z",
    "usage_count": 0
  }
}
```

---

## 📄 Cotações (Quotations)

### GET /workspace/quotations
```json
{
  "ok": true,
  "data": [
    {
      "id": 1,
      "number": "QUOT-2026-001",
      "client_id": 1,
      "client_name": "Cliente Exemplo Ltda",
      "type": "quotation",
      "status": "sent",
      "issue_date": "2026-03-08",
      "valid_until": "2026-03-22",
      "subtotal_cents": 600000,
      "tax_cents": 90000,
      "total_cents": 690000,
      "subtotal": 6000.00,
      "tax": 900.00,
      "total": 6900.00,
      "notes": "Cotação para projeto de desenvolvimento",
      "account_id": 1,
      "created_at": "2026-03-08T10:00:00.000000Z",
      "updated_at": "2026-03-08T14:30:00.000000Z",
      "items": [
        {
          "id": 1,
          "description": "Serviço de Consultoria em Laravel",
          "quantity": 40,
          "unit_price_cents": 15000,
          "unit_price": 150.00,
          "tax_rate": 15.0,
          "total_cents": 690000
        }
      ]
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 8,
    "last_page": 1
  }
}
```

### POST /workspace/quotations
```json
{
  "ok": true,
  "data": {
    "id": 9,
    "number": "QUOT-2026-009",
    "client_id": 1,
    "client_name": "Cliente Exemplo Ltda",
    "type": "quotation",
    "status": "draft",
    "issue_date": "2026-03-08",
    "valid_until": "2026-03-22",
    "subtotal_cents": 600000,
    "tax_cents": 90000,
    "total_cents": 690000,
    "subtotal": 6000.00,
    "tax": 900.00,
    "total": 6900.00,
    "notes": "Cotação para projeto de desenvolvimento web",
    "account_id": 1,
    "created_at": "2026-03-08T17:00:00.000000Z",
    "updated_at": "2026-03-08T17:00:00.000000Z",
    "items": [
      {
        "id": 25,
        "document_id": 9,
        "description": "Serviço de Consultoria em Laravel",
        "quantity": 40,
        "unit_price_cents": 15000,
        "unit_price": 150.00,
        "tax_rate": 15.0,
        "total_cents": 690000,
        "created_at": "2026-03-08T17:00:00.000000Z"
      }
    ]
  }
}
```

---

## 🧾 Faturas (Invoices)

### GET /workspace/invoices
```json
{
  "ok": true,
  "data": [
    {
      "id": 5,
      "number": "INV-2026-005",
      "client_id": 1,
      "client_name": "Cliente Exemplo Ltda",
      "type": "invoice",
      "status": "pending",
      "issue_date": "2026-03-08",
      "due_date": "2026-04-08",
      "subtotal_cents": 600000,
      "tax_cents": 90000,
      "total_cents": 690000,
      "subtotal": 6000.00,
      "tax": 900.00,
      "total": 6900.00,
      "paid_amount_cents": 0,
      "paid_amount": 0.00,
      "remaining_amount_cents": 690000,
      "remaining_amount": 6900.00,
      "payment_method": null,
      "notes": "Fatura referente a serviços prestados",
      "account_id": 1,
      "created_at": "2026-03-08T11:00:00.000000Z",
      "updated_at": "2026-03-08T11:00:00.000000Z",
      "items": [
        {
          "id": 12,
          "description": "Desenvolvimento Web - 40 horas",
          "quantity": 40,
          "unit_price_cents": 15000,
          "unit_price": 150.00,
          "tax_rate": 15.0,
          "total_cents": 690000
        }
      ]
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 12,
    "last_page": 1
  }
}
```

### POST /workspace/invoices
```json
{
  "ok": true,
  "data": {
    "id": 13,
    "number": "INV-2026-013",
    "client_id": 1,
    "client_name": "Cliente Exemplo Ltda",
    "type": "invoice",
    "status": "pending",
    "issue_date": "2026-03-08",
    "due_date": "2026-04-08",
    "subtotal_cents": 600000,
    "tax_cents": 90000,
    "total_cents": 690000,
    "subtotal": 6000.00,
    "tax": 900.00,
    "total": 6900.00,
    "paid_amount_cents": 0,
    "paid_amount": 0.00,
    "remaining_amount_cents": 690000,
    "remaining_amount": 6900.00,
    "payment_method": null,
    "notes": "Fatura referente a serviços prestados em março/2026",
    "account_id": 1,
    "created_at": "2026-03-08T17:15:00.000000Z",
    "updated_at": "2026-03-08T17:15:00.000000Z",
    "items": [
      {
        "id": 31,
        "document_id": 13,
        "description": "Desenvolvimento Web - 40 horas",
        "quantity": 40,
        "unit_price_cents": 15000,
        "unit_price": 150.00,
        "tax_rate": 15.0,
        "total_cents": 690000,
        "created_at": "2026-03-08T17:15:00.000000Z"
      }
    ]
  }
}
```

---

## 🧾 Recibos (Receipts)

### GET /workspace/receipts
```json
{
  "ok": true,
  "data": [
    {
      "id": 3,
      "number": "REC-2026-003",
      "client_id": 1,
      "client_name": "Cliente Exemplo Ltda",
      "type": "receipt",
      "status": "completed",
      "issue_date": "2026-03-08",
      "subtotal_cents": 690000,
      "tax_cents": 0,
      "total_cents": 690000,
      "subtotal": 6900.00,
      "tax": 0.00,
      "total": 6900.00,
      "payment_method": "bank_transfer",
      "notes": "Pagamento recebido conforme fatura #005",
      "account_id": 1,
      "created_at": "2026-03-08T15:00:00.000000Z",
      "updated_at": "2026-03-08T15:00:00.000000Z",
      "items": [
        {
          "id": 8,
          "description": "Pagamento Fatura INV-2026-005",
          "quantity": 1,
          "unit_price_cents": 690000,
          "unit_price": 6900.00,
          "tax_rate": 0.0,
          "total_cents": 690000
        }
      ]
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 7,
    "last_page": 1
  }
}
```

---

## 💳 Pagamentos

### GET /workspace/payments
```json
{
  "ok": true,
  "data": [
    {
      "id": 1,
      "client_id": 1,
      "client_name": "Cliente Exemplo Ltda",
      "document_id": 5,
      "document_number": "INV-2026-005",
      "amount_cents": 690000,
      "amount": 6900.00,
      "payment_method": "bank_transfer",
      "payment_date": "2026-03-08",
      "status": "completed",
      "notes": "Transferência bancária confirmada",
      "account_id": 1,
      "created_at": "2026-03-08T15:30:00.000000Z",
      "updated_at": "2026-03-08T15:30:00.000000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 15,
    "last_page": 1
  }
}
```

---

## 👥 Team Management

### GET /workspace/team
```json
{
  "ok": true,
  "data": [
    {
      "id": 1,
      "name": "Fernando Zucula",
      "email": "fernando.zucula@gmail.com",
      "role": "owner",
      "status": "active",
      "last_seen_at": "2026-03-08T14:30:00.000000Z",
      "created_at": "2026-02-15T10:00:00.000000Z",
      "permissions": [
        "view_dashboard",
        "manage_clients",
        "manage_products",
        "manage_documents",
        "manage_team",
        "manage_settings"
      ]
    },
    {
      "id": 2,
      "name": "João Silva",
      "email": "joao@zkinteractive.com",
      "role": "admin",
      "status": "active",
      "last_seen_at": "2026-03-08T12:15:00.000000Z",
      "created_at": "2026-02-20T09:00:00.000000Z",
      "permissions": [
        "view_dashboard",
        "manage_clients",
        "manage_products",
        "manage_documents"
      ]
    }
  ]
}
```

### POST /workspace/team/invitations
```json
{
  "ok": true,
  "data": {
    "id": 5,
    "email": "novo.membro@exemplo.com",
    "role": "member",
    "status": "pending",
    "token": "inv_abc123def456ghi789",
    "expires_at": "2026-03-15T23:59:59.000000Z",
    "invited_by": 1,
    "invited_by_name": "Fernando Zucula",
    "message": "Junte-se ao nosso time na ZK Interactive",
    "account_id": 1,
    "created_at": "2026-03-08T18:00:00.000000Z"
  }
}
```

---

## ⚙️ Settings & Security

### GET /workspace/settings
```json
{
  "ok": true,
  "data": {
    "company_name": "ZK Interactive Ltda",
    "tax_id": "12.345.678/0001-90",
    "email": "contato@zkinteractive.com",
    "phone": "+55 11 99999-8888",
    "address": "Rua das Flores, 123 - São Paulo/SP",
    "website": "https://zkinteractive.com",
    "currency": "BRL",
    "timezone": "America/Sao_Paulo",
    "language": "pt-BR",
    "logo_url": "https://example.com/logo.png",
    "invoice_prefix": "INV-",
    "quotation_prefix": "QUOT-",
    "receipt_prefix": "REC-",
    "default_tax_rate": 15.0,
    "created_at": "2026-02-15T10:00:00.000000Z",
    "updated_at": "2026-03-08T16:45:00.000000Z"
  }
}
```

### GET /workspace/security
```json
{
  "ok": true,
  "data": {
    "current_session": {
      "id": "sess_abc123def456",
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      "created_at": "2026-03-08T09:00:00.000000Z",
      "last_activity": "2026-03-08T17:30:00.000000Z",
      "is_current": true
    },
    "active_sessions": [
      {
        "id": "sess_abc123def456",
        "ip_address": "192.168.1.100",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        "created_at": "2026-03-08T09:00:00.000000Z",
        "last_activity": "2026-03-08T17:30:00.000000Z",
        "is_current": true
      },
      {
        "id": "sess_xyz789uvw456",
        "ip_address": "189.45.123.67",
        "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)",
        "created_at": "2026-03-07T14:20:00.000000Z",
        "last_activity": "2026-03-08T08:45:00.000000Z",
        "is_current": false
      }
    ],
    "password_last_changed": "2026-02-20T10:00:00.000000Z",
    "two_factor_enabled": false,
    "login_attempts": 0,
    "last_failed_login": null
  }
}
```

---

## 📊 Presence Tracking

### GET /presence/summary
```json
{
  "ok": true,
  "data": {
    "total_users": 45,
    "online_users": 12,
    "away_users": 8,
    "offline_users": 25,
    "active_today": 28,
    "active_this_week": 38,
    "active_this_month": 42,
    "average_session_duration": "02:34:15",
    "peak_concurrent_users": 18,
    "peak_time": "2026-03-08T14:30:00.000000Z"
  }
}
```

### GET /presence/users
```json
{
  "ok": true,
  "data": [
    {
      "user_id": 1,
      "user_name": "Fernando Zucula",
      "user_email": "fernando.zucula@gmail.com",
      "status": "online",
      "last_seen_at": "2026-03-08T17:30:00.000000Z",
      "session_duration": "08:30:00",
      "current_page": "/dashboard",
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
    },
    {
      "user_id": 2,
      "user_name": "João Silva",
      "user_email": "joao@zkinteractive.com",
      "status": "away",
      "last_seen_at": "2026-03-08T16:45:00.000000Z",
      "session_duration": "06:15:00",
      "current_page": "/clients",
      "ip_address": "189.45.123.67",
      "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }
  ]
}
```

---

## 🚨 Respostas de Erro

### Erro de Validação (422)
```json
{
  "ok": false,
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required.", "The email must be a valid email address."],
    "password": ["The password field is required.", "The password must be at least 8 characters."],
    "name": ["The name field is required.", "The name may not be greater than 160 characters."]
  }
}
```

### Não Autorizado (401)
```json
{
  "ok": false,
  "message": "Unauthenticated.",
  "error": "token_invalid"
}
```

### Proibido (403)
```json
{
  "ok": false,
  "message": "This action is unauthorized.",
  "error": "insufficient_permissions"
}
```

### Não Encontrado (404)
```json
{
  "ok": false,
  "message": "Resource not found.",
  "error": "not_found"
}
```

### Limite Excedido (429)
```json
{
  "ok": false,
  "message": "Too many attempts. Please try again later.",
  "error": "too_many_attempts",
  "retry_after": 60
}
```

### Erro Interno (500)
```json
{
  "ok": false,
  "message": "Internal server error.",
  "error": "server_error"
}
```

---

## 📝 Notas sobre Formatos

### Campos Comuns
- **id**: Identificador único numérico
- **status**: `active`, `inactive`, `draft`, `sent`, `pending`, `paid`, `completed`, `overdue`, `partial`
- **created_at/updated_at**: Formato ISO 8601 (UTC)
- **price_cents**: Valor em centavos (int)
- **price**: Valor formatado (float, 2 casas decimais)

### Paginação
```json
{
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 125,
    "last_page": 7,
    "from": 1,
    "to": 20
  }
}
```

### Cálculos Financeiros
- **subtotal**: Soma dos itens sem taxas
- **tax**: Valor total das taxas
- **total**: subtotal + tax
- **paid_amount**: Valor já pago
- **remaining_amount**: total - paid_amount

### Formatos de Data
- **date**: YYYY-MM-DD
- **datetime**: YYYY-MM-DDTHH:MM:SS.sssZ (ISO 8601)
- **timezone**: America/Sao_Paulo, UTC, etc.

### Métodos de Pagamento
- `bank_transfer`: Transferência bancária
- `credit_card`: Cartão de crédito
- `paypal`: PayPal
- `cash`: Dinheiro
- `pix`: PIX (Brasil)

### Tipos de Produto
- `service`: Serviço
- `product`: Produto físico
- `subscription`: Assinatura/recorrência
