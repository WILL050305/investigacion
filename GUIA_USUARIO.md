# Guía de Usuario - Sistema de Gestión Farmacéutica

## 🎯 Acceso al Sistema

1. Abre tu navegador en: `http://localhost:5173`
2. Usa una de las credenciales de prueba:
   - **Almacén**: almacen@pharma.com / password123
   - **Compras**: compras@pharma.com / password123
   - **Admin**: admin@pharma.com / password123

## 📚 Guía por Módulo

### 1️⃣ Dashboard (Inicio)

**¿Qué verás?**
- KPIs principales: productos, unidades, alertas
- Actividad reciente del sistema
- Estado de todos los servicios
- Alertas críticas destacadas

**Acciones:**
- Navega usando el menú lateral
- Revisa el estado general del inventario

---

### 2️⃣ Recepción de Medicamentos

**Rol requerido:** Operador de Almacén / Admin

**Flujo de trabajo:**

1. **Escanear Lote**
   - Haz clic en "Escanear" para simular lectura de código
   - O ingresa manualmente el código de lote

2. **Seleccionar Orden de Compra**
   - Elige la OC correspondiente del dropdown
   - El sistema validará automáticamente

3. **Completar Formulario**
   - Código de Producto: MED-001
   - Nombre: Paracetamol 500mg
   - Cantidad: 1000
   - Fecha de Caducidad: Usar el selector
   - Proveedor: Laboratorio Alpha
   - Número de Factura: FAC-001
   - Número de Guía: GU-001

4. **Validar**
   - Haz clic en "Validar Datos"
   - El sistema mostrará errores o advertencias

5. **Registrar**
   - Si todo es válido, haz clic en "Registrar Ingreso"
   - El producto se agrega automáticamente al inventario

**Validaciones automáticas:**
- ✅ Cantidad recibida vs. cantidad en OC
- ✅ Producto existe en OC
- ✅ Fecha de caducidad válida
- ✅ Coherencia entre factura y guía

---

### 3️⃣ Gestión de Compras

**Rol requerido:** Administrador de Compras / Admin

**Crear Nueva Orden de Compra:**

1. Haz clic en "Nueva Orden de Compra"
2. Ingresa proveedor: "Laboratorio Beta"
3. Agregar productos:
   - Código: MED-002
   - Nombre: Ibuprofeno 400mg
   - Cantidad: 500
   - Precio unitario: 0.75
4. Haz clic en "Agregar Producto" para más items
5. "Crear Orden" para finalizar

**Revisar Validaciones Pendientes:**
- La tarjeta amarilla muestra ingresos sin validar
- Revisa discrepancias antes de aprobar

**Ver Detalles de OC:**
- Haz clic en cualquier fila de la tabla
- Ver productos, estado y fechas

---

### 4️⃣ Inventario FIFO

**Rol requerido:** Todos

**Características:**

**Ordenamiento Automático FIFO:**
- Los lotes se ordenan por fecha de caducidad
- Posición #1 = DEBE USARSE PRIMERO
- Badges rojos indican prioridad alta

**Métricas:**
- Productos únicos
- Total de lotes
- Unidades totales
- Próximos a vencer (90 días)

**Resumen por Producto:**
- Agrupa todos los lotes del mismo producto
- Muestra cantidad total disponible
- Lista lotes en orden FIFO

**Detalles de Lote:**
- Haz clic en cualquier fila
- Ver información completa del lote
- Trazabilidad: quién registró, cuándo, validación

---

### 5️⃣ Panel de Alertas

**Rol requerido:** Todos

**Tipos de Alertas:**

**🔴 Críticas (Rojas)**
- Productos caducados
- Productos que caducan en < 30 días
- Requieren acción inmediata

**🟡 Advertencias (Amarillas)**
- Productos que caducan en 30-90 días
- Discrepancias menores
- Stock bajo

**🔵 Informativas (Azules)**
- Productos que caducan en 90-180 días
- Notificaciones generales

**Filtros Disponibles:**
- Todas
- Caducidad
- Caducados
- Discrepancias
- Stock Bajo

