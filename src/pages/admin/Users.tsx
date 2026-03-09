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
import { Search, Plus, MoreHorizontal, UserCheck, UserX, Mail, Shield, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'owner' | 'accountant' | 'worker';
  company: string;
  status: 'active' | 'blocked' | 'pending';
  lastLogin: string;
  createdAt: string;
}

const mockUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@techcorp.com', role: 'admin', company: 'System', status: 'active', lastLogin: '2 hours ago', createdAt: '2024-01-15' },
  { id: '2', name: 'Sarah Wilson', email: 'sarah@startupxyz.com', role: 'owner', company: 'StartupXYZ', status: 'active', lastLogin: '1 day ago', createdAt: '2024-02-20' },
  { id: '3', name: 'Mike Brown', email: 'mike@globalsol.com', role: 'accountant', company: 'Global Solutions', status: 'blocked', lastLogin: '1 week ago', createdAt: '2024-03-10' },
  { id: '4', name: 'Emily Chen', email: 'emily@digitald.com', role: 'worker', company: 'Digital Dynamics', status: 'active', lastLogin: '3 hours ago', createdAt: '2024-03-25' },
  { id: '5', name: 'Alex Johnson', email: 'alex@techstart.com', role: 'manager', company: 'TechStart Inc', status: 'pending', lastLogin: 'Never', createdAt: '2024-04-01' },
];

const roleColors = {
  admin: 'bg-destructive/10 text-destructive border-destructive/20',
  manager: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  owner: 'bg-primary/10 text-primary border-primary/20',
  accountant: 'bg-info/10 text-info border-info/20',
  worker: 'bg-muted text-muted-foreground border-muted',
};

const statusColors = {
  active: 'bg-success/10 text-success border-success/20',
  blocked: 'bg-destructive/10 text-destructive border-destructive/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
};

const Users = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users] = useState<User[]>(mockUsers);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleView = (user: User) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  const handleBlock = (user: User) => {
    toast.success(`User ${user.name} has been ${user.status === 'blocked' ? 'unblocked' : 'blocked'}`);
  };

  const handleResendInvite = (user: User) => {
    toast.success(`Invitation resent to ${user.email}`);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userType="local" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="User Management" subtitle="Manage all platform users" />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Filters & Actions */}
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
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="accountant">Accountant</SelectItem>
                <SelectItem value="worker">Worker</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>

          {/* Users Table */}
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
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-primary-foreground font-semibold text-sm">
                          {user.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <button
                            onClick={() => handleView(user)}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {user.name}
                          </button>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.company}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={roleColors[user.role]}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[user.status]}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.lastLogin}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(user)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.info('Edit user dialog')}>
                            <Shield className="w-4 h-4 mr-2" />
                            Change Role
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleResendInvite(user)}>
                            <Mail className="w-4 h-4 mr-2" />
                            Resend Invite
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleBlock(user)}
                            className={user.status === 'blocked' ? 'text-success' : 'text-destructive'}
                          >
                            {user.status === 'blocked' ? (
                              <>
                                <UserCheck className="w-4 h-4 mr-2" />
                                Unblock User
                              </>
                            ) : (
                              <>
                                <UserX className="w-4 h-4 mr-2" />
                                Block User
                              </>
                            )}
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

      {/* View User Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>View user information</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-primary-foreground font-semibold text-xl">
                  {selectedUser.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedUser.name}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-muted-foreground text-xs">Company</Label>
                  <p className="font-medium">{selectedUser.company}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Role</Label>
                  <Badge variant="outline" className={roleColors[selectedUser.role]}>
                    {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Status</Label>
                  <Badge variant="outline" className={statusColors[selectedUser.status]}>
                    {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Last Login</Label>
                  <p className="font-medium">{selectedUser.lastLogin}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground text-xs">Created At</Label>
                  <p className="font-medium">{selectedUser.createdAt}</p>
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

      {/* Add User Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Invite a new user to the platform</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input placeholder="John" />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success('User invitation sent');
              setAddDialogOpen(false);
            }}>
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
