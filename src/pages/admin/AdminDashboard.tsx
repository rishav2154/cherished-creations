import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, DollarSign, Users, Tag, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>({
    totalOrders: 0, totalRevenue: 0, totalUsers: 0, activeCoupons: 0, pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiGet<any>('/api/admin/dashboard', true);
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
    { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { title: 'Total Revenue', value: `₹${Number(stats.totalRevenue).toFixed(2)}`, icon: DollarSign, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    { title: 'Active Coupons', value: stats.activeCoupons, icon: Tag, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div><h1 className="text-3xl font-bold">Dashboard</h1><p className="text-muted-foreground">Welcome to your admin dashboard</p></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}><stat.icon className={`w-5 h-5 ${stat.color}`} /></div>
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{stat.value}</div></CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" />Pending Orders</CardTitle></CardHeader>
            <CardContent><div className="text-4xl font-bold text-orange-500">{stats.pendingOrders}</div><p className="text-muted-foreground text-sm mt-1">Orders awaiting processing</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
            <CardContent>
              {loading ? <p className="text-muted-foreground">Loading...</p> : recentOrders.length === 0 ? <p className="text-muted-foreground">No orders yet</p> : (
                <div className="space-y-3">
                  {recentOrders.map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div><p className="font-medium">{order.id.slice(0, 8)}</p><p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p></div>
                      <div className="text-right">
                        <p className="font-medium">₹{Number(order.final_amount || 0).toFixed(2)}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : order.status === 'delivered' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>{order.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
