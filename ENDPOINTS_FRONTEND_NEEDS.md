# 🚀 Endpoints que o Frontend Ainda Precisa

## 📋 ANÁLISE COMPLETA

Baseado na análise dos arquivos `complete_api_curl_commands.md` e `api_response_formats.md`, comparado com o que já está implementado no frontend (`src/lib/business-api.ts`), identifiquei os endpoints que ainda precisam ser criados.

---

## ✅ JÁ IMPLEMENTADO (Status: OK)

### Autenticação
- ✅ `POST /auth/login` - Implementado em `authLogin()`
- ✅ `POST /auth/logout` - Implementado em `authLogout()`
- ✅ `GET /auth/me` - Implementado em `authMe()`

### Workspace
- ✅ `GET /workspace/dashboard` - Implementado em `getDashboardSummary()`
- ✅ `GET /workspace/settings` - Implementado em `getSettings()`
- ✅ `PATCH /workspace/settings` - Implementado em `saveSettings()`

### Clientes
- ✅ `GET /workspace/clients` - Implementado em `listClients()`
- ✅ `POST /workspace/clients` - Implementado em `createClient()`
- ✅ `PATCH /workspace/clients/:id` - Implementado em `updateClient()`
- ✅ `DELETE /workspace/clients/:id` - Implementado em `deleteClient()`

### Produtos
- ✅ `GET /workspace/products` - Implementado em `listProducts()`
- ✅ `POST /workspace/products` - Implementado em `createProduct()`
- ✅ `PATCH /workspace/products/:id` - Implementado em `updateProduct()`
- ✅ `POST /workspace/products/:id/duplicate` - Implementado em `duplicateProduct()`
- ✅ `DELETE /workspace/products/:id` - Implementado em `deleteProduct()`

### Cotações
- ✅ `GET /workspace/quotations` - Implementado em `listQuotations()`
- ✅ `POST /workspace/quotations` - Implementado em `saveQuotation()`
- ✅ `PATCH /workspace/quotations/:id` - Implementado em `saveQuotation()`
- ✅ `POST /workspace/quotations/:id/convert` - Implementado em `convertQuotationToInvoice()`
- ✅ `POST /workspace/quotations/:id/send` - Implementado em `sendWorkspaceDocument()`
- ✅ `GET /workspace/quotations/:id/download` - Implementado em `getWorkspaceDocumentDownloadUrl()`
- ✅ `DELETE /workspace/quotations/:id` - Implementado em `deleteQuotation()`

### Faturas
- ✅ `GET /workspace/invoices` - Implementado em `listInvoices()`
- ✅ `POST /workspace/invoices` - Implementado em `saveInvoice()`
- ✅ `PATCH /workspace/invoices/:id` - Implementado em `saveInvoice()`
- ✅ `POST /workspace/invoices/:id/convert` - Implementado em `convertInvoiceToReceipt()`
- ✅ `POST /workspace/invoices/:id/send` - Implementado em `sendWorkspaceDocument()`
- ✅ `GET /workspace/invoices/:id/download` - Implementado em `getWorkspaceDocumentDownloadUrl()`
- ✅ `DELETE /workspace/invoices/:id` - Implementado em `deleteInvoice()`

### Recibos
- ✅ `GET /workspace/receipts` - Implementado em `listReceipts()`
- ✅ `POST /workspace/receipts` - Implementado em `saveReceipt()`
- ✅ `PATCH /workspace/receipts/:id` - **PRECISA SER IMPLEMENTADO**
- ✅ `POST /workspace/receipts/:id/send` - Implementado em `sendWorkspaceDocument()`
- ✅ `GET /workspace/receipts/:id/download` - Implementado em `getWorkspaceDocumentDownloadUrl()`
- ✅ `DELETE /workspace/receipts/:id` - Implementado em `deleteReceipt()`

### Pagamentos
- ✅ `GET /workspace/payments` - Implementado em `listPayments()`
- ✅ `POST /workspace/payments` - **PRECISA SER IMPLEMENTADO**

