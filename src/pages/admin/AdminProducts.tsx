import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
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
import { Plus, Pencil, Trash2, Loader2, Package, Search, ImageIcon } from 'lucide-react';

interface Product {
  id: string; name: string; description: string | null; price: number; original_price: number | null;
  category: string; image_url: string | null; images: string[]; customization_options: any;
  is_active: boolean; stock: number; tags: string[]; created_at: string;
}

const CATEGORIES = ['mugs', 'magic-cup', 'frames', 'keychains', 'phone-covers', 'lamps', 'tshirts', 'posters', 'combos'];

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredProducts = products.filter(p =>
    !searchQuery.trim() ||
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your product catalog ({products.length} total)</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="gap-2 flex-shrink-0"><Plus className="w-4 h-4" />Add Product</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2"><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1.5" /></div>
                    <div className="col-span-2"><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1.5" /></div>
                    <div><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price (₹) *</Label><Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required className="mt-1.5" /></div>
                    <div><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Original Price</Label><Input type="number" step="0.01" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} className="mt-1.5" /></div>
                    <div><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category *</Label>
                      <Select value={category} onValueChange={setCategory}><SelectTrigger className="mt-1.5"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stock</Label><Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="mt-1.5" /></div>
                    <div className="col-span-2"><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Image URL</Label><Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="mt-1.5" /></div>
                    <div className="col-span-2"><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tags (comma separated)</Label><Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="bestseller, new" className="mt-1.5" /></div>
                    <div className="col-span-2 flex gap-6 p-3 rounded-xl bg-muted/30">
                      <div className="flex items-center gap-2"><Switch checked={canAddText} onCheckedChange={setCanAddText} /><Label className="text-sm">Allow text</Label></div>
                      <div className="flex items-center gap-2"><Switch checked={canAddImage} onCheckedChange={setCanAddImage} /><Label className="text-sm">Allow image</Label></div>
                      <div className="flex items-center gap-2 ml-auto"><Switch checked={isActive} onCheckedChange={setIsActive} /><Label className="text-sm">Active</Label></div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
                    <Button type="submit" disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}{editingProduct ? 'Update' : 'Create'}</Button>
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
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">{searchQuery ? 'No products match your search' : 'No products yet'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="font-semibold">Product</TableHead>
                      <TableHead className="font-semibold">Category</TableHead>
                      <TableHead className="font-semibold">Price</TableHead>
                      <TableHead className="font-semibold">Stock</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((p) => (
                      <TableRow key={p.id} className="hover:bg-muted/20">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {(p.images?.[0] || p.image_url) ? (
                              <img src={p.images?.[0] || p.image_url || ''} alt="" className="w-11 h-11 rounded-lg object-cover border border-border/50" />
                            ) : (
                              <div className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center"><ImageIcon className="w-5 h-5 text-muted-foreground" /></div>
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate max-w-[200px]">{p.name}</p>
                              {p.tags?.length > 0 && (
                                <div className="flex gap-1 mt-0.5">
                                  {p.tags.slice(0, 2).map(t => (
                                    <Badge key={t} variant="secondary" className="text-[9px] px-1.5 py-0">{t}</Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px] font-medium">{p.category}</Badge></TableCell>
                        <TableCell>
                          <span className="font-bold text-sm">₹{p.price}</span>
                          {p.original_price && <span className="text-xs text-muted-foreground line-through ml-1.5">₹{p.original_price}</span>}
                        </TableCell>
                        <TableCell>
                          <span className={`text-sm font-medium ${p.stock <= 10 ? 'text-red-500' : p.stock <= 30 ? 'text-amber-500' : ''}`}>
                            {p.stock}
                          </span>
                        </TableCell>
                        <TableCell><Switch checked={p.is_active} onCheckedChange={() => toggleStatus(p)} /></TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEditDialog(p)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => { setProductToDelete(p); setDeleteDialogOpen(true); }}>
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
              <AlertDialogTitle>Delete Product?</AlertDialogTitle>
              <AlertDialogDescription>This will permanently delete "{productToDelete?.name}". This action cannot be undone.</AlertDialogDescription>
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

export default AdminProducts;
