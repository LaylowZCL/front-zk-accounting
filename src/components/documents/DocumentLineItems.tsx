import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { LineItem, Product } from '@/types/documents';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { formatMoney } from '@/lib/currency';

interface DocumentLineItemsProps {
  items: LineItem[];
  onItemsChange: (items: LineItem[]) => void;
  products?: Product[];
}

const generateId = () => crypto.randomUUID();

const DocumentLineItems = ({ items, onItemsChange, products = [] }: DocumentLineItemsProps) => {
  const activeProducts = products.filter(p => p.status === 'active');
  const { settings } = useCompanySettings();
  const currency = settings.currency || 'MT';

  const addItem = () => {
    const newItem: LineItem = {
      id: generateId(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 0,
      total: 0,
    };
    onItemsChange([...items, newItem]);
  };

  const removeItem = (id: string) => {
    onItemsChange(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        const subtotal = updated.quantity * updated.unitPrice;
        const tax = subtotal * (updated.taxRate / 100);
        updated.total = subtotal + tax;
        return updated;
      }
      return item;
    });
    onItemsChange(updatedItems);
  };

  const importProduct = (itemId: string, productId: string) => {
    const product = products.find(p => p.id === parseInt(productId));
    if (product) {
      const updatedItems = items.map(item => {
        if (item.id === itemId) {
          const updated = {
            ...item,
            productId: product.id,
            description: product.name,
            unitPrice: product.price,
            total: item.quantity * product.price * (1 + item.taxRate / 100),
          };
          return updated;
        }
        return item;
      });
      onItemsChange(updatedItems);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxTotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.taxRate / 100), 0);
  const grandTotal = subtotal + taxTotal;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Line Items</Label>
        <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted/50 grid grid-cols-12 gap-2 p-3 text-sm font-medium">
          <div className="col-span-4">Description</div>
          <div className="col-span-2">Product</div>
          <div className="col-span-1">Qty</div>
          <div className="col-span-2">Price</div>
          <div className="col-span-1">Tax %</div>
          <div className="col-span-1 text-right">Total</div>
          <div className="col-span-1"></div>
        </div>

        {items.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            No items added. Click "Add Item" to start.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 p-3 border-t items-center">
              <div className="col-span-4">
                <Input
                  placeholder="Item description"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Select onValueChange={(val) => importProduct(item.id, val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Import" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1">
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="col-span-1">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={item.taxRate}
                  onChange={(e) => updateItem(item.id, 'taxRate', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="col-span-1 text-right font-medium">
                {formatMoney(item.total, currency)}
              </div>
              <div className="col-span-1 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatMoney(subtotal, currency)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax</span>
            <span>{formatMoney(taxTotal, currency)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg border-t pt-2">
            <span>Total</span>
            <span>{formatMoney(grandTotal, currency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentLineItems;
