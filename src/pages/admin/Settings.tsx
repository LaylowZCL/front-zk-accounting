import { useEffect, useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save, Mail, Shield, Bell, Palette, Globe, Database } from 'lucide-react';
import { getAdminSettings, updateAdminSettings } from '@/lib/admin-api';

const AdminSettings = () => {
  const [general, setGeneral] = useState({
    platformName: 'BillFlow',
    supportEmail: 'support@billflow.com',
    platformDescription: 'Professional invoicing and billing platform for modern businesses.',
    defaultCurrency: 'USD',
    defaultTimezone: 'UTC',
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.example.com',
    smtpPort: '587',
    smtpUser: 'noreply@billflow.com',
    fromName: 'BillFlow',
    fromEmail: 'noreply@billflow.com',
  });

  const [notifications, setNotifications] = useState({
    newSignups: true,
    failedPayments: true,
    supportTickets: true,
    systemAlerts: true,
    weeklyReport: false,
    monthlyReport: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorRequired: false,
    sessionTimeout: '30',
    maxLoginAttempts: '5',
    passwordMinLength: '8',
  });

  const [appearance, setAppearance] = useState({
    primaryColor: '#6366f1',
    logoUrl: '',
    faviconUrl: '',
  });

  const [databaseInfo, setDatabaseInfo] = useState({
    status: 'connected',
    host: 'db.billflow.com',
    name: 'billflow_production',
    size: '2.4 GB',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAdminSettings();

        if (data.general) {
          setGeneral({
            platformName: data.general.platform_name ?? 'BillFlow',
            supportEmail: data.general.support_email ?? 'support@billflow.com',
            platformDescription: data.general.platform_description ?? 'Professional invoicing and billing platform for modern businesses.',
            defaultCurrency: data.general.default_currency ?? 'USD',
            defaultTimezone: data.general.default_timezone ?? 'UTC',
          });
        }

        if (data.email) {
          setEmailSettings({
            smtpHost: data.email.smtp_host ?? 'smtp.example.com',
            smtpPort: data.email.smtp_port ?? '587',
            smtpUser: data.email.smtp_user ?? 'noreply@billflow.com',
            fromName: data.email.from_name ?? 'BillFlow',
            fromEmail: data.email.from_email ?? 'noreply@billflow.com',
          });
        }

        if (data.notifications) {
          setNotifications({
            newSignups: Boolean(data.notifications.new_signups ?? true),
            failedPayments: Boolean(data.notifications.failed_payments ?? true),
            supportTickets: Boolean(data.notifications.support_tickets ?? true),
            systemAlerts: Boolean(data.notifications.system_alerts ?? true),
            weeklyReport: Boolean(data.notifications.weekly_report ?? false),
            monthlyReport: Boolean(data.notifications.monthly_report ?? true),
          });
        }

        if (data.security) {
          setSecuritySettings({
            twoFactorRequired: Boolean(data.security.two_factor_required ?? false),
            sessionTimeout: String(data.security.session_timeout ?? '30'),
            maxLoginAttempts: String(data.security.max_login_attempts ?? '5'),
            passwordMinLength: String(data.security.password_min_length ?? '8'),
          });
        }

        if (data.appearance) {
          setAppearance({
            primaryColor: data.appearance.primary_color ?? '#6366f1',
            logoUrl: data.appearance.logo_url ?? '',
            faviconUrl: data.appearance.favicon_url ?? '',
          });
        }

        if (data.database) {
          setDatabaseInfo({
            status: data.database.status ?? 'connected',
            host: data.database.host ?? 'db.billflow.com',
            name: data.database.name ?? 'billflow_production',
            size: data.database.size ?? '2.4 GB',
          });
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load admin settings');
      }
    };

    load();
  }, []);

  const handleSaveGeneral = async () => {
    try {
      await updateAdminSettings({
        general: {
          platform_name: general.platformName,
          support_email: general.supportEmail,
          platform_description: general.platformDescription,
          default_currency: general.defaultCurrency,
          default_timezone: general.defaultTimezone,
        },
      });
      toast.success('Settings saved');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save general settings');
    }
  };

  const handleSaveEmail = async () => {
    try {
      await updateAdminSettings({
        email: {
          smtp_host: emailSettings.smtpHost,
          smtp_port: emailSettings.smtpPort,
          smtp_user: emailSettings.smtpUser,
          from_name: emailSettings.fromName,
          from_email: emailSettings.fromEmail,
        },
      });
      toast.success('Email settings saved successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save email settings');
    }
  };

  const handleSaveNotifications = async () => {
    try {
      await updateAdminSettings({
        notifications: {
          new_signups: notifications.newSignups,
          failed_payments: notifications.failedPayments,
          support_tickets: notifications.supportTickets,
          system_alerts: notifications.systemAlerts,
          weekly_report: notifications.weeklyReport,
          monthly_report: notifications.monthlyReport,
        },
      });
      toast.success('Notification preferences saved');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save notification settings');
    }
  };

  const handleSaveSecurity = async () => {
    try {
      await updateAdminSettings({
        security: {
          two_factor_required: securitySettings.twoFactorRequired,
          session_timeout: securitySettings.sessionTimeout,
          max_login_attempts: securitySettings.maxLoginAttempts,
          password_min_length: securitySettings.passwordMinLength,
        },
      });
      toast.success('Security settings updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save security settings');
    }
  };

  const handleSaveAppearance = async () => {
    try {
      await updateAdminSettings({
        appearance: {
          primary_color: appearance.primaryColor,
          logo_url: appearance.logoUrl,
          favicon_url: appearance.faviconUrl,
        },
      });
      toast.success('Appearance settings saved');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save appearance settings');
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userType="local" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="Admin Settings" subtitle="Configure platform settings" />

        <main className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="bg-card border">
              <TabsTrigger value="general" className="gap-2">
                <Globe className="w-4 h-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="email" className="gap-2">
                <Mail className="w-4 h-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Shield className="w-4 h-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="appearance" className="gap-2">
                <Palette className="w-4 h-4" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="database" className="gap-2">
                <Database className="w-4 h-4" />
                Database
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Configure basic platform settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Platform Name</Label>
                      <Input value={general.platformName} onChange={(e) => setGeneral({ ...general, platformName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Support Email</Label>
                      <Input value={general.supportEmail} onChange={(e) => setGeneral({ ...general, supportEmail: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Platform Description</Label>
                    <Textarea value={general.platformDescription} onChange={(e) => setGeneral({ ...general, platformDescription: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Default Currency</Label>
                      <select className="w-full h-10 px-3 rounded-md border border-input bg-background" value={general.defaultCurrency} onChange={(e) => setGeneral({ ...general, defaultCurrency: e.target.value })}>
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Default Timezone</Label>
                      <select className="w-full h-10 px-3 rounded-md border border-input bg-background" value={general.defaultTimezone} onChange={(e) => setGeneral({ ...general, defaultTimezone: e.target.value })}>
                        <option value="UTC">UTC</option>
                        <option value="EST">Eastern Time</option>
                        <option value="PST">Pacific Time</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSaveGeneral}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email">
              <Card>
                <CardHeader>
                  <CardTitle>Email Configuration</CardTitle>
                  <CardDescription>Configure SMTP settings for outgoing emails</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>SMTP Host</Label>
                      <Input value={emailSettings.smtpHost} onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>SMTP Port</Label>
                      <Input value={emailSettings.smtpPort} onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>SMTP Username</Label>
                    <Input value={emailSettings.smtpUser} onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>SMTP Password</Label>
                    <Input type="password" placeholder="Enter password" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>From Name</Label>
                      <Input value={emailSettings.fromName} onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>From Email</Label>
                      <Input value={emailSettings.fromEmail} onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => toast.info('Test email sent')}>
                      Send Test Email
                    </Button>
                    <Button onClick={handleSaveEmail}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Email Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Admin Notifications</CardTitle>
                  <CardDescription>Configure which notifications you receive</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Real-time Alerts</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>New User Signups</Label>
                          <p className="text-sm text-muted-foreground">Get notified when new users register</p>
                        </div>
                        <Switch checked={notifications.newSignups} onCheckedChange={(checked) => setNotifications({ ...notifications, newSignups: checked })} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Failed Payments</Label>
                          <p className="text-sm text-muted-foreground">Get notified about payment failures</p>
                        </div>
                        <Switch checked={notifications.failedPayments} onCheckedChange={(checked) => setNotifications({ ...notifications, failedPayments: checked })} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Support Tickets</Label>
                          <p className="text-sm text-muted-foreground">Get notified about new support tickets</p>
                        </div>
                        <Switch checked={notifications.supportTickets} onCheckedChange={(checked) => setNotifications({ ...notifications, supportTickets: checked })} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>System Alerts</Label>
                          <p className="text-sm text-muted-foreground">Critical system notifications</p>
                        </div>
                        <Switch checked={notifications.systemAlerts} onCheckedChange={(checked) => setNotifications({ ...notifications, systemAlerts: checked })} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-medium">Reports</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Weekly Report</Label>
                          <p className="text-sm text-muted-foreground">Receive a weekly summary</p>
                        </div>
                        <Switch checked={notifications.weeklyReport} onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReport: checked })} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Monthly Report</Label>
                          <p className="text-sm text-muted-foreground">Receive a monthly summary</p>
                        </div>
                        <Switch checked={notifications.monthlyReport} onCheckedChange={(checked) => setNotifications({ ...notifications, monthlyReport: checked })} />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSaveNotifications}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Configure platform security options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Require 2FA for all admin users</p>
                    </div>
                    <Switch checked={securitySettings.twoFactorRequired} onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorRequired: checked })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="space-y-2">
                      <Label>Session Timeout (minutes)</Label>
                      <Input type="number" value={securitySettings.sessionTimeout} onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Login Attempts</Label>
                      <Input type="number" value={securitySettings.maxLoginAttempts} onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum Password Length</Label>
                    <Input type="number" value={securitySettings.passwordMinLength} onChange={(e) => setSecuritySettings({ ...securitySettings, passwordMinLength: e.target.value })} />
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSaveSecurity}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Security Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>Customize the platform appearance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Primary Color</Label>
                    <div className="flex gap-2">
                      <Input type="color" className="w-16 h-10 p-1" value={appearance.primaryColor} onChange={(e) => setAppearance({ ...appearance, primaryColor: e.target.value })} />
                      <Input value={appearance.primaryColor} className="flex-1" onChange={(e) => setAppearance({ ...appearance, primaryColor: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Logo URL</Label>
                    <Input placeholder="https://example.com/logo.png" value={appearance.logoUrl} onChange={(e) => setAppearance({ ...appearance, logoUrl: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Favicon URL</Label>
                    <Input placeholder="https://example.com/favicon.ico" value={appearance.faviconUrl} onChange={(e) => setAppearance({ ...appearance, faviconUrl: e.target.value })} />
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSaveAppearance}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Appearance
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="database">
              <Card>
                <CardHeader>
                  <CardTitle>Database Management</CardTitle>
                  <CardDescription>Database maintenance and backup options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 rounded-lg bg-secondary/50 border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Database Status</span>
                      <span className="text-sm text-success">{databaseInfo.status}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Host: {databaseInfo.host}</p>
                      <p>Database: {databaseInfo.name}</p>
                      <p>Size: {databaseInfo.size}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => toast.info('Backup started')}>
                      Create Backup
                    </Button>
                    <Button variant="outline" onClick={() => toast.info('Opening backup history')}>
                      View Backup History
                    </Button>
                  </div>
                  <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                    <h4 className="font-medium text-destructive mb-2">Danger Zone</h4>
                    <p className="text-sm text-muted-foreground mb-4">These actions are irreversible. Please be careful.</p>
                    <Button variant="destructive" onClick={() => toast.warning('This action requires confirmation')}>
                      Clear Cache
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default AdminSettings;
