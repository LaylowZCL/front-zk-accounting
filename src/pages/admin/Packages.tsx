import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Check, Users } from 'lucide-react';
import { toast } from 'sonner';

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  isActive: boolean;
  subscriberCount: number;
  color: string;
}

const mockPackages: Package[] = [
  {
    id: '1',
    name: 'Starter',
    description: 'Perfect for small businesses just getting started',
    price: 29,
    billingCycle: 'monthly',
    features: ['Up to 3 users', '100 invoices/month', 'Basic reports', 'Email support'],
    isActive: true,
    subscriberCount: 145,
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: '2',
    name: 'Professional',
    description: 'For growing businesses that need more power',
    price: 79,
    billingCycle: 'monthly',
    features: ['Up to 10 users', 'Unlimited invoices', 'Advanced reports', 'Priority support', 'Custom branding'],
    isActive: true,
    subscriberCount: 198,
    color: 'from-primary to-purple-600',
  },
  {
    id: '3',
    name: 'Enterprise',
    description: 'For large organizations with complex needs',
    price: 199,
    billingCycle: 'monthly',
    features: ['Unlimited users', 'Unlimited invoices', 'Custom reports', 'Dedicated support', 'API access', 'SSO'],
    isActive: true,
    subscriberCount: 55,
    color: 'from-orange-500 to-red-500',
  },
  {
    id: '4',
    name: 'Legacy Plan',
    description: 'Discontinued plan for existing subscribers',
    price: 49,
    billingCycle: 'monthly',
    features: ['Up to 5 users', '500 invoices/month', 'Basic reports'],
    isActive: false,
    subscriberCount: 23,
    color: 'from-gray-500 to-gray-600',
  },
];

const Packages = () => {
  const [packages, setPackages] = useState<Package[]>(mockPackages);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  const handleEdit = (pkg: Package) => {
    setSelectedPackage(pkg);
    setEditDialogOpen(true);
  };

  const handleDelete = (pkg: Package) => {
    setSelectedPackage(pkg);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedPackage) {
      setPackages(packages.filter((p) => p.id !== selectedPackage.id));
      toast.success(`Package "${selectedPackage.name}" deleted`);
      setDeleteDialogOpen(false);
    }
  };

  const togglePackageStatus = (pkgId: string) => {
    setPackages(packages.map((p) => (p.id === pkgId ? { ...p, isActive: !p.isActive } : p)));
    toast.success('Package status updated');
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userType="local" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="Packages & Plans" subtitle="Manage subscription packages" />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Actions */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                {packages.filter((p) => p.isActive).length} Active
              </Badge>
              <Badge variant="outline" className="bg-muted text-muted-foreground">
                {packages.filter((p) => !p.isActive).length} Inactive
              </Badge>
            </div>
            <Button onClick={() => {
              setSelectedPackage(null);
              setEditDialogOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Package
            </Button>
          </div>

          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {packages.map((pkg) => (
              <Card key={pkg.id} className={`relative overflow-hidden ${!pkg.isActive && 'opacity-60'}`}>
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${pkg.color}`} />
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      <CardDescription className="mt-1">{pkg.description}</CardDescription>
                    </div>
                    <Badge variant={pkg.isActive ? 'default' : 'secondary'}>
                      {pkg.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">${pkg.price}</span>
                    <span className="text-muted-foreground">/{pkg.billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{pkg.subscriberCount} subscribers</span>
                  </div>
                  <ul className="space-y-2">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-success" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={pkg.isActive}
                      onCheckedChange={() => togglePackageStatus(pkg.id)}
                    />
                    <span className="text-sm text-muted-foreground">Active</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(pkg)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(pkg)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </main>
      </div>

      {/* Edit/Create Package Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedPackage ? 'Edit Package' : 'Create Package'}</DialogTitle>
            <DialogDescription>
              {selectedPackage ? 'Modify package details' : 'Create a new subscription package'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Package Name</Label>
              <Input defaultValue={selectedPackage?.name} placeholder="e.g., Professional" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea defaultValue={selectedPackage?.description} placeholder="Describe the package..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price</Label>
                <Input type="number" defaultValue={selectedPackage?.price} placeholder="99" />
              </div>
              <div className="space-y-2">
                <Label>Billing Cycle</Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Features (one per line)</Label>
              <Textarea
                defaultValue={selectedPackage?.features.join('\n')}
                placeholder="Up to 10 users&#10;Unlimited invoices&#10;Priority support"
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success(selectedPackage ? 'Package updated' : 'Package created');
              setEditDialogOpen(false);
            }}>
              {selectedPackage ? 'Save Changes' : 'Create Package'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Package</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedPackage?.name}"? This action cannot be undone.
              {selectedPackage && selectedPackage.subscriberCount > 0 && (
                <span className="block mt-2 text-destructive">
                  Warning: This package has {selectedPackage.subscriberCount} active subscribers.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Package
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Packages;
