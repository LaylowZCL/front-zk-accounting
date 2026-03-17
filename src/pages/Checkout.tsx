import { useEffect, useState } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/button';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getWorkspaceEntitlements, WorkspaceEntitlements } from '@/lib/business-api';
import { useI18n } from '@/lib/i18n';

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [entitlements, setEntitlements] = useState<WorkspaceEntitlements | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    getWorkspaceEntitlements()
      .then((data) => setEntitlements(data ?? null))
      .catch(() => setEntitlements(null));
  }, []);

  useEffect(() => {
    if (entitlements?.billing_good_standing) {
      navigate('/dashboard', { replace: true });
    }
  }, [entitlements, navigate]);

  const planIdFromQuery = searchParams.get('plan');
  const selectedPlanName = entitlements?.current_plan?.name ?? (planIdFromQuery ? `Plan #${planIdFromQuery}` : 'Plano anterior');

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title={t('checkout.title')} subtitle={t('checkout.subtitle')} />

      <main className="px-6 pb-10">
        <div className="surface-panel p-6 max-w-2xl">
          <h2 className="font-display text-xl mb-2">{t('checkout.pending_title')}</h2>
          <p className="text-sm text-muted-foreground mb-6">
            {t('checkout.pending_body')}
          </p>
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">{t('checkout.selected_plan')}</p>
            <p className="text-lg font-semibold">{selectedPlanName}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="default" onClick={() => navigate('/dashboard/settings')}>
              {t('checkout.view_plan')}
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              {t('checkout.back_dashboard')}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
