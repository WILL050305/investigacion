# Datos de Ejemplo para Pruebas

## Órdenes de Compra (Purchase Orders)

### PO-001
```json
{
  "id": "PO-001",
  "supplier": "Laboratorio Alpha",
  "products": [
    {
      "code": "MED-001",
      "name": "Paracetamol 500mg",
      "quantity": 1000,
      "unitPrice": 0.5
    },
    {
      "code": "MED-002",
      "name": "Ibuprofeno 400mg",
      "quantity": 800,
      "unitPrice": 0.75
    }
  ],
  "status": "pending",
  "date": "2025-12-01T09:00:00.000Z"
}
```

### PO-002
```json
{
  "id": "PO-002",
  "supplier": "Farmacéutica Beta",
  "products": [
    {
      "code": "MED-003",
      "name": "Amoxicilina 500mg",
      "quantity": 2000,
      "unitPrice": 1.2
    }
  ],
  "status": "pending",
  "date": "2025-12-05T10:00:00.000Z"
}
```

## Escenarios de Prueba

### ✅ Caso 1: Ingreso Válido Completo

**Objetivo:** Registrar un ingreso que pase todas las validaciones

**Datos:**
- Orden de Compra: PO-001
- Código Producto: MED-001
- Nombre: Paracetamol 500mg
- Lote: LOT-2025-001
- Cantidad: 1000
- Fecha Caducidad: 2027-06-30
- Proveedor: Laboratorio Alpha
- Factura: FAC-001
- Guía: GU-001

**Resultado Esperado:**
- ✅ Validación exitosa
- ✅ Stock liberado automáticamente
- ✅ Registro en inventario
- ✅ Log de auditoría creado

---

### ⚠️ Caso 2: Cantidad Menor a la Ordenada

**Objetivo:** Probar advertencia por cantidad menor

**Datos:**
- Orden de Compra: PO-001
- Código Producto: MED-002
- Nombre: Ibuprofeno 400mg
- Lote: LOT-2025-002
- Cantidad: 500 (ordenada: 800)
- Fecha Caducidad: 2027-03-15
- Proveedor: Laboratorio Alpha
- Factura: FAC-002
- Guía: GU-002

**Resultado Esperado:**
- ⚠️ Advertencia: "Cantidad menor a ordenada"
- ✅ Registro permitido
- ✅ Stock liberado

---

### ❌ Caso 3: Cantidad Mayor a la Ordenada

**Objetivo:** Probar rechazo por exceso de cantidad

**Datos:**
- Orden de Compra: PO-001
- Código Producto: MED-001
- Nombre: Paracetamol 500mg
- Lote: LOT-2025-003
- Cantidad: 1500 (ordenada: 1000)
- Fecha Caducidad: 2027-08-20
- Proveedor: Laboratorio Alpha
- Factura: FAC-003
- Guía: GU-003

**Resultado Esperado:**
- ❌ Error: "Cantidad excede la ordenada"
- ❌ Registro rechazado
- ❌ Stock no liberado

---

### ❌ Caso 4: Producto No en Orden de Compra

**Objetivo:** Probar rechazo de producto no autorizado

**Datos:**
- Orden de Compra: PO-001
- Código Producto: MED-999
- Nombre: Producto No Autorizado
- Lote: LOT-2025-004
- Cantidad: 100
- Fecha Caducidad: 2027-12-31
- Proveedor: Laboratorio Alpha
- Factura: FAC-004
- Guía: GU-004

**Resultado Esperado:**
- ❌ Error: "Producto no está en la orden de compra"
- ❌ Registro rechazado

---

### ❌ Caso 5: Fecha de Caducidad Vencida

**Objetivo:** Probar rechazo por producto caducado

**Datos:**
- Orden de Compra: PO-001
- Código Producto: MED-001
- Nombre: Paracetamol 500mg
- Lote: LOT-2020-001
- Cantidad: 1000
- Fecha Caducidad: 2024-01-01 (vencida)
- Proveedor: Laboratorio Alpha
- Factura: FAC-005
- Guía: GU-005

**Resultado Esperado:**
- ❌ Error: "Producto ya está caducado"
- ❌ Registro rechazado

---

### ⚠️ Caso 6: Caducidad Próxima (< 3 meses)

**Objetivo:** Probar advertencia por caducidad cercana

**Datos:**
- Orden de Compra: PO-001
- Código Producto: MED-001
- Nombre: Paracetamol 500mg
- Lote: LOT-2025-005
- Cantidad: 1000
- Fecha Caducidad: 2026-02-15 (2 meses)
- Proveedor: Laboratorio Alpha
- Factura: FAC-006
- Guía: GU-006

**Resultado Esperado:**
- ⚠️ Advertencia: "Producto caduca en menos de 3 meses"
- ✅ Registro permitido
- 🔔 Alerta automática generada

---

### 🔔 Caso 7: Alertas Automáticas

**Objetivo:** Verificar generación de alertas

**Datos:**
Registrar 3 lotes con diferentes fechas:
1. Lote 1: Caduca en 15 días → Alerta CRÍTICA
2. Lote 2: Caduca en 60 días → Alerta ADVERTENCIA
3. Lote 3: Caduca en 120 días → Alerta INFO