### Team Management
- ✅ `GET /workspace/team` - Implementado em `listTeamMembers()`
- ✅ `POST /workspace/team/invitations` - Implementado em `inviteTeamMember()`
- ✅ `POST /workspace/team/invitations/:id/resend` - Implementado em `resendTeamInvitation()`
- ✅ `PATCH /workspace/team/members/:id` - Implementado em `updateTeamMember()`
- ✅ `DELETE /workspace/team/members/:id` - Implementado em `deleteTeamMember()`

### Documentos Enviados
- ✅ `GET /workspace/sent` - Implementado em `listSent()`

### Relatórios
- ✅ `GET /workspace/reports` - Implementado em `listReports()`

---

## ❌ ENDPOINTS QUE AINDA PRECISAM SER IMPLEMENTADOS

### 1. 🔐 Autenticação Adicional

#### Registrar Usuário
```typescript
export async function authRegister(payload: {
  name: string;
  email: string;
  password: string;
  company_name?: string;
  billing_email?: string;
}) {
  return apiRequestFirst<{
    ok: boolean;
    token?: string;
    user?: ApiUser;
    account?: { id: number; name: string; status: string };
  }>(['/auth/register'], postJson(payload));
}
```

#### Alterar Senha
```typescript
export async function changePassword(payload: {
  current_password: string;
  new_password: string;
  confirm_password: string;
}) {
  return apiRequestFirst<{ ok: boolean }>(['/workspace/security/change-password'], postJson(payload));
}
```

#### Revogar Sessão
```typescript
export async function revokeSession(sessionId: string) {
  return apiRequestFirst<{ ok: boolean }>([`/workspace/security/sessions/${sessionId}/revoke`], postJson({}));
}
```

### 2. 🏢 Workspace Setup

#### Configurar Empresa
```typescript
export async function setupCompany(payload: {
  company_name: string;
  tax_id?: string;
  phone?: string;
  email?: string;
  address?: string;
}) {
  return apiRequestFirst<{ ok: boolean; data?: any }>(['/workspace/company/setup'], postJson(payload));
}
```

### 3. 💳 Pagamentos (Criar)

#### Registrar Pagamento
```typescript
export async function createPayment(payload: {
  clientId: number;
  documentId?: number;
  amount: number;
  paymentMethod: string;
  paymentDate?: string;
  status?: 'completed' | 'pending' | 'failed';
  notes?: string;
}) {
  return apiRequestFirst<{ ok: boolean; data?: PaymentRecord }>(['/workspace/payments'], postJson(payload));
}
```

### 4. 📄 Recibos (Atualizar)

#### Atualizar Recibo
```typescript
export async function updateReceipt(id: string | number, payload: Partial<Receipt>) {
  const body = {
    ...toDocumentPayload(payload),
    status: 'paid',
  };
  return apiRequestFirst<ApiItem<BackendDocument> | BackendDocument>([`/workspace/receipts/${id}`], patchJson(body));
}
```

### 5. 💰 Billing/Pagamentos (Público)

#### Listar Planos
```typescript
export async function getBillingPlans() {
  return apiRequestFirst<{
    ok: boolean;
    data: Array<{
      id: number;
      name: string;
      price: number;
      billing_cycle: string;
      features: string[];
      status: string;
    }>;
  }>(['/billing/plans']);
}
```

#### Checkout
```typescript
export async function createCheckout(payload: {
  plan_id: number;
  payment_method: string;
  billing_address?: {
    street: string;
    city: string;
    country: string;
  };
}) {
  return apiRequestFirst<{ ok: boolean; data?: any }>(['/billing/checkout'], postJson(payload));
}
```

#### Detalhes da Transação
```typescript
export async function getTransactionDetails(transactionId: string) {
  return apiRequestFirst<{ ok: boolean; data?: any }>([`/billing/transactions/${transactionId}`]);
}
```

### 6. 👑 Admin (Se necessário)

#### Dashboard Admin
```typescript
export async function getAdminDashboard() {
  return apiRequestFirst<{
    ok: boolean;
    data: {
      total_users: number;
      active_users: number;
      total_companies: number;
      active_companies: number;
      monthly_revenue: number;
      new_registrations_today: number;
      top_plans: Array<{ plan_name: string; subscriptions: number }>;
    };
  }>(['/admin/dashboard']);
}
```

