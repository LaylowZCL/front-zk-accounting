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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
  Search,
  Plus,
  MoreHorizontal,
  Mail,
  Shield,
  UserX,
  UserCheck,
  Trash2,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'junior';
  status: 'active' | 'pending' | 'inactive';
  invitedAt: string;
  joinedAt?: string;
}

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@billflow.com',
    role: 'admin',
    status: 'active',
    invitedAt: '2024-01-01',
    joinedAt: '2024-01-02',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@billflow.com',
    role: 'manager',
    status: 'active',
    invitedAt: '2024-01-15',
    joinedAt: '2024-01-16',
  },
  {
    id: '3',
    name: 'Mike Brown',
    email: 'mike@billflow.com',
    role: 'junior',
    status: 'active',
    invitedAt: '2024-02-01',
    joinedAt: '2024-02-02',
  },
  {
    id: '4',
    name: 'Pending User',
    email: 'pending@example.com',
    role: 'junior',
    status: 'pending',
    invitedAt: '2024-03-01',
  },
];

const roleColors: Record<string, 'default' | 'secondary' | 'outline'> = {
  admin: 'default',
  manager: 'secondary',
  junior: 'outline',
};

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  pending: 'secondary',
  inactive: 'destructive',
};

const AdminTeam = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [teamMembers, setTeamMembers] = useState(mockTeamMembers);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'manager' | 'junior'>('junior');

  const filteredMembers = teamMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInvite = () => {
    if (!inviteEmail) {
      toast.error('Please enter an email address');
      return;
    }

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: 'Pending User',
      email: inviteEmail,
      role: inviteRole,
      status: 'pending',
      invitedAt: new Date().toISOString().split('T')[0],
    };

    setTeamMembers([...teamMembers, newMember]);
    toast.success(`Invitation sent to ${inviteEmail}`);
    setInviteEmail('');
    setInviteRole('junior');
    setIsInviteDialogOpen(false);
  };

  const handleResendInvite = (member: TeamMember) => {
    toast.success(`Invitation resent to ${member.email}`);
  };

  const handleDeactivate = (member: TeamMember) => {
    setTeamMembers(
      teamMembers.map((m) =>
        m.id === member.id ? { ...m, status: 'inactive' as const } : m
      )
    );
    toast.success(`${member.name} has been deactivated`);
  };

  const handleReactivate = (member: TeamMember) => {
    setTeamMembers(
      teamMembers.map((m) =>
        m.id === member.id ? { ...m, status: 'active' as const } : m
      )
    );
    toast.success(`${member.name} has been reactivated`);
  };

  const handleRemove = (member: TeamMember) => {
    setTeamMembers(teamMembers.filter((m) => m.id !== member.id));
    toast.success(`${member.name} has been removed from the team`);
  };

  const handleChangeRole = (member: TeamMember, newRole: 'manager' | 'junior') => {
    setTeamMembers(
      teamMembers.map((m) =>
        m.id === member.id ? { ...m, role: newRole } : m
      )
    );
    toast.success(`${member.name}'s role changed to ${newRole}`);
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar userType="local" />
      <div className="flex-1 flex flex-col">
        <DashboardHeader title="Team Management" subtitle="Manage your admin team members" />
        <main className="flex-1 p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-sm text-muted-foreground">Total Members</p>
              <p className="text-2xl font-bold">{teamMembers.length}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-sm text-muted-foreground">Admins</p>
              <p className="text-2xl font-bold">
                {teamMembers.filter((m) => m.role === 'admin').length}
              </p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-sm text-muted-foreground">Managers</p>
              <p className="text-2xl font-bold">
                {teamMembers.filter((m) => m.role === 'manager').length}
              </p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-sm text-muted-foreground">Pending Invites</p>
              <p className="text-2xl font-bold">
                {teamMembers.filter((m) => m.status === 'pending').length}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search team members..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={() => setIsInviteDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          </div>

          {/* Table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Invited</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-primary-foreground font-semibold text-sm">
                          {member.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={roleColors[member.role]} className="capitalize">
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[member.status]} className="capitalize">
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{member.invitedAt}</TableCell>
                    <TableCell>{member.joinedAt || '-'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {member.role !== 'admin' && (
                            <>
                              {member.status === 'pending' && (
                                <DropdownMenuItem onClick={() => handleResendInvite(member)}>
                                  <Send className="w-4 h-4 mr-2" />
                                  Resend Invite
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() =>
                                  handleChangeRole(
                                    member,
                                    member.role === 'manager' ? 'junior' : 'manager'
                                  )
                                }
                              >
                                <Shield className="w-4 h-4 mr-2" />
                                Change to {member.role === 'manager' ? 'Junior' : 'Manager'}
                              </DropdownMenuItem>
                              {member.status === 'active' ? (
                                <DropdownMenuItem onClick={() => handleDeactivate(member)}>
                                  <UserX className="w-4 h-4 mr-2" />
                                  Deactivate
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleReactivate(member)}>
                                  <UserCheck className="w-4 h-4 mr-2" />
                                  Reactivate
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleRemove(member)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remove
                              </DropdownMenuItem>
                            </>
                          )}
                          {member.role === 'admin' && (
                            <DropdownMenuItem disabled>
                              <Shield className="w-4 h-4 mr-2" />
                              Admin (Cannot modify)
                            </DropdownMenuItem>
                          )}
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

      {/* Invite Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your admin team. They will receive an email with
              instructions to set up their account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as 'manager' | 'junior')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="junior">Junior</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Managers have elevated permissions. Juniors have limited access.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite}>
              <Mail className="w-4 h-4 mr-2" />
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTeam;
