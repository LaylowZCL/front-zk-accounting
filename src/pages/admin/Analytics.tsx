import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Users, Building2, DollarSign, FileText } from 'lucide-react';

const revenueData = [
  { month: 'Jan', revenue: 32000, newCompanies: 12 },
  { month: 'Feb', revenue: 35000, newCompanies: 18 },
  { month: 'Mar', revenue: 38500, newCompanies: 15 },
  { month: 'Apr', revenue: 42000, newCompanies: 22 },
  { month: 'May', revenue: 45000, newCompanies: 28 },
  { month: 'Jun', revenue: 52400, newCompanies: 35 },
];

const planDistribution = [
  { name: 'Starter', value: 145, color: 'hsl(var(--success))' },
  { name: 'Professional', value: 198, color: 'hsl(var(--primary))' },
  { name: 'Enterprise', value: 55, color: 'hsl(var(--warning))' },
];

const userGrowth = [
  { week: 'W1', users: 2450 },
  { week: 'W2', users: 2520 },
  { week: 'W3', users: 2680 },
  { week: 'W4', users: 2847 },
];

const invoiceVolume = [
  { day: 'Mon', invoices: 245 },
  { day: 'Tue', invoices: 312 },
  { day: 'Wed', invoices: 287 },
  { day: 'Thu', invoices: 356 },
  { day: 'Fri', invoices: 298 },
  { day: 'Sat', invoices: 145 },
  { day: 'Sun', invoices: 98 },
];

const chartConfig = {
  revenue: { label: 'Revenue', color: 'hsl(var(--primary))' },
  newCompanies: { label: 'New Companies', color: 'hsl(var(--success))' },
  users: { label: 'Users', color: 'hsl(var(--info))' },
  invoices: { label: 'Invoices', color: 'hsl(var(--warning))' },
};

const Analytics = () => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar userType="local" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="Analytics" subtitle="Platform performance metrics" />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Monthly Revenue</p>
                    <p className="text-2xl font-bold">$52,400</p>
                    <div className="flex items-center gap-1 text-success text-sm mt-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>+16.4% from last month</span>
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
                    <p className="text-2xl font-bold">456</p>
                    <div className="flex items-center gap-1 text-success text-sm mt-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>+28 this month</span>
                    </div>
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
                    <p className="text-2xl font-bold">2,847</p>
                    <div className="flex items-center gap-1 text-success text-sm mt-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>+124 this week</span>
                    </div>
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
                    <p className="text-muted-foreground text-sm">Invoices Processed</p>
                    <p className="text-2xl font-bold">15,847</p>
                    <div className="flex items-center gap-1 text-destructive text-sm mt-1">
                      <TrendingDown className="w-4 h-4" />
                      <span>-3.2% from last month</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(value) => `$${value / 1000}k`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary) / 0.2)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* New Companies */}
            <Card>
              <CardHeader>
                <CardTitle>New Company Registrations</CardTitle>
              </CardHeader>
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

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Plan Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Plan Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px]">
                  <PieChart>
                    <Pie
                      data={planDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
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

            {/* User Growth */}
            <Card>
              <CardHeader>
                <CardTitle>User Growth (Last 4 Weeks)</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px]">
                  <LineChart data={userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="week" className="text-xs" />
                    <YAxis className="text-xs" domain={['auto', 'auto']} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="hsl(var(--info))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--info))' }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Invoice Volume */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Invoice Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px]">
                  <BarChart data={invoiceVolume}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="invoices" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                  </BarChart>
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
