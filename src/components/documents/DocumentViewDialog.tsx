import { useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, Download, Mail } from 'lucide-react';
import { Invoice, Quotation, Receipt } from '@/types/documents';
import { toast } from 'sonner';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { formatMoney } from '@/lib/currency';
import { downloadDocumentPdf } from '@/lib/business-api';

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
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print');
      return;
    }

    const logoHtml = companySettings.logo_url
      ? `<img src="${companySettings.logo_url}" style="max-height:48px; margin-bottom:6px;" alt="Logo" />`
      : `<div style="font-weight:700; color:#1f2937; margin-bottom:6px;">${companySettings.name || 'Sua Empresa'}</div>`;

    const itemsHtml = hasItems && 'items' in document
      ? document.items.map((item) => `
          <tr>
            <td>${item.description}</td>
            <td class="right">${item.quantity}</td>
            <td class="right">${formatMoney(item.unitPrice, currency)}</td>
            <td class="right">${item.taxRate}%</td>
            <td class="right">${formatMoney(item.total, currency)}</td>
          </tr>
        `).join('')
      : '';

    const totalsHtml = hasItems
      ? `
        <table class="totals">
          <tr>
            <td class="right" style="width:80%"><strong>Subtotal</strong></td>
            <td class="right">${formatMoney((document as Invoice | Quotation).subtotal, currency)}</td>
          </tr>
          <tr>
            <td class="right"><strong>Tax</strong></td>
            <td class="right">${formatMoney((document as Invoice | Quotation).taxTotal, currency)}</td>
          </tr>
          <tr>
            <td class="right"><strong>Total</strong></td>
            <td class="right">${formatMoney(document.amount, currency)}</td>
          </tr>
        </table>
      `
      : '';

    const receiptHtml = isReceipt && 'paymentMethod' in document
      ? `
        <div class="card">
          <div class="row">
            <div>
              <div class="label">Invoice Reference</div>
              <div>${document.invoice}</div>
            </div>
            <div>
              <div class="label">Payment Method</div>
              <div>${document.paymentMethod}</div>
            </div>
          </div>
          <div class="amount">${formatMoney(document.amount, currency)}</div>
        </div>
      `
      : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${document.id}</title>
          <style>
            :root { --brand: #1f2937; }
            body { font-family: DejaVu Sans, Arial, sans-serif; color: #1f2937; font-size: 12px; margin: 0; padding: 32px; }
            .header { display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:16px; border-bottom:2px solid var(--brand); margin-bottom:16px; }
            .title { font-size:18px; font-weight:700; margin:0 0 4px; color: var(--brand); }
            .muted { color:#6b7280; }
            .right { text-align:right; }
            .card { border:1px solid #e5e7eb; border-radius:10px; padding:12px; margin-bottom:16px; }
            .label { color:#6b7280; font-size:11px; }
            table { width:100%; border-collapse:collapse; }
            th, td { border-bottom:1px solid #e5e7eb; padding:8px 6px; text-align:left; }
            th { background:#f9fafb; font-weight:600; }
            .totals td { border:none; padding:4px 6px; }
            .status { display:inline-block; padding:4px 10px; border-radius:999px; font-size:11px; font-weight:600; text-transform:capitalize; }
            .status-paid, .status-accepted { background:#dcfce7; color:#166534; }
            .status-pending { background:#fef3c7; color:#92400e; }
            .status-overdue, .status-declined { background:#fee2e2; color:#991b1b; }
            .row { display:flex; justify-content:space-between; gap:16px; }
            .amount { text-align:right; font-size:18px; font-weight:700; margin-top:12px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              ${logoHtml}
              <div class="title">${type.toUpperCase()}</div>
              <div class="muted">#${document.id}</div>
            </div>
            <div class="right">
              <div style="font-weight:600;">${companySettings.name || 'Sua Empresa'}</div>
              ${companySettings.tax_id ? `<div class="muted">NIF: ${companySettings.tax_id}</div>` : ''}
              ${companySettings.email ? `<div class="muted">${companySettings.email}</div>` : ''}
              ${companySettings.phone ? `<div class="muted">${companySettings.phone}</div>` : ''}
              ${companySettings.address ? `<div class="muted">${companySettings.address}</div>` : ''}
            </div>
          </div>

          <div class="card">
            <div><strong>Client:</strong> ${'client' in document ? document.client : '-'}</div>
            <div><strong>Date:</strong> ${document.date}</div>
            ${'dueDate' in document ? `<div><strong>Due:</strong> ${document.dueDate}</div>` : ''}
            ${'validUntil' in document ? `<div><strong>Valid Until:</strong> ${document.validUntil}</div>` : ''}
            ${'status' in document ? `<div><strong>Status:</strong> <span class="status ${getStatusClass(document.status)}">${document.status}</span></div>` : ''}
          </div>

          ${hasItems ? `
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th class="right">Qty</th>
                  <th class="right">Unit</th>
                  <th class="right">Tax %</th>
                  <th class="right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            ${totalsHtml}
          ` : ''}

          ${receiptHtml}

          ${'notes' in document && document.notes ? `
            <div class="card">
              <strong>Notes:</strong> ${document.notes}
            </div>
          ` : ''}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleDownload = async () => {
    try {
      const doc = document as Invoice | Quotation | Receipt;
      const documentId = doc.documentId ?? doc.id;
      const result = await downloadDocumentPdf(documentId);
      const blobUrl = URL.createObjectURL(result.blob);
      const link = window.document.createElement('a');
      link.href = blobUrl;
      link.download = result.filename || `${doc.id}.pdf`;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to download PDF');
    }
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

  const getStatusBadgeClass = (status: string) => {
    if (status === 'paid' || status === 'accepted') return 'bg-success/15 text-success';
    if (status === 'pending') return 'bg-warning/15 text-warning';
    return 'bg-destructive/15 text-destructive';
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

        <div ref={printRef} className="border border-border rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-start border-b border-border/70 pb-4">
            <div>
              {companySettings.logo_url ? (
                <img src={companySettings.logo_url} alt="Logo" className="h-12 mb-2" />
              ) : (
                <p className="font-semibold text-base text-primary mb-2">{companySettings.name || 'Sua Empresa'}</p>
              )}
              <p className="text-lg font-bold text-primary uppercase">{type}</p>
              <p className="text-sm text-muted-foreground">#{document.id}</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-semibold">{companySettings.name || 'Sua Empresa'}</p>
              {companySettings.tax_id && <p className="text-muted-foreground">NIF: {companySettings.tax_id}</p>}
              {companySettings.email && <p className="text-muted-foreground">{companySettings.email}</p>}
              {companySettings.phone && <p className="text-muted-foreground">{companySettings.phone}</p>}
              {companySettings.address && <p className="text-muted-foreground">{companySettings.address}</p>}
            </div>
          </div>

          <div className="rounded-xl border border-border/70 p-4 text-sm">
            <div className="flex flex-wrap gap-4 justify-between">
              <div>
                <p className="text-muted-foreground">Client</p>
                <p className="font-medium">{'client' in document ? document.client : '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Date</p>
                <p className="font-medium">{document.date}</p>
              </div>
              {'dueDate' in document && (
                <div>
                  <p className="text-muted-foreground">Due</p>
                  <p className="font-medium">{document.dueDate}</p>
                </div>
              )}
              {'validUntil' in document && (
                <div>
                  <p className="text-muted-foreground">Valid Until</p>
                  <p className="font-medium">{document.validUntil}</p>
                </div>
              )}
              {'status' in document && (
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge className={`mt-1 capitalize ${getStatusBadgeClass(document.status)}`}>
                    {document.status}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {hasItems && 'items' in document && (
            <div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Description</th>
                    <th className="text-right py-2">Qty</th>
                    <th className="text-right py-2">Unit</th>
                    <th className="text-right py-2">Tax %</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {document.items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-2">{item.description}</td>
                      <td className="text-right py-2">{item.quantity}</td>
                      <td className="text-right py-2">{formatMoney(item.unitPrice, currency)}</td>
                      <td className="text-right py-2">{item.taxRate}%</td>
                      <td className="text-right py-2 font-medium">{formatMoney(item.total, currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end mt-4">
                <div className="w-64 space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatMoney(document.subtotal, currency)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax</span>
                    <span>{formatMoney(document.taxTotal, currency)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t pt-2">
                    <span>Total</span>
                    <span>{formatMoney(document.amount, currency)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isReceipt && 'paymentMethod' in document && (
            <div className="rounded-xl border border-border/70 p-4 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground">Invoice Reference</p>
                  <p className="font-medium">{document.invoice}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Method</p>
                  <p className="font-medium">{document.paymentMethod}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">Amount Paid</p>
                <p className="text-lg font-bold text-primary">{formatMoney(document.amount, currency)}</p>
              </div>
            </div>
          )}

          {'notes' in document && document.notes && (
            <div className="rounded-xl border border-border/70 p-4">
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-sm text-muted-foreground">{document.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewDialog;
