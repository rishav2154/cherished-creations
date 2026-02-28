import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '@/lib/api';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, IndianRupee, Users, Tag, TrendingUp, ArrowUpRight, Clock, Package } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600 border-amber-200',
  processing: 'bg-blue-500/10 text-blue-600 border-blue-200',
  shipped: 'bg-violet-500/10 text-violet-600 border-violet-200',
  delivered: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  cancelled: 'bg-red-500/10 text-red-600 border-red-200',
};

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>({
    totalOrders: 0, totalRevenue: 0, totalUsers: 0, activeCoupons: 0, pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiFetch<any>('/admin/dashboard');
        setStats({
          totalOrders: data.totalOrders || 0,
          totalRevenue: data.totalRevenue || 0,
          totalUsers: data.totalUsers || 0,
          activeCoupons: data.activeCoupons || 0,
          pendingOrders: data.pendingOrders || 0,
        });
        setRecentOrders(data.recentOrders || []);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Revenue', value: `₹${Number(stats.totalRevenue).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-emerald-600', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-200' },
    { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'text-blue-600', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-200' },
    { title: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-200' },
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-violet-600', bgColor: 'bg-violet-500/10', borderColor: 'border-violet-200' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Overview of your store performance</p>
          </div>
          <Badge variant="outline" className="text-xs gap-1.5 px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Live
          </Badge>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className={`border ${stat.borderColor} shadow-sm hover:shadow-md transition-shadow`}>
              <CardContent className="p-4 lg:p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-2xl lg:text-3xl font-bold tracking-tight">{loading ? '—' : stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Orders & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  Recent Orders
                </CardTitle>
                <Link to="/admin/orders" className="text-xs text-primary hover:underline flex items-center gap-1">
                  View all <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 rounded-lg bg-muted/50 animate-pulse" />
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-10">
                  <ShoppingCart className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentOrders.map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Package className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">#{order.id.slice(0, 8)}</p>
                          <p className="text-[11px] text-muted-foreground">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={`text-[10px] ${statusColors[order.status] || ''}`}>
                          {order.status}
                        </Badge>
                        <span className="text-sm font-bold min-w-[70px] text-right">₹{Number(order.final_amount || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'Manage Products', path: '/admin/products', icon: Package, desc: 'Add, edit or remove products' },
                { label: 'View Orders', path: '/admin/orders', icon: ShoppingCart, desc: 'Process and track orders' },
                { label: 'Manage Coupons', path: '/admin/coupons', icon: Tag, desc: 'Create discount codes' },
                { label: 'Manage Users', path: '/admin/users', icon: Users, desc: 'View and manage users' },
              ].map((action) => (
                <Link
                  key={action.path}
                  to={action.path}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <action.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{action.label}</p>
                    <p className="text-[11px] text-muted-foreground">{action.desc}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
