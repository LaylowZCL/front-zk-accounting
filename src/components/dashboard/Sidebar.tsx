import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  Settings,
  CreditCard,
  BarChart3,
  LogOut,
  Zap,
  Building2,
  ChevronDown,
  ChevronRight,
  UsersRound,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  userType: 'local' | 'client';
}

interface NavGroup {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  items: { label: string; href: string }[];
}

const Sidebar = ({ userType }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Documents', 'Transactions']);

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const localNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
    { icon: Users, label: 'Users', href: '/admin/users' },
    { icon: UsersRound, label: 'Team', href: '/admin/team' },
    { icon: Package, label: 'Packages', href: '/admin/packages' },
    { icon: Building2, label: 'Companies', href: '/admin/companies' },
    { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
    { icon: Shield, label: 'Security', href: '/admin/security' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
  ];

  const clientNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Users, label: 'Clients', href: '/dashboard/clients' },
    { icon: Package, label: 'Products', href: '/dashboard/products' },
    { icon: UsersRound, label: 'Team', href: '/dashboard/team' },
  ];

  const clientNavGroups: NavGroup[] = [
    {
      icon: FileText,
      label: 'Documents',
      items: [
        { label: 'Quotations', href: '/dashboard/quotations' },
        { label: 'Invoices', href: '/dashboard/invoices' },
        { label: 'Receipts', href: '/dashboard/receipts' },
      ],
    },
    {
      icon: CreditCard,
      label: 'Transactions',
      items: [
        { label: 'Payments', href: '/dashboard/payments' },
        { label: 'Sent', href: '/dashboard/sent' },
      ],
    },
  ];

  const clientBottomItems = [
    { icon: BarChart3, label: 'Reports', href: '/dashboard/reports' },
    { icon: Shield, label: 'Security', href: '/dashboard/security' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  ];

  const navItems = userType === 'local' ? localNavItems : clientNavItems;

  return (
    <aside className="hidden lg:flex sticky top-0 w-[300px] h-screen min-h-0 bg-sidebar border-r border-sidebar-border flex-col p-4 gap-4">
      <div className="surface-panel px-5 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
          <Zap className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Workspace</p>
          <p className="font-display text-lg leading-none">BillFlow</p>
        </div>
      </div>

      <nav className="surface-panel flex-1 min-h-0 p-3 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}

          {userType === 'client' && (
            <>
              {clientNavGroups.map((group) => {
                const isExpanded = expandedGroups.includes(group.label);
                const isGroupActive = group.items.some((item) => location.pathname === item.href);

                return (
                  <div key={group.label} className="pt-1">
                    <button
                      onClick={() => toggleGroup(group.label)}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200',
                        isGroupActive
                          ? 'bg-secondary text-foreground'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <group.icon className="w-4 h-4" />
                        {group.label}
                      </span>
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-1 ml-3 pl-3 border-l border-border/70 space-y-1">
                        {group.items.map((item) => {
                          const isActive = location.pathname === item.href;
                          return (
                            <Link
                              key={item.href}
                              to={item.href}
                              className={cn(
                                'block px-4 py-2 rounded-full text-sm transition-colors',
                                isActive
                                  ? 'bg-primary text-primary-foreground font-medium'
                                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                              )}
                            >
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="mt-3 pt-3 border-t border-border/80 space-y-1">
                {clientBottomItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        'flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </nav>

      <div className="surface-panel p-3">
        <div className="rounded-2xl bg-secondary px-4 py-3">
          <p className="font-semibold text-sm">{user?.name || 'Loading...'}</p>
          <p className="text-xs text-muted-foreground">
            {user?.roles?.includes('platform_admin') ? 'Administrator' : 
             user?.roles?.includes('owner') ? 'Owner' : 
             user?.roles?.includes('employee') ? 'Employee' : 'User'}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full mt-2 flex items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
