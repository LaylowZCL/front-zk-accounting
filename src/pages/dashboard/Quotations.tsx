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
import QuotationFormDialog from '@/components/documents/QuotationFormDialog';
import DocumentViewDialog from '@/components/documents/DocumentViewDialog';
import { Client, Product, Quotation } from '@/types/documents';
import { toast } from 'sonner';
import { convertQuotationToInvoice, deleteQuotation, getWorkspaceDocumentDownloadUrl, listClients, listProducts, listQuotations, saveQuotation, sendWorkspaceDocument } from '@/lib/business-api';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  accepted: 'default',
  declined: 'destructive',
  expired: 'outline',
  draft: 'outline',
};

const Quotations = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [quotes, clientList, productList] = await Promise.all([
          listQuotations(),
          listClients(),
          listProducts(),
        ]);
        setQuotations(quotes);
        setClients(clientList);
        setProducts(productList);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load quotations');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filteredQuotations = quotations.filter((quote) =>
    quote.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quote.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async (quotation: Quotation) => {
    try {
      const saved = await saveQuotation(quotation);
      const exists = quotations.find((q) => q.id === saved.id);
      if (exists) setQuotations(quotations.map((q) => (q.id === saved.id ? saved : q)));
      else setQuotations([saved, ...quotations]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save quotation');
    }
  };

  const handleEdit = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setFormOpen(true);
  };

  const handleView = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setViewOpen(true);
  };

  const handleDelete = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedQuotation) return;
    try {
      await deleteQuotation(selectedQuotation.documentId ?? selectedQuotation.id);
      setQuotations(quotations.filter((q) => q.id !== selectedQuotation.id));
      toast.success('Quotation deleted successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete quotation');
    }
    setDeleteOpen(false);
    setSelectedQuotation(null);
  };

  const handleConvertToInvoice = async (quotation: Quotation) => {
    if (!quotation.documentId) return toast.error('Missing internal quotation id');
    try {
      await convertQuotationToInvoice(quotation.documentId);
      toast.success(`Converting ${quotation.id} to invoice`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to convert quotation');
    }
  };

  const handleDownloadPDF = async (quotation: Quotation) => {
    if (!quotation.documentId) return toast.error('Missing internal quotation id');
    try {
      const url = await getWorkspaceDocumentDownloadUrl('quotations', quotation.documentId);
      if (url) window.open(url, '_blank');
      toast.success(`Downloading ${quotation.id} as PDF...`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to download PDF');
    }
  };

  const handleSendEmail = async (quotation: Quotation) => {
    if (!quotation.documentId) return toast.error('Missing internal quotation id');
    try {
      await sendWorkspaceDocument('quotations', quotation.documentId);
      toast.success(`Email sent to client for ${quotation.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send quotation');
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="client" />
      <div className="flex-1 flex flex-col">
        <DashboardHeader title="Quotations" />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-display font-bold">Quotations</h1>
              <p className="text-muted-foreground">Create and manage client quotations</p>
            </div>
            <Button className="gap-2" onClick={() => { setSelectedQuotation(null); setFormOpen(true); }}>
              <Plus className="w-4 h-4" />
              New Quotation
            </Button>
          </div>

          <div className="bg-card rounded-xl border border-border">
            <div className="p-4 border-b border-border">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search quotations..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quotation</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Loading quotations...</TableCell></TableRow>
                ) : (
                  filteredQuotations.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell>
                        <button onClick={() => handleView(quote)} className="flex items-center gap-2 hover:text-primary transition-colors">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium hover:underline">{quote.id}</span>
                        </button>
                      </TableCell>
                      <TableCell>{quote.client}</TableCell>
                      <TableCell>{quote.date}</TableCell>
                      <TableCell>{quote.validUntil}</TableCell>
                      <TableCell className="font-medium">${quote.amount.toLocaleString()}</TableCell>
                      <TableCell><Badge variant={statusColors[quote.status]} className="capitalize">{quote.status}</Badge></TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover">
                            <DropdownMenuItem onClick={() => handleView(quote)}>View Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(quote)}>Edit Quotation</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleConvertToInvoice(quote)}>Convert to Invoice</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadPDF(quote)}>Download PDF</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendEmail(quote)}>Send via Email</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(quote)}>Delete</DropdownMenuItem>
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

      <QuotationFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        quotation={selectedQuotation}
        onSave={handleSave}
        clients={clients}
        products={products}
      />

      <DocumentViewDialog open={viewOpen} onOpenChange={setViewOpen} document={selectedQuotation} type="quotation" />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quotation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedQuotation?.id}? This action cannot be undone.
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

export default Quotations;
