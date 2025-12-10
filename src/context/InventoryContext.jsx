import React, { createContext, useContext, useState, useEffect } from 'react';
import { validateInventoryService } from '../services/validationService';
import { fifoService } from '../services/fifoService';

const InventoryContext = createContext();

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

export const InventoryProvider = ({ children }) => {
  const [inventory, setInventory] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [auditLog, setAuditLog] = useState([]);

  useEffect(() => {
    // Cargar datos iniciales (simulado)
    const savedInventory = localStorage.getItem('inventory');
    const savedPOs = localStorage.getItem('purchaseOrders');
    const savedAlerts = localStorage.getItem('alerts');
    
    if (savedInventory) setInventory(JSON.parse(savedInventory));
    if (savedPOs) setPurchaseOrders(JSON.parse(savedPOs));
    if (savedAlerts) setAlerts(JSON.parse(savedAlerts));
    
    // Datos de ejemplo iniciales
    if (!savedPOs) {
      const initialPOs = [
        {
          id: 'PO-001',
          supplier: 'Laboratorio Alpha',
          products: [
            { code: 'MED-001', name: 'Paracetamol 500mg', quantity: 1000, unitPrice: 0.5 }
          ],
          status: 'pending',
          date: new Date().toISOString()
        }
      ];
      setPurchaseOrders(initialPOs);
      localStorage.setItem('purchaseOrders', JSON.stringify(initialPOs));
    }
  }, []);

  const addInventoryItem = (item, user) => {
    const newItem = {
      ...item,
      id: `INV-${Date.now()}`,
      registeredAt: new Date().toISOString(),
      registeredBy: user.name,
      status: 'pending_validation'
    };
    
    const updated = [...inventory, newItem];
    setInventory(updated);
    localStorage.setItem('inventory', JSON.stringify(updated));
    
    logAction('add_item', newItem, user);
    return newItem;
  };

  const validateAndRelease = (itemId, validationResult, user) => {
    const updated = inventory.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          status: validationResult.isValid ? 'active' : 'rejected',
          validationResult,
          validatedAt: new Date().toISOString(),
          validatedBy: user.name
        };
      }
      return item;
    });
    
    setInventory(updated);
    localStorage.setItem('inventory', JSON.stringify(updated));
    
    if (validationResult.isValid) {
      // Aplicar FIFO automáticamente
      const sortedInventory = fifoService.sortByFIFO(updated.filter(i => i.status === 'active'));
      checkExpirationAlerts(sortedInventory);
    }
    
    logAction('validate_item', { itemId, validationResult }, user);
  };

  const checkExpirationAlerts = (items) => {
    const newAlerts = [];
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    
    items.forEach(item => {
      const expirationDate = new Date(item.expirationDate);
      if (expirationDate <= sixMonthsFromNow) {
        const daysUntilExpiration = Math.floor((expirationDate - new Date()) / (1000 * 60 * 60 * 24));
        newAlerts.push({
          id: `ALERT-${Date.now()}-${item.id}`,
          type: daysUntilExpiration < 30 ? 'danger' : 'warning',
          title: 'Alerta de Caducidad',
          message: `${item.productName} (Lote: ${item.lotCode}) caduca en ${daysUntilExpiration} días`,
          itemId: item.id,
          createdAt: new Date().toISOString(),
          read: false
        });
      }
    });
    
    if (newAlerts.length > 0) {
      const updatedAlerts = [...alerts, ...newAlerts];
      setAlerts(updatedAlerts);
      localStorage.setItem('alerts', JSON.stringify(updatedAlerts));
    }
  };

  const logAction = (action, data, user) => {
    const logEntry = {
      id: `LOG-${Date.now()}`,
      action,
      data,
      user: user.name,
      userEmail: user.email,
      timestamp: new Date().toISOString()
    };
    
    setAuditLog(prev => [...prev, logEntry]);
  };

  const markAlertAsRead = (alertId) => {
    const updated = alerts.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    );
    setAlerts(updated);
    localStorage.setItem('alerts', JSON.stringify(updated));
  };

  const getActiveInventory = () => {
    return fifoService.sortByFIFO(inventory.filter(item => item.status === 'active'));
  };

  const getPendingValidations = () => {
    return inventory.filter(item => item.status === 'pending_validation');
  };

  return (
    <InventoryContext.Provider value={{
      inventory,
      purchaseOrders,
      alerts,
      auditLog,
      addInventoryItem,
      validateAndRelease,
      markAlertAsRead,
      getActiveInventory,
      getPendingValidations,
      setPurchaseOrders
    }}>
      {children}
    </InventoryContext.Provider>
  );
};
