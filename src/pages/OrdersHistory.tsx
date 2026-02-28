import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle2, Truck, ShoppingBag, ChevronDown, ChevronUp, Calendar, MapPin, CreditCard, FileText, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useInvoiceDownload } from '@/hooks/useInvoiceDownload';

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  price: number;
  customization: Record<string, unknown> | null;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  subtotal: number;
  shipping: number | null;
  tax: number | null;
  discount: number | null;
  total: number;
  shipping_address: {
    full_name?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    phone?: string;
  };
  created_at: string;
  order_items: OrderItem[];
}

interface OrderTracking {
  id: string;
  status: string;
  description: string | null;
  created_at: string;
}

const statusConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  pending: { label: 'Pending', icon: Clock, color: 'bg-yellow-500' },
  confirmed: { label: 'Confirmed', icon: CheckCircle2, color: 'bg-blue-500' },
  processing: { label: 'Processing', icon: Package, color: 'bg-purple-500' },
  shipped: { label: 'Shipped', icon: Truck, color: 'bg-indigo-500' },
  delivered: { label: 'Delivered', icon: CheckCircle2, color: 'bg-green-500' },
  cancelled: { label: 'Cancelled', icon: Package, color: 'bg-red-500' },
};

const OrdersHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderTracking, setOrderTracking] = useState<Record<string, OrderTracking[]>>({});
  const navigate = useNavigate();
  const { downloadInvoice, downloading } = useInvoiceDownload();

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
      } else {
        setOrders((ordersData as Order[]) || []);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [navigate]);

  const fetchOrderTracking = async (orderId: string) => {
    if (orderTracking[orderId]) return;

    const { data, error } = await supabase
      .from('order_tracking')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setOrderTracking(prev => ({ ...prev, [orderId]: data }));
    }
  };

  const toggleOrderExpand = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
      fetchOrderTracking(orderId);
    }
  };

  const getStatusInfo = (status: string) => {
    return statusConfig[status] || statusConfig.pending;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-accent" />
              My Orders
            </h1>
            <p className="text-muted-foreground mt-2">
              View and track all your orders
            </p>
          </motion.div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card rounded-2xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-40" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                  <Skeleton className="h-20 w-full" />
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-2xl p-12 text-center"
            >
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-6">
                Start shopping to see your orders here
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/shop')}
                className="px-6 py-3 bg-accent text-accent-foreground rounded-xl font-medium"
              >
                Browse Products
              </motion.button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, index) => {
                const statusInfo = getStatusInfo(order.status);
                const StatusIcon = statusInfo.icon;
                const isExpanded = expandedOrder === order.id;

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card rounded-2xl overflow-hidden"
                  >
                    {/* Order Header */}
                    <button
                      onClick={() => toggleOrderExpand(order.id)}
                      className="w-full p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-lg">{order.order_number}</span>
                          <Badge className={`${statusInfo.color} text-white`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(order.created_at), 'MMM dd, yyyy')}
                          </span>
                          <span className="flex items-center gap-1">
                            <CreditCard className="w-4 h-4" />
                            {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}
                          </span>
                          <span>{order.order_items?.length || 0} items</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold">₹{order.total.toFixed(2)}</p>
                          <p className={`text-sm ${order.payment_status === 'paid' ? 'text-green-500' : 'text-yellow-500'}`}>
                            {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadInvoice(order.id);
                          }}
                          disabled={downloading === order.id}
                          title="Download Invoice"
                          className="h-9 w-9"
                        >
                          {downloading === order.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                        </Button>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border"
                      >
                        {/* Order Items */}
                        <div className="p-6 space-y-4">
                          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                            Order Items
                          </h3>
                          <div className="space-y-3">
                            {order.order_items?.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-4 p-3 bg-muted/30 rounded-xl"
                              >
                                <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                                  {item.product_image ? (
                                    <img
                                      src={item.product_image}
                                      alt={item.product_name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Package className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{item.product_name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                                  </p>
                                </div>
                                <p className="font-semibold">
                                  ₹{(item.quantity * item.price).toFixed(2)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="px-6 pb-6">
                          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Shipping Address
                          </h3>
                          <div className="p-4 bg-muted/30 rounded-xl text-sm">
                            <p className="font-medium">{order.shipping_address?.full_name}</p>
                            <p className="text-muted-foreground">
                              {order.shipping_address?.address_line1}
                              {order.shipping_address?.address_line2 && `, ${order.shipping_address.address_line2}`}
                            </p>
                            <p className="text-muted-foreground">
                              {order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.pincode}
                            </p>
                            <p className="text-muted-foreground mt-1">
                              Phone: {order.shipping_address?.phone}
                            </p>
                          </div>
                        </div>

                        {/* Order Tracking */}
                        {orderTracking[order.id] && orderTracking[order.id].length > 0 && (
                          <div className="px-6 pb-6">
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
                              Tracking History
                            </h3>
                            <div className="space-y-3">
                              {orderTracking[order.id].map((track, idx) => (
                                <div
                                  key={track.id}
                                  className="flex gap-3 items-start"
                                >
                                  <div className="relative">
                                    <div className={`w-3 h-3 rounded-full ${idx === orderTracking[order.id].length - 1 ? 'bg-accent' : 'bg-muted-foreground'}`} />
                                    {idx < orderTracking[order.id].length - 1 && (
                                      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-muted" />
                                    )}
                                  </div>
                                  <div className="flex-1 pb-4">
                                    <p className="font-medium text-sm">{track.status}</p>
                                    {track.description && (
                                      <p className="text-xs text-muted-foreground">{track.description}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {format(new Date(track.created_at), 'MMM dd, yyyy • hh:mm a')}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Order Summary */}
                        <div className="px-6 pb-6">
                          <div className="p-4 bg-muted/30 rounded-xl space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Subtotal</span>
                              <span>₹{order.subtotal.toFixed(2)}</span>
                            </div>
                            {order.shipping && order.shipping > 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Shipping</span>
                                <span>₹{order.shipping.toFixed(2)}</span>
                              </div>
                            )}
                            {order.tax && order.tax > 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Tax</span>
                                <span>₹{order.tax.toFixed(2)}</span>
                              </div>
                            )}
                            {order.discount && order.discount > 0 && (
                              <div className="flex justify-between text-green-500">
                                <span>Discount</span>
                                <span>-₹{order.discount.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                              <span>Total</span>
                              <span>₹{order.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrdersHistory;
