import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { Link } from 'react-router-dom';

export const CartDrawer = () => {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotalPrice } = useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-accent" />
                <h2 className="text-xl font-semibold">Your Cart</h2>
                <span className="px-2 py-0.5 text-xs font-medium bg-accent/10 text-accent rounded-full">
                  {items.length} items
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={closeCart}
                className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Start adding some personalized gifts!
                  </p>
                  <Link
                    to="/shop"
                    onClick={closeCart}
                    className="btn-luxury text-sm"
                  >
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        className="glass-card p-4 flex gap-4"
                      >
                        <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          {item.customization && (
                            <p className="text-xs text-accent mt-1">Customized</p>
                          )}
                          <p className="text-sm font-semibold mt-2">
                            ₹{item.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => removeItem(item.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center"
                            >
                              <Minus className="w-3 h-3" />
                            </motion.button>
                            <span className="text-sm font-medium w-6 text-center">
                              {item.quantity}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center"
                            >
                              <Plus className="w-3 h-3" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-border space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-xl font-bold">₹{getTotalPrice().toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Shipping and taxes calculated at checkout
                </p>
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="block w-full btn-luxury text-center"
                >
                  Checkout
                </Link>
                <button
                  onClick={closeCart}
                  className="w-full btn-outline-luxury text-center"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