**Marcar como Leída:**
- Haz clic en una alerta
- Se marca automáticamente como leída

---

## 🔄 Flujo Completo de Ejemplo

### Escenario: Recibir nuevo lote de medicamento

1. **Login** (Operador de Almacén)
   - Email: almacen@pharma.com
   - Password: password123

2. **Ir a Recepción**
   - Menú lateral → "Recepción"

3. **Escanear Lote**
   - Clic en "Escanear"
   - Se genera código automático

4. **Completar Datos**
   - OC: PO-001
   - Código: MED-001
   - Nombre: Paracetamol 500mg
   - Lote: (ya escaneado)
   - Cantidad: 1000
   - Caducidad: 2026-12-31
   - Proveedor: Laboratorio Alpha
   - Factura: FAC-001
   - Guía: GU-001

5. **Validar y Registrar**
   - Clic "Validar Datos" → ✅ Válido
   - Clic "Registrar Ingreso" → ✅ Éxito

6. **Verificar en Inventario**
   - Menú → "Inventario"
   - Ver producto en posición FIFO
   - Ver detalles del lote

7. **Revisar Alertas**
   - Si caduca en < 6 meses → alerta automática
   - Menú → "Alertas" para ver

---

## ⚙️ Funcionalidades Automáticas

### Validación Automática
- Se ejecuta al registrar cada ingreso
- Compara con OC en tiempo real
- Valida documentos y fechas
- No requiere intervención manual

### FIFO Automático
- Ordenamiento por fecha de caducidad
- Los lotes más antiguos se priorizan
- Actualización en tiempo real
- Sugerencias automáticas de despacho

### Alertas Proactivas
- Sistema monitorea caducidades 24/7
- Genera alertas 6 meses antes
- Niveles de severidad automáticos
- Notificaciones en el header

### Trazabilidad Total
- Cada acción se registra
- Usuario + timestamp
- Historial inmutable
- Auditoría completa

---

## 🎨 Atajos de Teclado

- `Enter` en scanner → Registrar código
- `Esc` → Cerrar modales
- `/` → Buscar (en tablas)

---

## 📊 Interpretación de Indicadores

### Badges de Estado

**Verde** = Activo/Completado/OK
**Amarillo** = Pendiente/Advertencia
**Rojo** = Crítico/Error/Urgente
**Azul** = Información/Proceso

### Posiciones FIFO

**#1, #2, #3** = Usar primero (badge rojo)
**#4+** = En espera (badge azul)

### Colores de Cantidad

**Negro** = Stock normal (≥50)
**Rojo** = Stock bajo (<50)

---

## ❓ Preguntas Frecuentes

**P: ¿Puedo editar un ingreso después de registrarlo?**
R: No, por trazabilidad. Contacta al administrador.

**P: ¿Qué pasa si recibo menos de lo ordenado?**
R: El sistema genera una advertencia pero permite el registro.

**P: ¿Puedo recibir más de lo ordenado?**
R: No, el sistema rechaza el ingreso (error de validación).

**P: ¿Cómo sé qué lote usar primero?**
R: El inventario FIFO muestra el orden. Posición #1 siempre primero.

**P: ¿Las alertas se envían por email?**
R: Actualmente no, solo en el sistema. (Funcionalidad futura)

---

## 🆘 Solución de Problemas

### No puedo iniciar sesión
- Verifica email y contraseña
- Usa credenciales de prueba proporcionadas
- Limpia caché del navegador

### No veo el scanner
- Verifica permisos de rol
- Solo Almacén y Admin pueden escanear

### Validación falla
- Verifica que producto esté en OC
- Confirma cantidad no exceda OC
- Revisa fecha de caducidad

### No veo mis cambios
- Refresca la página (F5)
- Verifica que se guardó correctamente

---

## 📞 Soporte

Para problemas técnicos o consultas:
- Contactar al Administrador del Sistema
- Email: admin@pharma.com
- Sistema de tickets interno

---

**Sistema desarrollado según normas BPMN y PEPS/FIFO**
**Versión 1.0 - Diciembre 2025**
