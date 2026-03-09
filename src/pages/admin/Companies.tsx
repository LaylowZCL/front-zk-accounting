import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search, MoreHorizontal, Building2, Eye, Ban, RefreshCw, CreditCard, Users } from 'lucide-react';
import { toast } from 'sonner';

interface Company {
  id: string;
  name: string;
  email: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'suspended' | 'trial';
  users: number;
  invoicesThisMonth: number;
  mrr: number;
  createdAt: string;
}

const mockCompanies: Company[] = [
  { id: '1', name: 'TechCorp International', email: 'admin@techcorp.com', plan: 'enterprise', status: 'active', users: 25, invoicesThisMonth: 156, mrr: 199, createdAt: '2024-01-10' },
  { id: '2', name: 'StartupXYZ', email: 'hello@startupxyz.com', plan: 'professional', status: 'active', users: 8, invoicesThisMonth: 45, mrr: 79, createdAt: '2024-02-15' },
  { id: '3', name: 'Global Solutions', email: 'billing@globalsol.com', plan: 'professional', status: 'suspended', users: 12, invoicesThisMonth: 0, mrr: 0, createdAt: '2024-01-22' },
  { id: '4', name: 'Digital Dynamics', email: 'team@digitald.com', plan: 'starter', status: 'active', users: 3, invoicesThisMonth: 28, mrr: 29, createdAt: '2024-03-01' },
  { id: '5', name: 'CloudFirst Inc', email: 'admin@cloudfirst.io', plan: 'enterprise', status: 'trial', users: 15, invoicesThisMonth: 12, mrr: 0, createdAt: '2024-04-05' },
  { id: '6', name: 'DataFlow Systems', email: 'ops@dataflow.com', plan: 'starter', status: 'active', users: 2, invoicesThisMonth: 67, mrr: 29, createdAt: '2024-03-18' },
];

const planColors = {
  starter: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  professional: 'bg-primary/10 text-primary border-primary/20',
  enterprise: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
};

const statusColors = {
  active: 'bg-success/10 text-success border-success/20',
  suspended: 'bg-destructive/10 text-destructive border-destructive/20',
  trial: 'bg-info/10 text-info border-info/20',
};

const Companies = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [companies] = useState<Company[]>(mockCompanies);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = planFilter === 'all' || company.plan === planFilter;
    const matchesStatus = statusFilter === 'all' || company.status === statusFilter;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const handleView = (company: Company) => {
    setSelectedCompany(company);
    setViewDialogOpen(true);
  };

  const handleSuspend = (company: Company) => {
    toast.success(`Company ${company.name} has been ${company.status === 'suspended' ? 'reactivated' : 'suspended'}`);
  };

  const handleResetBilling = (company: Company) => {
    toast.success(`Billing reset for ${company.name}`);
  };

  const totalMRR = companies.reduce((sum, c) => sum + c.mrr, 0);
  const totalUsers = companies.reduce((sum, c) => sum + c.users, 0);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userType="local" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="Companies" subtitle="Manage registered companies" />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats */}
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
              <p className="text-2xl font-bold text-primary">${totalMRR}</p>
            </div>
          </div>

          {/* Filters */}
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
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Companies Table */}
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <button
                            onClick={() => handleView(company)}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {company.name}
                          </button>
                          <p className="text-sm text-muted-foreground">{company.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={planColors[company.plan]}>
                        {company.plan.charAt(0).toUpperCase() + company.plan.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[company.status]}>
                        {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        {company.users}
                      </div>
                    </TableCell>
                    <TableCell>{company.invoicesThisMonth}</TableCell>
                    <TableCell className="font-medium">${company.mrr}/mo</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(company)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleResetBilling(company)}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reset Billing
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.info('Change plan dialog')}>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Change Plan
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleSuspend(company)}
                            className={company.status === 'suspended' ? 'text-success' : 'text-destructive'}
                          >
                            <Ban className="w-4 h-4 mr-2" />
                            {company.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>

      {/* View Company Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Company Details</DialogTitle>
            <DialogDescription>View company information and statistics</DialogDescription>
          </DialogHeader>
          {selectedCompany && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedCompany.name}</h3>
                  <p className="text-muted-foreground">{selectedCompany.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-muted-foreground text-xs">Plan</Label>
                  <Badge variant="outline" className={planColors[selectedCompany.plan]}>
                    {selectedCompany.plan.charAt(0).toUpperCase() + selectedCompany.plan.slice(1)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Status</Label>
                  <Badge variant="outline" className={statusColors[selectedCompany.status]}>
                    {selectedCompany.status.charAt(0).toUpperCase() + selectedCompany.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Users</Label>
                  <p className="font-medium">{selectedCompany.users}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">MRR</Label>
                  <p className="font-medium">${selectedCompany.mrr}/mo</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Invoices This Month</Label>
                  <p className="font-medium">{selectedCompany.invoicesThisMonth}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Created At</Label>
                  <p className="font-medium">{selectedCompany.createdAt}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Companies;
