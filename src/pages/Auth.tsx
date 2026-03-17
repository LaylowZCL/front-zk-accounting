import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Zap, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { ApiError, authLogin, authRegister, fetchPlans, type Plan } from '@/lib/api';
import { LoginFormValues, RegisterFormValues, loginSchema, registerSchema } from '@/lib/validators';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';

interface AuthProps {
  mode: 'login' | 'register';
}

const Auth = ({ mode }: AuthProps) => {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const { language } = useI18n();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [searchParams] = useSearchParams();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);

  const isLogin = mode === 'login';

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', plan_id: 0 },
    mode: 'onBlur',
  });

  const selectedPlanId = registerForm.watch('plan_id');

  useEffect(() => {
    if (isLogin) return;
    setIsLoadingPlans(true);
    fetchPlans()
      .then((apiPlans) => {
        const activePlans = apiPlans.filter((p) => p.is_active);
        setPlans(activePlans);
        const queryPlan = Number(searchParams.get('plan'));
        const queryMatch = activePlans.find((p) => p.id === queryPlan);
        const popular = activePlans.find((p) => Boolean((p.metadata as { is_popular?: boolean } | null)?.is_popular))
          || activePlans.find((p) => p.code === 'professional')
          || activePlans[0];
        const chosen = queryMatch?.id ?? popular?.id;
        if (chosen) {
          registerForm.setValue('plan_id', chosen, { shouldValidate: true });
        }
      })
      .catch(() => {
        setPlans([]);
      })
      .finally(() => {
        setIsLoadingPlans(false);
      });
  }, [isLogin, searchParams, registerForm]);

  const activeForm = useMemo(() => (isLogin ? loginForm : registerForm), [isLogin, loginForm, registerForm]);

  const handleApiValidationErrors = (error: ApiError) => {
    const errors = error.errors;
    if (!errors) return;
    Object.entries(errors).forEach(([field, messages]) => {
      const firstMessage = messages?.[0];
      if (!firstMessage) return;
      const mappedField = field === 'name' || field === 'email' || field === 'password' || field === 'plan_id' ? field : undefined;
      if (mappedField) {
        activeForm.setError(mappedField as 'name' | 'email' | 'password', { message: firstMessage });
      }
    });
  };

  const onSubmit = async (values: LoginFormValues | RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      if (isLogin) {
        const payload = values as LoginFormValues;
        const response = await authLogin({
          email: payload.email,
          password: payload.password,
          two_factor_code: twoFactorCode.trim() || undefined,
          recovery_code: recoveryCode.trim() || undefined,
        });

        if (!response.ok) {
          setTwoFactorRequired(true);
          toast.warning(response.message || 'Two-factor code required');
          return;
        }

        setSession(response.data.token, response.data.user);
        toast.success('Login efetuado com sucesso');
        setTwoFactorRequired(false);
        setTwoFactorCode('');
        setRecoveryCode('');
        navigate(response.data.user.is_platform_admin ? '/admin/dashboard' : '/dashboard');
      } else {
        const payload = values as RegisterFormValues;
        const response = await authRegister({
          name: payload.name,
          email: payload.email,
          password: payload.password,
          company_name: `${payload.name.split(' ')[0] || 'My'} Company`,
          plan_id: Number(payload.plan_id),
        });
        setSession(response.data.token, response.data.user);
        toast.success('Conta criada com sucesso');
        navigate(response.data.user.is_platform_admin ? '/admin/dashboard' : '/dashboard');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        handleApiValidationErrors(error);
        if (isLogin && error.status === 428) {
          setTwoFactorRequired(true);
          toast.warning(error.message || 'Two-factor code required');
        } else {
          toast.error(error.message || 'Erro na autentica  o');
        }
      } else {
        toast.error('Erro na autentica  o');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />

        <div className="relative z-10 flex flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-2xl text-primary-foreground">ZK Contabilidade</span>
          </Link>

          <div className="space-y-6">
            <h1 className="font-display text-4xl font-bold text-primary-foreground leading-tight">Streamline your billing workflow</h1>
            <p className="text-lg text-primary-foreground/80 max-w-md">
              Join thousands of businesses managing invoices, clients, and payments effortlessly.
            </p>
          </div>

          <p className="text-sm text-primary-foreground/60">  {new Date().getFullYear()} ZK Contabilidade. All rights reserved.</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-2xl">ZK Contabilidade</span>
            </Link>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="font-display text-3xl font-bold mb-2">
              {isLogin
                ? (language === 'pt-PT' ? 'Bem-vindo de volta' : 'Welcome back')
                : (language === 'pt-PT' ? 'Criar conta' : 'Create an account')}
            </h2>
            <p className="text-muted-foreground">
              {isLogin
                ? (language === 'pt-PT' ? 'Insira as credenciais para aceder à conta' : 'Enter your credentials to access your account')
                : (language === 'pt-PT' ? 'Inicie o teste gratuito de 7 dias, sem cartao' : 'Start your 7-day free trial, no credit card required')}
            </p>
          </div>

          <form onSubmit={activeForm.handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">{language === 'pt-PT' ? 'Nome completo' : 'Full name'}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="********"
                    className={`pl-10 h-12 ${registerForm.formState.errors.name ? 'border-destructive' : ''}`}
                    {...registerForm.register('name')}
                  />
                </div>
                {registerForm.formState.errors.name && (
                  <p className="text-xs text-destructive">{registerForm.formState.errors.name.message}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="email">{language === 'pt-PT' ? 'Email' : 'Email address'}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  className={`pl-10 h-12 ${activeForm.formState.errors.email ? 'border-destructive' : ''}`}
                  {...activeForm.register('email')}
                />
              </div>
              {activeForm.formState.errors.email && (
                <p className="text-xs text-destructive">{activeForm.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{language === 'pt-PT' ? 'Palavra-passe' : 'Password'}</Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="********"
                  className={`pl-10 pr-10 h-12 ${activeForm.formState.errors.password ? 'border-destructive' : ''}`}
                  {...activeForm.register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {activeForm.formState.errors.password && (
                <p className="text-xs text-destructive">{activeForm.formState.errors.password.message}</p>
              )}
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label>{language === 'pt-PT' ? 'Pacote' : 'Plan'}</Label>
                <input type="hidden" {...registerForm.register('plan_id')} />
                {isLoadingPlans ? (
                  <p className="text-sm text-muted-foreground">{language === 'pt-PT' ? 'A carregar pacotes...' : 'Loading plans...'}</p>
                ) : plans.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{language === 'pt-PT' ? 'Sem pacotes disponiveis.' : 'No plans available.'}</p>
                ) : (
                  <RadioGroup
                    value={selectedPlanId ? String(selectedPlanId) : ''}
                    onValueChange={(value) => registerForm.setValue('plan_id', Number(value), { shouldValidate: true })}
                    className="grid gap-3"
                  >
                    {plans.map((plan) => {
                      const isPopular = Boolean((plan.metadata as { is_popular?: boolean } | null)?.is_popular) || plan.code === 'professional';
                      const isSelected = String(selectedPlanId) === String(plan.id);
                      return (
                        <label
                          key={plan.id}
                          htmlFor={`plan-${plan.id}`}
                          className={`flex items-start gap-3 rounded-lg border p-3 transition ${isSelected ? 'border-primary ring-1 ring-primary/30' : 'border-border/50'}`}
                        >
                          <RadioGroupItem id={`plan-${plan.id}`} value={String(plan.id)} className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{plan.name}</span>
                              {isPopular && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                  {language === 'pt-PT' ? 'Mais popular' : 'Most popular'}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{plan.description || (language === 'pt-PT' ? 'Plano de subscricao' : 'Subscription plan')}</p>
                          </div>
                          <div className="text-sm font-semibold">
                            {(plan.price_cents / 100).toLocaleString()} {plan.currency}/{plan.billing_interval === 'monthly' ? (language === 'pt-PT' ? 'mes' : 'mo') : (language === 'pt-PT' ? 'ano' : 'yr')}
                          </div>
                        </label>
                      );
                    })}
                  </RadioGroup>
                )}
                {registerForm.formState.errors.plan_id && (
                  <p className="text-xs text-destructive">{registerForm.formState.errors.plan_id.message}</p>
                )}
              </div>
            )}

            {isLogin && twoFactorRequired && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="twoFactorCode">{language === 'pt-PT' ? 'Codigo de autenticacao' : 'Authentication code'}</Label>
                  <Input
                    id="twoFactorCode"
                    type="text"
                    inputMode="numeric"
                    placeholder="123456"
                    className="h-12"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\s+/g, ''))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recoveryCode">{language === 'pt-PT' ? 'Codigo de recuperacao (opcional)' : 'Recovery code (optional)'}</Label>
                  <Input
                    id="recoveryCode"
                    type="text"
                    placeholder="ABCD-EFGH"
                    className="h-12"
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                  />
                </div>
              </>
            )}

            <Button variant="hero" size="lg" className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? (language === 'pt-PT' ? 'A processar...' : 'Processing...')
                : isLogin
                  ? (language === 'pt-PT' ? 'Entrar' : 'Sign In')
                  : (language === 'pt-PT' ? 'Criar conta' : 'Create account')}
              <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? (
              <>
                {language === 'pt-PT' ? 'Ainda nao tem conta?' : "Don't have an account?"}{' '}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  {language === 'pt-PT' ? 'Registe-se gratuitamente' : 'Sign up for free'}
                </Link>
              </>
            ) : (
              <>
                {language === 'pt-PT' ? 'Ja tem conta?' : 'Already have an account?'}{' '}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  {language === 'pt-PT' ? 'Entrar' : 'Sign in'}
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
