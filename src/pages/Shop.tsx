import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Grid3X3,
  Grid2X2,
  SlidersHorizontal,
  Search,
  X,
  Filter
} from 'lucide-react';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ProductCard } from '@/components/products/ProductCard';
import { useProducts, categories } from '@/hooks/useProducts';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProductGridSkeleton } from '@/components/ui/product-skeleton';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(4);
  const [showFilters, setShowFilters] = useState(false);

  const [priceRange, setPriceRange] = useState([
    Number(searchParams.get('minPrice')) || 0,
    Number(searchParams.get('maxPrice')) || 1000
  ]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const selectedCategory = searchParams.get('category') || '';

  const { data: products = [], isLoading } = useProducts();
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Debounced URL updates
  const updateSearchParams = useCallback((updates: Record<string, string | null>) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          newParams.delete(key);
        } else {
          newParams.set(key, String(value));
        }
      });
      setSearchParams(newParams, { replace: true });
    }, 400);
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
    setPriceRange([
      Number(searchParams.get('minPrice')) || 0,
      Number(searchParams.get('maxPrice')) || 1000
    ]);
  }, [searchParams]);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesSearch = !searchQuery.trim() ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesPrice && matchesSearch;
    });
  }, [products, selectedCategory, priceRange, searchQuery]);

  const finalProducts = useMemo(() => {
    if (!filteredProducts.length) return [];
    const sorted = [...filteredProducts] as any[];
    const customIndex = sorted.findIndex(product =>
      product.id === "customize-phone-cover" || product.category === "custom"
    );
    if (customIndex !== -1) {
      const customProduct = sorted.splice(customIndex, 1)[0];
      customProduct.isCustom = true;
      sorted.unshift(customProduct);
    }
    return sorted;
  }, [filteredProducts]);

  const handleCategoryChange = (categoryId: string) => {
    updateSearchParams({
      category: categoryId === selectedCategory ? null : categoryId
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    updateSearchParams({ search: value || null });
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
    updateSearchParams({
      minPrice: value[0].toString(),
      maxPrice: value[1].toString()
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setPriceRange([0, 1000]);
    updateSearchParams({
      search: null, category: null, minPrice: null, maxPrice: null
    });
    setShowFilters(false);
  };

  const gridClassName = useMemo(() => {
    return {
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4'
    }[gridCols] || 'grid-cols-4';
  }, [gridCols]);

  const hasActiveFilters = searchQuery || selectedCategory ||
    priceRange[0] > 0 || priceRange[1] < 1000;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      <main className="pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="container mx-auto px-3 sm:px-4 lg:px-8">

          {/* PAGE HEADER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6 sm:mb-12"
          >
            <span className="text-accent font-medium text-xs sm:text-sm tracking-wider uppercase">
              Shop Our Collection
            </span>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mt-2 sm:mt-4">
              {selectedCategory
                ? categories.find(c => c.id === selectedCategory)?.name || 'All Products'
                : 'All Products'
              }
            </h1>
            <p className="text-muted-foreground mt-2 sm:mt-4 max-w-xl mx-auto text-sm sm:text-base">
              Explore our curated selection of premium personalized gifts
            </p>
          </motion.div>

          {/* PROMINENT SEARCH BAR */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search products, categories, or keywords..."
                className="pl-14 pr-14 h-14 text-lg bg-transparent border-2 border-border hover:border-accent focus:border-accent focus:ring-accent/20"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-5 top-1/2 -translate-y-1/2 p-2 hover:bg-muted rounded-xl transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>

          {/* MAIN LAYOUT */}
          <div className="flex gap-8">

            {/* DESKTOP SIDEBAR */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block w-64 flex-shrink-0"
            >
              <div className="glass-card p-6 sticky top-28">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5" />
                    Filters
                  </h3>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="text-sm text-accent hover:underline">
                      Clear All
                    </button>
                  )}
                </div>

                {/* Desktop Categories */}
                <div className="mb-8">
                  <h4 className="text-sm font-medium mb-4 text-muted-foreground">Categories</h4>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryChange(category.id)}
                        className={`w-full text-left p-4 rounded-2xl transition-all border hover:shadow-xl hover:-translate-y-1 flex items-center gap-4 ${
                          selectedCategory === category.id
                            ? 'bg-accent text-accent-foreground border-accent shadow-accent/20 font-semibold'
                            : 'border-border/50 hover:border-accent/50 hover:bg-accent/5'
                        }`}
                      >
                        <span className="text-xl">
                          {category.icon}
                        </span>
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Desktop Price Slider */}
                <div className="mb-8">
                  <h4 className="text-sm font-medium mb-4 text-muted-foreground">Price Range</h4>
                  <div className="text-sm font-medium mb-2">
                    ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                  </div>
                  <Slider
                    value={priceRange}
                    onValueChange={handlePriceChange}
                    max={1000}
                    step={10}
                  />
                </div>
              </div>
            </motion.aside>

            {/* MAIN CONTENT */}
            <div className="flex-1">

              {/* MOBILE CONTROLS */}
              <div className="lg:hidden mb-4">
                <div className="flex items-center gap-3">
                  {/* Mobile Filter Button */}
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex-1 h-14 gap-2 border-2 shadow-lg hover:shadow-xl"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                    {showFilters && <X className="w-4 h-4" />}
                  </Button>

                  {/* Mobile Results & Clear */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {finalProducts.length} of {products.length} products
                    </span>
                    {hasActiveFilters && (
                      <button onClick={clearFilters} className="text-xs text-accent hover:underline">
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* DESKTOP CONTROLS */}
              <div className="hidden lg:flex items-center justify-between mb-6 p-4 glass-card">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    Showing {finalProducts.length} of {products.length} products
                  </span>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="text-sm text-accent hover:underline">
                      Clear All
                    </button>
                  )}
                </div>

                {/* Grid Controls */}
                <div className="flex items-center gap-2">
                  {[2, 3, 4].map(cols => (
                    <button
                      key={cols}
                      onClick={() => setGridCols(cols as 2 | 3 | 4)}
                      className={`p-3 rounded-xl transition-all shadow-md flex-shrink-0 ${
                        gridCols === cols
                          ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/25'
                          : 'hover:bg-muted hover:shadow-xl hover:shadow-accent/10'
                      }`}
                    >
                      {cols === 2 && <Grid2X2 className="w-4 h-4" />}
                      {cols === 3 && <Grid3X3 className="w-4 h-4" />}
                      {cols === 4 && <Grid3X3 className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* MOBILE FILTER PANEL */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="lg:hidden mb-6 overflow-hidden"
                  >
                    <div className="glass-card p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold flex items-center gap-2">
                          <SlidersHorizontal className="w-5 h-5" />
                          Filters
                        </h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowFilters(false)}
                          className="h-10 px-4"
                        >
                          Done
                        </Button>
                      </div>

                      {/* Mobile Categories */}
                      <div className="mb-6">
                        <h4 className="text-sm font-medium mb-3 text-muted-foreground">Categories</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {categories.map(category => (
                            <button
                              key={category.id}
                              onClick={() => handleCategoryChange(category.id)}
                              className={`p-4 rounded-2xl shadow-lg border hover:shadow-xl hover:-translate-y-1 flex flex-col items-center gap-2 h-full transition-all ${
                                selectedCategory === category.id
                                  ? 'bg-accent text-accent-foreground border-accent shadow-accent/25 scale-[1.02]'
                                  : 'border-border/50 hover:border-accent hover:bg-accent/5'
                              }`}
                            >
                              <span className="text-2xl">
                                {category.icon}
                              </span>
                              {category.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Mobile Price */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-3 text-muted-foreground">Price Range</h4>
                        <div className="text-sm font-medium mb-2">
                          ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                        </div>
                        <Slider
                          value={priceRange}
                          onValueChange={handlePriceChange}
                          max={1000}
                          step={10}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* PRODUCT GRID */}
              <div className="min-h-[400px]">
                {isLoading ? (
                  <ProductGridSkeleton count={8} />
                ) : finalProducts.length ? (
                  <motion.div layout className={`grid gap-3 sm:gap-6 grid-cols-2 lg:${gridClassName}`}>
                    {finalProducts.map((product: any, index: number) => {
                      const isCustom = product.isCustom ||
                        product.id === "customize-phone-cover" ||
                        product.category === "custom";

                      return isCustom ? (
                        <Link key={product.id} to="/customize-phone-cover" className="relative group">
                          <div className="absolute top-2 left-2 z-10 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                            ✨ Customize Now
                          </div>
                          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                            <ProductCard product={product} index={index} />
                          </motion.div>
                        </Link>
                      ) : (
                        <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                          <ProductCard product={product} index={index} />
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                    <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">
                      No products found
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Try adjusting your search or filters to see more results.
                    </p>
                    <Button onClick={clearFilters} variant="outline">
                      Clear All Filters
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
