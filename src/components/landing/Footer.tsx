import { Link } from 'react-router-dom';
import { Zap, Twitter, Linkedin, Github, Mail } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const Footer = () => {
  const { t, language } = useI18n();
  const footerLinks = {
    product: [
      { name: language === 'pt-PT' ? 'Funcionalidades' : 'Features', href: '#features' },
      { name: language === 'pt-PT' ? 'Precos' : 'Pricing', href: '#pricing' },
      { name: language === 'pt-PT' ? 'Integracoes' : 'Integrations', href: '#' },
      { name: 'API', href: '#' },
    ],
    company: [
      { name: language === 'pt-PT' ? 'Sobre' : 'About', href: '#about' },
      { name: 'Blog', href: '#' },
      { name: language === 'pt-PT' ? 'Carreiras' : 'Careers', href: '#' },
      { name: language === 'pt-PT' ? 'Contacto' : 'Contact', href: '#' },
    ],
    resources: [
      { name: language === 'pt-PT' ? 'Documentacao' : 'Documentation', href: '#' },
      { name: language === 'pt-PT' ? 'Centro de ajuda' : 'Help Center', href: '#' },
      { name: language === 'pt-PT' ? 'Modelos' : 'Templates', href: '#' },
      { name: language === 'pt-PT' ? 'Tutoriais' : 'Tutorials', href: '#' },
    ],
    legal: [
      { name: language === 'pt-PT' ? 'Privacidade' : 'Privacy', href: '#' },
      { name: language === 'pt-PT' ? 'Termos' : 'Terms', href: '#' },
      { name: language === 'pt-PT' ? 'Seguranca' : 'Security', href: '#' },
      { name: 'Cookies', href: '#' },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Mail, href: '#', label: 'Email' },
  ];

  return (
    <footer className="bg-card border-t border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">ZK Contabilidade</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold mb-4">{language === 'pt-PT' ? 'Produto' : 'Product'}</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4">{language === 'pt-PT' ? 'Empresa' : 'Company'}</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-semibold mb-4">{language === 'pt-PT' ? 'Recursos' : 'Resources'}</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold mb-4">{language === 'pt-PT' ? 'Legal' : 'Legal'}</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ZK Contabilidade. {t('footer.rights')}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('footer.made_with')}{' '}
            <a href="https://zki.co.mz" className="text-foreground hover:underline">ZK Interactive</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
