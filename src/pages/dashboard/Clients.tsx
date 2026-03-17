import { useEffect, useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, MoreHorizontal, Mail, Phone } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Client } from '@/types/documents';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '@/lib/api';
import { createClient, deleteClient, listClients, updateClient } from '@/lib/business-api';

const Clients = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');

  useEffect(() => {
    const run = async () => {
      setIsLoading(true);
      try {
        setClients(await listClients());
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load clients');
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, []);

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openForm = (client?: Client) => {
    if (client) {
      setSelectedClient(client);
      setFormName(client.name);
      setFormEmail(client.email);
      setFormPhone(client.phone);
      setFormAddress(client.address || '');
    } else {
      setSelectedClient(null);
      setFormName('');
      setFormEmail('');
      setFormPhone('');
      setFormAddress('');
    }
    setFormOpen(true);
  };

  const handleView = (client: Client) => {
    setSelectedClient(client);
    setViewOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) return toast.error('Please enter a client name');
    if (!formEmail.trim()) return toast.error('Please enter an email address');

    try {
      if (selectedClient) {
        const updated = await updateClient(selectedClient.id, {
          name: formName,
          email: formEmail,
          phone: formPhone,
          address: formAddress,
        });
        console.log('Created client:', updated);
        setClients(clients.map((c) => (c.id === selectedClient.id ? updated : c)));
        toast.success('Client updated successfully');
      } else {
        const created = await createClient({
          name: formName,
          email: formEmail,
          phone: formPhone,
          address: formAddress,
        });
        console.log('Created client:', created);
        setClients([created, ...clients]);
        toast.success('Client created successfully');
      }
      setFormOpen(false);
    } catch (error) {
      if (error instanceof ApiError) return toast.error(error.message);
      if (error instanceof Error) return toast.error(error.message);
      toast.error('Unable to save client');
    }
  };

  const handleDelete = (client: Client) => {
    setSelectedClient(client);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedClient) return;
    try {
      await deleteClient(selectedClient.id);
      setClients(clients.filter((c) => c.id !== selectedClient.id));
      toast.success('Client deleted successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete client');
    } finally {
      setDeleteOpen(false);
      setSelectedClient(null);
    }
  };

  const handleCreateInvoice = (client: Client) => {
    navigate('/dashboard/invoices?new=true');
    toast.success(`Creating invoice for ${client.name}`);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="client" />
      <div className="flex-1 flex flex-col">
        <DashboardHeader title="Clients" />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-display font-bold">Clients</h1>
              <p className="text-muted-foreground">Manage your client relationships</p>
            </div>
            <Button className="gap-2" onClick={() => openForm()}>
              <Plus className="w-4 h-4" />
              Add Client
            </Button>
          </div>

          <div className="bg-card rounded-xl border border-border">
            <div className="p-4 border-b border-border">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Total Invoices</TableHead>
                  <TableHead>Outstanding Balance</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">Loading clients...</TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client, index) => (
                    <TableRow key={client.id}>
                      <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleView(client)}
                          className="flex items-center gap-3 hover:text-primary transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                            {client.name.charAt(0)}
                          </div>
                          <span className="font-medium hover:underline">{client.name}</span>
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                            {client.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="w-3.5 h-3.5" />
                            {client.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{client.totalInvoices}</TableCell>
                      <TableCell className="font-medium">${client.balance.toLocaleString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover">
                            <DropdownMenuItem onClick={() => handleView(client)}>View Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openForm(client)}>Edit Client</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCreateInvoice(client)}>Create Invoice</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(client)}>Delete</DropdownMenuItem>
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

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input placeholder="Client or company name" value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" placeholder="contact@company.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input placeholder="+1 234 567 890" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea placeholder="Full address" value={formAddress} onChange={(e) => setFormAddress(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{selectedClient ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-semibold">
                  {selectedClient.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedClient.name}</h3>
                  <p className="text-muted-foreground">{selectedClient.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedClient.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{selectedClient.address || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Invoices</p>
                  <p className="font-medium">{selectedClient.totalInvoices}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                  <p className="font-medium text-primary">${selectedClient.balance.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button>
            <Button onClick={() => { setViewOpen(false); if (selectedClient) openForm(selectedClient); }}>Edit Client</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedClient?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Clients;
