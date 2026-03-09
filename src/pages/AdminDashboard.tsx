import { useEffect, useMemo, useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatCard from '@/components/dashboard/StatCard';
import { Users, Building2, Package, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getAdminDashboard } from '@/lib/admin-api';

type ActivityRow = {
  message: string;
  time: string;
  type: 'user' | 'company' | 'alert';
};

const activityIcons = {
  user: Users,
  company: Building2,
  alert: AlertCircle,
};

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [totals, setTotals] = useState({
    users: 0,
    activeCompanies: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
  });
  const [activities, setActivities] = useState<ActivityRow[]>([]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await getAdminDashboard();
        setTotals({
          users: Number(data.totals?.users ?? 0),
          activeCompanies: Number(data.totals?.active_companies ?? 0),
          activeSubscriptions: Number(data.totals?.active_subscriptions ?? 0),
          monthlyRevenue: Number(data.totals?.monthly_revenue ?? 0),
        });

        const normalized = (data.recent_activity ?? []).map((row) => {
          const message = row.description || row.event || row.log_name || 'Platform activity';
          const lower = message.toLowerCase();
          const type: ActivityRow['type'] =
            lower.includes('payment') || lower.includes('error') || lower.includes('fail')
              ? 'alert'
              : lower.includes('company')
                ? 'company'
                : 'user';

          return {
            message,
            time: row.created_at ? new Date(row.created_at).toLocaleString() : 'Recently',
            type,
          };
        });

        setActivities(normalized);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load admin dashboard');
        setActivities([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const todayRevenue = useMemo(() => Math.round(totals.monthlyRevenue / 30), [totals.monthlyRevenue]);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userType="local" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="Admin Dashboard" subtitle="System overview and management" />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={totals.users.toLocaleString()}
              change={isLoading ? 'Loading...' : 'Live from API'}
              changeType="neutral"
              icon={Users}
              iconColor="from-primary to-purple-600"
            />
            <StatCard
              title="Active Companies"
              value={totals.activeCompanies.toLocaleString()}
              change={isLoading ? 'Loading...' : 'Live from API'}
              changeType="neutral"
              icon={Building2}
              iconColor="from-success to-emerald-400"
            />
            <StatCard
              title="Active Subscriptions"
              value={totals.activeSubscriptions.toLocaleString()}
              change={isLoading ? 'Loading...' : 'Live from API'}
              changeType="neutral"
              icon={Package}
              iconColor="from-info to-cyan-400"
            />
            <StatCard
              title="Monthly Revenue"
              value={`$${totals.monthlyRevenue.toLocaleString()}`}
              change={isLoading ? 'Loading...' : 'Live from API'}
              changeType="positive"
              icon={TrendingUp}
              iconColor="from-warning to-orange-400"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-card rounded-xl border border-border/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-semibold text-lg">Recent Activity</h2>
                <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>Refresh</Button>
              </div>

              <div className="space-y-4">
                {activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent activity found.</p>
                ) : (
                  activities.map((activity, index) => {
                    const Icon = activityIcons[activity.type] || Users;
                    return (
                      <div
                        key={`${activity.time}-${index}`}
                        className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          activity.type === 'alert' ? 'bg-destructive/10' : 'bg-primary/10'
                        }`}>
                          <Icon className={`w-5 h-5 ${activity.type === 'alert' ? 'text-destructive' : 'text-primary'}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{activity.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border/50 p-6">
              <h2 className="font-display font-semibold text-lg mb-6">System Status</h2>

              <div className="space-y-4">
                {['API Services', 'Database', 'Email Service'].map((name) => (
                  <div key={name} className="flex items-center justify-between p-3 rounded-lg bg-success/10">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span className="text-sm font-medium">{name}</span>
                    </div>
                    <span className="text-xs text-success font-medium">Operational</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <h3 className="font-semibold mb-4">Today Overview</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-secondary/50 text-center">
                    <p className="text-2xl font-bold">{Math.max(activities.length, 0)}</p>
                    <p className="text-xs text-muted-foreground">Activity Logs</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50 text-center">
                    <p className="text-2xl font-bold">${todayRevenue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Daily Avg Revenue</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50 text-center">
                    <p className="text-2xl font-bold">{totals.activeCompanies}</p>
                    <p className="text-xs text-muted-foreground">Active Companies</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50 text-center">
                    <p className="text-2xl font-bold">{totals.users}</p>
                    <p className="text-xs text-muted-foreground">Total Users</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
