import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

const steps = [
  { id: 1, title: 'Company Info', icon: Building2 },
  { id: 2, title: 'Contact Details', icon: Phone },
  { id: 3, title: 'Tax & Legal', icon: FileText },
  { id: 4, title: 'Branding', icon: Upload },
];

const CompanySetup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '',
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
  });

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleComplete = () => {
    console.log('Setup complete:', formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">BillFlow</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Progress Steps */}
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

        {/* Form Card */}
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

          {/* Step 1: Company Info */}
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
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  placeholder="e.g., Technology, Consulting, Retail"
                  className="h-12"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                />
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

          {/* Step 2: Contact Details */}
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
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    className="h-12"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    placeholder="Country"
                    className="h-12"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Tax & Legal */}
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

          {/* Step 4: Branding */}
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
                  <Button variant="outline" size="sm">
                    Browse Files
                  </Button>
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

          {/* Navigation */}
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
              <Button variant="hero" onClick={handleComplete}>
                Complete Setup
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Skip Link */}
        <p className="text-center mt-6 text-sm text-muted-foreground">
          <Link to="/dashboard" className="text-primary hover:underline">
            Skip for now
          </Link>
          {' '}— you can complete this later
        </p>
      </main>
    </div>
  );
};

export default CompanySetup;
