import { differenceInDays, parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';

// Servicio de alertas y trazabilidad
export const alertService = {
  // Verificar alertas de caducidad
  checkExpirationAlerts: (inventoryItems, thresholdMonths = 6) => {
    const alerts = [];
    const today = new Date();
    
    inventoryItems.forEach(item => {
      const expirationDate = parseISO(item.expirationDate);
      const daysUntilExpiration = differenceInDays(expirationDate, today);
      const thresholdDays = thresholdMonths * 30;
      
      if (daysUntilExpiration <= thresholdDays && daysUntilExpiration > 0) {
        let severity = 'warning';
        if (daysUntilExpiration <= 30) severity = 'danger';
        else if (daysUntilExpiration <= 90) severity = 'warning';
        else severity = 'info';
        
        alerts.push({
          id: `EXP-${item.id}`,
          type: 'expiration',
          severity,
          title: 'Alerta de Caducidad',
          message: `${item.productName} (Lote: ${item.lotCode}) caduca en ${daysUntilExpiration} días`,
          productCode: item.productCode,
          lotCode: item.lotCode,
          expirationDate: item.expirationDate,
          daysUntilExpiration,
          itemId: item.id,
          createdAt: new Date().toISOString()
        });
      } else if (daysUntilExpiration <= 0) {
        alerts.push({
          id: `EXPIRED-${item.id}`,
          type: 'expired',
          severity: 'danger',
          title: 'Producto Caducado',
          message: `${item.productName} (Lote: ${item.lotCode}) está caducado`,
          productCode: item.productCode,
          lotCode: item.lotCode,
          expirationDate: item.expirationDate,
          itemId: item.id,
          createdAt: new Date().toISOString()
        });
      }
    });
    
    return alerts;
  },

  // Alertas de discrepancias en validación
  createDiscrepancyAlert: (validationResult, item) => {
    return {
      id: `DISC-${item.id}-${Date.now()}`,
      type: 'discrepancy',
      severity: 'warning',
      title: 'Discrepancia Detectada',
      message: `Errores en ${item.productName}: ${validationResult.errors.join(', ')}`,
      errors: validationResult.errors,
      warnings: validationResult.warnings,
      itemId: item.id,
      createdAt: new Date().toISOString()
    };
  },

  // Alertas de stock bajo
  checkLowStockAlerts: (inventoryItems, thresholds) => {
    const alerts = [];
    const stockByProduct = {};
    
    // Agrupar por producto
    inventoryItems.forEach(item => {
      if (item.status === 'active') {
        stockByProduct[item.productCode] = (stockByProduct[item.productCode] || 0) + item.quantity;
      }
    });
    
    // Verificar umbrales
    Object.entries(stockByProduct).forEach(([productCode, quantity]) => {
      const threshold = thresholds[productCode] || 100; // Umbral por defecto
      
      if (quantity <= threshold) {
        const sample = inventoryItems.find(i => i.productCode === productCode);
        alerts.push({
          id: `LOW-${productCode}-${Date.now()}`,
          type: 'low_stock',
          severity: quantity === 0 ? 'danger' : 'warning',
          title: 'Stock Bajo',
          message: `${sample?.productName || productCode}: solo quedan ${quantity} unidades`,
          productCode,
          currentStock: quantity,
          threshold,
          createdAt: new Date().toISOString()
        });
      }
    });
    
    return alerts;
  }
};

// Servicio de trazabilidad
export const traceabilityService = {
  // Rastrear historial completo de un producto
  traceProduct: (productCode, inventoryItems, auditLog) => {
    const productItems = inventoryItems.filter(item => item.productCode === productCode);
    const productLogs = auditLog.filter(log => 
      log.data?.productCode === productCode || 
      productItems.some(item => item.id === log.data?.itemId || log.data?.id === item.id)
    );
    
    return {
      product: productCode,
      totalBatches: productItems.length,
      activeBatches: productItems.filter(i => i.status === 'active').length,
      totalQuantity: productItems.reduce((sum, item) => sum + (item.quantity || 0), 0),
      batches: productItems.map(item => ({
        lotCode: item.lotCode,
        quantity: item.quantity,
        expirationDate: item.expirationDate,
        status: item.status,
        registeredAt: item.registeredAt,
        registeredBy: item.registeredBy,
        supplier: item.supplier
      })),
      history: productLogs.map(log => ({
        action: log.action,
        user: log.user,
        timestamp: log.timestamp,
        details: log.data
      }))
    };
  },

  // Rastrear un lote específico
  traceLot: (lotCode, inventoryItems, auditLog) => {
    const lotItem = inventoryItems.find(item => item.lotCode === lotCode);
    if (!lotItem) return null;
    
    const lotLogs = auditLog.filter(log => 
      log.data?.lotCode === lotCode || log.data?.itemId === lotItem.id
    );
    
    return {
      lot: lotCode,
      product: lotItem.productName,
      productCode: lotItem.productCode,
      currentQuantity: lotItem.quantity,
      originalQuantity: lotItem.originalQuantity || lotItem.quantity,
      expirationDate: lotItem.expirationDate,
      status: lotItem.status,
      supplier: lotItem.supplier,
      registeredAt: lotItem.registeredAt,
      registeredBy: lotItem.registeredBy,
      validatedAt: lotItem.validatedAt,
      validatedBy: lotItem.validatedBy,
      movements: lotLogs.map(log => ({
        action: log.action,
        user: log.user,
        timestamp: log.timestamp,
        details: log.data
      }))
    };
  },

  // Generar reporte de trazabilidad
  generateTraceabilityReport: (startDate, endDate, inventoryItems, auditLog) => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    const relevantItems = inventoryItems.filter(item => {
      const itemDate = parseISO(item.registeredAt);
      return itemDate >= start && itemDate <= end;
    });
    
    const relevantLogs = auditLog.filter(log => {
      const logDate = parseISO(log.timestamp);
      return logDate >= start && logDate <= end;
    });
    
    return {
      period: {
        start: format(start, 'dd/MM/yyyy', { locale: es }),
        end: format(end, 'dd/MM/yyyy', { locale: es })
      },
      summary: {
        totalIntakes: relevantItems.length,
        totalValidations: relevantLogs.filter(log => log.action === 'validate_item').length,
        totalDispatches: relevantLogs.filter(log => log.action === 'dispatch').length,
        uniqueProducts: new Set(relevantItems.map(i => i.productCode)).size
      },
      items: relevantItems,
      logs: relevantLogs
    };
  }
};
