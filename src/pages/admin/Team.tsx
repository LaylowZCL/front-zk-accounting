import { useEffect, useMemo, useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { AdminTeamInvite, listAdminTeamInvites } from '@/lib/admin-api';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  pending: 'secondary',
  inactive: 'destructive',
};

const AdminTeam = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [invites, setInvites] = useState<AdminTeamInvite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        setInvites(await listAdminTeamInvites());
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load admin team invites');
        setInvites([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredInvites = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return invites.filter((member) => member.email.toLowerCase().includes(q) || member.role.toLowerCase().includes(q));
  }, [invites, searchQuery]);

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar userType="local" />
      <div className="flex-1 flex flex-col">
        <DashboardHeader title="Team Management" subtitle="Platform invitation history" />
        <main className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-sm text-muted-foreground">Total Invitations</p>
              <p className="text-2xl font-bold">{invites.length}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{invites.filter((i) => i.status === 'pending').length}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-sm text-muted-foreground">Accepted/Other</p>
              <p className="text-2xl font-bold">{invites.filter((i) => i.status !== 'pending').length}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by email or role..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Invited At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading invitations...</TableCell></TableRow>
                ) : filteredInvites.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No invitations found.</TableCell></TableRow>
                ) : (
                  filteredInvites.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.email}</TableCell>
                      <TableCell>{member.role}</TableCell>
                      <TableCell>
                        <Badge variant={statusColors[member.status] ?? 'outline'} className="capitalize">
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{member.invited_at || member.created_at || '-'}</TableCell>
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

export default AdminTeam;
