import { useEffect, useMemo, useState } from 'react';
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
import { Plus, Search, MoreHorizontal, CreditCard, DollarSign, TrendingUp, Clock } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { listPayments, PaymentRecord } from '@/lib/business-api';
import { toast } from 'sonner';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  completed: 'default',
  pending: 'secondary',
  failed: 'destructive',
};

const Payments = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        setPayments(await listPayments());
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load payments');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filteredPayments = payments.filter((payment) =>
    payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.invoice.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalReceived = useMemo(() => payments.filter((p) => p.status === 'completed').reduce((acc, p) => acc + p.amount, 0), [payments]);
  const pendingAmount = useMemo(() => payments.filter((p) => p.status === 'pending').reduce((acc, p) => acc + p.amount, 0), [payments]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="client" />
      <div className="flex-1 flex flex-col">
        <DashboardHeader title="Payments" />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-display font-bold">Payments</h1>
              <p className="text-muted-foreground">Track and manage incoming payments</p>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Record Payment
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><DollarSign className="w-5 h-5 text-primary" /></div>
                <div><p className="text-2xl font-bold">${totalReceived.toLocaleString()}</p><p className="text-sm text-muted-foreground">Total Received</p></div>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center"><Clock className="w-5 h-5 text-yellow-500" /></div>
                <div><p className="text-2xl font-bold">${pendingAmount.toLocaleString()}</p><p className="text-sm text-muted-foreground">Pending</p></div>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-green-500" /></div>
                <div><p className="text-2xl font-bold">{payments.filter((p) => p.status === 'completed').length}</p><p className="text-sm text-muted-foreground">Completed</p></div>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><CreditCard className="w-5 h-5 text-blue-500" /></div>
                <div><p className="text-2xl font-bold">{payments.length}</p><p className="text-sm text-muted-foreground">Total Payments</p></div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border">
            <div className="p-4 border-b border-border">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search payments..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading payments...</TableCell></TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.id}</TableCell>
                      <TableCell><Badge variant="outline">{payment.invoice}</Badge></TableCell>
                      <TableCell>{payment.client}</TableCell>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell className="font-medium">${payment.amount.toLocaleString()}</TableCell>
                      <TableCell><Badge variant="secondary">{payment.method}</Badge></TableCell>
                      <TableCell><Badge variant={statusColors[payment.status]} className="capitalize">{payment.status}</Badge></TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Create Receipt</DropdownMenuItem>
                            <DropdownMenuItem>Refund Payment</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

export default Payments;
