import { useEffect, useMemo, useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Check, Users } from 'lucide-react';
import { toast } from 'sonner';
import { AdminPlan, createAdminPlan, listAdminPlans, updateAdminPlan } from '@/lib/admin-api';

const planColors = ['from-emerald-500 to-teal-500', 'from-primary to-purple-600', 'from-orange-500 to-red-500', 'from-gray-500 to-gray-600'];

const emptyForm = {
  id: 0,
  code: '',
  name: '',
  description: '',
  price: '',
  billingInterval: 'monthly' as 'monthly' | 'yearly',
  trialDays: '0',
  features: '',
  isActive: true,
};

const Packages = () => {
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const loadPlans = async () => {
    setLoading(true);
    try {
      setPlans(await listAdminPlans());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load plans');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const activeCount = useMemo(() => plans.filter((p) => p.is_active).length, [plans]);

  const openCreate = () => {
    setForm(emptyForm);
    setEditDialogOpen(true);
  };

  const openEdit = (plan: AdminPlan) => {
    setForm({
      id: plan.id,
      code: plan.code,
      name: plan.name,
      description: plan.description ?? '',
      price: String(plan.price_cents / 100),
      billingInterval: plan.billing_interval,
      trialDays: String(plan.trial_days),
      features: (plan.features ?? []).join('\n'),
      isActive: plan.is_active,
    });
    setEditDialogOpen(true);
  };

  const togglePlanStatus = async (plan: AdminPlan) => {
    try {
      await updateAdminPlan(plan.id, { is_active: !plan.is_active });
      toast.success('Plan status updated');
      await loadPlans();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update plan status');
    }
  };

  const savePlan = async () => {
    if (!form.code || !form.name || !form.price) {
      toast.error('Code, name and price are required');
      return;
    }

    const features = form.features
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    try {
      if (form.id) {
        await updateAdminPlan(form.id, {
          name: form.name,
          description: form.description || null,
          price_cents: Math.round(Number(form.price) * 100),
          billing_interval: form.billingInterval,
          trial_days: Number(form.trialDays || 0),
          is_active: form.isActive,
          features,
        });
        toast.success('Plan updated');
      } else {
        await createAdminPlan({
          code: form.code,
          name: form.name,
          description: form.description || null,
          price_cents: Math.round(Number(form.price) * 100),
          currency: 'MZN',
          billing_interval: form.billingInterval,
          trial_days: Number(form.trialDays || 0),
          is_active: form.isActive,
          features,
        });
        toast.success('Plan created');
      }

      setEditDialogOpen(false);
      await loadPlans();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save plan');
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userType="local" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="Packages & Plans" subtitle="Manage subscription packages" />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                {activeCount} Active
              </Badge>
              <Badge variant="outline" className="bg-muted text-muted-foreground">
                {plans.length - activeCount} Inactive
              </Badge>
            </div>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Create Package
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
              <p className="text-muted-foreground">Loading plans...</p>
            ) : plans.length === 0 ? (
              <p className="text-muted-foreground">No plans found.</p>
            ) : (
              plans.map((plan, index) => (
                <Card key={plan.id} className={`relative overflow-hidden ${!plan.is_active && 'opacity-60'}`}>
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${planColors[index % planColors.length]}`} />
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <CardDescription className="mt-1">{plan.description || 'No description'}</CardDescription>
                      </div>
                      <Badge variant={plan.is_active ? 'default' : 'secondary'}>{plan.is_active ? 'Active' : 'Inactive'}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span className="text-3xl font-bold">{(plan.price_cents / 100).toLocaleString()}</span>
                      <span className="text-muted-foreground"> {plan.currency}/{plan.billing_interval === 'monthly' ? 'mo' : 'yr'}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Code: {plan.code}</span>
                    </div>
                    <ul className="space-y-2">
                      {(plan.features ?? []).slice(0, 5).map((feature, i) => (
                        <li key={`${plan.id}-${i}`} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-success" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <div className="flex items-center gap-2">
                      <Switch checked={plan.is_active} onCheckedChange={() => togglePlanStatus(plan)} />
                      <span className="text-sm text-muted-foreground">Active</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(plan)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{form.id ? 'Edit Package' : 'Create Package'}</DialogTitle>
            <DialogDescription>{form.id ? 'Modify package details' : 'Create a new subscription package'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!form.id && (
              <div className="space-y-2">
                <Label>Code</Label>
                <Input value={form.code} onChange={(e) => setForm((v) => ({ ...v, code: e.target.value }))} placeholder="starter" />
              </div>
            )}
            <div className="space-y-2">
              <Label>Package Name</Label>
              <Input value={form.name} onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))} placeholder="Professional" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm((v) => ({ ...v, description: e.target.value }))} placeholder="Describe the package..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm((v) => ({ ...v, price: e.target.value }))} placeholder="99" />
              </div>
              <div className="space-y-2">
                <Label>Billing Cycle</Label>
                <select
                  value={form.billingInterval}
                  onChange={(e) => setForm((v) => ({ ...v, billingInterval: e.target.value as 'monthly' | 'yearly' }))}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Trial Days</Label>
              <Input type="number" value={form.trialDays} onChange={(e) => setForm((v) => ({ ...v, trialDays: e.target.value }))} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label>Features (one per line)</Label>
              <Textarea value={form.features} onChange={(e) => setForm((v) => ({ ...v, features: e.target.value }))} rows={5} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={savePlan}>{form.id ? 'Save Changes' : 'Create Package'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Packages;
