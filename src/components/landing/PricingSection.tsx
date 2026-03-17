import { Check, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchPlans, type Plan } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

const PricingSection = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [plans, setPlans] = useState<Array<{
    id: number;
    name: string;
    description: string;
    price: number;
    features: string[];
    cta: string;
    popular: boolean;
  }>>([]);
  const [loadingPlanId, setLoadingPlanId] = useState<number | null>(null);

  useEffect(() => {
    fetchPlans()
      .then((apiPlans) => {
        const mapped = apiPlans.map((plan: Plan) => ({
          id: plan.id,
          name: plan.name,
          description: plan.description || 'Subscription plan',
          price: plan.price_cents / 100,
          features: plan.features && plan.features.length > 0 ? plan.features : ['Billing access'],
          cta: 'Start Free Trial',
          popular: Boolean((plan.metadata as { is_popular?: boolean } | null)?.is_popular) || plan.code === 'professional',
        }));
        if (mapped.length > 0) setPlans(mapped);
      })
      .catch(() => {
        setPlans([]);
      });
  }, []);

  const handleCheckout = async (planId?: number) => {
    setLoadingPlanId(planId ?? null);
    navigate(planId ? `/register?plan=${planId}` : '/register');
    setLoadingPlanId(null);
  };

  return (
    <section id="pricing" className="py-20 lg:py-32 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            {t('pricing.badge')}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            {t('pricing.title_1')}{' '}
            <span className="gradient-text">{t('pricing.title_2')}</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('pricing.subtitle')}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground">{t('pricing.no_plans')}</div>
          ) : plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 ${
                plan.popular
                  ? 'bg-gradient-to-b from-primary/10 via-card to-card border-2 border-primary shadow-xl shadow-primary/10'
                  : 'bg-card border border-border/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary to-purple-600 text-primary-foreground text-sm font-semibold">
                    <Zap className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-display font-bold text-xl mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-display font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>

              <Button
                variant={plan.popular ? 'hero' : 'outline'}
                className="w-full mb-8"
                disabled={loadingPlanId === plan.id}
                onClick={() => handleCheckout(plan.id)}
              >
                <span>{t('pricing.cta')}</span>
              </Button>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
