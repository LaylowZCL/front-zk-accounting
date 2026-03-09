import { useEffect, useState } from 'react';
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
import {
  TeamMember,
  deleteTeamMember,
  inviteTeamMember,
  listTeamMembers,
  resendTeamInvitation,
  updateTeamMember,
} from '@/lib/business-api';

const roleColors: Record<string, 'default' | 'secondary'> = {
  owner: 'default',
  employee: 'secondary',
};

const statusColors: Record<string, 'default' | 'secondary' | 'destructive'> = {
  active: 'default',
  pending: 'secondary',
  inactive: 'destructive',
};

const DashboardTeam = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const loadTeam = async () => {
    setIsLoading(true);
    try {
      setTeamMembers(await listTeamMembers());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load team');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const filteredMembers = teamMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInvite = async () => {
    if (!inviteEmail) return toast.error('Please enter an email address');
    try {
      await inviteTeamMember({ email: inviteEmail, role: 'employee' });
      await loadTeam();
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setIsInviteDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to invite member');
    }
  };

  const handleResendInvite = async (member: TeamMember) => {
    try {
      await resendTeamInvitation(member.id);
      await loadTeam();
      toast.success(`Invitation resent to ${member.email}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to resend invite');
    }
  };

  const handleDeactivate = async (member: TeamMember) => {
    try {
      await updateTeamMember(member.id, { status: 'inactive' });
      await loadTeam();
      toast.success(`${member.name} has been deactivated`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to deactivate member');
    }
  };

  const handleReactivate = async (member: TeamMember) => {
    try {
      await updateTeamMember(member.id, { status: 'active' });
      await loadTeam();
      toast.success(`${member.name} has been reactivated`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to reactivate member');
    }
  };

  const handleRemove = async (member: TeamMember) => {
    try {
      await deleteTeamMember(member.id);
      await loadTeam();
      toast.success(`${member.name} has been removed from the team`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to remove member');
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar userType="client" />
      <div className="flex-1 flex flex-col">
        <DashboardHeader title="Team" subtitle="Manage your team members and permissions" />
        <main className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-sm text-muted-foreground">Total Members</p>
              <p className="text-2xl font-bold">{teamMembers.length}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-sm text-muted-foreground">Owner</p>
              <p className="text-2xl font-bold">{teamMembers.filter((m) => m.role === 'owner').length}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-sm text-muted-foreground">Employees</p>
              <p className="text-2xl font-bold">{teamMembers.filter((m) => m.role === 'employee').length}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-sm text-muted-foreground">Pending Invites</p>
              <p className="text-2xl font-bold">{teamMembers.filter((m) => m.status === 'pending').length}</p>
            </div>
          </div>

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
              Invite Employee
            </Button>
          </div>

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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">Loading team...</TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-primary-foreground font-semibold text-sm">
                            {member.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={roleColors[member.role]} className="capitalize">{member.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColors[member.status]} className="capitalize">{member.status}</Badge>
                      </TableCell>
                      <TableCell>{member.invitedAt}</TableCell>
                      <TableCell>{member.joinedAt || '-'}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {member.role !== 'owner' && (
                              <>
                                {member.status === 'pending' && (
                                  <DropdownMenuItem onClick={() => handleResendInvite(member)}>
                                    <Send className="w-4 h-4 mr-2" />Resend Invite
                                  </DropdownMenuItem>
                                )}
                                {member.status === 'active' ? (
                                  <DropdownMenuItem onClick={() => handleDeactivate(member)}>
                                    <UserX className="w-4 h-4 mr-2" />Deactivate
                                  </DropdownMenuItem>
                                ) : member.status === 'inactive' ? (
                                  <DropdownMenuItem onClick={() => handleReactivate(member)}>
                                    <UserCheck className="w-4 h-4 mr-2" />Reactivate
                                  </DropdownMenuItem>
                                ) : null}
                                <DropdownMenuItem className="text-destructive" onClick={() => handleRemove(member)}>
                                  <Trash2 className="w-4 h-4 mr-2" />Remove
                                </DropdownMenuItem>
                              </>
                            )}
                            {member.role === 'owner' && (
                              <DropdownMenuItem disabled>
                                <Shield className="w-4 h-4 mr-2" />Owner (Cannot modify)
                              </DropdownMenuItem>
                            )}
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

      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Employee</DialogTitle>
            <DialogDescription>
              Send an invitation to join your team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="employee@yourcompany.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleInvite}><Mail className="w-4 h-4 mr-2" />Send Invitation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardTeam;
