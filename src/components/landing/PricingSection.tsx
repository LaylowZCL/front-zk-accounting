import { Check, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchPlans, getToken, startCheckout, type Plan } from '@/lib/api';
import { toast } from 'sonner';

const fallbackPlans = [
  {
    id: 1,
    name: 'Starter',
    description: 'Perfect for freelancers and small businesses',
    price: 19,
    features: [
      'Up to 50 invoices/month',
      '5 clients',
      'Basic templates',
      'Email support',
      'PDF exports',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    id: 2,
    name: 'Professional',
    description: 'Ideal for growing businesses and teams',
    price: 49,
    features: [
      'Unlimited invoices',
      'Unlimited clients',
      'Custom templates',
      'Priority support',
      'Team collaboration (3 users)',
      'Advanced analytics',
      'Recurring invoices',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    id: 3,
    name: 'Enterprise',
    description: 'For large organizations with custom needs',
    price: 99,
    features: [
      'Everything in Professional',
      'Unlimited team members',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
      'Custom branding',
      'API access',
      'Advanced security',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const PricingSection = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState(fallbackPlans);
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
          popular: plan.code === 'professional',
        }));
        if (mapped.length > 0) setPlans(mapped);
      })
      .catch(() => {
        // Keep fallback list if API is unavailable.
      });
  }, []);

  const handleCheckout = async (planId?: number) => {
    if (!planId) {
      navigate('/register');
      return;
    }

    const token = getToken();
    if (!token) {
      toast.info('Cria conta ou faz login para continuar');
      navigate('/register');
      return;
    }

    setLoadingPlanId(planId);
    try {
      const response = await startCheckout({
        plan_id: planId,
        payment_type: 'REFERENCE',
      });

      if (response?.data?.checkout_url) {
        window.location.href = response.data.checkout_url;
        return;
      }

      toast.error('Checkout indisponível de momento');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao iniciar checkout';
      toast.error(message);
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <section id="pricing" className="py-20 lg:py-32 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Pricing
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Simple, Transparent{' '}
            <span className="gradient-text">Pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the perfect plan for your business. All plans include a 14-day free trial.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
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
                <span>{plan.cta}</span>
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
