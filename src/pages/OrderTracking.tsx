import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Truck, MapPin, CheckCircle, Clock, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TrackingEvent {
  id: string;
  status: string;
  description: string;
  created_at: string;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  shipping_address: {
    full_name: string;
    city: string;
    state: string;
    pincode: string;
  };
  created_at: string;
}

const statusSteps = [
  { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: MapPin }
];

const OrderTracking = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [tracking, setTracking] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId && user) {
      fetchOrderTracking();
    }
  }, [orderId, user]);

  const fetchOrderTracking = async () => {
    const { data: orderData } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderData) {
      setOrder(orderData as unknown as Order);

      const { data: trackingData } = await supabase
        .from('order_tracking')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (trackingData) {
        setTracking(trackingData);
      }
    }
    setLoading(false);
  };

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    const index = statusSteps.findIndex(s => s.key === order.status);
    return index === -1 ? 0 : index;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-20 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Order not found</h1>
            <Link to="/">
              <Button>Go to Home</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const currentStep = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link to={`/order-confirmation/${order.id}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Order Details
            </Link>
            <h1 className="text-3xl font-bold">Track Your Order</h1>
            <p className="text-muted-foreground">Order #{order.order_number}</p>
          </motion.div>

          {/* Progress Tracker */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 rounded-2xl mb-8"
          >
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-8 left-8 right-8 h-1 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="h-full bg-accent"
                />
              </div>

              {/* Steps */}
              <div className="relative flex justify-between">
                {statusSteps.map((step, index) => {
                  const isCompleted = index <= currentStep;
                  const isCurrent = index === currentStep;
                  const StepIcon = step.icon;

                  return (
                    <div key={step.key} className="flex flex-col items-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-muted text-muted-foreground'
                        } ${isCurrent ? 'ring-4 ring-accent/30' : ''}`}
                      >
                        <StepIcon className="h-7 w-7" />
                      </motion.div>
                      <p className={`mt-3 text-sm font-medium text-center ${
                        isCompleted ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Estimated Delivery */}
            {order.status !== 'delivered' && (
              <div className="mt-8 p-4 bg-accent/10 rounded-xl flex items-center gap-3">
                <Clock className="h-6 w-6 text-accent" />
                <div>
                  <p className="font-medium">Estimated Delivery</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Tracking Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 rounded-2xl mb-8"
          >
            <h2 className="text-xl font-semibold mb-6">Tracking History</h2>
            
            <div className="relative">
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-border" />
              
              <div className="space-y-6">
                {tracking.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="relative pl-10"
                  >
                    <div className={`absolute left-2 w-4 h-4 rounded-full ${
                      index === tracking.length - 1 ? 'bg-accent' : 'bg-muted-foreground'
                    }`} />
                    <div className="bg-muted/30 p-4 rounded-xl">
                      <p className="font-medium capitalize">{event.status.replace('_', ' ')}</p>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(event.created_at).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Delivery Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 rounded-2xl"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-accent" />
              Delivery Address
            </h2>
            <div className="bg-muted/30 p-4 rounded-xl">
              <p className="font-medium">{order.shipping_address.full_name}</p>
              <p className="text-sm text-muted-foreground">
                {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderTracking;
