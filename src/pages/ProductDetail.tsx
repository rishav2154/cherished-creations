import { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays } from 'date-fns';
import { 
  ArrowLeft, Heart, ShoppingBag, Star, Truck, ShieldCheck, RotateCcw,
  Plus, Minus, Upload, Type, Palette, Sparkles, CalendarIcon,
  MessageSquare, Package, Eye, Clock, Flame, BadgeCheck, ChevronRight
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
import { Textarea } from '@/components/ui/textarea';
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

// Fake live viewer count for urgency
const useLiveViewers = () => {
  const [viewers, setViewers] = useState(Math.floor(Math.random() * 30) + 12);
  useEffect(() => {
    const interval = setInterval(() => {
      setViewers(v => Math.max(5, v + Math.floor(Math.random() * 5) - 2));
    }, 4000);
    return () => clearInterval(interval);
  }, []);
  return viewers;
};

// Stock urgency
const StockUrgency = ({ stock }: { stock: number }) => {
  if (stock > 20) return null;
  return (
    <div className="flex items-center gap-1.5 text-destructive">
      <Flame className="w-3.5 h-3.5 animate-pulse" />
      <span className="text-xs font-semibold">Only {stock} left in stock!</span>
    </div>
  );
};

// Sticky bottom bar for mobile
const StickyBuyBar = ({ price, originalPrice, onAdd, onCustomize, isCustomizable }: {
  price: number; originalPrice?: number; onAdd: () => void; onCustomize?: () => void; isCustomizable: boolean;
}) => (
  <div className="fixed bottom-14 md:bottom-0 left-0 right-0 z-40 md:hidden bg-card/95 backdrop-blur-xl border-t border-border/60 px-4 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
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
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const viewers = useLiveViewers();

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
  const discountPercent = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
  const fakeStock = (parseInt(product.id.replace(/\D/g, '').slice(0, 2) || '15', 10) % 30) + 3;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: productImage,
      customization: customText || deliveryInstructions ? { 
        text: customText, 
        color: selectedColor,
        ...(deliveryInstructions && { deliveryInstructions })
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 md:mb-8 flex items-center gap-1 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground truncate max-w-[150px]">{product.name}</span>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6 md:gap-12">
            {/* Product Image */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="relative">
              <div className="aspect-square rounded-2xl md:rounded-3xl overflow-hidden glass-card">
                <img src={productImage} alt={product.name} className="w-full h-full object-cover" />
              </div>

              {/* Badges */}
              <div className="absolute top-3 left-3 md:top-6 md:left-6 flex flex-col gap-1.5">
                {product.isCustomizable && (
                  <Badge className="bg-accent-gradient text-accent-foreground border-0 text-[10px] md:text-xs">
                    ✨ Customizable
                  </Badge>
                )}
                {discountPercent > 0 && (
                  <Badge className="bg-destructive text-destructive-foreground border-0 text-[10px] md:text-xs">
                    {discountPercent}% OFF
                  </Badge>
                )}
              </div>

              {/* Live viewers - social proof */}
              <div className="absolute bottom-3 left-3 md:bottom-6 md:left-6">
                <div className="flex items-center gap-1.5 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1.5 border border-border/50">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                  </span>
                  <span className="text-[10px] md:text-xs font-medium">
                    <Eye className="w-3 h-3 inline mr-0.5" /> {viewers} viewing now
                  </span>
                </div>
              </div>

              {/* Wishlist on image */}
              <button
                onClick={handleToggleWishlist}
                className={`absolute top-3 right-3 md:top-6 md:right-6 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  inWishlist ? 'bg-accent text-accent-foreground' : 'bg-background/70 backdrop-blur-sm text-foreground hover:bg-background/90'
                }`}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </motion.div>

            {/* Product Details */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
              {/* Rating & Reviews */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-0.5 px-2 py-0.5 bg-accent/10 rounded-md">
                  <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                  <span className="text-xs font-bold text-accent">{product.rating}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  ({product.reviewCount} reviews)
                </span>
                <Badge variant="outline" className="text-[10px] border-accent/30 text-accent">
                  <BadgeCheck className="w-3 h-3 mr-0.5" /> Verified
                </Badge>
              </div>

              <h1 className="text-xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-4 leading-tight">{product.name}</h1>
              <p className="text-sm text-muted-foreground mb-3 md:mb-6 line-clamp-2 md:line-clamp-none">{product.description}</p>

              {/* Price Block */}
              <div className="flex items-center gap-3 mb-2 md:mb-4">
                <span className="text-2xl md:text-4xl font-bold">₹{product.price.toFixed(0)}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-base md:text-xl text-muted-foreground line-through">₹{product.originalPrice.toFixed(0)}</span>
                    <Badge className="bg-accent/15 text-accent border-0 text-xs font-bold">
                      Save ₹{(product.originalPrice - product.price).toFixed(0)}
                    </Badge>
                  </>
                )}
              </div>

              {/* Stock urgency + offer timer */}
              <div className="flex flex-wrap items-center gap-3 mb-4 md:mb-6">
                <StockUrgency stock={fakeStock} />
                <div className="flex items-center gap-1.5 text-accent">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Offer ends today!</span>
                </div>
              </div>

              {/* Trust strip - compact */}
              <div className="grid grid-cols-3 gap-2 mb-4 md:mb-6">
                {[
                  { icon: Truck, text: 'Free Delivery' },
                  { icon: ShieldCheck, text: '100% Genuine' },
                  { icon: RotateCcw, text: '7-Day Return' },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 p-2 md:p-3 rounded-xl bg-muted/30 border border-border/30">
                    <f.icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent flex-shrink-0" />
                    <span className="text-[10px] md:text-xs font-medium text-muted-foreground">{f.text}</span>
                  </div>
                ))}
              </div>

              {/* Customization Options - compact */}
              {product.isCustomizable && (
                <div className="space-y-4 mb-4 md:mb-6 p-4 md:p-6 glass-card rounded-xl md:rounded-2xl">
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
                            className={`w-8 h-8 md:w-10 md:h-10 rounded-full border-2 transition-all ${
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
                      className="w-full mt-1 px-3 py-2.5 rounded-xl bg-muted/50 border border-border focus:border-accent focus:outline-none transition-colors text-sm"
                      maxLength={50}
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" /> Upload Image
                    </label>
                    <div className="mt-1 border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-accent/50 transition-colors cursor-pointer">
                      <Upload className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Click or drag to upload</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity - compact */}
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <span className="text-xs text-muted-foreground">Qty</span>
                <div className="flex items-center gap-2 bg-muted/30 rounded-xl border border-border/30 p-1">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Delivery Info - compact */}
              <div className="mb-4 md:mb-6 p-3 md:p-5 glass-card rounded-xl md:rounded-2xl space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Truck className="w-4 h-4 text-accent" /> Delivery Info
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/30">
                    <CalendarIcon className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] md:text-xs font-medium">Delivery</p>
                      <p className="text-[10px] text-muted-foreground">
                        {format(estimatedDelivery.min, 'MMM d')} – {format(estimatedDelivery.max, 'MMM d')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/30">
                    <Package className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] md:text-xs font-medium">Free Shipping</p>
                      <p className="text-[10px] text-muted-foreground">Orders ₹500+</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] md:text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" /> Instructions (Optional)
                  </label>
                  <Textarea
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    placeholder="e.g., Leave at door, Gift wrap..."
                    className="mt-1 min-h-[60px] resize-none text-xs"
                    maxLength={150}
                  />
                </div>
              </div>

              {/* CTA Buttons - desktop only (mobile has sticky bar) */}
              <div className="hidden md:flex gap-3 mb-6">
                {isCustomizablePhoneCover ? (
                  <Button onClick={() => navigate('/customize-phone-cover')} className="flex-1 h-14 text-lg bg-accent-gradient hover:opacity-90">
                    <Sparkles className="w-5 h-5 mr-2" /> Customize Now
                  </Button>
                ) : (
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAddToCart} className="flex-1 btn-luxury flex items-center justify-center gap-2">
                    <ShoppingBag className="w-5 h-5" /> Add to Cart
                  </motion.button>
                )}
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleToggleWishlist}
                  className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
                    inWishlist ? 'bg-accent text-accent-foreground' : 'bg-muted hover:bg-muted/80'
                  }`}>
                  <Heart className={`w-6 h-6 ${inWishlist ? 'fill-current' : ''}`} />
                </motion.button>
              </div>

              {/* Why buy from us - conversion booster */}
              <div className="p-3 md:p-4 rounded-xl bg-accent/5 border border-accent/10">
                <p className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-accent" /> Why customers love us
                </p>
                <div className="grid grid-cols-2 gap-2 text-[10px] md:text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5"><span className="text-accent">✓</span> Premium Quality</div>
                  <div className="flex items-center gap-1.5"><span className="text-accent">✓</span> Handcrafted with care</div>
                  <div className="flex items-center gap-1.5"><span className="text-accent">✓</span> 50,000+ happy customers</div>
                  <div className="flex items-center gap-1.5"><span className="text-accent">✓</span> Secure checkout</div>
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
                {relatedProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
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
