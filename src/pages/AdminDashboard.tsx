import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatCard from '@/components/dashboard/StatCard';
import { Users, Building2, Package, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const recentActivity = [
  { type: 'user', message: 'New user registered: john@techcorp.com', time: '2 mins ago' },
  { type: 'company', message: 'TechStart Inc upgraded to Professional plan', time: '15 mins ago' },
  { type: 'alert', message: 'Payment failed for Global Solutions', time: '1 hour ago' },
  { type: 'user', message: 'Account unlocked: sarah@startupxyz.com', time: '2 hours ago' },
  { type: 'company', message: 'New company registered: Digital Dynamics', time: '3 hours ago' },
];

const activityIcons = {
  user: Users,
  company: Building2,
  alert: AlertCircle,
};

const AdminDashboard = () => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar userType="local" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          title="Admin Dashboard"
          subtitle="System overview and management"
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value="2,847"
              change="+124 this week"
              changeType="positive"
              icon={Users}
              iconColor="from-primary to-purple-600"
            />
            <StatCard
              title="Active Companies"
              value="456"
              change="+28 this month"
              changeType="positive"
              icon={Building2}
              iconColor="from-success to-emerald-400"
            />
            <StatCard
              title="Active Subscriptions"
              value="398"
              change="$45,600 MRR"
              changeType="neutral"
              icon={Package}
              iconColor="from-info to-cyan-400"
            />
            <StatCard
              title="Monthly Revenue"
              value="$52,400"
              change="+18% growth"
              changeType="positive"
              icon={TrendingUp}
              iconColor="from-warning to-orange-400"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-card rounded-xl border border-border/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-semibold text-lg">Recent Activity</h2>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
              
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const Icon = activityIcons[activity.type as keyof typeof activityIcons] || Users;
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activity.type === 'alert' ? 'bg-destructive/10' : 'bg-primary/10'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          activity.type === 'alert' ? 'text-destructive' : 'text-primary'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{activity.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* System Status */}
            <div className="bg-card rounded-xl border border-border/50 p-6">
              <h2 className="font-display font-semibold text-lg mb-6">System Status</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span className="text-sm font-medium">API Services</span>
                  </div>
                  <span className="text-xs text-success font-medium">Operational</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span className="text-sm font-medium">Database</span>
                  </div>
                  <span className="text-xs text-success font-medium">Operational</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span className="text-sm font-medium">Email Service</span>
                  </div>
                  <span className="text-xs text-success font-medium">Operational</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-warning" />
                    <span className="text-sm font-medium">Payment Gateway</span>
                  </div>
                  <span className="text-xs text-warning font-medium">Degraded</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-8">
                <h3 className="font-semibold mb-4">Today's Overview</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-secondary/50 text-center">
                    <p className="text-2xl font-bold">24</p>
                    <p className="text-xs text-muted-foreground">New Signups</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50 text-center">
                    <p className="text-2xl font-bold">$2.4k</p>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50 text-center">
                    <p className="text-2xl font-bold">8</p>
                    <p className="text-xs text-muted-foreground">Support Tickets</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50 text-center">
                    <p className="text-2xl font-bold">99.9%</p>
                    <p className="text-xs text-muted-foreground">Uptime</p>
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
