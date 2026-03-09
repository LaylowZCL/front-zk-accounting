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
import { Plus, Search, MoreHorizontal, Receipt as ReceiptIcon } from 'lucide-react';
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
import ReceiptFormDialog from '@/components/documents/ReceiptFormDialog';
import DocumentViewDialog from '@/components/documents/DocumentViewDialog';
import { Client, Invoice, Receipt } from '@/types/documents';
import { toast } from 'sonner';
import { deleteReceipt, getWorkspaceDocumentDownloadUrl, listClients, listInvoices, listReceipts, saveReceipt, sendWorkspaceDocument } from '@/lib/business-api';

const Receipts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [receiptList, invoiceList, clientList] = await Promise.all([
          listReceipts(),
          listInvoices(),
          listClients(),
        ]);
        setReceipts(receiptList);
        setInvoices(invoiceList);
        setClients(clientList);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load receipts');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const invoiceOptions = useMemo(
    () => invoices.map((inv) => ({ id: inv.id, client: inv.client, clientId: inv.clientId, amount: inv.amount })),
    [invoices]
  );

  const filteredReceipts = receipts.filter((receipt) =>
    receipt.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    receipt.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
    receipt.invoice.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async (receipt: Receipt) => {
    try {
      const saved = await saveReceipt(receipt);
      const exists = receipts.find((r) => r.id === saved.id);
      if (exists) setReceipts(receipts.map((r) => (r.id === saved.id ? saved : r)));
      else setReceipts([saved, ...receipts]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save receipt');
    }
  };

  const handleView = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setViewOpen(true);
  };

  const handleDelete = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedReceipt) return;
    try {
      await deleteReceipt(selectedReceipt.documentId ?? selectedReceipt.id);
      setReceipts(receipts.filter((r) => r.id !== selectedReceipt.id));
      toast.success('Receipt deleted successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete receipt');
    }
    setDeleteOpen(false);
    setSelectedReceipt(null);
  };

  const handleDownloadPDF = async (receipt: Receipt) => {
    if (!receipt.documentId) return toast.error('Missing internal receipt id');
    try {
      const url = await getWorkspaceDocumentDownloadUrl('receipts', receipt.documentId);
      if (url) window.open(url, '_blank');
      toast.success(`Downloading ${receipt.id} as PDF...`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to download PDF');
    }
  };

  const handleSendEmail = async (receipt: Receipt) => {
    if (!receipt.documentId) return toast.error('Missing internal receipt id');
    try {
      await sendWorkspaceDocument('receipts', receipt.documentId);
      toast.success(`Email sent to client for ${receipt.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send receipt');
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="client" />
      <div className="flex-1 flex flex-col">
        <DashboardHeader title="Receipts" />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-display font-bold">Receipts</h1>
              <p className="text-muted-foreground">View and manage payment receipts</p>
            </div>
            <Button className="gap-2" onClick={() => { setSelectedReceipt(null); setFormOpen(true); }}>
              <Plus className="w-4 h-4" />
              Create Receipt
            </Button>
          </div>

          <div className="bg-card rounded-xl border border-border">
            <div className="p-4 border-b border-border">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search receipts..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Loading receipts...</TableCell></TableRow>
                ) : (
                  filteredReceipts.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell>
                        <button onClick={() => handleView(receipt)} className="flex items-center gap-2 hover:text-primary transition-colors">
                          <ReceiptIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium hover:underline">{receipt.id}</span>
                        </button>
                      </TableCell>
                      <TableCell><Badge variant="outline">{receipt.invoice}</Badge></TableCell>
                      <TableCell>{receipt.client}</TableCell>
                      <TableCell>{receipt.date}</TableCell>
                      <TableCell className="font-medium">${receipt.amount.toLocaleString()}</TableCell>
                      <TableCell><Badge variant="secondary">{receipt.paymentMethod}</Badge></TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover">
                            <DropdownMenuItem onClick={() => handleView(receipt)}>View Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadPDF(receipt)}>Download PDF</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendEmail(receipt)}>Send via Email</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(receipt)}>Delete</DropdownMenuItem>
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

      <ReceiptFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        receipt={selectedReceipt}
        onSave={handleSave}
        invoiceOptions={invoiceOptions}
        clients={clients}
      />

      <DocumentViewDialog open={viewOpen} onOpenChange={setViewOpen} document={selectedReceipt} type="receipt" />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Receipt</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedReceipt?.id}? This action cannot be undone.
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

export default Receipts;
