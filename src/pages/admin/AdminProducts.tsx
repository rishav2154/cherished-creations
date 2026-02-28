import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Loader2, X, Package } from 'lucide-react';

interface Product {
  id: string; name: string; description: string | null; price: number; original_price: number | null;
  category: string; image_url: string | null; images: string[]; customization_options: any;
  is_active: boolean; stock: number; tags: string[]; created_at: string;
}

const CATEGORIES = ['mugs', 'frames', 'keychains', 'phone-covers', 'lamps', 'tshirts', 'posters', 'combos'];

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [stock, setStock] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [canAddText, setCanAddText] = useState(false);
  const [canAddImage, setCanAddImage] = useState(false);
  const [tags, setTags] = useState('');

  const fetchProducts = async () => {
    try {
      const data = await apiGet<Product[]>('/api/admin/products', true);
      setProducts(data || []);
    } catch (error: any) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const resetForm = () => { setName(''); setDescription(''); setPrice(''); setOriginalPrice(''); setCategory(''); setImageUrl(''); setStock('0'); setIsActive(true); setCanAddText(false); setCanAddImage(false); setTags(''); setEditingProduct(null); };

  const openEditDialog = (p: Product) => {
    setEditingProduct(p); setName(p.name); setDescription(p.description || ''); setPrice(p.price.toString()); setOriginalPrice(p.original_price?.toString() || '');
    setCategory(p.category); setImageUrl(p.images?.[0] || p.image_url || ''); setStock(p.stock.toString()); setIsActive(p.is_active);
    setCanAddText(p.customization_options?.canAddText || false); setCanAddImage(p.customization_options?.canAddImage || false);
    setTags(p.tags?.join(', ') || ''); setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const body = {
        name, description: description || null, price: parseFloat(price), original_price: originalPrice ? parseFloat(originalPrice) : null,
        category, images: imageUrl ? [imageUrl] : [], stock: parseInt(stock), is_active: isActive,
        customization_options: { canAddText, canAddImage }, tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      if (editingProduct) { await apiPut(`/api/admin/products/${editingProduct.id}`, body, true); toast({ title: 'Product updated' }); }
      else { await apiPost('/api/admin/products', body, true); toast({ title: 'Product created' }); }
      setDialogOpen(false); resetForm(); fetchProducts();
    } catch (error: any) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try { await apiDelete(`/api/admin/products/${productToDelete.id}`, true); toast({ title: 'Product deleted' }); fetchProducts(); }
    catch (error: any) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
    finally { setDeleteDialogOpen(false); setProductToDelete(null); }
  };

  const toggleStatus = async (p: Product) => {
    try { await apiPatch(`/api/admin/products/${p.id}/status`, { is_active: !p.is_active }, true); toast({ title: p.is_active ? 'Deactivated' : 'Activated' }); fetchProducts(); }
    catch (error: any) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-3xl font-bold">Products</h1><p className="text-muted-foreground">Manage your product catalog</p></div>
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" />Add Product</Button></DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><Label>Name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
                  <div className="col-span-2"><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} /></div>
                  <div><Label>Price (₹) *</Label><Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required /></div>
                  <div><Label>Original Price</Label><Input type="number" step="0.01" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} /></div>
                  <div><Label>Category *</Label>
                    <Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Stock</Label><Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} /></div>
                  <div className="col-span-2"><Label>Image URL</Label><Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." /></div>
                  <div className="col-span-2"><Label>Tags (comma separated)</Label><Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="bestseller, new" /></div>
                  <div className="col-span-2 flex gap-6">
                    <div className="flex items-center gap-2"><Switch checked={canAddText} onCheckedChange={setCanAddText} /><Label>Allow text</Label></div>
                    <div className="flex items-center gap-2"><Switch checked={canAddImage} onCheckedChange={setCanAddImage} /><Label>Allow image</Label></div>
                  </div>
                  <div className="col-span-2 flex items-center gap-2"><Switch checked={isActive} onCheckedChange={setIsActive} /><Label>Active</Label></div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
                  <Button type="submit" disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}{editingProduct ? 'Update' : 'Create'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Package className="w-5 h-5" />All Products ({products.length})</CardTitle></CardHeader>
          <CardContent>
            {loading ? <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin" /></div> : (
              <Table>
                <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Price</TableHead><TableHead>Stock</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell><div className="flex items-center gap-3">{(p.images?.[0] || p.image_url) && <img src={p.images?.[0] || p.image_url || ''} alt="" className="w-10 h-10 rounded object-cover" />}<div><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.category}</p></div></div></TableCell>
                      <TableCell>₹{p.price}{p.original_price && <span className="text-xs text-muted-foreground line-through ml-1">₹{p.original_price}</span>}</TableCell>
                      <TableCell>{p.stock}</TableCell>
                      <TableCell><Switch checked={p.is_active} onCheckedChange={() => toggleStatus(p)} /></TableCell>
                      <TableCell><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => openEditDialog(p)}><Pencil className="w-4 h-4" /></Button><Button variant="ghost" size="sm" className="text-destructive" onClick={() => { setProductToDelete(p); setDeleteDialogOpen(true); }}><Trash2 className="w-4 h-4" /></Button></div></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Delete Product?</AlertDialogTitle><AlertDialogDescription>This will permanently delete "{productToDelete?.name}".</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