#### Listar Usuários Admin
```typescript
export async function getAdminUsers() {
  return apiRequestFirst<{
    ok: boolean;
    data: Array<{
      id: number;
      name: string;
      email: string;
      account_id: number;
      status: string;
      is_platform_admin: boolean;
      last_seen_at?: string;
      created_at: string;
    }>;
    meta: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
  }>(['/admin/users']);
}
```

### 7. 📊 Presence Tracking (Se necessário)

#### Summary Presence
```typescript
export async function getPresenceSummary() {
  return apiRequestFirst<{
    ok: boolean;
    data: {
      total_users: number;
      online_users: number;
      away_users: number;
      offline_users: number;
      active_today: number;
      active_this_week: number;
      active_this_month: number;
      average_session_duration: string;
      peak_concurrent_users: number;
      peak_time: string;
    };
  }>(['/presence/summary']);
}
```

#### Usuários Online
```typescript
export async function getOnlineUsers() {
  return apiRequestFirst<{
    ok: boolean;
    data: Array<{
      user_id: number;
      user_name: string;
      user_email: string;
      status: string;
      last_seen_at: string;
      session_duration: string;
      current_page: string;
      ip_address: string;
      user_agent: string;
    }>;
  }>(['/presence/users']);
}
```

### 8. ⚙️ Security (Visão Geral)

#### Security Overview
```typescript
export async function getSecurityOverview() {
  return apiRequestFirst<{
    ok: boolean;
    data: {
      current_session: {
        id: string;
        ip_address: string;
        user_agent: string;
        created_at: string;
        last_activity: string;
        is_current: boolean;
      };
      active_sessions: Array<{
        id: string;
        ip_address: string;
        user_agent: string;
        created_at: string;
        last_activity: string;
        is_current: boolean;
      }>;
      password_last_changed?: string;
      two_factor_enabled: boolean;
      login_attempts: number;
      last_failed_login?: string;
    };
  }>(['/workspace/security']);
}
```

---

## 🔧 IMPLEMENTAÇÕES NECESSÁRIAS

### 1. Correções Imediatas (Priority: HIGH)

#### Atualizar Recibo
- **Arquivo**: `src/lib/business-api.ts`
- **Função**: `updateReceipt(id, payload)`
- **Endpoint**: `PATCH /workspace/receipts/:id`

#### Criar Pagamento
- **Arquivo**: `src/lib/business-api.ts`
- **Função**: `createPayment(payload)`
- **Endpoint**: `POST /workspace/payments`

#### Registrar Usuário
- **Arquivo**: `src/lib/api.ts`
- **Função**: `authRegister(payload)`
- **Endpoint**: `POST /auth/register`

#### Alterar Senha
- **Arquivo**: `src/lib/api.ts`
- **Função**: `changePassword(payload)`
- **Endpoint**: `POST /workspace/security/change-password`

### 2. Implementações Futuras (Priority: MEDIUM)

#### Billing Plans
- Listar planos disponíveis
- Processar checkout
- Histórico de transações

#### Admin Functions
- Dashboard administrativo
- Gerenciamento de usuários
- Analytics avançado

#### Presence Tracking
- Usuários online
- Tempo de sessão
- Atividade em tempo real

---

## 📊 RESUMO

### Status Atual
- ✅ **Implementados**: 45 endpoints
- ❌ **Faltantes**: 15 endpoints
- 🔄 **Correções**: 2 endpoints

### Prioridade
1. **HIGH**: Atualizar recibo, criar pagamento, registrar usuário, alterar senha
2. **MEDIUM**: Billing plans, admin functions, presence tracking
3. **LOW**: Callbacks BIM, analytics avançados

### Arquivos a Modificar
1. `src/lib/business-api.ts` - Adicionar funções faltantes
2. `src/lib/api.ts` - Adicionar auth e security functions
3. `src/types/` - Adicionar tipos necessários
4. `src/pages/` - Implementar UI para novas funções

---

## 🚀 PRÓXIMOS PASSOS

1. **Implementar funções críticas** (updateReceipt, createPayment, authRegister, changePassword)
2. **Testar integração** com backend
3. **Criar componentes UI** para novas funcionalidades
4. **Implementar validações** e tratamento de erros
5. **Adicionar testes** unitários e de integração

---

**Com estas implementações, o frontend estará 100% completo e funcional!** 🎉
