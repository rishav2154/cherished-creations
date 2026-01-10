import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';

const Wishlist = () => {
  const { items, removeItem } = useWishlistStore();
  const addToCart = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const handleAddToCart = (item: typeof items[0]) => {
    addToCart({
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
    });
    removeItem(item.id);
    openCart();
  };

  const handleAddAllToCart = () => {
    items.forEach((item) => {
      addToCart({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        image: item.image,
      });
    });
    items.forEach((item) => removeItem(item.id));
    openCart();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <span className="text-accent font-medium text-sm tracking-wider uppercase">
              Your Favorites
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mt-4">My Wishlist</h1>
            <p className="text-muted-foreground mt-4">
              {items.length} {items.length === 1 ? 'item' : 'items'} saved for later
            </p>
          </motion.div>

          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
                <Heart className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Start adding items you love by clicking the heart icon on products
              </p>
              <Link to="/shop">
                <Button className="btn-luxury">
                  Browse Products
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
          ) : (
            <>
              {/* Action Bar */}
              <div className="flex justify-end mb-6">
                <Button onClick={handleAddAllToCart} className="btn-luxury">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Add All to Cart
                </Button>
              </div>

              {/* Wishlist Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-card-hover group overflow-hidden"
                  >
                    {/* Image */}
                    <Link to={`/product/${item.id}`}>
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="p-4">
                      <Link to={`/product/${item.id}`}>
                        <h3 className="font-medium text-sm line-clamp-1 hover:text-accent transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-muted-foreground mt-1 capitalize">
                        {item.category.replace('-', ' ')}
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-lg font-bold">₹{item.price.toFixed(2)}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() => handleAddToCart(item)}
                          className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground text-sm"
                        >
                          <ShoppingBag className="w-4 h-4 mr-1" />
                          Add to Cart
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="border-destructive/30 hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
