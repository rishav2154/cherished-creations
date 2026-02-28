import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, ShoppingCart, Tag, Users, LogOut, ChevronLeft, Package,
  PanelLeftClose, PanelLeft, Store,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Package, label: 'Products', path: '/admin/products' },
  { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
  { icon: Tag, label: 'Coupons', path: '/admin/coupons' },
  { icon: Users, label: 'Users', path: '/admin/users' },
];

export const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    toast({ title: 'Logged out', description: 'You have been signed out.' });
    navigate('/');
  };

  const NavItem = ({ icon: Icon, label, path }: { icon: any; label: string; path: string }) => {
    const isActive = location.pathname === path;
    const content = (
      <Link
        to={path}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
          collapsed && 'justify-center px-2',
          isActive
            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'drop-shadow-sm')} />
        {!collapsed && <span>{label}</span>}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">{label}</TooltipContent>
        </Tooltip>
      );
    }
    return content;
  };

  return (
    <aside className={cn(
      'bg-card border-r border-border min-h-screen flex flex-col transition-all duration-300 relative',
      collapsed ? 'w-[72px]' : 'w-64'
    )}>
      {/* Header */}
      <div className={cn('p-4 border-b border-border/50', collapsed && 'px-3')}>
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-primary-foreground font-bold text-lg">D</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="font-bold text-sm truncate">The Design Hive</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Admin Panel</p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border shadow-sm flex items-center justify-center hover:bg-muted transition-colors z-10"
      >
        {collapsed ? <PanelLeft className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-3.5 h-3.5" />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {!collapsed && (
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
            Management
          </p>
        )}
        {menuItems.map((item) => (
          <NavItem key={item.path} {...item} />
        ))}
      </nav>

      {/* Footer */}
      <div className={cn('p-3 border-t border-border/50 space-y-1', collapsed && 'px-2')}>
        {collapsed ? (
          <>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Link to="/" className="flex items-center justify-center p-2.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  <Store className="w-5 h-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Back to Store</TooltipContent>
            </Tooltip>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button onClick={handleLogout} className="w-full flex items-center justify-center p-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          </>
        ) : (
          <>
            <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <Store className="w-5 h-5" /><span className="font-medium">Back to Store</span>
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
              <LogOut className="w-5 h-5" /><span className="font-medium">Logout</span>
            </button>
          </>
        )}
      </div>
    </aside>
  );
};
