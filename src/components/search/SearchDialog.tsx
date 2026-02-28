import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { categories } from '@/hooks/useProducts';
import {
  Dialog, DialogContent, DialogTitle,
} from '@/components/ui/dialog';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
  const [query, setQuery] = useState('');
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (open && allProducts.length === 0) {
      apiGet<any[]>('/api/products').then(data => setAllProducts(data || [])).catch(() => {});
    }
    if (!open) setQuery('');
  }, [open]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return { products: [], categories: [] };
    const lowerQuery = query.toLowerCase();
    const matchedProducts = allProducts.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) || (p.description || '').toLowerCase().includes(lowerQuery) ||
      (p.tags || []).some((tag: string) => tag.toLowerCase().includes(lowerQuery))
    ).slice(0, 5);
    const matchedCategories = categories.filter(c => c.name.toLowerCase().includes(lowerQuery) || c.description.toLowerCase().includes(lowerQuery));
    return { products: matchedProducts, categories: matchedCategories };
  }, [query, allProducts]);

  const handleProductClick = (id: string) => { onOpenChange(false); navigate(`/product/${id}`); };
  const handleCategoryClick = (id: string) => { onOpenChange(false); navigate(`/shop?category=${id}`); };

  const hasResults = searchResults.products.length > 0 || searchResults.categories.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden" aria-describedby={undefined}>
        <DialogTitle className="sr-only">Search Products</DialogTitle>
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products, categories..." className="flex-1 bg-transparent border-none outline-none text-lg placeholder:text-muted-foreground" autoFocus />
          {query && <button onClick={() => setQuery('')} className="p-1 rounded-full hover:bg-muted transition-colors"><X className="w-4 h-4" /></button>}
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {!query.trim() ? (
            <div className="text-center py-12"><Search className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">Start typing to search...</p>
              <div className="flex flex-wrap justify-center gap-2 mt-6">{['T-Shirts', 'Mugs', 'Frames', 'Gift Combos'].map((s) => <button key={s} onClick={() => setQuery(s)} className="px-3 py-1.5 text-sm rounded-full bg-muted hover:bg-accent hover:text-accent-foreground transition-colors">{s}</button>)}</div>
            </div>
          ) : !hasResults ? (
            <div className="text-center py-12"><p className="text-muted-foreground">No results for "{query}"</p><button onClick={() => { onOpenChange(false); navigate('/shop'); }} className="mt-4 text-accent hover:underline inline-flex items-center gap-1">Browse all<ArrowRight className="w-4 h-4" /></button></div>
          ) : (
            <div className="space-y-6">
              {searchResults.categories.length > 0 && <div><h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Categories</h3>{searchResults.categories.map((c) => <button key={c.id} onClick={() => handleCategoryClick(c.id)} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"><span className="text-2xl">{c.icon}</span><div className="flex-1"><p className="font-medium">{c.name}</p><p className="text-sm text-muted-foreground line-clamp-1">{c.description}</p></div><ArrowRight className="w-4 h-4 text-muted-foreground" /></button>)}</div>}
              {searchResults.products.length > 0 && <div><h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Products</h3>{searchResults.products.map((p: any) => <button key={p.id} onClick={() => handleProductClick(p.id)} className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors text-left"><img src={p.images?.[0] || '/placeholder.svg'} alt={p.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" /><div className="flex-1 min-w-0"><p className="font-medium line-clamp-1">{p.name}</p><p className="text-sm text-muted-foreground line-clamp-1">{p.description}</p></div><div className="text-right flex-shrink-0"><p className="font-bold">₹{Number(p.price).toFixed(2)}</p>{p.original_price && <p className="text-xs text-muted-foreground line-through">₹{Number(p.original_price).toFixed(2)}</p>}</div></button>)}</div>}
              <button onClick={() => { onOpenChange(false); navigate(`/shop?search=${encodeURIComponent(query)}`); }} className="w-full py-3 text-center text-accent hover:underline flex items-center justify-center gap-2">View all results<ArrowRight className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
