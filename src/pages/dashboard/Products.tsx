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
import { Plus, Search, MoreHorizontal } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Product } from '@/types/documents';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api';
import { createProduct, deleteProduct, duplicateProduct, listProducts, updateProduct } from '@/lib/business-api';

const Products = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formType, setFormType] = useState<Product['type']>('service');
  const [formStatus, setFormStatus] = useState<Product['status']>('active');

  useEffect(() => {
    const run = async () => {
      setIsLoading(true);
      try {
        setProducts(await listProducts());
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openForm = (product?: Product) => {
    if (product) {
      setSelectedProduct(product);
      setFormName(product.name);
      setFormDescription(product.description);
      setFormPrice(product.price);
      setFormType(product.type);
      setFormStatus(product.status);
    } else {
      setSelectedProduct(null);
      setFormName('');
      setFormDescription('');
      setFormPrice(0);
      setFormType('service');
      setFormStatus('active');
    }
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) return toast.error('Please enter a product name');

    try {
      if (selectedProduct) {
        const updated = await updateProduct(selectedProduct.id, {
          name: formName,
          description: formDescription,
          price: formPrice,
          type: formType,
          status: formStatus,
        });
        setProducts(products.map((p) => (p.id === selectedProduct.id ? updated : p)));
        toast.success('Product updated successfully');
      } else {
        const created = await createProduct({
          name: formName,
          description: formDescription,
          price: formPrice,
          type: formType,
          status: formStatus,
        });
        setProducts([created, ...products]);
        toast.success('Product created successfully');
      }
      setFormOpen(false);
    } catch (error) {
      if (error instanceof ApiError) return toast.error(error.message);
      toast.error('Unable to save product');
    }
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;
    try {
      await deleteProduct(selectedProduct.id);
      setProducts(products.filter((p) => p.id !== selectedProduct.id));
      toast.success('Product deleted successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete product');
    } finally {
      setDeleteOpen(false);
      setSelectedProduct(null);
    }
  };

  const handleDuplicate = async (product: Product) => {
    try {
      const newProduct = await duplicateProduct(product.id);
      setProducts([newProduct, ...products]);
      toast.success('Product duplicated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to duplicate product');
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="client" />
      <div className="flex-1 flex flex-col">
        <DashboardHeader title="Products" />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-display font-bold">Products & Services</h1>
              <p className="text-muted-foreground">Manage your billable items</p>
            </div>
            <Button className="gap-2" onClick={() => openForm()}>
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </div>

          <div className="bg-card rounded-xl border border-border">
            <div className="p-4 border-b border-border">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product/Service</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">Loading products...</TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <button onClick={() => openForm(product)} className="text-left hover:text-primary transition-colors">
                          <p className="font-medium hover:underline">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.description}</p>
                        </button>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">{product.type}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">${product.price.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>{product.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover">
                            <DropdownMenuItem onClick={() => openForm(product)}>Edit Product</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(product)}>Duplicate</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(product)}>Delete</DropdownMenuItem>
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
            <DialogTitle>{selectedProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input placeholder="Product or service name" value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Brief description" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price *</Label>
                <Input type="number" min="0" step="0.01" value={formPrice} onChange={(e) => setFormPrice(parseFloat(e.target.value) || 0)} />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formType} onValueChange={(val) => setFormType(val as Product['type'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formStatus} onValueChange={(val) => setFormStatus(val as Product['status'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{selectedProduct ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone.
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

export default Products;
