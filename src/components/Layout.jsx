import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Bell, 
  Box,
  LogOut,
  User,
  Menu,
  X
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';
import Badge from '../components/Badge';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { alerts } = useInventory();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const unreadAlerts = alerts.filter(a => !a.read).length;

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      roles: ['all']
    },
    {
      name: 'Recepción',
      href: '/warehouse',
      icon: Package,
      roles: ['warehouse', 'admin']
    },
    {
      name: 'Compras',
      href: '/purchasing',
      icon: ShoppingCart,
      roles: ['purchasing', 'admin']
    },
    {
      name: 'Inventario',
      href: '/inventory',
      icon: Box,
      roles: ['all']
    },
    {
      name: 'Alertas',
      href: '/alerts',
      icon: Bell,
      roles: ['all'],
      badge: unreadAlerts
    }
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes('all') || 
    item.roles.includes(user?.role) ||
    user?.role === 'admin'
  );

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 hover:text-gray-900 lg:hidden"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Sistema Farmacéutico</h1>
                <p className="text-xs text-gray-600">Gestión de Inventario FIFO</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {unreadAlerts > 0 && (
              <Link to="/alerts">
                <div className="relative">
                  <Bell className="w-6 h-6 text-gray-600 hover:text-gray-900" />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadAlerts}
                  </span>
                </div>
              </Link>
            )}
            
            <div className="flex items-center gap-3 border-l pl-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            fixed lg:sticky lg:translate-x-0
            top-0 left-0 h-screen w-64 bg-white shadow-lg
            transition-transform duration-300 ease-in-out
            z-20 lg:z-0
            mt-[73px]
          `}
        >
          <nav className="p-4 space-y-2">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center justify-between gap-3 px-4 py-3 rounded-lg
                    transition-colors duration-200
                    ${active 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                  onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  {item.badge > 0 && (
                    <Badge variant={active ? 'default' : 'danger'} size="sm">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
