import { Link, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { ApiError, authLogin, authRegister } from '@/lib/api';
import { LoginFormValues, RegisterFormValues, loginSchema, registerSchema } from '@/lib/validators';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface AuthProps {
  mode: 'login' | 'register';
}

const Auth = ({ mode }: AuthProps) => {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLogin = mode === 'login';

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
    mode: 'onBlur',
  });

  const activeForm = useMemo(() => (isLogin ? loginForm : registerForm), [isLogin, loginForm, registerForm]);

  const handleApiValidationErrors = (error: ApiError) => {
    const errors = error.errors;
    if (!errors) return;
    Object.entries(errors).forEach(([field, messages]) => {
      const firstMessage = messages?.[0];
      if (!firstMessage) return;
      const mappedField = field === 'name' || field === 'email' || field === 'password' ? field : undefined;
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
        const response = await authLogin({ email: payload.email, password: payload.password });
        setSession(response.token, response.user);
        toast.success('Login efetuado com sucesso');
        navigate(response.user.is_platform_admin ? '/admin/dashboard' : '/dashboard');
      } else {
        const payload = values as RegisterFormValues;
        const response = await authRegister({
          name: payload.name,
          email: payload.email,
          password: payload.password,
          company_name: `${payload.name.split(' ')[0] || 'My'} Company`,
        });
        setSession(response.token, response.user);
        toast.success('Conta criada com sucesso');
        navigate(response.user.is_platform_admin ? '/admin/dashboard' : '/dashboard');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        handleApiValidationErrors(error);
        toast.error(error.message || 'Erro na autenticação');
      } else {
        toast.error('Erro na autenticação');
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
            <span className="font-display font-bold text-2xl text-primary-foreground">BillFlow</span>
          </Link>

          <div className="space-y-6">
            <h1 className="font-display text-4xl font-bold text-primary-foreground leading-tight">Streamline your billing workflow</h1>
            <p className="text-lg text-primary-foreground/80 max-w-md">
              Join thousands of businesses managing invoices, clients, and payments effortlessly.
            </p>
          </div>

          <p className="text-sm text-primary-foreground/60">© {new Date().getFullYear()} BillFlow. All rights reserved.</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-2xl">BillFlow</span>
            </Link>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="font-display text-3xl font-bold mb-2">{isLogin ? 'Welcome back' : 'Create an account'}</h2>
            <p className="text-muted-foreground">
              {isLogin
                ? 'Enter your credentials to access your account'
                : 'Start your 14-day free trial, no credit card required'}
            </p>
          </div>

          <form onSubmit={activeForm.handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
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
              <Label htmlFor="email">Email Address</Label>
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
                <Label htmlFor="password">Password</Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
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

            <Button variant="hero" size="lg" className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'A processar...' : isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? (
              <>
                Don't have an account?{' '}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  Sign up for free
                </Link>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Sign in
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
