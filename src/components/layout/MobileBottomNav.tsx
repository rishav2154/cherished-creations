import { Home, ShoppingBag, Store, User, Heart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Store, label: 'Shop', path: '/shop' },
  { icon: Heart, label: 'Wishlist', path: '/wishlist' },
  { icon: ShoppingBag, label: 'Cart', path: '/cart' },
  { icon: User, label: 'Account', path: '/auth' },
];

export const MobileBottomNav = () => {
  const location = useLocation();
  const totalItems = useCartStore((state) => state.getTotalItems());
  const wishlistItems = useWishlistStore((state) => state.items);

  // Hide on admin pages
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-xl border-t border-border/60 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const showBadge = item.label === 'Cart' && totalItems > 0;
          const showWishlistBadge = item.label === 'Wishlist' && wishlistItems.length > 0;

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-0.5 w-full h-full relative transition-colors ${
                isActive ? 'text-accent' : 'text-muted-foreground'
              }`}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-accent rounded-full" />
              )}
              <div className="relative">
                <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 flex items-center justify-center text-[9px] font-bold bg-accent text-accent-foreground rounded-full px-1">
                    {totalItems}
                  </span>
                )}
                {showWishlistBadge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 flex items-center justify-center text-[9px] font-bold bg-accent text-accent-foreground rounded-full px-1">
                    {wishlistItems.length}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      {/* Safe area for devices with home indicators */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
};
