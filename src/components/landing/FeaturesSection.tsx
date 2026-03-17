import { 
  FileText, 
  Users, 
  CreditCard, 
  BarChart3, 
  Mail, 
  Shield,
  Zap,
  Globe
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const FeaturesSection = () => {
  const { t, language } = useI18n();
  const features = [
    {
      icon: FileText,
      title: language === 'pt-PT' ? 'Faturas profissionais' : 'Professional invoices',
      description: language === 'pt-PT'
        ? 'Crie faturas em segundos. Personalize modelos, adicione a sua marca e envie diretamente aos clientes.'
        : 'Create stunning invoices in seconds. Customize templates, add your branding, and send directly to clients.',
      color: 'from-primary to-blue-500',
    },
    {
      icon: Users,
      title: language === 'pt-PT' ? 'Gestao de clientes' : 'Client management',
      description: language === 'pt-PT'
        ? 'Organize toda a informacao dos clientes. Registe interacoes e construa relacoes.'
        : 'Keep all your client information organized. Track interactions, manage contacts, and build relationships.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: CreditCard,
      title: language === 'pt-PT' ? 'Controlo de pagamentos' : 'Payment tracking',
      description: language === 'pt-PT'
        ? 'Acompanhe pagamentos em tempo real. Saiba quando as faturas sao pagas e o que falta receber.'
        : 'Monitor payments in real-time. Get notified when invoices are paid and track outstanding balances.',
      color: 'from-success to-emerald-400',
    },
    {
      icon: BarChart3,
      title: language === 'pt-PT' ? 'Analise detalhada' : 'Detailed analytics',
      description: language === 'pt-PT'
        ? 'Veja a performance do negocio com dashboards e relatórios financeiros completos.'
        : 'Gain insights into your business performance with comprehensive dashboards and financial reports.',
      color: 'from-warning to-orange-400',
    },
    {
      icon: Mail,
      title: language === 'pt-PT' ? 'Integracao de email' : 'Email integration',
      description: language === 'pt-PT'
        ? 'Envie faturas e lembretes pela plataforma. Automatize follow-ups e poupe tempo.'
        : 'Send invoices and reminders directly from the platform. Automate follow-ups and save time.',
      color: 'from-info to-cyan-400',
    },
    {
      icon: Shield,
      title: language === 'pt-PT' ? 'Seguro e conforme' : 'Secure & compliant',
      description: language === 'pt-PT'
        ? 'Os seus dados estao protegidos com seguranca de nivel empresarial e conformidade fiscal.'
        : 'Your data is protected with enterprise-grade security. Stay compliant with tax regulations.',
      color: 'from-destructive to-rose-400',
    },
    {
      icon: Zap,
      title: language === 'pt-PT' ? 'Orcamento para fatura' : 'Quote to invoice',
      description: language === 'pt-PT'
        ? 'Converta orcamentos aceites em faturas com um clique.'
        : 'Convert accepted quotations to invoices with one click. Streamline your sales workflow.',
      color: 'from-yellow-500 to-amber-400',
    },
    {
      icon: Globe,
      title: language === 'pt-PT' ? 'Multi-moeda' : 'Multi-currency',
      description: language === 'pt-PT'
        ? 'Trabalhe com clientes globais. Suporte a varias moedas.'
        : 'Work with clients globally. Support for multiple currencies and automatic exchange rates.',
      color: 'from-teal-500 to-cyan-400',
    },
  ];

  return (
    <section id="features" className="py-20 lg:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            {t('features.badge')}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            {t('features.title_1')}{' '}
            <span className="gradient-text">{t('features.title_2')}</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('features.subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
