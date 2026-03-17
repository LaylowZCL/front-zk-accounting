import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Zap,
  Building2,
  Upload,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Globe,
  Phone,
  Mail,
  MapPin,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { completeCompanySetup } from '@/lib/business-api';

const steps = [
  { id: 1, title: 'Company Info', icon: Building2 },
  { id: 2, title: 'Contact Details', icon: Phone },
  { id: 3, title: 'Tax & Legal', icon: FileText },
  { id: 4, title: 'Branding', icon: Upload },
];

const defaultIndustries = [
  'Design',
  'Saude',
  'Servicos',
  'Mineracao',
  'Tecnologia',
  'Educacao',
  'Agricultura',
  'Construcao',
  'Consultoria',
  'Comercio',
  'Transporte',
  'Hotelaria',
  'Financas',
  'Marketing',
  'Outros',
];

const CompanySetup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    taxNumber: '',
    registrationNumber: '',
    logo: null as File | null,
    logoDataUrl: '',
    currency: 'MT',
  });
  const [countries, setCountries] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [industries, setIndustries] = useState<string[]>(defaultIndustries);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const industryApi = (import.meta.env.VITE_INDUSTRIES_API as string | undefined) ?? '';
    if (!industryApi) return;

    const loadIndustries = async () => {
      try {
        const response = await fetch(industryApi);
        const payload = await response.json();
        const list = Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []);
        const normalized = list.map((item: { name?: string } | string) => (typeof item === 'string' ? item : item?.name)).filter(Boolean) as string[];
        if (normalized.length > 0) setIndustries(normalized);
      } catch {
        // keep default list
      }
    };

    loadIndustries();
  }, []);

  useEffect(() => {
    const loadCountries = async () => {
      setIsLoadingCountries(true);
      try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries/iso');
        const payload = await response.json();
        const list = Array.isArray(payload?.data)
          ? payload.data.map((item: { name?: string }) => item?.name).filter(Boolean)
          : [];
        setCountries(list);
      } catch {
        setCountries([]);
      } finally {
        setIsLoadingCountries(false);
      }
    };

    loadCountries();
  }, []);

  useEffect(() => {
    const loadCities = async () => {
      if (!formData.country) {
        setCities([]);
        return;
      }

      setIsLoadingCities(true);
      try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries/cities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country: formData.country }),
        });
        const payload = await response.json();
        const list = Array.isArray(payload?.data) ? payload.data : [];
        setCities(list);
      } catch {
        setCities([]);
      } finally {
        setIsLoadingCities(false);
      }
    };

    loadCities();
  }, [formData.country]);

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleLogoUpload = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo must be up to 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setFormData((prev) => ({ ...prev, logo: file, logoDataUrl: result }));
      toast.success('Logo selected successfully.');
    };
    reader.onerror = () => toast.error('Failed to read logo file.');
    reader.readAsDataURL(file);
  };

  const handleComplete = async () => {
    if (!formData.name || !formData.email) {
      toast.error('Company name and business email are required.');
      setCurrentStep(formData.name ? 2 : 1);
      return;
    }

    setIsSubmitting(true);
    try {
      await completeCompanySetup({
        name: formData.name,
        industry: formData.industry,
        website: formData.website,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        tax_number: formData.taxNumber,
        registration_number: formData.registrationNumber,
        logo: formData.logoDataUrl || undefined,
        currency: formData.currency || 'MT',
      });
      toast.success('Company setup completed successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to complete company setup');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">ZK Contabilidade</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      step.id < currentStep
                        ? 'bg-success text-success-foreground'
                        : step.id === currentStep
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {step.id < currentStep ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                  </div>
                  <span className={`text-sm mt-2 font-medium ${
                    step.id <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-full h-1 mx-4 rounded ${
                    step.id < currentStep ? 'bg-success' : 'bg-secondary'
                  }`} style={{ minWidth: '60px' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border/50 p-8 shadow-lg">
          <h2 className="font-display text-2xl font-bold mb-2">
            {steps[currentStep - 1].title}
          </h2>
          <p className="text-muted-foreground mb-8">
            {currentStep === 1 && 'Tell us about your company'}
            {currentStep === 2 && 'How can your clients reach you?'}
            {currentStep === 3 && 'Tax and registration details'}
            {currentStep === 4 && 'Upload your company logo and customize your brand'}
          </p>

          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="companyName"
                    placeholder="Acme Corporation"
                    className="pl-10 h-12"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => setFormData({ ...formData, industry: value })}
                >
                  <SelectTrigger id="industry" className="h-12">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="website"
                    placeholder="https://yourcompany.com"
                    className="pl-10 h-12"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Business Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="contact@company.com"
                      className="pl-10 h-12"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="phone"
                      placeholder="+1 (555) 000-0000"
                      className="pl-10 h-12"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Textarea
                    id="address"
                    placeholder="Street address"
                    className="pl-10 min-h-[80px]"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => setFormData({ ...formData, country: value, city: '' })}
                  >
                    <SelectTrigger id="country" className="h-12" disabled={isLoadingCountries}>
                      <SelectValue placeholder={isLoadingCountries ? 'Loading countries...' : 'Select country'} />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Select
                    value={formData.city}
                    onValueChange={(value) => setFormData({ ...formData, city: value })}
                  >
                    <SelectTrigger id="city" className="h-12" disabled={!formData.country || isLoadingCities}>
                      <SelectValue placeholder={!formData.country ? 'Select country first' : (isLoadingCities ? 'Loading cities...' : 'Select city')} />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="taxNumber">Tax Number / VAT ID</Label>
                <Input
                  id="taxNumber"
                  placeholder="e.g., US123456789"
                  className="h-12"
                  value={formData.taxNumber}
                  onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  This will appear on your invoices
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Company Registration Number</Label>
                <Input
                  id="registrationNumber"
                  placeholder="e.g., 12345678"
                  className="h-12"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                />
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Company Logo</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm font-medium mb-1">
                    Drag and drop your logo here
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    SVG, PNG, JPG up to 2MB
                  </p>
                  <Button variant="outline" size="sm" type="button" onClick={() => logoInputRef.current?.click()}>
                    Browse Files
                  </Button>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                    className="hidden"
                    onChange={(e) => handleLogoUpload(e.target.files?.[0] ?? null)}
                  />
                  {formData.logo && (
                    <p className="text-xs text-muted-foreground mt-2">Selected: {formData.logo.name}</p>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Almost done!</p>
                    <p className="text-sm text-muted-foreground">
                      You can always update these settings later from your dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {currentStep < 4 ? (
              <Button variant="gradient" onClick={handleNext}>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button variant="hero" onClick={handleComplete} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Complete Setup'}
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          <Link to="/dashboard" className="text-primary hover:underline">
            Skip for now
          </Link>
          {' '} - you can complete this later
        </p>
      </main>
    </div>
  );
};

export default CompanySetup;
