import { useEffect, useState } from 'react';
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
import {
  Building2,
  User,
  Bell,
  CreditCard,
  Palette,
  Upload,
} from 'lucide-react';
import { getSettings, saveSettings, SettingsPayload } from '@/lib/business-api';
import { toast } from 'sonner';

const Settings = () => {
  const [settings, setSettings] = useState<SettingsPayload>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getSettings()
      .then((data) => setSettings(data))
      .catch((error) => toast.error(error instanceof Error ? error.message : 'Failed to load settings'));
  }, []);

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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Company Name</Label><Input value={settings.company?.name || ''} onChange={(e) => patchSettings({ company: { ...settings.company, name: e.target.value } })} /></div>
                    <div className="space-y-2"><Label>Tax Number</Label><Input value={settings.company?.tax_number || ''} onChange={(e) => patchSettings({ company: { ...settings.company, tax_number: e.target.value } })} /></div>
                  </div>
                  <div className="space-y-2"><Label>Address</Label><Textarea value={settings.company?.address || ''} onChange={(e) => patchSettings({ company: { ...settings.company, address: e.target.value } })} /></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Phone</Label><Input value={settings.company?.phone || ''} onChange={(e) => patchSettings({ company: { ...settings.company, phone: e.target.value } })} /></div>
                    <div className="space-y-2"><Label>Business Email</Label><Input type="email" value={settings.company?.email || ''} onChange={(e) => patchSettings({ company: { ...settings.company, email: e.target.value } })} /></div>
                  </div>
                  <Button disabled={isSaving} onClick={() => handleSave({ company: settings.company }, 'Company settings saved')}>Save Changes</Button>
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
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="font-semibold">Plan data comes from backend billing endpoints</p>
                    <p className="text-sm text-muted-foreground">Use landing pricing for checkout management.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="branding">
              <Card>
                <CardHeader><CardTitle>Invoice Branding</CardTitle><CardDescription>Customize invoice visuals</CardDescription></CardHeader>
                <CardContent className="space-y-4">
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
