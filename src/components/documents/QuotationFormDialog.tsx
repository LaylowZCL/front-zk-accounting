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
import { Client, Product, Quotation, LineItem } from '@/types/documents';
import DocumentLineItems from './DocumentLineItems';
import { toast } from 'sonner';

interface QuotationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotation?: Quotation | null;
  onSave: (quotation: Quotation) => void;
  clients?: Client[];
  products?: Product[];
}

const generateQuotationId = () => `QT-${Date.now()}`;

const QuotationFormDialog = ({
  open,
  onOpenChange,
  quotation,
  onSave,
  clients = [],
  products = [],
}: QuotationFormDialogProps) => {
  const [clientId, setClientId] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState('');
  const [items, setItems] = useState<LineItem[]>([]);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<Quotation['status']>('pending');

  useEffect(() => {
    if (quotation) {
      setClientId(quotation.clientId.toString());
      setDate(quotation.date);
      setValidUntil(quotation.validUntil);
      setItems(quotation.items);
      setNotes(quotation.notes || '');
      setStatus(quotation.status);
    } else {
      resetForm();
    }
  }, [quotation, open]);

  const resetForm = () => {
    setClientId('');
    setDate(new Date().toISOString().split('T')[0]);
    setValidUntil('');
    setItems([]);
    setNotes('');
    setStatus('pending');
  };

  const handleSave = () => {
    if (!clientId) {
      toast.error('Please select a client');
      return;
    }
    if (!validUntil) {
      toast.error('Please set validity date');
      return;
    }
    if (items.length === 0) {
      toast.error('Please add at least one line item');
      return;
    }

    const client = clients.find(c => c.id === parseInt(clientId));
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxTotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.taxRate / 100), 0);

    const newQuotation: Quotation = {
      id: quotation?.id || generateQuotationId(),
      documentId: quotation?.documentId,
      client: client?.name || '',
      clientId: parseInt(clientId),
      date,
      validUntil,
      amount: subtotal + taxTotal,
      status,
      items,
      subtotal,
      taxTotal,
      notes,
    };

    onSave(newQuotation);
    toast.success(quotation ? 'Quotation updated successfully' : 'Quotation created successfully');
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{quotation ? 'Edit Quotation' : 'Create New Quotation'}</DialogTitle>
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
              <Select value={status} onValueChange={(val) => setStatus(val as Quotation['status'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quotation Date *</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Valid Until *</Label>
              <Input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>
          </div>

          <DocumentLineItems items={items} onItemsChange={setItems} products={products} />

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              placeholder="Add any notes or terms and conditions..."
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
            {quotation ? 'Update Quotation' : 'Create Quotation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuotationFormDialog;


