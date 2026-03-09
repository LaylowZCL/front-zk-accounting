import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Key,
  Smartphone,
  Monitor,
  MapPin,
  Clock,
  CheckCircle2,
  Eye,
  EyeOff,
  LogOut,
  Loader2,
} from 'lucide-react';
import { ApiError, ApiSession, changePassword, listSecurityEvents, listSessions, revokeOtherSessions, revokeSession } from '@/lib/api';
import { PasswordChangeFormValues, passwordChangeSchema } from '@/lib/validators';

interface SecuritySettingsPageProps {
  userType: 'local' | 'client';
}

const SecuritySettingsPage = ({ userType }: SecuritySettingsPageProps) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions, setSessions] = useState<ApiSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isRevokingAll, setIsRevokingAll] = useState(false);
  const [securityEvents, setSecurityEvents] = useState<Array<{ id: string; event: string; date: string; status: 'success' | 'warning' }>>([]);

  const form = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  const loadSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const data = await listSessions();
      setSessions(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao carregar sessões';
      toast.error(message);
      setSessions([]);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  useEffect(() => {
    loadSessions();
    listSecurityEvents()
      .then((events) => setSecurityEvents(events))
      .catch(() => setSecurityEvents([]));
  }, []);

  const handleChangePassword = async (values: PasswordChangeFormValues) => {
    try {
      await changePassword({
        current_password: values.currentPassword,
        password: values.newPassword,
        password_confirmation: values.confirmPassword,
      });
      toast.success('Password alterada com sucesso');
      form.reset();
    } catch (error) {
      if (error instanceof ApiError && error.errors) {
        Object.entries(error.errors).forEach(([field, messages]) => {
          const message = messages?.[0];
          if (!message) return;
          if (field === 'current_password') form.setError('currentPassword', { message });
          if (field === 'password') form.setError('newPassword', { message });
          if (field === 'password_confirmation') form.setError('confirmPassword', { message });
        });
      }
      const message = error instanceof Error ? error.message : 'Não foi possível alterar a password';
      toast.error(message);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSession(sessionId);
      toast.success('Sessão revogada com sucesso');
      await loadSessions();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao revogar sessão';
      toast.error(message);
    }
  };

  const handleRevokeAllSessions = async () => {
    setIsRevokingAll(true);
    try {
      await revokeOtherSessions();
      toast.success('Sessões revogadas com sucesso');
      await loadSessions();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao revogar sessões';
      toast.error(message);
    } finally {
      setIsRevokingAll(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar userType={userType} />
      <div className="flex-1 flex flex-col">
        <DashboardHeader title="Security" />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-display font-bold">Security Settings</h1>
              <p className="text-muted-foreground">Manage your account security and authentication</p>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Key className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your password regularly to keep your account secure</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={form.handleSubmit(handleChangePassword)} noValidate>
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        className={form.formState.errors.currentPassword ? 'border-destructive' : ''}
                        {...form.register('currentPassword')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {form.formState.errors.currentPassword && (
                      <p className="text-xs text-destructive">{form.formState.errors.currentPassword.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          className={form.formState.errors.newPassword ? 'border-destructive' : ''}
                          {...form.register('newPassword')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {form.formState.errors.newPassword && (
                        <p className="text-xs text-destructive">{form.formState.errors.newPassword.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          className={form.formState.errors.confirmPassword ? 'border-destructive' : ''}
                          {...form.register('confirmPassword')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {form.formState.errors.confirmPassword && (
                        <p className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Password must be at least 8 characters long with a mix of letters and numbers
                  </p>

                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'A atualizar...' : 'Update Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Smartphone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Two-Factor Authentication</CardTitle>
                      <CardDescription>Add an extra layer of security to your account</CardDescription>
                    </div>
                  </div>
                  <Badge variant={twoFactorEnabled ? 'default' : 'secondary'}>{twoFactorEnabled ? 'Enabled' : 'Disabled'}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div>
                    <p className="font-medium">Protect your account with 2FA</p>
                    <p className="text-sm text-muted-foreground">Backend 2FA endpoint is not configured yet.</p>
                  </div>
                  <Button variant="outline" onClick={() => setTwoFactorEnabled((prev) => !prev)}>
                    {twoFactorEnabled ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Monitor className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Active Sessions</CardTitle>
                      <CardDescription>Manage devices where you're currently logged in</CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleRevokeAllSessions} disabled={isRevokingAll || isLoadingSessions}>
                    {isRevokingAll ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LogOut className="h-4 w-4 mr-2" />}
                    Revoke All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingSessions ? (
                  <div className="py-8 text-center text-muted-foreground text-sm">Loading sessions...</div>
                ) : sessions.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground text-sm">No active sessions found.</div>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                        <div className="flex items-center gap-4">
                          <Monitor className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{session.device}</p>
                              {session.current && (
                                <Badge variant="outline" className="text-xs">
                                  Current
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {session.location || 'Unknown location'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {session.last_active || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                        {!session.current && (
                          <Button variant="ghost" size="sm" onClick={() => handleRevokeSession(session.id)}>
                            Revoke
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Log</CardTitle>
                <CardDescription>Recent security events on your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {securityEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                      <div className="flex items-center gap-3">
                        {event.status === 'success' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className="text-sm">{event.event}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{event.date}</span>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <p className="text-xs text-muted-foreground">Security log loaded from backend activity events.</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SecuritySettingsPage;
