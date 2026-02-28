import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/lib/api';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Tag, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Coupon {
  id: string; code: string; description: string | null; discount_type: string; discount_value: number;
  min_order_amount: number | null; max_discount: number | null; usage_limit: number | null;
  used_count: number | null; is_active: boolean | null; valid_until: string | null;
}

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
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

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    try { await apiDelete(`/api/admin/coupons/${id}`, true); toast({ title: 'Deleted' }); fetchCoupons(); }
    catch (error: any) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-3xl font-bold">Coupons</h1><p className="text-muted-foreground">Manage discount coupons</p></div>
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditingCoupon(null); resetForm(); } }}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Coupon</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Code</Label><Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required /></div>
                  <div><Label>Type</Label>
                    <Select value={formData.discount_type} onValueChange={(v) => setFormData({ ...formData, discount_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="percentage">Percentage</SelectItem><SelectItem value="fixed">Fixed</SelectItem><SelectItem value="free_shipping">Free Shipping</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Description</Label><Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Value</Label><Input type="number" value={formData.discount_value} onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })} required /></div>
                  <div><Label>Max Discount</Label><Input type="number" value={formData.max_discount} onChange={(e) => setFormData({ ...formData, max_discount: Number(e.target.value) })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Min Order</Label><Input type="number" value={formData.min_order_amount} onChange={(e) => setFormData({ ...formData, min_order_amount: Number(e.target.value) })} /></div>
                  <div><Label>Usage Limit</Label><Input type="number" value={formData.usage_limit} onChange={(e) => setFormData({ ...formData, usage_limit: Number(e.target.value) })} /></div>
                </div>
                <div><Label>Valid Until</Label><Input type="date" value={formData.valid_until} onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })} /></div>
                <Button type="submit" className="w-full">{editingCoupon ? 'Update' : 'Create'}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Tag className="w-5 h-5" />All Coupons</CardTitle></CardHeader>
          <CardContent>
            {loading ? <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin" /></div> : coupons.length === 0 ? <p className="text-center py-8 text-muted-foreground">No coupons</p> : (
              <Table>
                <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Type</TableHead><TableHead>Value</TableHead><TableHead>Usage</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {coupons.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell><p className="font-mono font-bold">{c.code}</p>{c.description && <p className="text-xs text-muted-foreground">{c.description}</p>}</TableCell>
                      <TableCell><Badge variant="outline">{c.discount_type}</Badge></TableCell>
                      <TableCell>{c.discount_type === 'percentage' ? `${c.discount_value}%` : c.discount_type === 'fixed' ? `₹${c.discount_value}` : 'Free'}</TableCell>
                      <TableCell>{c.used_count || 0}{c.usage_limit ? ` / ${c.usage_limit}` : ''}</TableCell>
                      <TableCell><Switch checked={c.is_active || false} onCheckedChange={() => handleToggle(c)} /></TableCell>
                      <TableCell><div className="flex gap-2"><Button variant="ghost" size="sm" onClick={() => handleEdit(c)}><Pencil className="w-4 h-4" /></Button><Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(c.id)}><Trash2 className="w-4 h-4" /></Button></div></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminCoupons;
