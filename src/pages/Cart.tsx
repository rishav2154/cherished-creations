import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { useCartStore } from '@/store/cartStore';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

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

const Cart = () => {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();

  const getItemImage = (item: typeof items[0]) => {
    if (item.image && item.image !== '/placeholder.svg') {
      return item.image;
    }
    // Try to get from category images based on product name
    for (const [category, image] of Object.entries(categoryImages)) {
      if (item.name.toLowerCase().includes(category.replace('-', ' '))) {
        return image;
      }
    }
    return productTshirt;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold">
              Your <span className="text-gradient-accent">Cart</span>
            </h1>
            <p className="text-muted-foreground mt-4">
              {items.length === 0
                ? 'Your cart is empty'
                : `You have ${items.length} item${items.length > 1 ? 's' : ''} in your cart`}
            </p>
          </motion.div>

          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Your cart is empty</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Looks like you haven't added any personalized gifts yet. Start exploring our collection!
              </p>
              <Link to="/shop" className="btn-luxury inline-flex items-center gap-2">
                Start Shopping
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2 space-y-4"
              >
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card p-6 flex gap-6"
                  >
                    <div className="w-28 h-28 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={getItemImage(item)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          {item.customization && (
                            <p className="text-sm text-accent mt-1">✨ Customized</p>
                          )}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-medium w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xl font-bold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                <button
                  onClick={clearCart}
                  className="text-sm text-muted-foreground hover:text-destructive transition-colors"
                >
                  Clear all items
                </button>
              </motion.div>

              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="glass-card p-6 sticky top-28">
                  <h3 className="text-lg font-semibold mb-6">Order Summary</h3>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${getTotalPrice().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-accent">Free</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span>${(getTotalPrice() * 0.08).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Coupon */}
                  <div className="mb-6">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Coupon code"
                        className="flex-1 px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-accent focus:outline-none transition-colors text-sm"
                      />
                      <button className="px-4 py-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors text-sm font-medium">
                        Apply
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 mb-6">
                    <div className="flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="text-2xl font-bold">
                        ${(getTotalPrice() * 1.08).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Link to="/checkout" className="block">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full btn-luxury flex items-center justify-center gap-2"
                    >
                      Proceed to Checkout
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </Link>

                  <Link
                    to="/shop"
                    className="block mt-4 text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