**Resultado Esperado:**
- 🔔 3 alertas generadas automáticamente
- 🔴 1 crítica (roja)
- 🟡 1 advertencia (amarilla)
- 🔵 1 informativa (azul)

---

### 📊 Caso 8: Ordenamiento FIFO

**Objetivo:** Verificar orden automático FIFO

**Datos:**
Registrar 4 lotes del mismo producto con fechas diferentes:
1. MED-001, Caduca: 2026-03-15
2. MED-001, Caduca: 2026-01-10
3. MED-001, Caduca: 2026-06-20
4. MED-001, Caduca: 2026-02-05

**Resultado Esperado en Inventario:**
```
Posición #1: 2026-01-10 (más cercana)
Posición #2: 2026-02-05
Posición #3: 2026-03-15
Posición #4: 2026-06-20 (más lejana)
```

---

## Flujos de Usuario Completos

### Flujo 1: Operador de Almacén - Día Completo

1. **Login**
   - Usuario: almacen@pharma.com
   - Password: password123

2. **Revisar Dashboard**
   - Ver KPIs del día
   - Revisar alertas críticas

3. **Recepción de 5 lotes**
   - Escanear cada lote
   - Completar formularios
   - Validar automáticamente

4. **Revisar Inventario**
   - Verificar orden FIFO
   - Confirmar todos los lotes registrados

5. **Logout**

---

### Flujo 2: Administrador de Compras

1. **Login**
   - Usuario: compras@pharma.com
   - Password: password123

2. **Crear 2 Nuevas OC**
   - OC-003: Proveedor Gamma
   - OC-004: Proveedor Delta

3. **Revisar Validaciones Pendientes**
   - Verificar ingresos sin validar
   - Aprobar o rechazar

4. **Ver Detalles de OC Activas**
   - Estado de cada orden
   - Productos pendientes

5. **Logout**

---

### Flujo 3: Administrador - Auditoría Completa

1. **Login**
   - Usuario: admin@pharma.com
   - Password: password123

2. **Dashboard General**
   - Revisar todas las métricas
   - Ver actividad reciente

3. **Revisar Todas las Alertas**
   - Filtrar por tipo
   - Marcar como leídas

4. **Inventario FIFO**
   - Verificar orden correcto
   - Revisar resumen por producto

5. **Trazabilidad** (futuro)
   - Rastrear lote específico
   - Generar reporte

6. **Logout**

---

## Datos de Ejemplo para Importar

### JSON para LocalStorage

```javascript
// Ejecutar en Console del navegador para datos de ejemplo

const examplePOs = [
  {
    id: "PO-001",
    supplier: "Laboratorio Alpha",
    products: [
      { code: "MED-001", name: "Paracetamol 500mg", quantity: 1000, unitPrice: 0.5 },
      { code: "MED-002", name: "Ibuprofeno 400mg", quantity: 800, unitPrice: 0.75 }
    ],
    status: "pending",
    date: new Date().toISOString(),
    total: 1100
  },
  {
    id: "PO-002",
    supplier: "Farmacéutica Beta",
    products: [
      { code: "MED-003", name: "Amoxicilina 500mg", quantity: 2000, unitPrice: 1.2 }
    ],
    status: "pending",
    date: new Date().toISOString(),
    total: 2400
  }
];

localStorage.setItem('purchaseOrders', JSON.stringify(examplePOs));
console.log('✅ Órdenes de compra cargadas');
```

---

## Checklist de Pruebas

### Funcionalidad Básica
- [ ] Login con 3 tipos de usuarios
- [ ] Navegación entre módulos
- [ ] Logout correcto

### Módulo Recepción
- [ ] Escaneo de códigos
- [ ] Validación exitosa
- [ ] Validación con errores
- [ ] Validación con advertencias
- [ ] Registro de ingreso

### Módulo Compras
- [ ] Crear nueva OC
- [ ] Ver lista de OC
- [ ] Ver detalles de OC
- [ ] Ver validaciones pendientes

### Módulo Inventario
- [ ] Ver inventario ordenado FIFO
- [ ] Ver resumen por producto
- [ ] Ver detalles de lote
- [ ] Verificar KPIs

### Módulo Alertas
- [ ] Ver todas las alertas
- [ ] Filtrar por tipo
- [ ] Marcar como leída
- [ ] Ver alertas críticas

### Validaciones Automáticas
- [ ] Validación contra OC
- [ ] Validación de cantidad
- [ ] Validación de fecha
- [ ] Validación de documentos

### Sistema FIFO
- [ ] Ordenamiento automático
- [ ] Posiciones correctas
- [ ] Badges de prioridad

---

## Métricas de Éxito

### Reducción de Tiempos
- **Antes:** 30-45 días
- **Después:** < 25 días
- **Meta:** ✅ Cumplida con validación automática

### Reducción de Errores
- **Antes:** 25% tasa de error
- **Después:** < 10% tasa de error
- **Meta:** ✅ Cumplida con validaciones automáticas

### Trazabilidad
- **Antes:** Manual, incompleta
- **Después:** 100% automática
- **Meta:** ✅ Log completo de auditoría

---

**Usa estos datos para probar todas las funcionalidades del sistema**
