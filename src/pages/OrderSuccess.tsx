import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { apiGet } from '@/lib/api';
import { CheckCircle, Package, Truck, Home, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  total: number;
  created_at: string;
  notes: string | null;
  shipping_address: {
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
}

const OrderSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) { navigate('/'); return; }

      try {
        const orders = await apiGet<any[]>('/api/orders', true);
        const found = orders?.find((o: any) => o.id === orderId);
        if (!found) { navigate('/'); return; }

        setOrder({
          id: found.id,
          order_number: found.order_number,
          status: found.status,
          payment_method: found.payment_method,
          payment_status: found.payment_status,
          total: found.total,
          created_at: found.created_at,
          notes: found.notes || null,
          shipping_address: found.shipping_address,
        });
      } catch {
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-2xl">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.5 }} className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
                <CheckCircle className="w-12 h-12 text-green-500" />
              </motion.div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Order <span className="text-gradient-accent">Confirmed!</span></h1>
            <p className="text-muted-foreground">Thank you for your order. We'll send you a confirmation email shortly.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Order Details</h2>
              <span className="text-sm text-accent font-medium">#{order.order_number}</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Order Status</span><span className="capitalize font-medium text-accent">{order.status}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Payment Method</span><span className="capitalize">{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Payment Status</span><span className={`capitalize ${order.payment_status === 'paid' ? 'text-green-500' : 'text-yellow-500'}`}>{order.payment_status}</span></div>
              <div className="flex justify-between text-sm pt-2 border-t border-border"><span className="font-semibold">Total Amount</span><span className="text-xl font-bold">₹{order.total.toFixed(2)}</span></div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6 mb-6">
            <div className="flex items-center gap-2 mb-4"><Truck className="w-5 h-5 text-accent" /><h2 className="font-semibold">Shipping Address</h2></div>
            <div className="text-sm space-y-1">
              <p className="font-medium">{order.shipping_address.full_name}</p>
              <p className="text-muted-foreground">{order.shipping_address.address_line1}</p>
              {order.shipping_address.address_line2 && <p className="text-muted-foreground">{order.shipping_address.address_line2}</p>}
              <p className="text-muted-foreground">{order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}</p>
              <p className="text-muted-foreground">Phone: {order.shipping_address.phone}</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex flex-col sm:flex-row gap-4">
            <Link to="/shop" className="flex-1"><Button variant="outline" className="w-full h-12"><Package className="w-5 h-5 mr-2" />Continue Shopping</Button></Link>
            <Link to="/" className="flex-1"><Button className="w-full h-12 btn-luxury"><Home className="w-5 h-5 mr-2" />Back to Home</Button></Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderSuccess;
