# Comandos cURL Completos - API ZK Accounting

## Configuração Base

```bash
# Variáveis de ambiente
API_BASE="http://127.0.0.1:8000/api/v1"
TOKEN="SEU_TOKEN_AQUI"

# Headers padrão
HEADERS="-H 'Content-Type: application/json' -H 'Authorization: Bearer $TOKEN'"
```

---

## 🔓 Autenticação (Pública)

### Registrar Usuário
```bash
curl -X POST "$API_BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fernando Zucula",
    "email": "fernando.zucula@gmail.com",
    "password": "20002004",
    "company_name": "ZK Interactive",
    "billing_email": "financeiro@zkinteractive.com"
  }'
```

### Login
```bash
curl -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "fernando.zucula@gmail.com",
    "password": "20002004",
    "device_name": "API Client"
  }'
```

---

## 💰 Billing (Público)

### Listar Planos
```bash
curl -X GET "$API_BASE/billing/plans"
```

### Callback BIM
```bash
curl -X POST "$API_BASE/billing/bim/callback" \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "txn_123456",
    "status": "completed",
    "amount": 99.99
  }'
```

---

## 👑 Admin (Requer role:platform_admin)

### Dashboard Admin
```bash
curl -X GET "$API_BASE/admin/dashboard" $HEADERS
```

### Listar Usuários
```bash
curl -X GET "$API_BASE/admin/users" $HEADERS
```

### Criar Usuário
```bash
curl -X POST "$API_BASE/admin/users" $HEADERS \
  -d '{
    "name": "Novo Usuário",
    "email": "novo@exemplo.com",
    "password": "senha123",
    "account_id": 1
  }'
```

### Atualizar Usuário
```bash
curl -X PATCH "$API_BASE/admin/users/1" $HEADERS \
  -d '{
    "name": "Usuário Atualizado",
    "email": "atualizado@exemplo.com"
  }'
```

### Listar Empresas
```bash
curl -X GET "$API_BASE/admin/companies" $HEADERS
```

### Atualizar Empresa
```bash
curl -X PATCH "$API_BASE/admin/companies/1" $HEADERS \
  -d '{
    "name": "Empresa Atualizada",
    "status": "active"
  }'
```

### Listar Pacotes/Planos Admin
```bash
curl -X GET "$API_BASE/admin/packages" $HEADERS
```

### Criar Plano
```bash
curl -X POST "$API_BASE/admin/plans" $HEADERS \
  -d '{
    "name": "Plano Premium",
    "price": 99.99,
    "billing_cycle": "monthly",
    "features": ["feature1", "feature2"]
  }'
```

### Atualizar Plano
```bash
curl -X PATCH "$API_BASE/admin/plans/1" $HEADERS \
  -d '{
    "name": "Plano Premium Atualizado",
    "price": 149.99
  }'
```

### Analytics Admin
```bash
curl -X GET "$API_BASE/admin/analytics" $HEADERS
```

### Team Admin
```bash
curl -X GET "$API_BASE/admin/team" $HEADERS
```

### Settings Admin
```bash
curl -X GET "$API_BASE/admin/settings" $HEADERS
```

---

## 🔐 Autenticação (Autenticada)

### Logout
```bash
curl -X POST "$API_BASE/auth/logout" $HEADERS
```

### Obter Dados do Usuário
```bash
curl -X GET "$API_BASE/auth/me" $HEADERS
```

---

## 💳 Billing (Autenticado)

### Checkout
```bash
curl -X POST "$API_BASE/billing/checkout" $HEADERS \
  -d '{
    "plan_id": 1,
    "payment_method": "credit_card",
    "billing_address": {
      "street": "Rua das Flores, 123",
      "city": "São Paulo",
      "country": "BR"
    }
  }'
```

### Detalhes da Transação
```bash
curl -X GET "$API_BASE/billing/transactions/txn_123456" $HEADERS
```

---

## 📊 Presence Tracking

### Summary
```bash
curl -X GET "$API_BASE/presence/summary" $HEADERS
```

### Usuários Online
```bash
curl -X GET "$API_BASE/presence/users" $HEADERS
```

---

## 🏢 Workspace

### Dashboard
```bash
curl -X GET "$API_BASE/workspace/dashboard" $HEADERS
```

### Setup da Empresa
```bash
curl -X POST "$API_BASE/workspace/company/setup" $HEADERS \
  -d '{
    "company_name": "Minha Empresa",
    "tax_id": "12.345.678/0001-90",
    "phone": "+55 11 99999-8888",
    "email": "contato@empresa.com",
    "address": "Rua das Flores, 123, São Paulo/SP"
  }'
```

---

## 👥 Clientes

### Listar Clientes
```bash
curl -X GET "$API_BASE/workspace/clients" $HEADERS
```

