import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWorkspaceEntitlements } from '@/lib/business-api';
import { useI18n } from '@/lib/i18n';

const BillingLocked = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  useEffect(() => {
    getWorkspaceEntitlements()
      .then((data) => {
        if (data?.billing_good_standing) {
          navigate('/dashboard', { replace: true });
        }
      })
      .catch(() => null);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title={t('billing.locked.title')} subtitle={t('billing.locked.subtitle')} />

      <main className="px-6 pb-10">
        <div className="surface-panel p-6 max-w-2xl">
          <h2 className="font-display text-xl mb-2">{t('billing.locked.title')}</h2>
          <p className="text-sm text-muted-foreground mb-6">
            {t('billing.locked.message')}
          </p>
          <Button variant="outline" onClick={() => navigate('/')}>
            {t('billing.locked.back')}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default BillingLocked;
