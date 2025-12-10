import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, Clock, Package } from 'lucide-react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Alert from '../components/Alert';
import Table from '../components/Table';
import { useInventory } from '../context/InventoryContext';
import { alertService } from '../services/alertService';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const AlertsDashboard = () => {
  const { inventory, alerts, markAlertAsRead } = useInventory();
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [filter, setFilter] = useState('all'); // all, expiration, discrepancy, low_stock

  useEffect(() => {
    // Generar alertas dinámicas
    const expirationAlerts = alertService.checkExpirationAlerts(
      inventory.filter(i => i.status === 'active')
    );
    
    const lowStockAlerts = alertService.checkLowStockAlerts(
      inventory,
      {} // En producción, cargar umbrales desde configuración
    );
    
    const allAlerts = [...alerts, ...expirationAlerts, ...lowStockAlerts];
    
    // Eliminar duplicados por itemId
    const uniqueAlerts = allAlerts.filter((alert, index, self) =>
      index === self.findIndex(a => a.itemId === alert.itemId && a.type === alert.type)
    );
    
    setActiveAlerts(uniqueAlerts);
  }, [inventory, alerts]);

  const filteredAlerts = filter === 'all' 
    ? activeAlerts 
    : activeAlerts.filter(alert => alert.type === filter);

  const unreadCount = activeAlerts.filter(a => !a.read).length;

  const getSeverityBadge = (severity) => {
    const variants = {
      danger: 'danger',
      warning: 'warning',
      info: 'info'
    };
    return <Badge variant={variants[severity]}>{severity.toUpperCase()}</Badge>;
  };

  const getTypeIcon = (type) => {
    const icons = {
      expiration: Clock,
      expired: AlertTriangle,
      discrepancy: AlertTriangle,
      low_stock: Package
    };
    const Icon = icons[type] || Bell;
    return <Icon className="w-5 h-5" />;
  };

  const columns = [
    {
      header: 'Tipo',
      accessor: 'type',
      render: (alert) => (
        <div className="flex items-center gap-2">
          {getTypeIcon(alert.type)}
          <span className="capitalize">{alert.type.replace('_', ' ')}</span>
        </div>
      )
    },
    {
      header: 'Severidad',
      accessor: 'severity',
      render: (alert) => getSeverityBadge(alert.severity)
    },
    {
      header: 'Título',
      accessor: 'title'
    },
    {
      header: 'Mensaje',
      accessor: 'message'
    },
    {
      header: 'Fecha',
      accessor: 'createdAt',
      render: (alert) => format(parseISO(alert.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })
    },
    {
      header: 'Estado',
      accessor: 'read',
      render: (alert) => (
        alert.read ? (
          <Badge variant="success">Leída</Badge>
        ) : (
          <Badge variant="warning">Nueva</Badge>
        )
      )
    }
  ];

  const dangerAlerts = activeAlerts.filter(a => a.severity === 'danger').length;
  const warningAlerts = activeAlerts.filter(a => a.severity === 'warning').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Bell className="w-8 h-8" />
          Panel de Alertas
        </h1>
        {unreadCount > 0 && (
          <Badge variant="danger" size="lg">
            {unreadCount} sin leer
          </Badge>
        )}
      </div>

      {/* Resumen de alertas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-red-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Alertas Críticas</p>
              <p className="text-3xl font-bold text-red-600">{dangerAlerts}</p>
            </div>
            <AlertTriangle className="w-12 h-12 text-red-600" />
          </div>
        </Card>

        <Card className="bg-yellow-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Advertencias</p>
              <p className="text-3xl font-bold text-yellow-600">{warningAlerts}</p>
            </div>
            <AlertTriangle className="w-12 h-12 text-yellow-600" />
          </div>
        </Card>

        <Card className="bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Alertas</p>
              <p className="text-3xl font-bold text-green-600">{activeAlerts.length}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todas ({activeAlerts.length})
          </button>
          <button
            onClick={() => setFilter('expiration')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'expiration' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Caducidad ({activeAlerts.filter(a => a.type === 'expiration').length})
          </button>
          <button
            onClick={() => setFilter('expired')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'expired' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Caducados ({activeAlerts.filter(a => a.type === 'expired').length})
          </button>
          <button
            onClick={() => setFilter('discrepancy')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'discrepancy' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Discrepancias ({activeAlerts.filter(a => a.type === 'discrepancy').length})
          </button>
          <button
            onClick={() => setFilter('low_stock')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'low_stock' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Stock Bajo ({activeAlerts.filter(a => a.type === 'low_stock').length})
          </button>
        </div>
      </Card>

      {/* Tabla de alertas */}
      <Card title="Listado de Alertas">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No hay alertas de este tipo</p>
          </div>
        ) : (
          <Table 
            columns={columns} 
            data={filteredAlerts}
            onRowClick={(alert) => !alert.read && markAlertAsRead(alert.id)}
          />
        )}
      </Card>

      {/* Alertas críticas destacadas */}
      {dangerAlerts > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-red-600">⚠️ Atención Urgente Requerida</h2>
          {activeAlerts
            .filter(a => a.severity === 'danger')
            .slice(0, 5)
            .map((alert, idx) => (
              <Alert
                key={idx}
                type="error"
                title={alert.title}
                message={alert.message}
              />
            ))
          }
        </div>
      )}
    </div>
  );
};

export default AlertsDashboard;
