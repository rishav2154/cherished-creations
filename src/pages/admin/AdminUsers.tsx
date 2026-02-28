import { useEffect, useState } from 'react';
import { apiGet, apiPatch } from '@/lib/api';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, Shield, ShieldOff } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const data = await apiGet<any[]>('/api/admin/users', true);
      setUsers(data || []);
    } catch (error: any) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleAdmin = async (userId: string) => {
    try {
      await apiPatch(`/api/admin/users/${userId}/toggle-admin`, {}, true);
      toast({ title: 'Role updated' });
      fetchUsers();
    } catch (error: any) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
  };

  const getInitials = (name: string | null, email: string | null) => {
    if (name) return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    return email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold">Users</h1><p className="text-muted-foreground">Manage user accounts and roles</p></div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" />All Users ({users.length})</CardTitle></CardHeader>
          <CardContent>
            {loading ? <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin" /></div> : users.length === 0 ? <p className="text-center py-8 text-muted-foreground">No users</p> : (
              <Table>
                <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Email</TableHead><TableHead>Joined</TableHead><TableHead>Role</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10"><AvatarImage src={u.avatar_url || undefined} /><AvatarFallback>{getInitials(u.name, u.email)}</AvatarFallback></Avatar>
                          <span className="font-medium">{u.name || 'No name'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell><Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className={u.role === 'admin' ? 'bg-primary' : ''}>{u.role}</Badge></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleToggleAdmin(u.id)} className={u.role === 'admin' ? 'text-destructive' : ''}>
                          {u.role === 'admin' ? <><ShieldOff className="w-4 h-4 mr-1" />Remove Admin</> : <><Shield className="w-4 h-4 mr-1" />Make Admin</>}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
