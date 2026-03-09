import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import { Plus, Search, MoreHorizontal, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import InvoiceFormDialog from '@/components/documents/InvoiceFormDialog';
import DocumentViewDialog from '@/components/documents/DocumentViewDialog';
import { Client, Invoice, Product } from '@/types/documents';
import { toast } from 'sonner';
import { convertInvoiceToReceipt, deleteInvoice, getWorkspaceDocumentDownloadUrl, listClients, listInvoices, listProducts, saveInvoice, sendWorkspaceDocument } from '@/lib/business-api';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  paid: 'default',
  pending: 'secondary',
  overdue: 'destructive',
  partial: 'outline',
  draft: 'outline',
};

const Invoices = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setFormOpen(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [invoiceList, clientList, productList] = await Promise.all([
          listInvoices(),
          listClients(),
          listProducts(),
        ]);
        setInvoices(invoiceList);
        setClients(clientList);
        setProducts(productList);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load invoices');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filteredInvoices = invoices.filter((invoice) =>
    invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async (invoice: Invoice) => {
    try {
      const saved = await saveInvoice(invoice);
      const exists = invoices.find((inv) => inv.id === saved.id);
      if (exists) {
        setInvoices(invoices.map((inv) => (inv.id === saved.id ? saved : inv)));
      } else {
        setInvoices([saved, ...invoices]);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save invoice');
    }
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setFormOpen(true);
  };

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewOpen(true);
  };

  const handleDelete = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedInvoice) return;
    try {
      await deleteInvoice(selectedInvoice.documentId ?? selectedInvoice.id);
      setInvoices(invoices.filter((inv) => inv.id !== selectedInvoice.id));
      toast.success('Invoice deleted successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete invoice');
    }
    setDeleteOpen(false);
    setSelectedInvoice(null);
  };

  const handleRecordPayment = () => {
    toast.success('Navigate to Receipts to create a receipt');
  };

  const handleConvertToReceipt = async (invoice: Invoice) => {
    if (!invoice.documentId) return toast.error('Missing internal invoice id');
    try {
      await convertInvoiceToReceipt(invoice.documentId);
      toast.success(`${invoice.id} converted to receipt`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to convert invoice');
    }
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    if (!invoice.documentId) return toast.error('Missing internal invoice id');
    try {
      const url = await getWorkspaceDocumentDownloadUrl('invoices', invoice.documentId);
      if (url) window.open(url, '_blank');
      toast.success(`Downloading ${invoice.id} as PDF...`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to download PDF');
    }
  };

  const handleSendEmail = async (invoice: Invoice) => {
    if (!invoice.documentId) return toast.error('Missing internal invoice id');
    try {
      await sendWorkspaceDocument('invoices', invoice.documentId);
      toast.success(`Email sent to client for ${invoice.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send invoice');
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="client" />
      <div className="flex-1 flex flex-col">
        <DashboardHeader title="Invoices" />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-display font-bold">Invoices</h1>
              <p className="text-muted-foreground">Manage and track your invoices</p>
            </div>
            <Button className="gap-2" onClick={() => { setSelectedInvoice(null); setFormOpen(true); }}>
              <Plus className="w-4 h-4" />
              New Invoice
            </Button>
          </div>

          <div className="bg-card rounded-xl border border-border">
            <div className="p-4 border-b border-border">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Loading invoices...</TableCell></TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <button onClick={() => handleView(invoice)} className="flex items-center gap-2 hover:text-primary transition-colors">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium hover:underline">{invoice.id}</span>
                        </button>
                      </TableCell>
                      <TableCell>{invoice.client}</TableCell>
                      <TableCell>{invoice.date}</TableCell>
                      <TableCell>{invoice.dueDate}</TableCell>
                      <TableCell className="font-medium">${invoice.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={statusColors[invoice.status]} className="capitalize">{invoice.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(invoice)}>View Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(invoice)}>Edit Invoice</DropdownMenuItem>
                            <DropdownMenuItem onClick={handleRecordPayment}>Record Payment</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleConvertToReceipt(invoice)}>Convert to Receipt</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadPDF(invoice)}>Download PDF</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendEmail(invoice)}>Send via Email</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(invoice)}>Delete</DropdownMenuItem>
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

      <InvoiceFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        invoice={selectedInvoice}
        onSave={handleSave}
        clients={clients}
        products={products}
      />

      <DocumentViewDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        document={selectedInvoice}
        type="invoice"
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedInvoice?.id}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Invoices;
