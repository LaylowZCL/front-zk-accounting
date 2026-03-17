# Cashier API Integration

## ✅ Implementação Completa

### 🏗️ **Arquivos Criados**

#### 1. `/src/lib/cashier-api.ts`
API client para integração com endpoints do Cashier:
- `getCashierSubscription()` - Status da assinatura atual
- `getCashierPlans()` - Planos disponíveis
- `getCashierUsage()` - Métricas de uso
- `getCashierTrialStatus()` - Status específico do trial
- `startCashierCheckout()` - Iniciar processo de pagamento
- `cancelCashierSubscription()` - Cancelar assinatura

#### 2. `/src/components/ui/trial-banner.tsx`
Componente reutilizável para banner de trial:
- Auto-fetch do status via Cashier API
- Cores dinâmicas por urgência (≤3 dias vermelho, ≤7 dias laranja)
- Botão integrado de upgrade
- Opção de dismiss persistente por sessão

### 🎯 **Endpoints do Cashier Implementados**

```typescript
// Status da assinatura
GET /cashier/subscription

// Planos disponíveis  
GET /cashier/plans

// Métricas de uso
GET /cashier/usage

// Status do trial
GET /cashier/trial-status

// Iniciar checkout
POST /cashier/checkout
{
  "plan_id": number,
  "payment_type": "REFERENCE" | "MPESA" | "EMOLA"
}

// Cancelar assinatura
POST /cashier/subscription/cancel
{
  "reason": string
}
```

### 🔄 **Fluxo de Dados**

#### Trial Banner
1. **Componente montado** → `getCashierTrialStatus()`
2. **Se trial ativo** → Exibe banner com dias restantes
3. **Botão "Assinar"** → `getCashierPlans()` → `startCashierCheckout()`
4. **Redirect** → URL de pagamento do Cashier

#### Settings - Billing
1. **loadCashierData()** → Paralelo:
   - `getCashierSubscription()`
   - `getCashierTrialStatus()` 
   - `getCashierUsage()`
   - `getCashierPlans()`
2. **UI Atualizada** → Status, uso, planos disponíveis
3. **Actions** → Upgrade, cancelar via Cashier API

### 📊 **Tipos de Dados**

```typescript
interface CashierSubscription {
  id: string;
  status: 'trial' | 'active' | 'cancelled' | 'expired' | 'past_due';
  plan_id: number;
  plan_name: string;
  trial_ends_at?: string;
  amount: number;
  currency: string;
  billing_interval: 'monthly' | 'yearly';
}

interface CashierPlan {
  id: number;
  name: string;
  price_cents: number;
  currency: string;
  billing_interval: 'monthly' | 'yearly';
  trial_days: number;
  features: string[];
}

interface CashierUsage {
  limits: {
    invoices: { used: number; limit: number };
    clients: { used: number; limit: number };
    team_members: { used: number; limit: number };
  };
}
```

### 🎨 **Interface Dinâmica**

#### Trial Banner
- **Dias restantes**: Calculados da API do Cashier
- **Cores contextuais**: Urgência visual
- **Data término**: Formatada PT-BR
- **Botão upgrade**: Integrado com checkout

#### Settings Billing
- **Status real**: Ativo/Trial/Cancelado
- **Métricas de uso**: Barras de progresso
- **Planos disponíveis**: Cards com features
- **Actions**: Upgrade/cancelar funcionais

### 🔧 **Como Usar**

#### Adicionar TrialBanner:
```typescript
import TrialBanner from '@/components/ui/trial-banner';

<TrialBanner />
```

#### Usar Cashier API:
```typescript
import { 
  getCashierSubscription, 
  getCashierPlans,
  startCashierCheckout 
} from '@/lib/cashier-api';

const subscription = await getCashierSubscription();
const plans = await getCashierPlans();
await startCashierCheckout(planId);
```

### 🚀 **Testar Implementação**

1. **Trial Banner**: Aparecerá se trial ativo
2. **Settings Billing**: Mostrará dados reais
3. **Upgrade**: Redirecionará para Cashier
4. **Uso**: Barras de progresso funcionais

### 📝 **Próximos Passos**

1. **Mock Data**: Para desenvolvimento sem backend
2. **Error Handling**: Melhorar tratamento de erros
3. **Loading States**: Indicadores mais específicos
4. **Notifications**: Sucesso/erro em actions
5. **Analytics**: Eventos de upgrade/cancel

---

**Status**: ✅ **Implementação completa e funcionando com Cashier API**
