import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  User, Package, Heart, MapPin, LogOut, ChevronRight,
  Mail, Phone, Shield, Loader2, ShoppingBag
} from 'lucide-react';

const menuItems = [
  { icon: Package, label: 'My Orders', description: 'View & track your orders', path: '/orders' },
  { icon: Heart, label: 'Wishlist', description: 'Items you love', path: '/wishlist' },
  { icon: ShoppingBag, label: 'Shopping Cart', description: 'Review your cart', path: '/cart' },
  { icon: MapPin, label: 'Contact Us', description: 'Get in touch', path: '/contact' },
  { icon: Shield, label: 'Return Policy', description: 'Returns & refunds', path: '/returns' },
];

const Account = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: 'Signed out', description: 'You have been logged out successfully.' });
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  // Not logged in — redirect to auth
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <CartDrawer />
        <main className="pt-24 pb-32">
          <div className="container mx-auto px-4 max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-6">
                <User className="w-10 h-10 text-muted-foreground" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Welcome to The Design Hive</h1>
              <p className="text-muted-foreground mb-8">Sign in to access your account, orders, and wishlist.</p>
              <div className="space-y-3">
                <Button onClick={() => navigate('/auth')} className="w-full h-12 btn-luxury">
                  Sign In
                </Button>
                <Button variant="outline" onClick={() => navigate('/auth')} className="w-full h-12">
                  Create Account
                </Button>
              </div>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const avatarUrl = user.user_metadata?.avatar_url;
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      <main className="pt-24 pb-32">
        <div className="container mx-auto px-4 max-w-lg">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-accent/30"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center ring-2 ring-accent/30">
                  <span className="text-xl font-bold text-accent">{initials}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold truncate">{displayName}</h1>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span>{user.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Menu Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl overflow-hidden mb-6"
          >
            {menuItems.map((item, index) => (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors ${
                  index !== menuItems.length - 1 ? 'border-b border-border/50' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </Link>
            ))}
          </motion.div>

          {/* Sign Out */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full h-12 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Account;
