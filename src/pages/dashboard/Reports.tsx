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
import {
  getDashboardSummary,
  getSettings,
  listClients,
  listInvoices,
  listPayments,
  listReports,
} from '@/lib/business-api';
import { formatMoney, normalizeCurrency } from '@/lib/currency';
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

const escapeCsv = (value: unknown) => {
  const text = String(value ?? '');
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

const downloadCsv = (filename: string, rows: Array<Array<unknown>>) => {
  const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const Reports = () => {
  const [reportTypes, setReportTypes] = useState(fallbackReportTypes);
  const [stats, setStats] = useState({ revenue: 0, invoices: 0, clients: 0 });
  const [currency, setCurrency] = useState('MT');
  const [busyReportKey, setBusyReportKey] = useState<string | null>(null);

  const loadReportData = async () => {
    const [reports, summary, settings] = await Promise.all([
      listReports().catch(() => []),
      getDashboardSummary(),
      getSettings().catch(() => ({})),
    ]);

    if (reports.length) setReportTypes(reports);
    setStats({
      revenue: summary.totalRevenue,
      invoices: summary.paidInvoicesThisMonth,
      clients: summary.totalClients,
    });
    setCurrency(normalizeCurrency(settings.company?.currency));
  };

  useEffect(() => {
    loadReportData().catch((error) => {
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

  const handleGenerate = async (reportKey: string) => {
    setBusyReportKey(`generate-${reportKey}`);
    try {
      await loadReportData();
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate report');
    } finally {
      setBusyReportKey(null);
    }
  };

  const handleExport = async (reportKey: string, title: string) => {
    setBusyReportKey(`export-${reportKey}`);
    try {
      const now = new Date().toISOString().slice(0, 10);

      if (reportKey === 'revenue') {
        const [summary, payments] = await Promise.all([getDashboardSummary(), listPayments()]);
        const rows: Array<Array<unknown>> = [
          ['Report', 'Revenue'],
          ['Date', now],
          ['Total Revenue', formatMoney(summary.totalRevenue, currency)],
          ['Paid This Month', formatMoney(summary.paidThisMonth, currency)],
          [],
          ['Payment Number', 'Invoice', 'Client', 'Date', 'Method', 'Status', `Amount (${currency})`],
          ...payments.map((payment) => [
            payment.id,
            payment.invoice,
            payment.client,
            payment.date,
            payment.method,
            payment.status,
            Number(payment.amount ?? 0).toFixed(2),
          ]),
        ];

        downloadCsv(`revenue-report-${now}.csv`, rows);
      } else if (reportKey === 'invoices') {
        const invoices = await listInvoices();
        const rows: Array<Array<unknown>> = [
          ['Report', 'Invoices'],
          ['Date', now],
          [],
          ['Invoice', 'Client', 'Issue Date', 'Due Date', 'Status', `Amount (${currency})`],
          ...invoices.map((invoice) => [
            invoice.id,
            invoice.client,
            invoice.date,
            invoice.dueDate ?? '',
            invoice.status,
            Number(invoice.amount ?? 0).toFixed(2),
          ]),
        ];

        downloadCsv(`invoice-summary-${now}.csv`, rows);
      } else if (reportKey === 'clients') {
        const clients = await listClients();
        const rows: Array<Array<unknown>> = [
          ['Report', 'Clients'],
          ['Date', now],
          [],
          ['Name', 'Email', 'Phone', 'Address', 'Total Invoices', `Outstanding (${currency})`],
          ...clients.map((client) => [
            client.name,
            client.email,
            client.phone,
            client.address,
            client.totalInvoices,
            Number(client.balance ?? 0).toFixed(2),
          ]),
        ];

        downloadCsv(`client-analysis-${now}.csv`, rows);
      } else {
        const reports = await listReports();
        const selected = reports.find((item) => item.key === reportKey) ?? { title, description: '-', key: reportKey };
        downloadCsv(`report-${reportKey}-${now}.csv`, [
          ['Report', selected.title],
          ['Date', now],
          ['Details', selected.description],
        ]);
      }

      toast.success('Report exported successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to export report');
    } finally {
      setBusyReportKey(null);
    }
  };

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
                <div><p className="text-2xl font-bold">{formatMoney(stats.revenue, currency)}</p><p className="text-sm text-muted-foreground">This Month Revenue</p></div>
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => handleExport(report.key, report.title)}
                      disabled={busyReportKey !== null}
                    >
                      <Download className="w-4 h-4" />
                      {busyReportKey === `export-${report.key}` ? 'Exporting...' : 'Export'}
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleGenerate(report.key)}
                      disabled={busyReportKey !== null}
                    >
                      {busyReportKey === `generate-${report.key}` ? 'Generating...' : 'Generate'}
                    </Button>
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
