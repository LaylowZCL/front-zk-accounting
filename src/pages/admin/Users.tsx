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
import { AdminCompany, AdminTeamInvite, AdminUser, createAdminUser, listAdminCompanies, listAdminTeamInvites, listAdminUsers, updateAdminUser } from '@/lib/admin-api';

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
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [invites, setInvites] = useState<AdminTeamInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('worker');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const [usersData, companiesData, invitesData] = await Promise.all([
        listAdminUsers(),
        listAdminCompanies(),
        listAdminTeamInvites(),
      ]);
      setUsers(usersData);
      setCompanies(companiesData);
      setInvites(invitesData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load users');
      setUsers([]);
      setCompanies([]);
      setInvites([]);
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

  const isSystemAdmin = (user: AdminUser) => user.is_platform_admin || user.role === 'platform_admin';

  const adminUsers = useMemo(() => filteredUsers.filter((u) => isSystemAdmin(u)), [filteredUsers]);
  const saasUsers = useMemo(() => filteredUsers.filter((u) => !isSystemAdmin(u)), [filteredUsers]);

  const pendingInvitesByAccount = useMemo(() => {
    const map = new Map<string, number>();
    invites
      .filter((invite) => invite.status === 'pending' && invite.account_id)
      .forEach((invite) => {
        const key = String(invite.account_id);
        map.set(key, (map.get(key) ?? 0) + 1);
      });
    return map;
  }, [invites]);

  const selectedCompany = useMemo(
    () => companies.find((c) => String(c.id) === String(selectedCompanyId)) ?? null,
    [companies, selectedCompanyId]
  );

  const selectedCompanyInvites = useMemo(
    () => invites.filter((invite) => String(invite.account_id) === String(selectedCompanyId)),
    [invites, selectedCompanyId]
  );

  const openCompanyDetails = (companyId?: string | number | null) => {
    if (!companyId) return;
    setSelectedCompanyId(String(companyId));
    setCompanyDialogOpen(true);
  };

  const openCompanyInvites = (companyId?: string | number | null) => {
    if (!companyId) return;
    setSelectedCompanyId(String(companyId));
    setInviteDialogOpen(true);
  };

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

          <div className="space-y-8">
            <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
              <div className="px-6 py-4 border-b border-border/50">
                <h3 className="font-semibold">System Administrators</h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
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
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading users...</TableCell>
                    </TableRow>
                  ) : adminUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No admins found.</TableCell>
                    </TableRow>
                  ) : (
                    adminUsers.map((user, index) => (
                      <TableRow key={user.id}>
                        <TableCell className="text-muted-foreground">{index + 1}</TableCell>
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

            <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
              <div className="px-6 py-4 border-b border-border/50">
                <h3 className="font-semibold">SaaS Users</h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
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
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading users...</TableCell>
                    </TableRow>
                  ) : saasUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No SaaS users found.</TableCell>
                    </TableRow>
                  ) : (
                    saasUsers.map((user) => {
                      const rowIndex = saasUsers.findIndex((row) => row.id === user.id) + 1;
                      const pending = user.company_id ? (pendingInvitesByAccount.get(String(user.company_id)) ?? 0) : 0;
                      return (
                        <TableRow key={user.id}>
                          <TableCell className="text-muted-foreground">{rowIndex}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="link" className="px-0" onClick={() => openCompanyDetails(user.company_id)}>
                                {user.company}
                              </Button>
                              {pending > 0 && (
                                <Button variant="outline" size="sm" onClick={() => openCompanyInvites(user.company_id)}>
                                  {pending}
                                </Button>
                              )}
                            </div>
                          </TableCell>
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
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
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

      <Dialog open={companyDialogOpen} onOpenChange={setCompanyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Company Details</DialogTitle>
            <DialogDescription>Informacoes da empresa selecionada.</DialogDescription>
          </DialogHeader>
          {selectedCompany ? (
            <div className="space-y-2 text-sm">
              <div><strong>Name:</strong> {selectedCompany.name}</div>
              <div><strong>Status:</strong> {selectedCompany.status}</div>
              <div><strong>Plan:</strong> {selectedCompany.plan}</div>
              <div><strong>Users:</strong> {selectedCompany.users}</div>
              <div><strong>MRR:</strong> {selectedCompany.mrr}</div>
              <div><strong>Created:</strong> {selectedCompany.createdAt}</div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Empresa nao encontrada.</p>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invites da Empresa</DialogTitle>
            <DialogDescription>Convites pendentes e historico.</DialogDescription>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Invited At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedCompanyInvites.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">No invites found.</TableCell>
                </TableRow>
              ) : (
                selectedCompanyInvites.map((invite, index) => (
                  <TableRow key={invite.id}>
                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                    <TableCell>{invite.email}</TableCell>
                    <TableCell>{invite.role}</TableCell>
                    <TableCell>{invite.status}</TableCell>
                    <TableCell>{invite.invited_at || invite.created_at || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
