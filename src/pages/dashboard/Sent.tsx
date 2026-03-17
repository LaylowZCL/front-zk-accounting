import { useEffect, useMemo, useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
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
import { Search, Mail, Eye, MousePointer } from 'lucide-react';
import { listSent, SentRecord } from '@/lib/business-api';
import { toast } from 'sonner';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  delivered: 'secondary',
  opened: 'default',
  clicked: 'default',
  bounced: 'destructive',
};

const Sent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sentItems, setSentItems] = useState<SentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        setSentItems(await listSent());
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load sent items');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filteredItems = sentItems.filter((item) =>
    item.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalOpens = useMemo(() => sentItems.reduce((acc, item) => acc + item.opens, 0), [sentItems]);
  const totalClicks = useMemo(() => sentItems.reduce((acc, item) => acc + item.clicks, 0), [sentItems]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="client" />
      <div className="flex-1 flex flex-col">
        <DashboardHeader title="Sent" />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-display font-bold">Sent Documents</h1>
              <p className="text-muted-foreground">Track emails sent to your clients</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Mail className="w-5 h-5 text-primary" /></div>
                <div><p className="text-2xl font-bold">{sentItems.length}</p><p className="text-sm text-muted-foreground">Total Sent</p></div>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center"><Eye className="w-5 h-5 text-green-500" /></div>
                <div><p className="text-2xl font-bold">{totalOpens}</p><p className="text-sm text-muted-foreground">Total Opens</p></div>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><MousePointer className="w-5 h-5 text-blue-500" /></div>
                <div><p className="text-2xl font-bold">{totalClicks}</p><p className="text-sm text-muted-foreground">Total Clicks</p></div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border">
            <div className="p-4 border-b border-border">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search sent items..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Opens</TableHead>
                  <TableHead>Clicks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading sent items...</TableCell></TableRow>
                ) : (
                  filteredItems.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                      <TableCell><Badge variant="outline">{item.type}</Badge></TableCell>
                      <TableCell className="font-medium">{item.reference}</TableCell>
                      <TableCell>{item.recipient}</TableCell>
                      <TableCell>{item.sentAt}</TableCell>
                      <TableCell><Badge variant={statusColors[item.status]} className="capitalize">{item.status}</Badge></TableCell>
                      <TableCell>{item.opens}</TableCell>
                      <TableCell>{item.clicks}</TableCell>
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

export default Sent;