### Criar Cliente
```bash
curl -X POST "$API_BASE/workspace/clients" $HEADERS \
  -d '{
    "name": "Cliente Exemplo LTDA",
    "email": "cliente@exemplo.com",
    "phone": "+55 11 99999-7777",
    "address": "Av. Paulista, 1000 - São Paulo/SP",
    "status": "active"
  }'
```

### Atualizar Cliente
```bash
curl -X PATCH "$API_BASE/workspace/clients/1" $HEADERS \
  -d '{
    "name": "Cliente Atualizado LTDA",
    "email": "atualizado@exemplo.com",
    "status": "active"
  }'
```

### Excluir Cliente
```bash
curl -X DELETE "$API_BASE/workspace/clients/1" $HEADERS
```

---

## 📦 Produtos

### Listar Produtos
```bash
curl -X GET "$API_BASE/workspace/products" $HEADERS
```

### Criar Produto
```bash
curl -X POST "$API_BASE/workspace/products" $HEADERS \
  -d '{
    "name": "Serviço de Consultoria",
    "description": "Consultoria especializada em desenvolvimento de software",
    "price": 500.00,
    "type": "service",
    "status": "active"
  }'
```

### Criar Produto Físico
```bash
curl -X POST "$API_BASE/workspace/products" $HEADERS \
  -d '{
    "name": "Licença de Software",
    "description": "Licença anual de uso do sistema",
    "price": 1200.00,
    "type": "subscription",
    "status": "active"
  }'
```

### Atualizar Produto
```bash
curl -X PATCH "$API_BASE/workspace/products/1" $HEADERS \
  -d '{
    "name": "Produto Atualizado",
    "price": 550.00,
    "status": "active"
  }'
```

### Duplicar Produto
```bash
curl -X POST "$API_BASE/workspace/products/1/duplicate" $HEADERS
```

### Excluir Produto
```bash
curl -X DELETE "$API_BASE/workspace/products/1" $HEADERS
```

---

## 📄 Cotações (Quotations)

### Listar Cotações
```bash
curl -X GET "$API_BASE/workspace/quotations" $HEADERS
```

### Criar Cotação
```bash
curl -X POST "$API_BASE/workspace/quotations" $HEADERS \
  -d '{
    "clientId": 1,
    "date": "2026-03-08",
    "validUntil": "2026-03-22",
    "status": "draft",
    "notes": "Cotação para projeto de desenvolvimento web",
    "items": [
      {
        "description": "Serviço de Consultoria em Laravel",
        "quantity": 40,
        "unitPrice": 150.00,
        "taxRate": 15.0
      },
      {
        "description": "Licença de Software Anual",
        "quantity": 1,
        "unitPrice": 1200.00,
        "taxRate": 15.0
      }
    ]
  }'
```

### Atualizar Cotação
```bash
curl -X PATCH "$API_BASE/workspace/quotations/1" $HEADERS \
  -d '{
    "status": "sent",
    "notes": "Cotação enviada ao cliente"
  }'
```

### Converter Cotação em Fatura
```bash
curl -X POST "$API_BASE/workspace/quotations/1/convert" $HEADERS \
  -d '{
    "dueDate": "2026-04-08",
    "notes": "Convertida de cotação #001"
  }'
```

### Enviar Cotação por Email
```bash
curl -X POST "$API_BASE/workspace/quotations/1/send" $HEADERS \
  -d '{
    "to": "cliente@exemplo.com",
    "subject": "Cotação #001 - ZK Interactive",
    "message": "Segue sua cotação conforme solicitado"
  }'
```

### Download Cotação (PDF)
```bash
curl -X GET "$API_BASE/workspace/quotations/1/download" $HEADERS \
  --output "cotacao_001.pdf"
```

### Excluir Cotação
```bash
curl -X DELETE "$API_BASE/workspace/quotations/1" $HEADERS
```

---

## 🧾 Faturas (Invoices)

### Listar Faturas
```bash
curl -X GET "$API_BASE/workspace/invoices" $HEADERS
```

### Criar Fatura
```bash
curl -X POST "$API_BASE/workspace/invoices" $HEADERS \
  -d '{
    "clientId": 1,
    "date": "2026-03-08",
    "dueDate": "2026-04-08",
    "status": "pending",
    "notes": "Fatura referente a serviços prestados em março/2026",
    "items": [
      {
        "description": "Desenvolvimento Web - 40 horas",
        "quantity": 40,
        "unitPrice": 150.00,
        "taxRate": 15.0
      },
      {
        "description": "Hospedagem e Manutenção Mensal",
        "quantity": 1,
        "unitPrice": 299.00,
        "taxRate": 15.0
      }
    ]
  }'
```

