import React, { useState, useEffect } from 'react';
import { Package, ArrowUpDown, Filter, Calendar, Box } from 'lucide-react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { useInventory } from '../context/InventoryContext';
import { fifoService } from '../services/fifoService';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const InventoryManagement = () => {
  const { getActiveInventory } = useInventory();
  const [inventory, setInventory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortedInventory, setSortedInventory] = useState([]);

  useEffect(() => {
    const active = getActiveInventory();
    setInventory(active);
    setSortedInventory(fifoService.sortByFIFO(active));
  }, [getActiveInventory]);

  const getStatusBadge = (status) => {
    const variants = {
      active: 'success',
      pending_validation: 'warning',
      rejected: 'danger'
    };
    const labels = {
      active: 'Activo',
      pending_validation: 'Pendiente',
      rejected: 'Rechazado'
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const columns = [
    {
      header: 'Posición FIFO',
      accessor: 'fifoPosition',
      render: (item, index) => (
        <Badge variant={index < 3 ? 'danger' : 'info'}>
          #{index + 1}
        </Badge>
      )
    },
    {
      header: 'Código',
      accessor: 'productCode'
    },
    {
      header: 'Producto',
      accessor: 'productName'
    },
    {
      header: 'Lote',
      accessor: 'lotCode'
    },
    {
      header: 'Cantidad',
      accessor: 'quantity',
      render: (item) => (
        <span className={item.quantity < 50 ? 'text-red-600 font-bold' : ''}>
          {item.quantity}
        </span>
      )
    },
    {
      header: 'Caducidad',
      accessor: 'expirationDate',
      render: (item) => {
        const daysUntil = Math.floor((new Date(item.expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
        return (
          <div>
            <div>{format(parseISO(item.expirationDate), 'dd/MM/yyyy', { locale: es })}</div>
            <div className={`text-xs ${daysUntil < 90 ? 'text-red-600' : 'text-gray-500'}`}>
              {daysUntil} días
            </div>
          </div>
        );
      }
    },
    {
      header: 'Proveedor',
      accessor: 'supplier'
    },
    {
      header: 'Estado',
      accessor: 'status',
      render: (item) => getStatusBadge(item.status)
    }
  ];

  // Agrupar por producto
  const inventoryByProduct = sortedInventory.reduce((acc, item) => {
    if (!acc[item.productCode]) {
      acc[item.productCode] = {
        productCode: item.productCode,
        productName: item.productName,
        totalQuantity: 0,
        batches: []
      };
    }
    acc[item.productCode].totalQuantity += item.quantity;
    acc[item.productCode].batches.push(item);
    return acc;
  }, {});

  const productSummary = Object.values(inventoryByProduct);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Box className="w-8 h-8" />
          Gestión de Inventario FIFO
        </h1>
      </div>

      {/* Resumen de inventario */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Productos Únicos</p>
              <p className="text-3xl font-bold text-blue-600">{productSummary.length}</p>
            </div>
            <Package className="w-12 h-12 text-blue-600" />
          </div>
        </Card>

        <Card className="bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Lotes</p>
              <p className="text-3xl font-bold text-green-600">{sortedInventory.length}</p>
            </div>
            <Box className="w-12 h-12 text-green-600" />
          </div>
        </Card>

        <Card className="bg-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unidades Totales</p>
              <p className="text-3xl font-bold text-purple-600">
                {sortedInventory.reduce((sum, item) => sum + item.quantity, 0)}
              </p>
            </div>
            <ArrowUpDown className="w-12 h-12 text-purple-600" />
          </div>
        </Card>

        <Card className="bg-yellow-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Próximos a Vencer</p>
              <p className="text-3xl font-bold text-yellow-600">
                {sortedInventory.filter(item => {
                  const days = Math.floor((new Date(item.expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
                  return days <= 90;
                }).length}
              </p>
            </div>
            <Calendar className="w-12 h-12 text-yellow-600" />
          </div>
        </Card>
      </div>

      {/* Tabla de inventario ordenada por FIFO */}
      <Card title="Inventario Ordenado por FIFO" subtitle="Los primeros lotes deben usarse primero">
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <ArrowUpDown className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-900">Política FIFO Activa</p>
              <p className="text-xs text-blue-700">
                Los lotes están ordenados automáticamente por fecha de caducidad. 
                Los primeros en la lista deben ser despachados primero.
              </p>
            </div>
          </div>
        </div>

        <Table 
          columns={columns} 
          data={sortedInventory.map((item, index) => ({ ...item, fifoPosition: index }))}
          onRowClick={setSelectedItem}
        />
      </Card>

      {/* Resumen por producto */}
      <Card title="Resumen por Producto">
        <div className="space-y-4">
          {productSummary.map(product => (
            <div key={product.productCode} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{product.productName}</h3>
                  <p className="text-sm text-gray-600">Código: {product.productCode}</p>
                </div>
                <Badge variant="primary" size="lg">
                  {product.totalQuantity} unidades
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Lotes disponibles ({product.batches.length}):
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {product.batches.map((batch, idx) => (
                    <div key={batch.id} className="bg-gray-50 p-3 rounded text-sm">
                      <div className="flex justify-between items-start">
                        <span className="font-medium">{batch.lotCode}</span>
                        <Badge variant={idx === 0 ? 'danger' : 'default'} size="sm">
                          {idx === 0 ? 'USAR PRIMERO' : `#${idx + 1}`}
                        </Badge>
                      </div>
                      <p className="text-gray-600">Cant: {batch.quantity}</p>
                      <p className="text-gray-600">
                        Cad: {format(parseISO(batch.expirationDate), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Modal de detalles */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title="Detalles del Lote"
        size="lg"
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Producto</p>
                <p className="font-semibold">{selectedItem.productName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Código</p>
                <p className="font-semibold">{selectedItem.productCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Lote</p>
                <p className="font-semibold">{selectedItem.lotCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cantidad</p>
                <p className="font-semibold">{selectedItem.quantity}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Caducidad</p>
                <p className="font-semibold">
                  {format(parseISO(selectedItem.expirationDate), 'dd/MM/yyyy', { locale: es })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Proveedor</p>
                <p className="font-semibold">{selectedItem.supplier}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Registrado Por</p>
                <p className="font-semibold">{selectedItem.registeredBy}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fecha de Registro</p>
                <p className="font-semibold">
                  {format(parseISO(selectedItem.registeredAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InventoryManagement;
