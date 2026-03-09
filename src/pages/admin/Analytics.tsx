import { useEffect, useMemo, useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, Users, Building2, DollarSign, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { getAdminAnalytics, getAdminDashboard } from '@/lib/admin-api';

const chartConfig = {
  revenue: { label: 'Revenue', color: 'hsl(var(--primary))' },
  newCompanies: { label: 'New Companies', color: 'hsl(var(--success))' },
  users: { label: 'Users', color: 'hsl(var(--info))' },
  invoices: { label: 'Invoices', color: 'hsl(var(--warning))' },
};

const colors = ['hsl(var(--success))', 'hsl(var(--primary))', 'hsl(var(--warning))', 'hsl(var(--info))'];

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<Array<{ month: string; revenue: number; newCompanies: number }>>([]);
  const [planDistribution, setPlanDistribution] = useState<Array<{ name: string; value: number; color: string }>>([]);
  const [invoiceVolume, setInvoiceVolume] = useState<Array<{ day: string; invoices: number }>>([]);
  const [totals, setTotals] = useState({ users: 0, activeCompanies: 0, monthlyRevenue: 0, activeSubscriptions: 0 });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [analytics, dashboard] = await Promise.all([getAdminAnalytics(), getAdminDashboard()]);
        setRevenueData(analytics.revenueData ?? []);
        setInvoiceVolume(analytics.invoiceVolume ?? []);
        setPlanDistribution(
          (analytics.planDistribution ?? []).map((item, index) => ({
            ...item,
            color: colors[index % colors.length],
          }))
        );
        setTotals({
          users: Number(dashboard.totals?.users ?? 0),
          activeCompanies: Number(dashboard.totals?.active_companies ?? 0),
          monthlyRevenue: Number(dashboard.totals?.monthly_revenue ?? 0),
          activeSubscriptions: Number(dashboard.totals?.active_subscriptions ?? 0),
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const totalInvoices = useMemo(() => invoiceVolume.reduce((acc, row) => acc + Number(row.invoices ?? 0), 0), [invoiceVolume]);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userType="local" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="Analytics" subtitle="Platform performance metrics" />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Monthly Revenue</p>
                    <p className="text-2xl font-bold">${totals.monthlyRevenue.toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-success text-sm mt-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>{loading ? 'Loading...' : 'Live from API'}</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Active Companies</p>
                    <p className="text-2xl font-bold">{totals.activeCompanies.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Users</p>
                    <p className="text-2xl font-bold">{totals.users.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-info" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Invoices This Week</p>
                    <p className="text-2xl font-bold">{totalInvoices.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader><CardTitle>Revenue Trend</CardTitle></CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(value) => `$${value / 1000}k`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" strokeWidth={2} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>New Company Registrations</CardTitle></CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="newCompanies" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Plan Distribution</CardTitle></CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px]">
                  <PieChart>
                    <Pie data={planDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                      {planDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Daily Invoice Volume</CardTitle></CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px]">
                  <LineChart data={invoiceVolume}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="invoices" stroke="hsl(var(--warning))" strokeWidth={2} dot={{ fill: 'hsl(var(--warning))' }} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;
