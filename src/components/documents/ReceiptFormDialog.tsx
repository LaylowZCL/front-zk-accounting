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
import { Client, Receipt, mockClients, paymentMethods } from '@/types/documents';
import { toast } from 'sonner';

interface ReceiptFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt?: Receipt | null;
  onSave: (receipt: Receipt) => void;
  invoiceOptions?: { id: string; client: string; clientId?: number; amount: number }[];
  clients?: Client[];
}

const generateReceiptId = () => `RCP-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

const mockInvoiceOptions = [
  { id: 'INV-001', client: 'Acme Corporation', amount: 8500.00 },
  { id: 'INV-002', client: 'TechStart Inc.', amount: 3200.00 },
  { id: 'INV-003', client: 'Global Services Ltd.', amount: 12000.00 },
  { id: 'INV-004', client: 'Creative Agency', amount: 1500.00 },
];

const ReceiptFormDialog = ({ 
  open, 
  onOpenChange, 
  receipt, 
  onSave,
  invoiceOptions = mockInvoiceOptions,
  clients = mockClients,
}: ReceiptFormDialogProps) => {
  const [invoiceId, setInvoiceId] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (receipt) {
      setInvoiceId(String(receipt.invoiceId));
      setDate(receipt.date);
      setAmount(receipt.amount);
      setPaymentMethod(receipt.paymentMethod);
      setNotes(receipt.notes || '');
    } else {
      resetForm();
    }
  }, [receipt, open]);

  const resetForm = () => {
    setInvoiceId('');
    setDate(new Date().toISOString().split('T')[0]);
    setAmount(0);
    setPaymentMethod('');
    setNotes('');
  };

  const handleInvoiceSelect = (id: string) => {
    setInvoiceId(id);
    const invoice = invoiceOptions.find(inv => inv.id === id);
    if (invoice) {
      setAmount(invoice.amount);
    }
  };

  const handleSave = () => {
    if (!invoiceId) {
      toast.error('Please select an invoice');
      return;
    }
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }
    if (amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const invoice = invoiceOptions.find(inv => inv.id === invoiceId);
    const client = clients.find(c => c.name === invoice?.client);

    const newReceipt: Receipt = {
      id: receipt?.id || generateReceiptId(),
      documentId: receipt?.documentId,
      invoice: invoiceId,
      invoiceId,
      client: invoice?.client || '',
      clientId: invoice?.clientId || client?.id || 0,
      date,
      amount,
      paymentMethod,
      notes,
    };

    onSave(newReceipt);
    toast.success(receipt ? 'Receipt updated successfully' : 'Receipt created successfully');
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{receipt ? 'Edit Receipt' : 'Create New Receipt'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Invoice *</Label>
            <Select value={invoiceId} onValueChange={handleInvoiceSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select an invoice" />
              </SelectTrigger>
              <SelectContent>
                {invoiceOptions.map((inv) => (
                  <SelectItem key={inv.id} value={inv.id}>
                    {inv.id} - {inv.client} (${inv.amount.toLocaleString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Receipt Date *</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Amount *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Payment Method *</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              placeholder="Add any notes..."
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
            {receipt ? 'Update Receipt' : 'Create Receipt'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptFormDialog;
