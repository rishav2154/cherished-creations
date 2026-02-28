import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, addDays } from 'date-fns';
import { 
  Heart, ShoppingBag, Star, Truck, ShieldCheck, RotateCcw,
  Plus, Minus, Upload, Type, Palette, Sparkles, CalendarIcon,
  Package, Clock, Flame, BadgeCheck, ChevronRight, Share2
} from 'lucide-react';
import { ProductDetailSkeleton } from '@/components/ui/product-skeleton';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductReviews } from '@/components/reviews/ProductReviews';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import productTshirt from '@/assets/product-tshirt.jpg';
import productMug from '@/assets/product-mug.jpg';
import productFrame from '@/assets/product-frame.jpg';
import productPhone from '@/assets/product-phone.jpg';
import productPoster from '@/assets/product-poster.jpg';
import productCombo from '@/assets/product-combo.jpg';

const categoryImages: Record<string, string> = {
  tshirts: productTshirt,
  mugs: productMug,
  frames: productFrame,
  'phone-covers': productPhone,
  posters: productPoster,
  combos: productCombo,
};

// Stock urgency
const StockUrgency = ({ stock }: { stock: number }) => {
  if (stock > 20) return null;
  return (
    <div className="flex items-center gap-1.5 text-destructive bg-destructive/10 rounded-lg px-3 py-1.5">
      <Flame className="w-3.5 h-3.5" />
      <span className="text-xs font-semibold">Only {stock} left in stock!</span>
    </div>
  );
};

