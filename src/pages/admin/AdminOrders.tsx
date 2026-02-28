import { useEffect, useState } from 'react';
import { apiFetch, apiAdmin } from '@/lib/api';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useInvoiceDownload } from '@/hooks/useInvoiceDownload';
import { Loader2, Eye, Package, FileText, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-500/10 text-amber-600 border-amber-200' },
  processing: { label: 'Processing', className: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  shipped: { label: 'Shipped', className: 'bg-violet-500/10 text-violet-600 border-violet-200' },
  delivered: { label: 'Delivered', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
  cancelled: { label: 'Cancelled', className: 'bg-red-500/10 text-red-600 border-red-200' },
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const { downloadInvoice, downloading } = useInvoiceDownload();

  const fetchOrders = async () => {
    try {
      const data = await apiAdmin.getOrders() as any[];
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
      await apiAdmin.updateOrderStatus(orderId, newStatus);
      toast({ title: 'Status Updated', description: `Order status changed to ${newStatus}` });
      fetchOrders();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const viewOrderDetails = async (order: any) => {
    setSelectedOrder(order);
    try {
      const items = await apiFetch<any[]>(`/admin/orders/${order.id}/items`);
      setOrderItems(items || []);
    } catch { setOrderItems([]); }
  };

  const filteredOrders = orders.filter(o =>
    !searchQuery.trim() ||
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage and track customer orders</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search orders..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
        </div>

        {/* Summary badges */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(statusConfig).map(([key, cfg]) => {
            const count = orders.filter(o => o.status === key).length;
            return (
              <Badge key={key} variant="outline" className={`${cfg.className} text-xs px-3 py-1`}>
                {cfg.label}: {count}
              </Badge>
            );
          })}
        </div>

        <Card className="shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">{searchQuery ? 'No orders match your search' : 'No orders found'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="font-semibold">Order ID</TableHead>
                      <TableHead className="font-semibold">Customer</TableHead>
                      <TableHead className="font-semibold">Total</TableHead>
                      <TableHead className="font-semibold">Payment</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => {
                      const sc = statusConfig[order.status] || statusConfig.pending;
                      return (
                        <TableRow key={order.id} className="hover:bg-muted/20">
                          <TableCell>
                            <span className="font-mono text-xs font-semibold bg-muted px-2 py-1 rounded">
                              #{order.id.slice(0, 8)}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium">{order.customer_name || 'N/A'}</TableCell>
                          <TableCell className="font-bold">₹{Number(order.final_amount || 0).toLocaleString('en-IN')}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px] font-medium">{order.payment_status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Select value={order.status} onValueChange={(v) => handleStatusChange(order.id, v)}>
                              <SelectTrigger className="w-[130px] h-8 text-xs">
                                <Badge variant="outline" className={`${sc.className} text-[10px] border-0`}>{sc.label}</Badge>
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(statusConfig).map(([key, cfg]) => (
                                  <SelectItem key={key} value={key}>
                                    <span className="flex items-center gap-2">
                                      <span className={`w-2 h-2 rounded-full ${cfg.className.split(' ')[0].replace('/10', '')}`} />
                                      {cfg.label}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => viewOrderDetails(order)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => downloadInvoice(order.id)} disabled={downloading === order.id}>
                                {downloading === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Detail Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order #{selectedOrder?.id.slice(0, 8)}
              </DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Date', value: new Date(selectedOrder.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                    { label: 'Status', value: selectedOrder.status, isBadge: true },
                    { label: 'Payment', value: selectedOrder.payment_status },
                    { label: 'Total', value: `₹${Number(selectedOrder.final_amount || 0).toLocaleString('en-IN')}` },
                  ].map((item) => (
                    <div key={item.label} className="p-3 rounded-xl bg-muted/30">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">{item.label}</p>
                      {item.isBadge ? (
                        <Badge variant="outline" className={`text-xs ${statusConfig[item.value]?.className || ''}`}>
                          {statusConfig[item.value]?.label || item.value}
                        </Badge>
                      ) : (
                        <p className="text-sm font-semibold">{item.value}</p>
                      )}
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-3">Order Items</h4>
                  <div className="space-y-2">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                        {item.product_image && (
                          <img src={item.product_image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.product_name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold">₹{Number(item.price).toLocaleString('en-IN')}</p>
                      </div>
                    ))}
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