### Atualizar Fatura
```bash
curl -X PATCH "$API_BASE/workspace/invoices/1" $HEADERS \
  -d '{
    "status": "paid",
    "paymentMethod": "bank_transfer",
    "notes": "Pago via transferência bancária"
  }'
```

### Converter Fatura em Recibo
```bash
curl -X POST "$API_BASE/workspace/invoices/1/convert" $HEADERS \
  -d '{
    "amount": 6899.00,
    "paymentMethod": "bank_transfer",
    "notes": "Recibo gerado automaticamente"
  }'
```

### Enviar Fatura por Email
```bash
curl -X POST "$API_BASE/workspace/invoices/1/send" $HEADERS \
  -d '{
    "to": "cliente@exemplo.com",
    "subject": "Fatura #001 - ZK Interactive",
    "message": "Segue fatura para pagamento"
  }'
```

### Download Fatura (PDF)
```bash
curl -X GET "$API_BASE/workspace/invoices/1/download" $HEADERS \
  --output "fatura_001.pdf"
```

### Excluir Fatura
```bash
curl -X DELETE "$API_BASE/workspace/invoices/1" $HEADERS
```

---

## 🧾 Recibos (Receipts)

### Listar Recibos
```bash
curl -X GET "$API_BASE/workspace/receipts" $HEADERS
```

### Criar Recibo
```bash
curl -X POST "$API_BASE/workspace/receipts" $HEADERS \
  -d '{
    "clientId": 1,
    "date": "2026-03-08",
    "status": "completed",
    "paymentMethod": "bank_transfer",
    "amount": 6899.00,
    "notes": "Pagamento recebido conforme fatura #001",
    "items": [
      {
        "description": "Pagamento Fatura #001",
        "quantity": 1,
        "unitPrice": 6899.00,
        "taxRate": 0.0
      }
    ]
  }'
```

### Atualizar Recibo
```bash
curl -X PATCH "$API_BASE/workspace/receipts/1" $HEADERS \
  -d '{
    "notes": "Recibo atualizado com informações adicionais"
  }'
```

### Enviar Recibo por Email
```bash
curl -X POST "$API_BASE/workspace/receipts/1/send" $HEADERS \
  -d '{
    "to": "cliente@exemplo.com",
    "subject": "Recibo #001 - ZK Interactive",
    "message": "Confirmamos recebimento de seu pagamento"
  }'
```

### Download Recibo (PDF)
```bash
curl -X GET "$API_BASE/workspace/receipts/1/download" $HEADERS \
  --output "recibo_001.pdf"
```

### Excluir Recibo
```bash
curl -X DELETE "$API_BASE/workspace/receipts/1" $HEADERS
```

---

## 💳 Pagamentos

### Listar Pagamentos
```bash
curl -X GET "$API_BASE/workspace/payments" $HEADERS
```

### Registrar Pagamento
```bash
curl -X POST "$API_BASE/workspace/payments" $HEADERS \
  -d '{
    "clientId": 1,
    "documentId": 1,
    "amount": 6899.00,
    "paymentMethod": "bank_transfer",
    "paymentDate": "2026-03-08",
    "status": "completed",
    "notes": "Transferência bancária confirmada"
  }'
```

### Documentos Enviados
```bash
curl -X GET "$API_BASE/workspace/sent" $HEADERS
```

### Relatórios
```bash
curl -X GET "$API_BASE/workspace/reports" $HEADERS
```

---

## 👥 Team Management

### Listar Time
```bash
curl -X GET "$API_BASE/workspace/team" $HEADERS
```

### Convidar Membro
```bash
curl -X POST "$API_BASE/workspace/team/invitations" $HEADERS \
  -d '{
    "email": "novo.membro@exemplo.com",
    "role": "member",
    "message": "Junte-se ao nosso time na ZK Interactive"
  }'
```

### Reenviar Convite
```bash
curl -X POST "$API_BASE/workspace/team/invitations/1/resend" $HEADERS
```

### Atualizar Membro
```bash
curl -X PATCH "$API_BASE/workspace/team/members/1" $HEADERS \
  -d '{
    "role": "admin",
    "status": "active"
  }'
```

### Remover Membro
```bash
curl -X DELETE "$API_BASE/workspace/team/members/1" $HEADERS
```

---

## ⚙️ Settings & Security

### Configurações da Workspace
```bash
curl -X GET "$API_BASE/workspace/settings" $HEADERS
```

### Atualizar Configurações
```bash
curl -X PATCH "$API_BASE/workspace/settings" $HEADERS \
  -d '{
    "company_name": "ZK Interactive Ltda",
    "tax_id": "12.345.678/0001-90",
    "email": "contato@zkinteractive.com",
    "phone": "+55 11 99999-8888",
    "address": "Rua das Flores, 123 - São Paulo/SP",
    "currency": "BRL",
    "timezone": "America/Sao_Paulo"
  }'
```

