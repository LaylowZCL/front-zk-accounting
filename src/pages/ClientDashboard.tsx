import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatCard from '@/components/dashboard/StatCard';
import { FileText, Users, CreditCard, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { DashboardSummary, getDashboardSummary, getSettings } from '@/lib/business-api';
import { formatMoney } from '@/lib/currency';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const fallbackSummary: DashboardSummary = {
  totalRevenue: 45230,
  pendingInvoices: 12,
  pendingAmount: 8400,
  totalClients: 48,
  paidThisMonth: 12800,
  paidInvoicesThisMonth: 24,
  recentInvoices: [
    { id: 'INV-001', client: 'Acme Corp', amount: 2450, status: 'paid', date: 'Dec 28, 2024' },
    { id: 'INV-002', client: 'TechStart Inc', amount: 1800, status: 'pending', date: 'Dec 27, 2024' },
    { id: 'INV-003', client: 'Global Solutions', amount: 3200, status: 'overdue', date: 'Dec 20, 2024' },
    { id: 'INV-004', client: 'StartupXYZ', amount: 950, status: 'paid', date: 'Dec 18, 2024' },
  ],
  revenueByMonth: [
    { month: 'Jan', revenue: 12400 }, { month: 'Feb', revenue: 15600 }, { month: 'Mar', revenue: 18200 }, { month: 'Apr', revenue: 14800 },
    { month: 'May', revenue: 22100 }, { month: 'Jun', revenue: 19500 }, { month: 'Jul', revenue: 24300 }, { month: 'Aug', revenue: 21700 },
    { month: 'Sep', revenue: 26400 }, { month: 'Oct', revenue: 28900 }, { month: 'Nov', revenue: 32100 }, { month: 'Dec', revenue: 45230 },
  ],
  invoiceStatus: [
    { name: 'Paid', value: 65 },
    { name: 'Pending', value: 25 },
    { name: 'Overdue', value: 10 },
  ],
  weeklyActivity: [
    { day: 'Mon', invoices: 5, payments: 3 }, { day: 'Tue', invoices: 8, payments: 6 }, { day: 'Wed', invoices: 4, payments: 4 },
    { day: 'Thu', invoices: 12, payments: 8 }, { day: 'Fri', invoices: 7, payments: 5 }, { day: 'Sat', invoices: 2, payments: 2 }, { day: 'Sun', invoices: 1, payments: 1 },
  ],
};

const statusColors = {
  paid: 'bg-success/15 text-success',
  pending: 'bg-warning/15 text-warning',
  overdue: 'bg-destructive/15 text-destructive',
};

const chartConfig = {
  revenue: { label: 'Revenue', color: 'hsl(var(--primary))' },
  invoices: { label: 'Invoices', color: 'hsl(var(--accent))' },
  payments: { label: 'Payments', color: 'hsl(var(--primary))' },
};

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary>(fallbackSummary);
  const [currency, setCurrency] = useState('MT');
  const [headerSearch, setHeaderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    Promise.all([getDashboardSummary(), getSettings()])
      .then(([data, settings]) => {
        setSummary(data);
        setCurrency(settings.company?.currency || 'MT');
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to load dashboard summary');
      });
  }, []);

  const invoiceStatusData = useMemo(
    () => summary.invoiceStatus.map((item) => ({ ...item, color: item.name === 'Paid' ? 'hsl(var(--success))' : item.name === 'Pending' ? 'hsl(var(--accent))' : 'hsl(var(--destructive))' })),
    [summary.invoiceStatus]
  );

  const filteredRecentInvoices = useMemo(() => {
    const query = headerSearch.trim().toLowerCase();
    return summary.recentInvoices.filter((invoice) => {
      const matchesSearch =
        !query ||
        invoice.id.toLowerCase().includes(query) ||
        invoice.client.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [summary.recentInvoices, headerSearch, statusFilter]);

  const headerNotifications = useMemo(
    () => summary.recentInvoices.slice(0, 5).map((invoice) => ({
      id: invoice.id,
      title: `${invoice.id} - ${invoice.client}`,
      description: `Status: ${invoice.status} | ${formatMoney(invoice.amount, currency)}`,
      time: invoice.date,
      unread: invoice.status !== 'paid',
    })),
    [summary.recentInvoices, currency]
  );

  const handleNewInvoice = () => {
    navigate('/dashboard/invoices?new=true');
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="client" />

      <div className="flex-1 flex flex-col overflow-hidden pb-6">
        <DashboardHeader
          title="Dashboard"
          subtitle={`Welcome back, ${user?.name?.split(' ')[0] || 'User'}`}
          showCreateButton
          createButtonLabel="New Invoice"
          onCreateClick={handleNewInvoice}
          searchValue={headerSearch}
          onSearchChange={setHeaderSearch}
          onSearchSubmit={setHeaderSearch}
          filterOptions={[
            { value: 'all', label: 'All Statuses' },
            { value: 'paid', label: 'Paid' },
            { value: 'pending', label: 'Pending' },
            { value: 'overdue', label: 'Overdue' },
          ]}
          activeFilter={statusFilter}
          onFilterChange={setStatusFilter}
          notifications={headerNotifications}
          onNotificationClick={() => navigate('/dashboard/invoices')}
        />

        <main className="flex-1 overflow-y-auto px-4 lg:px-6 pt-4 space-y-6">
          <div className="surface-panel p-5 lg:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Weekly performance</p>
                <h2 className="font-display text-3xl">{formatMoney(summary.totalRevenue, currency)}</h2>
              </div>
              <div className="w-full max-w-md space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Collections target</span>
                  <span>{Math.min(100, Math.round((summary.paidThisMonth / Math.max(summary.totalRevenue, 1)) * 100))}%</span>
                </div>
                <div className="progress-track h-2.5">
                  <div className="progress-value" style={{ width: `${Math.min(100, Math.round((summary.paidThisMonth / Math.max(summary.totalRevenue, 1)) * 100))}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
            <StatCard title="Total Revenue" value={formatMoney(summary.totalRevenue, currency)} change="Updated from backend" changeType="positive" icon={TrendingUp} iconColor="from-primary to-accent" />
            <StatCard title="Pending Invoices" value={String(summary.pendingInvoices)} change={`${formatMoney(summary.pendingAmount, currency)} outstanding`} changeType="neutral" icon={Clock} iconColor="from-accent to-warning" />
            <StatCard title="Total Clients" value={String(summary.totalClients)} change="Updated from backend" changeType="positive" icon={Users} iconColor="from-primary to-muted-foreground" />
            <StatCard title="Paid This Month" value={formatMoney(summary.paidThisMonth, currency)} change={`${summary.paidInvoicesThisMonth} invoices`} changeType="neutral" icon={CheckCircle} iconColor="from-success to-accent" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
            <div className="xl:col-span-2 surface-panel p-5 lg:p-6">
              <h2 className="font-display text-lg mb-4">Revenue Overview</h2>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <LineChart data={summary.revenueByMonth}>
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(value) => `${Math.round((Number(value) || 0) / 1000)}k${currency}`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--accent))', strokeWidth: 0, r: 3.5 }} />
                </LineChart>
              </ChartContainer>
            </div>

            <div className="surface-panel p-5 lg:p-6">
              <h2 className="font-display text-lg mb-4">Invoice Status</h2>
              <div className="h-[200px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={invoiceStatusData} cx="50%" cy="50%" innerRadius={52} outerRadius={84} paddingAngle={2} dataKey="value">
                      {invoiceStatusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {invoiceStatusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} /><span className="text-xs text-muted-foreground">{item.name}</span></div>
                ))}
              </div>
            </div>
          </div>

          <div className="surface-panel p-5 lg:p-6">
            <h2 className="font-display text-lg mb-4">Weekly Activity</h2>
            <ChartContainer config={chartConfig} className="h-[220px] w-full">
              <BarChart data={summary.weeklyActivity}>
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="invoices" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
                <Bar dataKey="payments" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
            <div className="xl:col-span-2 surface-panel p-5 lg:p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-lg">Recent Invoices</h2>
                <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/invoices')}>View All</Button>
              </div>

              <div className="space-y-3">
                {filteredRecentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 rounded-2xl glass-soft hover:bg-card/60 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center"><FileText className="w-4 h-4" /></div>
                      <div><p className="font-medium text-sm">{invoice.id}</p><p className="text-xs text-muted-foreground">{invoice.client}</p></div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{formatMoney(invoice.amount, currency)}</p>
                      <span className={`inline-block mt-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[invoice.status as keyof typeof statusColors] || 'bg-secondary text-secondary-foreground'}`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-panel-dark p-5 lg:p-6 self-start h-fit">
              <h2 className="font-display text-lg mb-5 text-white">Quick Actions</h2>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-3 border-white/20 bg-white/10 text-white hover:bg-white/20" onClick={handleNewInvoice}><FileText className="w-4 h-4" />Create Invoice</Button>
                <Button variant="outline" className="w-full justify-start gap-3 border-white/20 bg-white/10 text-white hover:bg-white/20" onClick={() => navigate('/dashboard/clients')}><Users className="w-4 h-4" />Add Client</Button>
                <Button variant="outline" className="w-full justify-start gap-3 border-white/20 bg-white/10 text-white hover:bg-white/20" onClick={() => navigate('/dashboard/payments')}><CreditCard className="w-4 h-4" />Record Payment</Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClientDashboard;

