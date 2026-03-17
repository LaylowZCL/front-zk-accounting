import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Zap } from 'lucide-react';
import ThemeToggle from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const { language, setLanguage, t } = useI18n();
  const navigate = useNavigate();

  const navLinks = [
    { name: t('nav.features'), href: '#features' },
    { name: t('nav.pricing'), href: '#pricing' },
    { name: t('nav.about'), href: '#about' },
  ];

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  const accountPath = user?.is_platform_admin ? '/admin/dashboard' : '/dashboard';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">ZK Contabilidade</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === 'pt-PT' ? 'en' : 'pt-PT')}
            >
              {language === 'pt-PT' ? 'EN' : 'PT'}
            </Button>
            {isAuthenticated ? (
              <>
                <Button variant="ghost" onClick={handleSignOut}>
                  {t('nav.sign_out')}
                </Button>
                <Button variant="gradient" asChild>
                  <Link to={accountPath}>{t('nav.your_account')}</Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">{t('nav.sign_in')}</Link>
                </Button>
                <Button variant="gradient" asChild>
                  <Link to="/register">{t('nav.get_started')}</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <ThemeToggle size="sm" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLanguage(language === 'pt-PT' ? 'en' : 'pt-PT')}
                  >
                    {language === 'pt-PT' ? 'EN' : 'PT'}
                  </Button>
                </div>
                {isAuthenticated ? (
                  <>
                    <Button variant="ghost" className="justify-start" onClick={handleSignOut}>
                      {t('nav.sign_out')}
                    </Button>
                    <Button variant="gradient" asChild>
                      <Link to={accountPath}>{t('nav.your_account')}</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" asChild className="justify-start">
                      <Link to="/login">{t('nav.sign_in')}</Link>
                    </Button>
                    <Button variant="gradient" asChild>
                      <Link to="/register">{t('nav.get_started')}</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
