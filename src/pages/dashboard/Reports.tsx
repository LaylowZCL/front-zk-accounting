import { useEffect, useMemo, useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  FileText,
  Download,
  Calendar,
  DollarSign,
  Users,
} from 'lucide-react';
import { getDashboardSummary, listReports } from '@/lib/business-api';
import { toast } from 'sonner';

const fallbackReportTypes = [
  { title: 'Revenue Report', description: 'Track your income over time with detailed breakdowns', key: 'revenue' },
  { title: 'Invoice Summary', description: 'Overview of all invoices by status and client', key: 'invoices' },
  { title: 'Client Analysis', description: 'Analyze client activity and payment patterns', key: 'clients' },
  { title: 'Aging Report', description: 'Track overdue invoices and outstanding balances', key: 'aging' },
  { title: 'Product Performance', description: 'See which products/services generate more revenue', key: 'products' },
  { title: 'Tax Summary', description: 'Summary of collected taxes for accounting purposes', key: 'tax' },
];

const iconMap = {
  revenue: DollarSign,
  invoices: FileText,
  clients: Users,
  aging: Calendar,
  products: BarChart3,
  tax: PieChart,
} as const;

const Reports = () => {
  const [reportTypes, setReportTypes] = useState(fallbackReportTypes);
  const [stats, setStats] = useState({ revenue: 0, invoices: 0, clients: 0 });

  useEffect(() => {
    listReports()
      .then((items) => {
        if (items.length) setReportTypes(items);
      })
      .catch(() => {
        // fallback is already loaded
      });

    getDashboardSummary()
      .then((summary) => {
        setStats({
          revenue: summary.totalRevenue,
          invoices: summary.paidInvoicesThisMonth,
          clients: summary.totalClients,
        });
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to load report stats');
      });
  }, []);

  const reportCards = useMemo(
    () =>
      reportTypes.map((report) => {
        const Icon = iconMap[report.key as keyof typeof iconMap] ?? BarChart3;
        return { ...report, Icon };
      }),
    [reportTypes]
  );

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="client" />
      <div className="flex-1 flex flex-col">
        <DashboardHeader title="Reports" />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-display font-bold">Reports</h1>
              <p className="text-muted-foreground">Generate and download business reports</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-primary" /></div>
                <div><p className="text-2xl font-bold">${stats.revenue.toLocaleString()}</p><p className="text-sm text-muted-foreground">This Month Revenue</p></div>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center"><FileText className="w-5 h-5 text-green-500" /></div>
                <div><p className="text-2xl font-bold">{stats.invoices}</p><p className="text-sm text-muted-foreground">Invoices This Month</p></div>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><Users className="w-5 h-5 text-blue-500" /></div>
                <div><p className="text-2xl font-bold">{stats.clients}</p><p className="text-sm text-muted-foreground">Active Clients</p></div>
              </div>
            </div>
          </div>

          <h2 className="text-lg font-semibold mb-4">Available Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportCards.map((report) => (
              <Card key={report.key} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <report.Icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-2"><Download className="w-4 h-4" />Export</Button>
                    <Button size="sm" className="flex-1">Generate</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reports;
