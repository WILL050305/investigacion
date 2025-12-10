// Servicio de validación automática
export const validateInventoryService = {
  // Validar contra orden de compra
  validateAgainstPO: (receivedItem, purchaseOrders) => {
    const po = purchaseOrders.find(po => po.id === receivedItem.poId);
    
    if (!po) {
      return {
        isValid: false,
        errors: ['Orden de compra no encontrada'],
        warnings: []
      };
    }

    const errors = [];
    const warnings = [];

    // Buscar producto en la PO
    const poProduct = po.products.find(p => p.code === receivedItem.productCode);
    
    if (!poProduct) {
      errors.push('Producto no está en la orden de compra');
    } else {
      // Validar cantidad
      if (receivedItem.quantity > poProduct.quantity) {
        errors.push(`Cantidad recibida (${receivedItem.quantity}) excede cantidad ordenada (${poProduct.quantity})`);
      } else if (receivedItem.quantity < poProduct.quantity) {
        warnings.push(`Cantidad recibida (${receivedItem.quantity}) es menor a cantidad ordenada (${poProduct.quantity})`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      po
    };
  },

  // Validar fecha de caducidad
  validateExpirationDate: (expirationDate) => {
    const expDate = new Date(expirationDate);
    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    const errors = [];
    const warnings = [];

    if (expDate <= today) {
      errors.push('Producto ya está caducado');
    } else if (expDate <= threeMonthsFromNow) {
      warnings.push('Producto caduca en menos de 3 meses');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  },

  // Validar documentos (factura vs guía)
  validateDocuments: (invoice, deliveryNote) => {
    const errors = [];
    const warnings = [];

    if (!invoice || !deliveryNote) {
      errors.push('Falta factura o guía de remisión');
      return { isValid: false, errors, warnings };
    }

    // Validar coincidencia de cantidades
    if (invoice.totalQuantity !== deliveryNote.totalQuantity) {
      errors.push('Las cantidades en factura y guía no coinciden');
    }

    // Validar proveedor
    if (invoice.supplier !== deliveryNote.supplier) {
      warnings.push('Proveedor en factura difiere de la guía');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  },

  // Validación completa
  validateComplete: (receivedItem, purchaseOrders, documents) => {
    const poValidation = validateInventoryService.validateAgainstPO(receivedItem, purchaseOrders);
    const dateValidation = validateInventoryService.validateExpirationDate(receivedItem.expirationDate);
    const docValidation = documents ? validateInventoryService.validateDocuments(documents.invoice, documents.deliveryNote) : { isValid: true, errors: [], warnings: [] };

    const allErrors = [
      ...poValidation.errors,
      ...dateValidation.errors,
      ...docValidation.errors
    ];

    const allWarnings = [
      ...poValidation.warnings,
      ...dateValidation.warnings,
      ...docValidation.warnings
    ];

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      details: {
        poValidation,
        dateValidation,
        docValidation
      }
    };
  }
};
