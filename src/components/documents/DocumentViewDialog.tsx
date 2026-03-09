import { useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, Download, Mail, Building2, Phone, Mail as MailIcon, Globe, MapPin } from 'lucide-react';
import { Invoice, Quotation, Receipt } from '@/types/documents';
import { toast } from 'sonner';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { formatMoney } from '@/lib/currency';

interface DocumentViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Invoice | Quotation | Receipt | null;
  type: 'invoice' | 'quotation' | 'receipt';
}

const DocumentViewDialog = ({ open, onOpenChange, document, type }: DocumentViewDialogProps) => {
  const printRef = useRef<HTMLDivElement>(null);
  const { settings: companySettings, loading: settingsLoading } = useCompanySettings();
  const currency = companySettings.currency || 'MT';

  if (!document) return null;

  const isReceipt = type === 'receipt';
  const hasItems = !isReceipt && 'items' in document;

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${document.id}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .company { font-size: 24px; font-weight: bold; color: #4f46e5; margin-bottom: 8px; }
            .company-details { font-size: 14px; color: #6b7280; line-height: 1.5; }
            .document-info { text-align: right; }
            .document-id { font-size: 20px; font-weight: bold; }
            .client-info { margin-bottom: 30px; padding: 20px; background: #f9fafb; border-radius: 8px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            .items-table th { background: #f9fafb; font-weight: 600; }
            .totals { text-align: right; }
            .totals .row { display: flex; justify-content: flex-end; gap: 40px; margin-bottom: 8px; }
            .totals .total { font-size: 18px; font-weight: bold; border-top: 2px solid #e5e7eb; padding-top: 8px; }
            .notes { margin-top: 40px; padding: 20px; background: #f9fafb; border-radius: 8px; }
            .status { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 500; }
            .status-paid, .status-accepted { background: #dcfce7; color: #166534; }
            .status-pending { background: #fef3c7; color: #92400e; }
            .status-overdue, .status-declined { background: #fee2e2; color: #991b1b; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="company">${companySettings.company_name || 'Sua Empresa'}</div>
              <div class="company-details">
                ${companySettings.address ? `<div>${companySettings.address}</div>` : ''}
                ${companySettings.tax_id ? `<div>NIF: ${companySettings.tax_id}</div>` : ''}
                <div>${companySettings.email || 'empresa@exemplo.com'}</div>
                ${companySettings.phone ? `<div>${companySettings.phone}</div>` : ''}
                ${companySettings.website ? `<div>${companySettings.website}</div>` : ''}
              </div>
            </div>
            <div class="document-info">
              <div class="document-id">${document.id}</div>
              <div>Date: ${document.date}</div>
              ${'dueDate' in document ? `<div>Due: ${document.dueDate}</div>` : ''}
              ${'validUntil' in document ? `<div>Valid Until: ${document.validUntil}</div>` : ''}
              ${'status' in document ? `<div class="status ${getStatusClass(document.status)}">${document.status}</div>` : ''}
            </div>
          </div>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownload = () => {
    toast.success('PDF download started');
    // In a real app, this would generate a PDF
  };

  const handleEmail = () => {
    toast.success('Email dialog would open here');
    // In a real app, this would open an email dialog
  };

  const getStatusClass = (status: string) => {
    if (status === 'paid' || status === 'accepted') return 'status-paid';
    if (status === 'pending') return 'status-pending';
    return 'status-overdue';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>View {type.charAt(0).toUpperCase() + type.slice(1)}</DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleEmail}>
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
          </div>
        </DialogHeader>

        {/* Non-printable Header for UI */}
        <div className="flex justify-between items-start mb-8 print:hidden">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-primary">
                {companySettings.company_name || 'Sua Empresa'}
              </h2>
            </div>
            
            {/* Company Details */}
            <div className="space-y-1 text-sm text-muted-foreground">
              {companySettings.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{companySettings.address}</span>
                </div>
              )}
              
              {companySettings.tax_id && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>NIF: {companySettings.tax_id}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <MailIcon className="w-4 h-4" />
                <span>{companySettings.email || 'empresa@exemplo.com'}</span>
              </div>
              
              {companySettings.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{companySettings.phone}</span>
                </div>
              )}
              
              {companySettings.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>{companySettings.website}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-xl font-bold">{document.id}</p>
            <p className="text-sm text-muted-foreground">
              Date: {document.date}
            </p>
            {'dueDate' in document && (
              <p className="text-sm text-muted-foreground">
                Due: {document.dueDate}
              </p>
            )}
            {'validUntil' in document && (
              <p className="text-sm text-muted-foreground">
                Valid Until: {document.validUntil}
              </p>
            )}
            {'status' in document && (
              <Badge className={`mt-2 capitalize ${getStatusClass(document.status)}`}>
                {document.status}
              </Badge>
            )}
          </div>
        </div>

        {/* Printable Content */}
        <div ref={printRef} className="py-6">
          {/* Client Info */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2">Bill To:</h3>
            <p className="font-medium">{document.client}</p>
          </div>

          {/* Line Items (for Invoice/Quotation) */}
          {hasItems && 'items' in document && (
            <div className="mb-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 font-semibold">Description</th>
                    <th className="text-right py-3 font-semibold">Qty</th>
                    <th className="text-right py-3 font-semibold">Price</th>
                    <th className="text-right py-3 font-semibold">Tax</th>
                    <th className="text-right py-3 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {document.items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-3">{item.description}</td>
                      <td className="text-right py-3">{item.quantity}</td>
                      <td className="text-right py-3">$</td>
                      <td className="text-right py-3">{item.taxRate}%</td>
                      <td className="text-right py-3 font-medium">$</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end mt-4">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>$</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>$</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>$</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Receipt specific info */}
          {isReceipt && 'paymentMethod' in document && (
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Invoice Reference</p>
                  <p className="font-medium">{document.invoice}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-medium">{document.paymentMethod}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Amount Paid</p>
                <p className="text-2xl font-bold text-primary">$</p>
              </div>
            </div>
          )}

          {/* Notes */}
          {'notes' in document && document.notes && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Notes:</h3>
              <p className="text-sm">{document.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewDialog;

