import { useEffect, useRef, useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Building2,
  User,
  Bell,
  CreditCard,
  Palette,
  Upload,
} from 'lucide-react';
import { getSettings, saveSettings, SettingsPayload } from '@/lib/business-api';
import { normalizeCurrency } from '@/lib/currency';
import { getStoredThemeMode, setThemeMode, ThemeMode } from '@/lib/theme';
import { toast } from 'sonner';
import { fetchCountries, fetchStates, INDUSTRIES, CURRENCIES, Country, State, Industry } from '@/lib/api-data';
import { getCashierSubscription, getCashierPlans, getCashierUsage, getCashierTrialStatus, startCashierCheckout, cancelCashierSubscription } from '@/lib/cashier-api';

const Settings = () => {
  const [settings, setSettings] = useState<SettingsPayload>({});
  const [isSaving, setIsSaving] = useState(false);
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => getStoredThemeMode());
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  
  // API data states
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [industries] = useState<Industry[]>(INDUSTRIES);
  const [currencies] = useState(CURRENCIES);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [currencyPosition, setCurrencyPosition] = useState<'prefix' | 'suffix'>('suffix');
  
  // Loading states
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  
  // Cashier billing states
  const [subscription, setSubscription] = useState<any>(null);
  const [trialStatus, setTrialStatus] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoadingBilling, setIsLoadingBilling] = useState(false);

  useEffect(() => {
    getSettings()
      .then((data) => {
        setSettings(data);
        // Set initial values for selects
        if (data.company?.country) {
          setSelectedCountry(data.company.country);
        }
        if (data.company?.currency_position) {
          setCurrencyPosition(data.company.currency_position as 'prefix' | 'suffix');
        }
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : 'Failed to load settings'));
    
    // Load countries on mount
    loadCountries();
    
    // Load billing data from Cashier
    loadCashierData();
  }, []);
  
  // Load states when country changes
  useEffect(() => {
    if (selectedCountry) {
      loadStates(selectedCountry);
    } else {
      setStates([]);
    }
  }, [selectedCountry]);
  
  const loadCountries = async () => {
    setIsLoadingCountries(true);
    try {
      const data = await fetchCountries();
      setCountries(data);
    } catch (error) {
      toast.error('Failed to load countries');
    } finally {
      setIsLoadingCountries(false);
    }
  };
  
  const loadStates = async (countryCode: string) => {
    setIsLoadingStates(true);
    try {
      const data = await fetchStates(countryCode);
      setStates(data);
    } catch (error) {
      toast.error('Failed to load states/provinces');
    } finally {
      setIsLoadingStates(false);
    }
  };
  
  const loadCashierData = async () => {
    setIsLoadingBilling(true);
    try {
      // Load all billing data in parallel
      const [subscriptionData, trialData, usageData, plansData] = await Promise.allSettled([
        getCashierSubscription(),
        getCashierTrialStatus(),
        getCashierUsage(),
        getCashierPlans()
      ]);
      
      if (subscriptionData.status === 'fulfilled') {
        setSubscription(subscriptionData.value.data);
      }
      
      if (trialData.status === 'fulfilled') {
        setTrialStatus(trialData.value.data);
      }
      
      if (usageData.status === 'fulfilled') {
        setUsage(usageData.value.data);
      }
      
      if (plansData.status === 'fulfilled') {
        setPlans(plansData.value.data);
      }
    } catch (error) {
      toast.error('Failed to load billing information');
    } finally {
      setIsLoadingBilling(false);
    }
  };
  
  const handleUpgradePlan = async (planId: number) => {
    try {
      const result = await startCashierCheckout(planId);
      if (result.ok && result.data.checkout_url) {
        window.location.href = result.data.checkout_url;
      } else {
        toast.error('Failed to start checkout');
      }
    } catch (error) {
      toast.error('Failed to start checkout');
    }
  };
  
  const handleCancelSubscription = async () => {
    try {
      await cancelCashierSubscription('User requested cancellation');
      toast.success('Subscription cancelled');
      loadCashierData(); // Reload data
    } catch (error) {
      toast.error('Failed to cancel subscription');
    }
  };

  const patchSettings = (partial: SettingsPayload) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const handleSave = async (payload: SettingsPayload, message: string) => {
    setIsSaving(true);
    try {
      await saveSettings(payload);
      patchSettings(payload);
      toast.success(message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleThemeChange = (isDark: boolean) => {
    const nextMode: ThemeMode = isDark ? 'dark' : 'light';
    setThemeModeState(nextMode);
    setThemeMode(nextMode);
    toast.success(`Theme changed to ${nextMode} mode`);
  };

  const handleLogoFile = (file: File | null) => {
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
      patchSettings({ company: { ...settings.company, logo: result, logo_url: result } });
      toast.success('Logo loaded. Save changes to apply.');
    };
    reader.onerror = () => toast.error('Failed to read logo file.');
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="client" />
      <div className="flex-1 flex flex-col">
        <DashboardHeader title="Settings" />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-display font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account and company preferences</p>
          </div>

          <Tabs defaultValue="company" className="space-y-6">
            <TabsList className="grid w-full max-w-2xl grid-cols-5">
              <TabsTrigger value="company" className="gap-2"><Building2 className="w-4 h-4" /><span className="hidden sm:inline">Company</span></TabsTrigger>
              <TabsTrigger value="profile" className="gap-2"><User className="w-4 h-4" /><span className="hidden sm:inline">Profile</span></TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2"><Bell className="w-4 h-4" /><span className="hidden sm:inline">Notifications</span></TabsTrigger>
              <TabsTrigger value="billing" className="gap-2"><CreditCard className="w-4 h-4" /><span className="hidden sm:inline">Billing</span></TabsTrigger>
              <TabsTrigger value="branding" className="gap-2"><Palette className="w-4 h-4" /><span className="hidden sm:inline">Branding</span></TabsTrigger>
            </TabsList>

            <TabsContent value="company">
              <Card>
                <CardHeader><CardTitle>Company Information</CardTitle><CardDescription>Update company details for invoices</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16"><AvatarImage src={settings.company?.logo_url || settings.company?.logo || ''} /><AvatarFallback className="text-sm">LOGO</AvatarFallback></Avatar>
                    <Button variant="outline" className="gap-2" type="button" onClick={() => logoInputRef.current?.click()}><Upload className="w-4 h-4" />Upload Logo</Button>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                      className="hidden"
                      onChange={(e) => handleLogoFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Company Name</Label><Input value={settings.company?.name || ''} onChange={(e) => patchSettings({ company: { ...settings.company, name: e.target.value } })} /></div>
                    <div className="space-y-2"><Label>Tax Number</Label><Input value={settings.company?.tax_number || ''} onChange={(e) => patchSettings({ company: { ...settings.company, tax_number: e.target.value } })} /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Industry</Label>
                      <Select 
                        value={settings.company?.industry || ''} 
                        onValueChange={(value) => patchSettings({ company: { ...settings.company, industry: value } })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {industries.map((industry) => (
                            <SelectItem key={industry.id} value={industry.name}>
                              {industry.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2"><Label>Website</Label><Input value={settings.company?.website || ''} onChange={(e) => patchSettings({ company: { ...settings.company, website: e.target.value } })} /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Select 
                        value={settings.company?.currency || 'MZN'} 
                        onValueChange={(value) => patchSettings({ company: { ...settings.company, currency: value } })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.symbol} - {currency.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Currency Position</Label>
                      <RadioGroup 
                        value={currencyPosition} 
                        onValueChange={(value) => {
                          const position = value as 'prefix' | 'suffix';
                          setCurrencyPosition(position);
                          patchSettings({ company: { ...settings.company, currency_position: position } });
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="prefix" id="prefix" />
                          <Label htmlFor="prefix">Prefix (start)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="suffix" id="suffix" />
                          <Label htmlFor="suffix">Suffix (end)</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="space-y-2"><Label>Business Email</Label><Input type="email" value={settings.company?.email || ''} onChange={(e) => patchSettings({ company: { ...settings.company, email: e.target.value } })} /></div>
                  </div>
                  <div className="space-y-2"><Label>Address</Label><Textarea value={settings.company?.address || ''} onChange={(e) => patchSettings({ company: { ...settings.company, address: e.target.value } })} /></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Phone</Label><Input value={settings.company?.phone || ''} onChange={(e) => patchSettings({ company: { ...settings.company, phone: e.target.value } })} /></div>
                    <div className="space-y-2">
                      <Label>Country</Label>
                      <Select 
                        value={selectedCountry || ''} 
                        onValueChange={(value) => {
                          setSelectedCountry(value);
                          patchSettings({ company: { ...settings.company, country: value, city: '' } });
                        }}
                        disabled={isLoadingCountries}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.cca2} value={country.cca2}>
                              {country.name.common}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>State/Province</Label>
                      <Select 
                        value={settings.company?.city || ''} 
                        onValueChange={(value) => patchSettings({ company: { ...settings.company, city: value } })}
                        disabled={isLoadingStates || states.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={selectedCountry ? "Select state/province" : "Select country first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {states.map((state) => (
                            <SelectItem key={state.id} value={state.name}>
                              {state.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button disabled={isSaving} onClick={() => handleSave({ company: { ...settings.company, currency: normalizeCurrency(settings.company?.currency), currency_position: currencyPosition } }, 'Company settings saved')}>Save Changes</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile">
              <Card>
                <CardHeader><CardTitle>Profile Settings</CardTitle><CardDescription>Update your personal information</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20"><AvatarImage src="" /><AvatarFallback className="text-lg">JD</AvatarFallback></Avatar>
                    <Button variant="outline" className="gap-2"><Upload className="w-4 h-4" />Upload Photo</Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>First Name</Label><Input value={settings.profile?.first_name || ''} onChange={(e) => patchSettings({ profile: { ...settings.profile, first_name: e.target.value } })} /></div>
                    <div className="space-y-2"><Label>Last Name</Label><Input value={settings.profile?.last_name || ''} onChange={(e) => patchSettings({ profile: { ...settings.profile, last_name: e.target.value } })} /></div>
                  </div>
                  <div className="space-y-2"><Label>Email</Label><Input type="email" value={settings.profile?.email || ''} onChange={(e) => patchSettings({ profile: { ...settings.profile, email: e.target.value } })} /></div>
                  <Button disabled={isSaving} onClick={() => handleSave({ profile: settings.profile }, 'Profile settings saved')}>Save Changes</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader><CardTitle>Notification Preferences</CardTitle><CardDescription>Choose what notifications you receive</CardDescription></CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between"><div><Label>Email Notifications</Label></div><Switch checked={settings.notifications?.email_notifications ?? true} onCheckedChange={(v) => patchSettings({ notifications: { ...settings.notifications, email_notifications: v } })} /></div>
                  <div className="flex items-center justify-between"><div><Label>Invoice Reminders</Label></div><Switch checked={settings.notifications?.invoice_reminders ?? true} onCheckedChange={(v) => patchSettings({ notifications: { ...settings.notifications, invoice_reminders: v } })} /></div>
                  <div className="flex items-center justify-between"><div><Label>Payment Alerts</Label></div><Switch checked={settings.notifications?.payment_alerts ?? true} onCheckedChange={(v) => patchSettings({ notifications: { ...settings.notifications, payment_alerts: v } })} /></div>
                  <Button disabled={isSaving} onClick={() => handleSave({ notifications: settings.notifications }, 'Notification preferences saved')}>Save Preferences</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing">
              <Card>
                <CardHeader><CardTitle>Billing & Subscription</CardTitle><CardDescription>Manage your subscription and payment methods</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingBilling ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <>
                      {/* Trial Status Banner */}
                      {trialStatus?.is_active && (
                        <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-orange-800">Trial: {trialStatus.days_remaining} dias restantes</p>
                              <p className="text-sm text-orange-600">Seu trial termina em {new Date(trialStatus.trial_ends_at).toLocaleDateString('pt-BR')}</p>
                            </div>
                            {plans.length > 0 && (
                              <Button onClick={() => handleUpgradePlan(plans[0].id)} className="bg-orange-600 hover:bg-orange-700">
                                Assinar Agora
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Current Subscription */}
                      {subscription && (
                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="font-semibold">Plano Atual</p>
                              <p className="text-sm text-muted-foreground">{subscription.plan_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {subscription.currency} {subscription.amount.toLocaleString()} / {subscription.billing_interval === 'monthly' ? 'mês' : 'ano'}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                                subscription.status === 'trial' ? 'bg-orange-100 text-orange-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {subscription.status === 'active' ? 'Ativo' :
                                 subscription.status === 'trial' ? 'Trial' :
                                 subscription.status}
                              </span>
                            </div>
                          </div>
                          
                          {/* Usage Stats */}
                          {usage && (
                            <div className="space-y-3">
                              <p className="text-sm font-medium mb-2">Uso do Plano</p>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <div className="flex justify-between text-sm">
                                    <span>Faturas</span>
                                    <span>{usage.limits.invoices.used}/{usage.limits.invoices.limit}</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full" 
                                      style={{ width: `${(usage.limits.invoices.used / usage.limits.invoices.limit) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between text-sm">
                                    <span>Clientes</span>
                                    <span>{usage.limits.clients.used}/{usage.limits.clients.limit}</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                    <div 
                                      className="bg-green-600 h-2 rounded-full" 
                                      style={{ width: `${(usage.limits.clients.used / usage.limits.clients.limit) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between text-sm">
                                    <span>Equipe</span>
                                    <span>{usage.limits.team_members.used}/{usage.limits.team_members.limit}</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                    <div 
                                      className="bg-purple-600 h-2 rounded-full" 
                                      style={{ width: `${(usage.limits.team_members.used / usage.limits.team_members.limit) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex gap-2 mt-4">
                            {plans.filter(p => p.id !== subscription.plan_id).length > 0 && (
                              <Button variant="outline" onClick={() => {
                                const upgradePlan = plans.find(p => p.id !== subscription.plan_id);
                                if (upgradePlan) handleUpgradePlan(upgradePlan.id);
                              }}>
                                Alterar Plano
                              </Button>
                            )}
                            {subscription.status === 'active' && (
                              <Button variant="outline" onClick={handleCancelSubscription}>
                                Cancelar
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Available Plans */}
                      {plans.length > 0 && !subscription && (
                        <div className="space-y-4">
                          <p className="font-medium">Planos Disponíveis</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {plans.map((plan) => (
                              <div key={plan.id} className="p-4 rounded-lg border border-border">
                                <h4 className="font-semibold">{plan.name}</h4>
                                <p className="text-2xl font-bold mt-2">
                                  {plan.currency} {(plan.price_cents / 100).toLocaleString()}
                                  <span className="text-sm font-normal text-muted-foreground">
                                    /{plan.billing_interval === 'monthly' ? 'mês' : 'ano'}
                                  </span>
                                </p>
                                {plan.trial_days > 0 && (
                                  <p className="text-sm text-green-600 mt-1">
                                    {plan.trial_days} dias grátis
                                  </p>
                                )}
                                {plan.features && (
                                  <ul className="mt-3 space-y-1 text-sm">
                                    {plan.features.map((feature: string, index: number) => (
                                      <li key={index} className="flex items-center">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                                        {feature}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                                <Button 
                                  className="w-full mt-4" 
                                  onClick={() => handleUpgradePlan(plan.id)}
                                >
                                  Assinar
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="branding">
              <Card>
                <CardHeader><CardTitle>Invoice Branding</CardTitle><CardDescription>Customize invoice visuals</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <Label>Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">Switch between light and dark appearance</p>
                    </div>
                    <Switch checked={themeMode === 'dark'} onCheckedChange={handleThemeChange} />
                  </div>
                  <div className="space-y-2"><Label>Invoice Number Prefix</Label><Input value={settings.branding?.invoice_prefix || ''} onChange={(e) => patchSettings({ branding: { ...settings.branding, invoice_prefix: e.target.value } })} /></div>
                  <div className="space-y-2"><Label>Invoice Footer Text</Label><Textarea value={settings.branding?.invoice_footer || ''} onChange={(e) => patchSettings({ branding: { ...settings.branding, invoice_footer: e.target.value } })} /></div>
                  <Button disabled={isSaving} onClick={() => handleSave({ branding: settings.branding }, 'Branding saved')}>Save Branding</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Settings;
