import React from 'react';
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { alertService } from '../services/alertService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const Dashboard = () => {
  const { user } = useAuth();
  const { inventory, alerts, auditLog, getActiveInventory } = useInventory();
  
  const activeInventory = getActiveInventory();
  const criticalAlerts = alerts.filter(a => a.severity === 'danger').length;
  const recentLogs = auditLog.slice(-5).reverse();

  // Calcular métricas
  const totalProducts = new Set(activeInventory.map(i => i.productCode)).size;
  const totalUnits = activeInventory.reduce((sum, item) => sum + item.quantity, 0);
  const expiringItems = activeInventory.filter(item => {
    const days = Math.floor((new Date(item.expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days <= 90;
  }).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, {user?.name}
        </h1>
        <p className="text-gray-600 mt-1">
          {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
        </p>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white" hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Productos Únicos</p>
              <p className="text-4xl font-bold mt-2">{totalProducts}</p>
              <p className="text-blue-100 text-xs mt-2">En inventario activo</p>
            </div>
            <Package className="w-16 h-16 text-blue-200 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white" hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Unidades Totales</p>
              <p className="text-4xl font-bold mt-2">{totalUnits.toLocaleString()}</p>
              <p className="text-green-100 text-xs mt-2">Stock disponible</p>
            </div>
            <TrendingUp className="w-16 h-16 text-green-200 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white" hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Próximos a Vencer</p>
              <p className="text-4xl font-bold mt-2">{expiringItems}</p>
              <p className="text-yellow-100 text-xs mt-2">En los próximos 90 días</p>
            </div>
            <Clock className="w-16 h-16 text-yellow-200 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white" hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Alertas Críticas</p>
              <p className="text-4xl font-bold mt-2">{criticalAlerts}</p>
              <p className="text-red-100 text-xs mt-2">Requieren atención</p>
            </div>
            <AlertTriangle className="w-16 h-16 text-red-200 opacity-50" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actividad reciente */}
        <Card title="Actividad Reciente" className="lg:col-span-1">
          <div className="space-y-3">
            {recentLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay actividad reciente</p>
            ) : (
              recentLogs.map(log => (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium text-gray-900">
                        {log.action === 'add_item' && 'Nuevo ingreso registrado'}
                        {log.action === 'validate_item' && 'Item validado'}
                        {log.action === 'dispatch' && 'Despacho realizado'}
                      </p>
                      <span className="text-xs text-gray-500">
                        {format(new Date(log.timestamp), 'HH:mm', { locale: es })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Por: {log.user}</p>
                    {log.data?.productName && (
                      <p className="text-xs text-gray-500 mt-1">{log.data.productName}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Estado del sistema */}
        <Card title="Estado del Sistema" className="lg:col-span-1">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="font-semibold text-gray-900">Sistema Operativo</p>
                  <p className="text-sm text-gray-600">Todos los servicios funcionando</p>
                </div>
              </div>
              <Badge variant="success">Activo</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Validaciones Auto</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  <CheckCircle className="w-6 h-6 inline text-green-600" /> ON
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">FIFO Activo</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  <CheckCircle className="w-6 h-6 inline text-green-600" /> ON
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Alertas</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  <CheckCircle className="w-6 h-6 inline text-green-600" /> ON
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Trazabilidad</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  <CheckCircle className="w-6 h-6 inline text-green-600" /> ON
                </p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-blue-900 mb-2">
                Información del Usuario
              </p>
              <div className="space-y-1 text-sm text-blue-800">
                <p><strong>Rol:</strong> {user?.role}</p>
                <p><strong>Permisos:</strong> {user?.permissions.join(', ')}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Alertas destacadas */}
      {criticalAlerts > 0 && (
        <Card title="⚠️ Alertas que Requieren Atención Inmediata" className="bg-red-50">
          <div className="space-y-3">
            {alerts
              .filter(a => a.severity === 'danger')
              .slice(0, 3)
              .map((alert, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-red-200">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{alert.title}</p>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                  </div>
                  <Badge variant="danger">Urgente</Badge>
                </div>
              ))
            }
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
