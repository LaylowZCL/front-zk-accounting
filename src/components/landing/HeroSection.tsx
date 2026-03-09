import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Play } from 'lucide-react';

const HeroSection = () => {
  const features = [
    'Unlimited invoices & quotes',
    'Multi-user access',
    'Real-time analytics',
  ];

  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Trusted by 10,000+ businesses worldwide
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Billing Made{' '}
            <span className="gradient-text">Effortless</span>
            {' '}for Modern Teams
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Create professional invoices, manage clients, and track payments—all in one powerful platform designed for growing businesses.
          </p>

          {/* Feature List */}
          <div className="flex flex-wrap justify-center gap-4 mb-10 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <Button variant="hero" size="xl" asChild>
              <Link to="/register">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-1" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="xl" asChild>
              <a href="#demo">
                <Play className="w-5 h-5 mr-1" />
                Watch Demo
              </a>
            </Button>
          </div>

          {/* Social Proof */}
          <div className="mt-12 pt-12 border-t border-border/50 animate-fade-up" style={{ animationDelay: '0.5s' }}>
            <p className="text-sm text-muted-foreground mb-6">Trusted by innovative companies</p>
            <div className="flex items-center justify-center gap-8 opacity-60 grayscale">
              {['TechCorp', 'StartupX', 'FinanceHub', 'GrowthCo', 'CloudBase'].map((company) => (
                <div key={company} className="font-display font-bold text-lg text-muted-foreground">
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
