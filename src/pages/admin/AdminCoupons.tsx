import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/lib/api';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Tag, Pencil, Search, Percent, IndianRupee } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface Coupon {
  id: string; code: string; description: string | null; discount_type: string; discount_value: number;
  min_order_amount: number | null; max_discount: number | null; usage_limit: number | null;
  used_count: number | null; is_active: boolean | null; valid_until: string | null;
}

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ code: '', description: '', discount_type: 'percentage', discount_value: 0, min_order_amount: 0, max_discount: 0, usage_limit: 0, valid_until: '' });
  const { toast } = useToast();

  const fetchCoupons = async () => {
    try {
      const data = await apiGet<Coupon[]>('/api/admin/coupons', true);
      setCoupons(data || []);
    } catch (error: any) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const resetForm = () => setFormData({ code: '', description: '', discount_type: 'percentage', discount_value: 0, min_order_amount: 0, max_discount: 0, usage_limit: 0, valid_until: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCoupon) {
        await apiPut(`/api/admin/coupons/${editingCoupon.id}`, formData, true);
        toast({ title: 'Coupon updated' });
      } else {
        await apiPost('/api/admin/coupons', formData, true);
        toast({ title: 'Coupon created' });
      }
      setDialogOpen(false); setEditingCoupon(null); resetForm(); fetchCoupons();
    } catch (error: any) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({ code: coupon.code, description: coupon.description || '', discount_type: coupon.discount_type, discount_value: coupon.discount_value, min_order_amount: coupon.min_order_amount || 0, max_discount: coupon.max_discount || 0, usage_limit: coupon.usage_limit || 0, valid_until: coupon.valid_until ? coupon.valid_until.split('T')[0] : '' });
    setDialogOpen(true);
  };

  const handleToggle = async (coupon: Coupon) => {
    try { await apiPatch(`/api/admin/coupons/${coupon.id}/toggle`, {}, true); toast({ title: coupon.is_active ? 'Deactivated' : 'Activated' }); fetchCoupons(); }
    catch (error: any) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
  };

  const handleDelete = async () => {
    if (!couponToDelete) return;
    try { await apiDelete(`/api/admin/coupons/${couponToDelete.id}`, true); toast({ title: 'Deleted' }); fetchCoupons(); }
    catch (error: any) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
    finally { setDeleteDialogOpen(false); setCouponToDelete(null); }
  };

  const filteredCoupons = coupons.filter(c =>
    !searchQuery.trim() ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Coupons</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage discount codes ({coupons.length} total)</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search coupons..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditingCoupon(null); resetForm(); } }}>
              <DialogTrigger asChild><Button className="gap-2 flex-shrink-0"><Plus className="w-4 h-4" />Add Coupon</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Code *</Label><Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} required className="mt-1.5 font-mono" /></div>
                    <div><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</Label>
                      <Select value={formData.discount_type} onValueChange={(v) => setFormData({ ...formData, discount_type: v })}>
                        <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="percentage">Percentage</SelectItem><SelectItem value="fixed">Fixed Amount</SelectItem><SelectItem value="free_shipping">Free Shipping</SelectItem></SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</Label><Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="mt-1.5" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Value</Label><Input type="number" value={formData.discount_value} onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })} required className="mt-1.5" /></div>
                    <div><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Max Discount</Label><Input type="number" value={formData.max_discount} onChange={(e) => setFormData({ ...formData, max_discount: Number(e.target.value) })} className="mt-1.5" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Min Order</Label><Input type="number" value={formData.min_order_amount} onChange={(e) => setFormData({ ...formData, min_order_amount: Number(e.target.value) })} className="mt-1.5" /></div>
                    <div><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Usage Limit</Label><Input type="number" value={formData.usage_limit} onChange={(e) => setFormData({ ...formData, usage_limit: Number(e.target.value) })} className="mt-1.5" /></div>
                  </div>
                  <div><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Valid Until</Label><Input type="date" value={formData.valid_until} onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })} className="mt-1.5" /></div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); setEditingCoupon(null); resetForm(); }}>Cancel</Button>
                    <Button type="submit">{editingCoupon ? 'Update' : 'Create'}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
            ) : filteredCoupons.length === 0 ? (
              <div className="text-center py-16">
                <Tag className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">{searchQuery ? 'No coupons match your search' : 'No coupons yet'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="font-semibold">Code</TableHead>
                      <TableHead className="font-semibold">Discount</TableHead>
                      <TableHead className="font-semibold">Usage</TableHead>
                      <TableHead className="font-semibold">Expires</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCoupons.map((c) => (
                      <TableRow key={c.id} className="hover:bg-muted/20">
                        <TableCell>
                          <div>
                            <p className="font-mono font-bold text-sm">{c.code}</p>
                            {c.description && <p className="text-[11px] text-muted-foreground mt-0.5">{c.description}</p>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {c.discount_type === 'percentage' ? <Percent className="w-3.5 h-3.5 text-muted-foreground" /> : <IndianRupee className="w-3.5 h-3.5 text-muted-foreground" />}
                            <span className="font-bold text-sm">
                              {c.discount_type === 'percentage' ? `${c.discount_value}%` : c.discount_type === 'fixed' ? `₹${c.discount_value}` : 'Free Shipping'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{c.used_count || 0}</span>
                          {c.usage_limit && <span className="text-xs text-muted-foreground"> / {c.usage_limit}</span>}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {c.valid_until ? new Date(c.valid_until).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                        </TableCell>
                        <TableCell><Switch checked={c.is_active || false} onCheckedChange={() => handleToggle(c)} /></TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(c)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => { setCouponToDelete(c); setDeleteDialogOpen(true); }}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Coupon?</AlertDialogTitle>
              <AlertDialogDescription>This will permanently delete the coupon "{couponToDelete?.code}".</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminCoupons;
