import { useEffect, useMemo, useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { AdminCompany, listAdminCompanies, updateAdminCompany } from '@/lib/admin-api';

const planColors: Record<string, string> = {
  starter: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  professional: 'bg-primary/10 text-primary border-primary/20',
  enterprise: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
};

const statusColors: Record<string, string> = {
  active: 'bg-success/10 text-success border-success/20',
  suspended: 'bg-destructive/10 text-destructive border-destructive/20',
  trial: 'bg-info/10 text-info border-info/20',
  cancelled: 'bg-muted text-muted-foreground border-muted',
};

const Companies = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      setCompanies(await listAdminCompanies());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load companies');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const filteredCompanies = useMemo(
    () =>
      companies.filter((company) => {
        const q = searchQuery.toLowerCase();
        return company.name.toLowerCase().includes(q) || company.email.toLowerCase().includes(q);
      }),
    [companies, searchQuery]
  );

  const handleStatusChange = async (company: AdminCompany, status: AdminCompany['status']) => {
    try {
      await updateAdminCompany(company.id, { status });
      toast.success(`Company updated to ${status}`);
      await loadCompanies();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update company');
    }
  };

  const handlePlanChange = async (company: AdminCompany, plan: string) => {
    try {
      await updateAdminCompany(company.id, { plan });
      toast.success(`Plan changed to ${plan}`);
      await loadCompanies();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update plan');
    }
  };

  const totalMRR = companies.reduce((sum, c) => sum + Number(c.mrr ?? 0), 0);
  const totalUsers = companies.reduce((sum, c) => sum + Number(c.users ?? 0), 0);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userType="local" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="Companies" subtitle="Manage registered companies" />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card rounded-lg border p-4">
              <p className="text-muted-foreground text-sm">Total Companies</p>
              <p className="text-2xl font-bold">{companies.length}</p>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <p className="text-muted-foreground text-sm">Active</p>
              <p className="text-2xl font-bold text-success">{companies.filter((c) => c.status === 'active').length}</p>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <p className="text-muted-foreground text-sm">Total Users</p>
              <p className="text-2xl font-bold">{totalUsers}</p>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <p className="text-muted-foreground text-sm">Monthly Revenue</p>
              <p className="text-2xl font-bold text-primary">${totalMRR.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={loadCompanies}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Invoices/Month</TableHead>
                  <TableHead>MRR</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading companies...</TableCell></TableRow>
                ) : filteredCompanies.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No companies found.</TableCell></TableRow>
                ) : (
                  filteredCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{company.name}</p>
                          <p className="text-sm text-muted-foreground">{company.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={planColors[company.plan] ?? planColors.starter}>{company.plan}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[company.status] ?? statusColors.trial}>{company.status}</Badge>
                      </TableCell>
                      <TableCell>{company.users}</TableCell>
                      <TableCell>{company.invoicesThisMonth}</TableCell>
                      <TableCell className="font-medium">${Number(company.mrr).toLocaleString()}/mo</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Select value={company.plan} onValueChange={(value) => handlePlanChange(company, value)}>
                            <SelectTrigger className="w-[140px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="starter">starter</SelectItem>
                              <SelectItem value="professional">professional</SelectItem>
                              <SelectItem value="enterprise">enterprise</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select value={company.status} onValueChange={(value) => handleStatusChange(company, value as AdminCompany['status'])}>
                            <SelectTrigger className="w-[140px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="trial">trial</SelectItem>
                              <SelectItem value="active">active</SelectItem>
                              <SelectItem value="suspended">suspended</SelectItem>
                              <SelectItem value="cancelled">cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Companies;