// Sticky bottom bar for mobile
const StickyBuyBar = ({ price, originalPrice, onAdd, onCustomize, isCustomizable }: {
  price: number; originalPrice?: number; onAdd: () => void; onCustomize?: () => void; isCustomizable: boolean;
}) => (
  <div className="fixed bottom-14 md:bottom-0 left-0 right-0 z-40 md:hidden bg-card/95 backdrop-blur-xl border-t border-border/60 px-4 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0">
        <span className="text-lg font-bold">₹{price.toFixed(0)}</span>
        {originalPrice && (
          <span className="text-xs text-muted-foreground line-through ml-1.5">₹{originalPrice.toFixed(0)}</span>
        )}
      </div>
      <button
        onClick={isCustomizable && onCustomize ? onCustomize : onAdd}
        className="flex-1 btn-luxury flex items-center justify-center gap-2 !py-2.5 !px-4 !rounded-xl text-sm"
      >
        {isCustomizable ? <><Sparkles className="w-4 h-4" /> Customize</> : <><ShoppingBag className="w-4 h-4" /> Add to Cart</>}
      </button>
    </div>
  </div>
);

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(id || '');
  const { data: allProducts = [] } = useProducts();
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [customText, setCustomText] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const estimatedDelivery = useMemo(() => {
    const min = addDays(new Date(), 5);
    const max = addDays(new Date(), 7);
    return { min, max };
  }, []);
  
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const { isInWishlist, toggleItem } = useWishlistStore();
  
  const inWishlist = product ? isInWishlist(product.id) : false;
  
  const isCustomizablePhoneCover = product?.name?.toLowerCase().includes('customized phone cover') || 
                                   product?.name?.toLowerCase().includes('customised phone cover');

  if (isLoading) {
    return (<><Navbar /><ProductDetailSkeleton /><Footer /></>);
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link to="/shop" className="btn-luxury">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const productImage = categoryImages[product.category] || product.images[0];
  const allImages = product.images.length > 0 ? product.images : [productImage];
  const discountPercent = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
  const fakeStock = (parseInt(product.id.replace(/\D/g, '').slice(0, 2) || '15', 10) % 30) + 3;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: productImage,
      customization: customText ? { 
        text: customText, 
        color: selectedColor,
      } : undefined,
    });
    openCart();
  };

  const handleToggleWishlist = () => {
    toggleItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: productImage,
      category: product.category,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      <main className="pt-20 md:pt-24 pb-24 md:pb-16">
        <div className="container mx-auto px-3 sm:px-4 lg:px-8">
          {/* Breadcrumb */}
          <motion.nav initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 md:mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium truncate max-w-[180px]">{product.name}</span>
          </motion.nav>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">
            {/* Product Images */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
              {/* Main Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted/20 border border-border/40">
                <img 
                  src={allImages[selectedImageIndex] || productImage} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  {discountPercent > 0 && (
                    <Badge className="bg-destructive text-destructive-foreground border-0 text-[10px] md:text-xs font-bold shadow-sm">
                      -{discountPercent}%
                    </Badge>
                  )}
                  {product.isCustomizable && (
                    <Badge className="bg-accent text-accent-foreground border-0 text-[10px] md:text-xs shadow-sm">
                      ✨ Customizable
                    </Badge>
                  )}
                </div>

                {/* Action buttons on image */}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  <button
                    onClick={handleToggleWishlist}
                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all ${
                      inWishlist ? 'bg-accent text-accent-foreground' : 'bg-background/90 backdrop-blur-sm text-foreground hover:bg-background'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm text-foreground flex items-center justify-center shadow-md hover:bg-background transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Thumbnail strip */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImageIndex(i)}
                      className={`w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                        selectedImageIndex === i ? 'border-accent ring-1 ring-accent/30' : 'border-border/40 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Details */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1 bg-accent/10 rounded-md px-2 py-1">
                  <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                  <span className="text-xs font-bold text-accent">{product.rating}</span>
                </div>
                <span className="text-xs text-muted-foreground">({product.reviewCount} reviews)</span>
                <Badge variant="outline" className="text-[10px] border-accent/30 text-accent gap-0.5">
                  <BadgeCheck className="w-3 h-3" /> Verified
                </Badge>
              </div>

              <h1 className="text-xl md:text-3xl font-bold mb-2 leading-tight">{product.name}</h1>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{product.description}</p>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-3xl md:text-4xl font-bold">₹{product.price.toFixed(0)}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">₹{product.originalPrice.toFixed(0)}</span>
                    <Badge className="bg-accent/15 text-accent border-0 text-xs font-bold">
                      Save ₹{(product.originalPrice - product.price).toFixed(0)}
                    </Badge>
                  </>
                )}
              </div>

              {/* Urgency row */}
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <StockUrgency stock={fakeStock} />
                <div className="flex items-center gap-1.5 text-accent bg-accent/10 rounded-lg px-3 py-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Offer ends today!</span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-border/50 mb-5" />

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {[
                  { icon: Truck, label: 'Free Delivery', sub: 'Orders ₹500+' },
                  { icon: ShieldCheck, label: '100% Genuine', sub: 'Guaranteed' },
                  { icon: RotateCcw, label: '7-Day Return', sub: 'Easy returns' },
                ].map((f, i) => (
                  <div key={i} className="text-center p-2.5 rounded-xl bg-muted/40 border border-border/30">
                    <f.icon className="w-5 h-5 text-accent mx-auto mb-1" />
                    <p className="text-[10px] md:text-xs font-semibold">{f.label}</p>
                    <p className="text-[9px] md:text-[10px] text-muted-foreground">{f.sub}</p>
                  </div>
                ))}
              </div>

              {/* Customization */}
              {product.isCustomizable && (
                <div className="space-y-4 mb-5 p-4 rounded-xl bg-muted/20 border border-border/40">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" /> Customize Your Product
                  </h3>

                  {product.colors && product.colors.length > 0 && (
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5" /> Select Color
                      </label>
                      <div className="flex gap-2 mt-1.5">
                        {product.colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`w-9 h-9 rounded-full border-2 transition-all ${
                              selectedColor === color ? 'border-accent scale-110 ring-2 ring-accent/30' : 'border-border hover:scale-105'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
                      <Type className="w-3.5 h-3.5" /> Custom Text
                    </label>
                    <input
                      type="text"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="Enter your text here..."
                      className="w-full mt-1 px-3 py-2.5 rounded-xl bg-background border border-border focus:border-accent focus:ring-1 focus:ring-accent/30 focus:outline-none transition-all text-sm"
                      maxLength={50}
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" /> Upload Image
                    </label>
                    <div className="mt-1 border-2 border-dashed border-border/60 rounded-xl p-5 text-center hover:border-accent/50 hover:bg-accent/5 transition-all cursor-pointer">
                      <Upload className="w-6 h-6 mx-auto mb-1.5 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Click or drag to upload</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-5">
                <span className="text-sm font-medium">Quantity</span>
                <div className="flex items-center gap-1 rounded-xl border border-border/50 overflow-hidden">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Delivery */}
              <div className="mb-5 p-4 rounded-xl bg-muted/20 border border-border/40">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <Truck className="w-4 h-4 text-accent" /> Delivery Info
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-background/60">
                    <CalendarIcon className="w-4 h-4 text-accent flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium">Estimated</p>
                      <p className="text-[10px] text-muted-foreground">
                        {format(estimatedDelivery.min, 'MMM d')} – {format(estimatedDelivery.max, 'MMM d')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-background/60">
                    <Package className="w-4 h-4 text-accent flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium">Free Shipping</p>
                      <p className="text-[10px] text-muted-foreground">Orders ₹500+</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons - desktop */}
              <div className="hidden md:flex gap-3 mb-6">
                {isCustomizablePhoneCover ? (
                  <Button onClick={() => navigate('/customize-phone-cover')} className="flex-1 h-14 text-lg bg-accent-gradient hover:opacity-90">
                    <Sparkles className="w-5 h-5 mr-2" /> Customize Now
                  </Button>
                ) : (
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAddToCart} className="flex-1 btn-luxury flex items-center justify-center gap-2 h-14 text-base">
                    <ShoppingBag className="w-5 h-5" /> Add to Cart — ₹{(product.price * quantity).toFixed(0)}
                  </motion.button>
                )}
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleToggleWishlist}
                  className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
                    inWishlist ? 'bg-accent text-accent-foreground' : 'bg-muted hover:bg-muted/80'
                  }`}>
                  <Heart className={`w-6 h-6 ${inWishlist ? 'fill-current' : ''}`} />
                </motion.button>
              </div>

              {/* Why buy from us */}
              <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
                <p className="text-xs font-semibold mb-2.5 flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-accent" /> Why customers love us
                </p>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5"><span className="text-accent font-bold">✓</span> Premium Quality</div>
                  <div className="flex items-center gap-1.5"><span className="text-accent font-bold">✓</span> Handcrafted with care</div>
                  <div className="flex items-center gap-1.5"><span className="text-accent font-bold">✓</span> 50,000+ happy customers</div>
                  <div className="flex items-center gap-1.5"><span className="text-accent font-bold">✓</span> Secure checkout</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Customer Reviews */}
          <ProductReviews productId={product.id} />

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-2xl font-bold mb-4 md:mb-8">You May Also Like</h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {relatedProducts.map((p, index) => (
                  <ProductCard key={p.id} product={p} index={index} />
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </main>

      {/* Sticky buy bar for mobile */}
      <StickyBuyBar
        price={product.price}
        originalPrice={product.originalPrice}
        onAdd={handleAddToCart}
        onCustomize={() => navigate('/customize-phone-cover')}
        isCustomizable={!!isCustomizablePhoneCover}
      />

      <Footer />
    </div>
  );
};

export default ProductDetail;
