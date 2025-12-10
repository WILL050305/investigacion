import React, { useState } from 'react';
import { ShoppingCart, Plus, FileText, CheckCircle } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { useInventory } from '../context/InventoryContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const PurchasingModule = () => {
  const { purchaseOrders, setPurchaseOrders, getPendingValidations } = useInventory();
  const [showNewPO, setShowNewPO] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [newPO, setNewPO] = useState({
    supplier: '',
    products: [{ code: '', name: '', quantity: '', unitPrice: '' }]
  });

  const pendingValidations = getPendingValidations();

  const handleAddProduct = () => {
    setNewPO(prev => ({
      ...prev,
      products: [...prev.products, { code: '', name: '', quantity: '', unitPrice: '' }]
    }));
  };

  const handleProductChange = (index, field, value) => {
    setNewPO(prev => {
      const products = [...prev.products];
      products[index][field] = value;
      return { ...prev, products };
    });
  };

  const handleCreatePO = () => {
    const po = {
      id: `PO-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
      supplier: newPO.supplier,
      products: newPO.products.map(p => ({
        ...p,
        quantity: parseInt(p.quantity),
        unitPrice: parseFloat(p.unitPrice)
      })),
      status: 'pending',
      date: new Date().toISOString(),
      total: newPO.products.reduce((sum, p) => sum + (parseInt(p.quantity) * parseFloat(p.unitPrice)), 0)
    };

    setPurchaseOrders([...purchaseOrders, po]);
    localStorage.setItem('purchaseOrders', JSON.stringify([...purchaseOrders, po]));
    
    setShowNewPO(false);
    setNewPO({
      supplier: '',
      products: [{ code: '', name: '', quantity: '', unitPrice: '' }]
    });
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      partial: 'info',
      completed: 'success',
      cancelled: 'danger'
    };
    const labels = {
      pending: 'Pendiente',
      partial: 'Parcial',
      completed: 'Completada',
      cancelled: 'Cancelada'
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const poColumns = [
    {
      header: 'ID',
      accessor: 'id'
    },
    {
      header: 'Proveedor',
      accessor: 'supplier'
    },
    {
      header: 'Productos',
      accessor: 'products',
      render: (po) => po.products.length
    },
    {
      header: 'Total',
      accessor: 'total',
      render: (po) => `$${po.total?.toFixed(2) || '0.00'}`
    },
    {
      header: 'Fecha',
      accessor: 'date',
      render: (po) => format(new Date(po.date), 'dd/MM/yyyy', { locale: es })
    },
    {
      header: 'Estado',
      accessor: 'status',
      render: (po) => getStatusBadge(po.status)
    }
  ];

  const validationColumns = [
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
      accessor: 'quantity'
    },
    {
      header: 'Proveedor',
      accessor: 'supplier'
    },
    {
      header: 'Registrado Por',
      accessor: 'registeredBy'
    },
    {
      header: 'Estado',
      accessor: 'status',
      render: () => <Badge variant="warning">Pendiente Validación</Badge>
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <ShoppingCart className="w-8 h-8" />
          Gestión de Compras
        </h1>
        <Button onClick={() => setShowNewPO(true)} icon={Plus}>
          Nueva Orden de Compra
        </Button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Órdenes Activas</p>
              <p className="text-3xl font-bold text-blue-600">
                {purchaseOrders.filter(po => po.status === 'pending').length}
              </p>
            </div>
            <ShoppingCart className="w-12 h-12 text-blue-600" />
          </div>
        </Card>

        <Card className="bg-yellow-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendientes Validación</p>
              <p className="text-3xl font-bold text-yellow-600">{pendingValidations.length}</p>
            </div>
            <FileText className="w-12 h-12 text-yellow-600" />
          </div>
        </Card>

        <Card className="bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completadas</p>
              <p className="text-3xl font-bold text-green-600">
                {purchaseOrders.filter(po => po.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Validaciones pendientes */}
      {pendingValidations.length > 0 && (
        <Card title="Ingresos Pendientes de Validación" className="bg-yellow-50">
          <Table columns={validationColumns} data={pendingValidations} />
        </Card>
      )}

      {/* Órdenes de compra */}
      <Card title="Órdenes de Compra">
        <Table 
          columns={poColumns} 
          data={purchaseOrders}
          onRowClick={setSelectedPO}
        />
      </Card>

      {/* Modal nueva orden */}
      <Modal
        isOpen={showNewPO}
        onClose={() => setShowNewPO(false)}
        title="Nueva Orden de Compra"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Proveedor"
            value={newPO.supplier}
            onChange={(e) => setNewPO({ ...newPO, supplier: e.target.value })}
            placeholder="Laboratorio Alpha"
            required
          />

          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Productos</h3>
              <Button onClick={handleAddProduct} size="sm" icon={Plus}>
                Agregar Producto
              </Button>
            </div>

            {newPO.products.map((product, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Código"
                    value={product.code}
                    onChange={(e) => handleProductChange(index, 'code', e.target.value)}
                    placeholder="MED-001"
                  />
                  <Input
                    label="Nombre"
                    value={product.name}
                    onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                    placeholder="Paracetamol 500mg"
                  />
                  <Input
                    label="Cantidad"
                    type="number"
                    value={product.quantity}
                    onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                    placeholder="1000"
                  />
                  <Input
                    label="Precio Unitario"
                    type="number"
                    step="0.01"
                    value={product.unitPrice}
                    onChange={(e) => handleProductChange(index, 'unitPrice', e.target.value)}
                    placeholder="0.50"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleCreatePO} variant="success">
              Crear Orden
            </Button>
            <Button onClick={() => setShowNewPO(false)} variant="secondary">
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal detalle orden */}
      <Modal
        isOpen={!!selectedPO}
        onClose={() => setSelectedPO(null)}
        title={`Orden de Compra ${selectedPO?.id}`}
        size="lg"
      >
        {selectedPO && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Proveedor</p>
                <p className="font-semibold">{selectedPO.supplier}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                {getStatusBadge(selectedPO.status)}
              </div>
              <div>
                <p className="text-sm text-gray-600">Fecha</p>
                <p className="font-semibold">
                  {format(new Date(selectedPO.date), 'dd/MM/yyyy', { locale: es })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="font-semibold">${selectedPO.total?.toFixed(2)}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Productos</h4>
              <div className="space-y-2">
                {selectedPO.products.map((product, index) => (
                  <div key={index} className="border border-gray-200 rounded p-3 flex justify-between">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">Código: {product.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{product.quantity} unidades</p>
                      <p className="text-sm text-gray-600">${product.unitPrice} c/u</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PurchasingModule;
