import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Client, Invoice, LineItem, Product, mockClients, mockProducts } from '@/types/documents';
import DocumentLineItems from './DocumentLineItems';
import { toast } from 'sonner';

interface InvoiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: Invoice | null;
  onSave: (invoice: Invoice) => void;
  clients?: Client[];
  products?: Product[];
}

const generateInvoiceId = () => `INV-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

const InvoiceFormDialog = ({
  open,
  onOpenChange,
  invoice,
  onSave,
  clients = mockClients,
  products = mockProducts,
}: InvoiceFormDialogProps) => {
  const [clientId, setClientId] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<LineItem[]>([]);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<Invoice['status']>('pending');

  useEffect(() => {
    if (invoice) {
      setClientId(invoice.clientId.toString());
      setDate(invoice.date);
      setDueDate(invoice.dueDate);
      setItems(invoice.items);
      setNotes(invoice.notes || '');
      setStatus(invoice.status);
    } else {
      resetForm();
    }
  }, [invoice, open]);

  const resetForm = () => {
    setClientId('');
    setDate(new Date().toISOString().split('T')[0]);
    setDueDate('');
    setItems([]);
    setNotes('');
    setStatus('pending');
  };

  const handleSave = () => {
    if (!clientId) {
      toast.error('Please select a client');
      return;
    }
    if (!dueDate) {
      toast.error('Please set a due date');
      return;
    }
    if (items.length === 0) {
      toast.error('Please add at least one line item');
      return;
    }

    const client = clients.find(c => c.id === parseInt(clientId));
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxTotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.taxRate / 100), 0);

    const newInvoice: Invoice = {
      id: invoice?.id || generateInvoiceId(),
      documentId: invoice?.documentId,
      client: client?.name || '',
      clientId: parseInt(clientId),
      date,
      dueDate,
      amount: subtotal + taxTotal,
      status,
      items,
      subtotal,
      taxTotal,
      notes,
    };

    onSave(newInvoice);
    toast.success(invoice ? 'Invoice updated successfully' : 'Invoice created successfully');
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{invoice ? 'Edit Invoice' : 'Create New Invoice'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Client *</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(val) => setStatus(val as Invoice['status'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Invoice Date *</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Due Date *</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <DocumentLineItems items={items} onItemsChange={setItems} products={products} />

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              placeholder="Add any notes or payment instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {invoice ? 'Update Invoice' : 'Create Invoice'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceFormDialog;
