import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, Package } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500',
  processing: 'bg-blue-500/10 text-blue-500',
  shipped: 'bg-purple-500/10 text-purple-500',
  delivered: 'bg-green-500/10 text-green-500',
  cancelled: 'bg-red-500/10 text-red-500',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      // Add tracking entry
      await supabase.from('order_tracking').insert({
        order_id: orderId,
        status: newStatus,
        description: `Order status updated to ${newStatus}`,
      });

      toast({
        title: 'Status Updated',
        description: `Order status changed to ${newStatus}`,
      });

      fetchOrders();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const viewOrderDetails = async (order: any) => {
    setSelectedOrder(order);
    const { data } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);
    setOrderItems(data || []);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              All Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No orders found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>₹{Number(order.total).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{order.payment_status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusChange(order.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewOrderDetails(order)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Order Details - {selectedOrder?.order_number}</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Order Date</p>
                    <p className="font-medium">
                      {new Date(selectedOrder.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={statusColors[selectedOrder.status]}>
                      {selectedOrder.status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Shipping Address</p>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="font-medium">{selectedOrder.shipping_address?.full_name}</p>
                    <p className="text-sm">{selectedOrder.shipping_address?.address_line1}</p>
                    {selectedOrder.shipping_address?.address_line2 && (
                      <p className="text-sm">{selectedOrder.shipping_address.address_line2}</p>
                    )}
                    <p className="text-sm">
                      {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} - {selectedOrder.shipping_address?.pincode}
                    </p>
                    <p className="text-sm">Phone: {selectedOrder.shipping_address?.phone}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Order Items</p>
                  <div className="space-y-4">
                    {orderItems.map((item) => {
                      const customization = item.customization as { imageUrl?: string; text?: string; color?: string } | null;
                      return (
                        <div
                          key={item.id}
                          className="p-4 rounded-lg bg-muted/50 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {item.product_image && (
                                <img
                                  src={item.product_image}
                                  alt={item.product_name}
                                  className="w-12 h-12 rounded object-cover"
                                />
                              )}
                              <div>
                                <p className="font-medium">{item.product_name}</p>
                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <p className="font-medium">₹{Number(item.price).toFixed(2)}</p>
                          </div>
                          
                          {/* Customization Details */}
                          {customization && (
                            <div className="border-t border-border pt-3">
                              <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Customer Customization</p>
                              <div className="flex flex-wrap gap-4">
                                {customization.imageUrl && (
                                  <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Uploaded Image</p>
                                    <a 
                                      href={customization.imageUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="block"
                                    >
                                      <img
                                        src={customization.imageUrl}
                                        alt="Customer uploaded"
                                        className="w-24 h-24 rounded-lg object-cover border border-border hover:border-accent transition-colors cursor-pointer"
                                      />
                                    </a>
                                  </div>
                                )}
                                {customization.text && (
                                  <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Custom Text</p>
                                    <p className="text-sm font-medium bg-background px-3 py-2 rounded-md border border-border">
                                      "{customization.text}"
                                    </p>
                                  </div>
                                )}
                                {customization.color && (
                                  <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Selected Color</p>
                                    <div className="flex items-center gap-2">
                                      <div 
                                        className="w-6 h-6 rounded-full border border-border"
                                        style={{ backgroundColor: customization.color }}
                                      />
                                      <span className="text-xs font-mono">{customization.color}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{Number(selectedOrder.subtotal).toFixed(2)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-green-500">
                      <span>Discount</span>
                      <span>-₹{Number(selectedOrder.discount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>₹{Number(selectedOrder.shipping).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{Number(selectedOrder.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
