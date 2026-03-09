import { useEffect, useMemo, useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search, Plus, UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { AdminUser, createAdminUser, listAdminUsers, updateAdminUser } from '@/lib/admin-api';

const roleColors: Record<string, string> = {
  platform_admin: 'bg-destructive/10 text-destructive border-destructive/20',
  admin: 'bg-destructive/10 text-destructive border-destructive/20',
  manager: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  owner: 'bg-primary/10 text-primary border-primary/20',
  accountant: 'bg-info/10 text-info border-info/20',
  worker: 'bg-muted text-muted-foreground border-muted',
  employee: 'bg-muted text-muted-foreground border-muted',
};

const statusColors: Record<string, string> = {
  active: 'bg-success/10 text-success border-success/20',
  blocked: 'bg-destructive/10 text-destructive border-destructive/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  inactive: 'bg-secondary text-secondary-foreground border-secondary',
};

const Users = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('worker');

  const loadUsers = async () => {
    setLoading(true);
    try {
      setUsers(await listAdminUsers());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const q = searchQuery.toLowerCase();
        return (
          user.name.toLowerCase().includes(q) ||
          user.email.toLowerCase().includes(q) ||
          user.company.toLowerCase().includes(q)
        );
      }),
    [users, searchQuery]
  );

  const handleStatusToggle = async (user: AdminUser) => {
    const nextStatus = user.status === 'blocked' ? 'active' : 'blocked';
    try {
      await updateAdminUser(user.id, { status: nextStatus });
      toast.success(`User ${nextStatus === 'blocked' ? 'blocked' : 'unblocked'} successfully`);
      await loadUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update user status');
    }
  };

  const handleCreateUser = async () => {
    if (!name || !email) {
      toast.error('Name and email are required');
      return;
    }

    try {
      await createAdminUser({ name, email, role });
      toast.success('User invitation created');
      setAddDialogOpen(false);
      setName('');
      setEmail('');
      setRole('worker');
      await loadUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create user');
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userType="local" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="User Management" subtitle="Manage all platform users" />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>

          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading users...</TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No users found.</TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{user.company}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={roleColors[user.role] ?? roleColors.worker}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[user.status] ?? statusColors.inactive}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.lastLogin}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleStatusToggle(user)}>
                          {user.status === 'blocked' ? (
                            <><UserCheck className="w-4 h-4 mr-2" />Unblock</>
                          ) : (
                            <><UserX className="w-4 h-4 mr-2" />Block</>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create user invitation in the platform.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="worker">Worker</SelectItem>
                  <SelectItem value="accountant">Accountant</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateUser}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
