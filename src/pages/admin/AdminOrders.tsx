import { useEffect, useState } from 'react';
import { apiGet, apiPut } from '@/lib/api';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useInvoiceDownload } from '@/hooks/useInvoiceDownload';
import { Loader2, Eye, Package, Download, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
  const { downloadInvoice, downloading } = useInvoiceDownload();

  const fetchOrders = async () => {
    try {
      const data = await apiGet<any[]>('/admin/orders', true);
      setOrders(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await apiPut(`/admin/orders/${orderId}/status`, { status: newStatus }, true);
      toast({ title: 'Status Updated', description: `Order status changed to ${newStatus}` });
      fetchOrders();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const viewOrderDetails = async (order: any) => {
    setSelectedOrder(order);
    try {
      const items = await apiGet<any[]>(`/admin/orders/${order.id}/items`, true);
      setOrderItems(items || []);
    } catch { setOrderItems([]); }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold">Orders</h1><p className="text-muted-foreground">Manage customer orders</p></div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Package className="w-5 h-5" />All Orders</CardTitle></CardHeader>
          <CardContent>
            {loading ? <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin" /></div> : orders.length === 0 ? <p className="text-center py-8 text-muted-foreground">No orders found</p> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Total</TableHead><TableHead>Payment</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id.slice(0, 8)}</TableCell>
                      <TableCell>{order.customer_name || 'N/A'}</TableCell>
                      <TableCell>₹{Number(order.final_amount || 0).toFixed(2)}</TableCell>
                      <TableCell><Badge variant="outline">{order.payment_status}</Badge></TableCell>
                      <TableCell>
                        <Select value={order.status} onValueChange={(v) => handleStatusChange(order.id, v)}>
                          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
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
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => viewOrderDetails(order)}><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => downloadInvoice(order.id)} disabled={downloading === order.id}>
                            {downloading === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Order Details - {selectedOrder?.id.slice(0, 8)}</DialogTitle></DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-sm text-muted-foreground">Date</p><p className="font-medium">{new Date(selectedOrder.created_at).toLocaleString()}</p></div>
                  <div><p className="text-sm text-muted-foreground">Status</p><Badge className={statusColors[selectedOrder.status]}>{selectedOrder.status}</Badge></div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Order Items</p>
                  {orderItems.map((item) => (
                    <div key={item.id} className="p-3 rounded-lg bg-muted/50 mb-2 flex justify-between">
                      <div><p className="font-medium">{item.product_name}</p><p className="text-sm text-muted-foreground">Qty: {item.quantity}</p></div>
                      <p className="font-medium">₹{Number(item.price).toFixed(2)}</p>
                    </div>
                  ))}
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
