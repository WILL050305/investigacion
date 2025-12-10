import { parseISO, compareAsc } from 'date-fns';

// Servicio FIFO/PEPS - First Expired, First Out
export const fifoService = {
  // Ordenar inventario por FIFO (primero el más próximo a caducar)
  sortByFIFO: (inventoryItems) => {
    return [...inventoryItems].sort((a, b) => {
      // Primero por fecha de caducidad
      const dateCompare = compareAsc(
        parseISO(a.expirationDate),
        parseISO(b.expirationDate)
      );
      
      if (dateCompare !== 0) return dateCompare;
      
      // Si tienen la misma fecha de caducidad, ordenar por fecha de registro
      return compareAsc(
        parseISO(a.registeredAt),
        parseISO(b.registeredAt)
      );
    });
  },

  // Obtener el siguiente lote a utilizar según FIFO
  getNextBatch: (productCode, inventoryItems) => {
    const productBatches = inventoryItems.filter(
      item => item.productCode === productCode && item.status === 'active' && item.quantity > 0
    );
    
    const sorted = fifoService.sortByFIFO(productBatches);
    return sorted[0] || null;
  },

  // Sugerir lotes para salida según cantidad solicitada
  suggestBatchesForDispatch: (productCode, requestedQuantity, inventoryItems) => {
    const productBatches = inventoryItems.filter(
      item => item.productCode === productCode && item.status === 'active' && item.quantity > 0
    );
    
    const sorted = fifoService.sortByFIFO(productBatches);
    const selectedBatches = [];
    let remainingQuantity = requestedQuantity;
    
    for (const batch of sorted) {
      if (remainingQuantity <= 0) break;
      
      const quantityFromBatch = Math.min(batch.quantity, remainingQuantity);
      selectedBatches.push({
        ...batch,
        dispatchQuantity: quantityFromBatch
      });
      
      remainingQuantity -= quantityFromBatch;
    }
    
    return {
      batches: selectedBatches,
      fulfilled: remainingQuantity === 0,
      shortfall: Math.max(0, remainingQuantity)
    };
  },

  // Verificar si hay stock disponible
  checkAvailability: (productCode, requestedQuantity, inventoryItems) => {
    const totalAvailable = inventoryItems
      .filter(item => item.productCode === productCode && item.status === 'active')
      .reduce((sum, item) => sum + item.quantity, 0);
    
    return {
      available: totalAvailable >= requestedQuantity,
      totalAvailable,
      requested: requestedQuantity,
      shortfall: Math.max(0, requestedQuantity - totalAvailable)
    };
  }
};