### Visão Geral de Segurança
```bash
curl -X GET "$API_BASE/workspace/security" $HEADERS
```

### Alterar Senha
```bash
curl -X POST "$API_BASE/workspace/security/change-password" $HEADERS \
  -d '{
    "current_password": "senha_atual",
    "new_password": "nova_senha123",
    "confirm_password": "nova_senha123"
  }'
```

### Revogar Sessão
```bash
curl -X POST "$API_BASE/workspace/security/sessions/abc123/revoke" $HEADERS
```

---

## 🔄 Fluxo Completo de Exemplo

```bash
#!/bin/bash

# Configuração
API_BASE="http://127.0.0.1:8000/api/v1"

echo "🔐 1. Fazendo login..."
TOKEN=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "fernando.zucula@gmail.com",
    "password": "20002004",
    "device_name": "API Test"
  }' | jq -r '.token')

if [ "$TOKEN" = "null" ]; then
  echo "❌ Falha no login"
  exit 1
fi

echo "✅ Login successful"
HEADERS="-H 'Content-Type: application/json' -H 'Authorization: Bearer $TOKEN'"

echo "👥 2. Criando cliente..."
CLIENT_ID=$(curl -s -X POST "$API_BASE/workspace/clients" $HEADERS \
  -d '{
    "name": "Cliente Teste Ltda",
    "email": "teste@cliente.com",
    "status": "active"
  }' | jq -r '.data.id')

echo "📦 3. Criando produto..."
PRODUCT_ID=$(curl -s -X POST "$API_BASE/workspace/products" $HEADERS \
  -d '{
    "name": "Serviço de Desenvolvimento",
    "price": 150.00,
    "type": "service",
    "status": "active"
  }' | jq -r '.data.id')

echo "📄 4. Criando cotação..."
QUOTATION_ID=$(curl -s -X POST "$API_BASE/workspace/quotations" $HEADERS \
  -d "{
    \"clientId\": $CLIENT_ID,
    \"status\": \"draft\",
    \"items\": [
      {
        \"description\": \"Serviço de Desenvolvimento\",
        \"quantity\": 10,
        \"unitPrice\": 150.00,
        \"taxRate\": 15.0
      }
    ]
  }" | jq -r '.data.id')

echo "📊 5. Criando fatura..."
INVOICE_ID=$(curl -s -X POST "$API_BASE/workspace/invoices" $HEADERS \
  -d "{
    \"clientId\": $CLIENT_ID,
    \"status\": \"pending\",
    \"items\": [
      {
        \"description\": \"Serviço de Desenvolvimento\",
        \"quantity\": 10,
        \"unitPrice\": 150.00,
        \"taxRate\": 15.0
      }
    ]
  }" | jq -r '.data.id')

echo "🧾 6. Criando recibo..."
RECEIPT_ID=$(curl -s -X POST "$API_BASE/workspace/receipts" $HEADERS \
  -d "{
    \"clientId\": $CLIENT_ID,
    \"amount\": 1725.00,
    \"paymentMethod\": \"bank_transfer\",
    \"status\": \"completed\"
  }" | jq -r '.data.id')

echo "✅ Fluxo completo executado!"
echo "Cliente ID: $CLIENT_ID"
echo "Produto ID: $PRODUCT_ID"
echo "Cotação ID: $QUOTATION_ID"
echo "Fatura ID: $INVOICE_ID"
echo "Recibo ID: $RECEIPT_ID"
```

---

## 📝 Notas Importantes

1. **Autenticação**: Substitua `SEU_TOKEN_AQUI` pelo token obtido no login
2. **IDs**: Substitua IDs numéricos pelos IDs reais da sua base de dados
3. **URL Base**: Altere `http://127.0.0.1:8000` para o URL do seu ambiente
4. **Preços**: Valores são enviados como decimal (ex: 150.00)
5. **Datas**: Formato ISO: `YYYY-MM-DD`
6. **Taxas**: Percentual como decimal (ex: 15.0 para 15%)
7. **Status**: Use valores válidos: `active`, `inactive`, `draft`, `sent`, `pending`, `paid`, `completed`
8. **Tipos de Produto**: `service`, `product`, `subscription`
9. **Métodos de Pagamento**: `bank_transfer`, `credit_card`, `paypal`, `cash`

## 🔧 Ferramentas Úteis

### Instalar jq para processamento JSON
```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq

# Windows (via chocolatey)
choco install jq
```

### Testar Conectividade
```bash
curl -X GET "$API_BASE/auth/me" $HEADERS | jq
```

### Verificar Resposta HTTP
```bash
curl -v -X GET "$API_BASE/workspace/clients" $HEADERS 2>&1 | grep HTTP
```
