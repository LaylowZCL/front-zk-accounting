import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type Language = 'pt-PT' | 'en';

type Dictionary = Record<string, string>;

const STORAGE_KEY = 'zk_language';

const dictionaries: Record<Language, Dictionary> = {
  'pt-PT': {
    'nav.features': 'Funcionalidades',
    'nav.pricing': 'Precos',
    'nav.about': 'Sobre',
    'nav.sign_in': 'Entrar',
    'nav.get_started': 'Comecar',
    'nav.sign_out': 'Sair',
    'nav.your_account': 'A sua conta',
    'nav.language': 'Idioma',
    'nav.dashboard': 'Dashboard',
    'nav.users': 'Utilizadores',
    'nav.team': 'Equipa',
    'nav.packages': 'Pacotes',
    'nav.companies': 'Empresas',
    'nav.analytics': 'Analitica',
    'nav.security': 'Seguranca',
    'nav.settings': 'Definicoes',
    'nav.clients': 'Clientes',
    'nav.products': 'Produtos',
    'nav.documents': 'Documentos',
    'nav.quotations': 'Orcamentos',
    'nav.invoices': 'Faturas',
    'nav.receipts': 'Recibos',
    'nav.transactions': 'Transacoes',
    'nav.payments': 'Pagamentos',
    'nav.sent': 'Enviados',
    'nav.reports': 'Relatorios',
    'hero.badge': 'Confiado por mais de 10.000 empresas em todo o mundo',
    'hero.title_1': 'Faturacao simples',
    'hero.title_2': 'para equipas modernas',
    'hero.subtitle': 'Crie faturas profissionais, gere clientes e acompanhe pagamentos numa plataforma poderosa para empresas em crescimento.',
    'hero.feature_1': 'Faturas e orcamentos ilimitados',
    'hero.feature_2': 'Acesso multiutilizador',
    'hero.feature_3': 'Analise em tempo real',
    'hero.cta_primary': 'Comecar teste gratuito',
    'hero.cta_secondary': 'Ver demonstracao',
    'hero.trusted': 'Confiado por empresas inovadoras',
    'features.badge': 'Funcionalidades',
    'features.title_1': 'Tudo o que precisa para',
    'features.title_2': 'gerir a faturacao',
    'features.subtitle': 'Ferramentas poderosas para criar faturas, gerir clientes e fazer crescer o negocio.',
    'pricing.badge': 'Precos',
    'pricing.title_1': 'Preco simples e',
    'pricing.title_2': 'transparente',
    'pricing.subtitle': 'Escolha o plano ideal para o seu negocio. Todos os planos incluem um teste gratuito de 7 dias.',
    'pricing.cta': 'Iniciar teste gratuito',
    'pricing.no_plans': 'Nenhum plano disponivel.',
    'footer.tagline': 'A plataforma moderna de faturacao para empresas de qualquer dimensao. Crie faturas, gestione clientes e faca crescer o seu negocio.',
    'footer.made_with': 'Feito com ❤️ para negocios modernos por',
    'footer.rights': 'Todos os direitos reservados.',
    'header.search': 'Pesquisar',
    'header.filters.none': 'Sem filtros disponiveis',
    'header.filters.selected': ' (Selecionado)',
    'header.notifications.none': 'Sem notificacoes',
    'billing.locked.title': 'Acesso suspenso',
    'billing.locked.subtitle': 'A sua conta precisa de reativacao do owner.',
    'billing.locked.message': 'O periodo de teste ou a subscricao expirou. Para voltar a usar o ZK Contabilidade, o owner deve efetuar o pagamento.',
    'billing.locked.back': 'Voltar ao inicio',
    'checkout.title': 'Checkout',
    'checkout.subtitle': 'Finalize o seu plano para continuar sem interrupcoes.',
    'checkout.pending_title': 'Pagamento em configuracao',
    'checkout.pending_body': 'O gateway de pagamento ainda nao foi escolhido. Assim que estiver pronto, esta pagina permitira concluir a subscricao.',
    'checkout.selected_plan': 'Plano selecionado',
    'checkout.view_plan': 'Ver detalhes do plano',
    'checkout.back_dashboard': 'Voltar ao dashboard',
    'team.title': 'Equipa',
    'team.subtitle': 'Gira membros e permissoes',
    'theme.light': 'Claro',
    'theme.dark': 'Escuro',
  },
  en: {
    'nav.features': 'Features',
    'nav.pricing': 'Pricing',
    'nav.about': 'About',
    'nav.sign_in': 'Sign In',
    'nav.get_started': 'Getting Started',
    'nav.sign_out': 'Sign Out',
    'nav.your_account': 'Your Account',
    'nav.language': 'Language',
    'nav.dashboard': 'Dashboard',
    'nav.users': 'Users',
    'nav.team': 'Team',
    'nav.packages': 'Packages',
    'nav.companies': 'Companies',
    'nav.analytics': 'Analytics',
    'nav.security': 'Security',
    'nav.settings': 'Settings',
    'nav.clients': 'Clients',
    'nav.products': 'Products',
    'nav.documents': 'Documents',
    'nav.quotations': 'Quotations',
    'nav.invoices': 'Invoices',
    'nav.receipts': 'Receipts',
    'nav.transactions': 'Transactions',
    'nav.payments': 'Payments',
    'nav.sent': 'Sent',
    'nav.reports': 'Reports',
    'hero.badge': 'Trusted by 10,000+ businesses worldwide',
    'hero.title_1': 'Billing made',
    'hero.title_2': 'for modern teams',
    'hero.subtitle': 'Create professional invoices, manage clients, and track payments in one powerful platform for growing businesses.',
    'hero.feature_1': 'Unlimited invoices & quotes',
    'hero.feature_2': 'Multi-user access',
    'hero.feature_3': 'Real-time analytics',
    'hero.cta_primary': 'Start free trial',
    'hero.cta_secondary': 'Watch demo',
    'hero.trusted': 'Trusted by innovative companies',
    'features.badge': 'Features',
    'features.title_1': 'Everything you need to',
    'features.title_2': 'manage billing',
    'features.subtitle': 'Powerful tools to help you create invoices, manage clients, and grow your business.',
    'pricing.badge': 'Pricing',
    'pricing.title_1': 'Simple, transparent',
    'pricing.title_2': 'pricing',
    'pricing.subtitle': 'Choose the perfect plan for your business. All plans include a 7-day free trial.',
    'pricing.cta': 'Start free trial',
    'pricing.no_plans': 'No plans available.',
    'footer.tagline': 'The modern billing platform for businesses of all sizes. Create invoices, manage clients, and grow your business.',
    'footer.made_with': 'Made with ❤️ for modern businesses by',
    'footer.rights': 'All rights reserved.',
    'header.search': 'Search',
    'header.filters.none': 'No filters available',
    'header.filters.selected': ' (Selected)',
    'header.notifications.none': 'No notifications',
    'billing.locked.title': 'Access paused',
    'billing.locked.subtitle': 'Your account needs owner reactivation.',
    'billing.locked.message': 'The trial or subscription has expired. To use ZK Contabilidade again, the owner must complete payment.',
    'billing.locked.back': 'Back to home',
    'checkout.title': 'Checkout',
    'checkout.subtitle': 'Finish your plan to continue without interruptions.',
    'checkout.pending_title': 'Payment not configured',
    'checkout.pending_body': 'The payment gateway has not been chosen yet. Once ready, this page will allow you to complete the subscription.',
    'checkout.selected_plan': 'Selected plan',
    'checkout.view_plan': 'View plan details',
    'checkout.back_dashboard': 'Back to dashboard',
    'team.title': 'Team',
    'team.subtitle': 'Manage members and permissions',
    'theme.light': 'Light',
    'theme.dark': 'Dark',
  },
};

type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    return stored === 'en' ? 'en' : 'pt-PT';
  });

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const t = useCallback((key: string) => {
    const dict = dictionaries[language];
    return dict[key] ?? dictionaries['pt-PT'][key] ?? key;
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within LanguageProvider');
  }
  return ctx;
};
