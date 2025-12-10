import React, { useState } from 'react';
import { Package, Truck, Calendar, FileText, AlertCircle } from 'lucide-react';
import Scanner from '../components/Scanner';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { validateInventoryService } from '../services/validationService';

const WarehouseIntake = () => {
  const { user } = useAuth();
  const { addInventoryItem, purchaseOrders, validateAndRelease } = useInventory();
  
  const [formData, setFormData] = useState({
    poId: '',
    productCode: '',
    productName: '',
    lotCode: '',
    quantity: '',
    expirationDate: '',
    supplier: '',
    invoiceNumber: '',
    deliveryNoteNumber: ''
  });
  
  const [validationResult, setValidationResult] = useState(null);
  const [alerts, setAlerts] = useState([]);

  const handleScanLot = (scannedCode) => {
    setFormData(prev => ({ ...prev, lotCode: scannedCode }));
    setAlerts([]);
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    setValidationResult(null);
  };

  const validateItem = () => {
    const result = validateInventoryService.validateComplete(
      formData,
      purchaseOrders,
      {
        invoice: { 
          number: formData.invoiceNumber, 
          supplier: formData.supplier,
          totalQuantity: parseInt(formData.quantity)
        },
        deliveryNote: { 
          number: formData.deliveryNoteNumber, 
          supplier: formData.supplier,
          totalQuantity: parseInt(formData.quantity)
        }
      }
    );
    
    setValidationResult(result);
    
    if (result.errors.length > 0) {
      setAlerts([{
        type: 'error',
        title: 'Errores de Validación',
        message: result.errors.join(', ')
      }]);
    }
    
    if (result.warnings.length > 0 && result.errors.length === 0) {
      setAlerts([{
        type: 'warning',
        title: 'Advertencias',
        message: result.warnings.join(', ')
      }]);
    }
    
    return result;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validation = validateItem();
    
    if (validation.isValid) {
      const newItem = addInventoryItem({
        ...formData,
        quantity: parseInt(formData.quantity),
        originalQuantity: parseInt(formData.quantity)
      }, user);
      
      // Auto-validar y liberar si todo está correcto
      validateAndRelease(newItem.id, validation, user);
      
      setAlerts([{
        type: 'success',
        title: 'Éxito',
        message: 'Medicamento registrado y validado correctamente'
      }]);
      
      // Limpiar formulario
      setFormData({
        poId: '',
        productCode: '',
        productName: '',
        lotCode: '',
        quantity: '',
        expirationDate: '',
        supplier: '',
        invoiceNumber: '',
        deliveryNoteNumber: ''
      });
      setValidationResult(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Recepción de Medicamentos</h1>
        <span className="text-sm text-gray-600">Usuario: {user?.name}</span>
      </div>

      {alerts.map((alert, idx) => (
        <Alert 
          key={idx}
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlerts(alerts.filter((_, i) => i !== idx))}
        />
      ))}

      <Scanner onScan={handleScanLot} label="Escanear Código de Lote" />

      <Card title="Información del Ingreso" padding="lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Orden de Compra *
              </label>
              <select
                value={formData.poId}
                onChange={handleChange('poId')}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar...</option>
                {purchaseOrders.map(po => (
                  <option key={po.id} value={po.id}>
                    {po.id} - {po.supplier}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Código de Producto"
              value={formData.productCode}
              onChange={handleChange('productCode')}
              placeholder="MED-001"
              required
              icon={Package}
            />

            <Input
              label="Nombre del Producto"
              value={formData.productName}
              onChange={handleChange('productName')}
              placeholder="Paracetamol 500mg"
              required
            />

            <Input
              label="Código de Lote"
              value={formData.lotCode}
              onChange={handleChange('lotCode')}
              placeholder="LOT-12345"
              required
            />

            <Input
              label="Cantidad"
              type="number"
              value={formData.quantity}
              onChange={handleChange('quantity')}
              placeholder="1000"
              required
            />

            <Input
              label="Fecha de Caducidad"
              type="date"
              value={formData.expirationDate}
              onChange={handleChange('expirationDate')}
              required
              icon={Calendar}
            />

            <Input
              label="Proveedor"
              value={formData.supplier}
              onChange={handleChange('supplier')}
              placeholder="Laboratorio Alpha"
              required
              icon={Truck}
            />

            <Input
              label="Número de Factura"
              value={formData.invoiceNumber}
              onChange={handleChange('invoiceNumber')}
              placeholder="FAC-001"
              required
              icon={FileText}
            />

            <Input
              label="Número de Guía"
              value={formData.deliveryNoteNumber}
              onChange={handleChange('deliveryNoteNumber')}
              placeholder="GU-001"
              required
            />
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-200 mt-8">
            <Button type="button" onClick={validateItem} variant="secondary" size="lg">
              Validar Datos
            </Button>
            <Button 
              type="submit" 
              variant="success"
              size="lg"
              disabled={!validationResult?.isValid}
            >
              Registrar Ingreso
            </Button>
          </div>
        </form>

        {validationResult && (
          <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold mb-2">Resultado de Validación:</h4>
            {validationResult.isValid ? (
              <p className="text-green-600">✓ Todos los datos son válidos</p>
            ) : (
              <div>
                <p className="text-red-600 font-medium">Errores encontrados:</p>
                <ul className="list-disc list-inside ml-4">
                  {validationResult.errors.map((error, idx) => (
                    <li key={idx} className="text-red-600">{error}</li>
                  ))}
                </ul>
              </div>
            )}
            {validationResult.warnings.length > 0 && (
              <div className="mt-2">
                <p className="text-yellow-600 font-medium">Advertencias:</p>
                <ul className="list-disc list-inside ml-4">
                  {validationResult.warnings.map((warning, idx) => (
                    <li key={idx} className="text-yellow-600">{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default WarehouseIntake;
