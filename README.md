# Sistema de Gestión de Inventario Farmacéutico

Sistema digital completo para el proceso de entrada y registro de medicamentos con validación automática, política FIFO/PEPS y trazabilidad total.

## 🎯 Características Principales

### 1. Módulo de Digitalización y Entrada de Datos
- ✅ Escaneo de códigos de lote (simulado con cámara)
- ✅ Lectura de fechas de caducidad
- ✅ Registro digital de facturas y guías
- ✅ Interfaz optimizada para dispositivos móviles

### 2. Motor de Validación Automática
- ✅ Validación contra Órdenes de Compra (OC)
- ✅ Comparación de cantidades recibidas vs pedidas
- ✅ Validación de coherencia documental
- ✅ Reglas automáticas de aceptación/rechazo

### 3. Sistema de Trazabilidad y Alertas
- ✅ Alertas automáticas de caducidad (6 meses antes)
- ✅ Alertas de lotes próximos a vencer
- ✅ Alertas por discrepancias en documentos
- ✅ Trazabilidad completa: proveedor → lote → fecha → ubicación

### 4. Gestión de Inventario FIFO/PEPS
- ✅ Política PEPS automática
- ✅ Liberación inmediata de stock tras validación
- ✅ Actualización en tiempo real
- ✅ Historial inmutable de auditoría

### 5. Sistema de Roles y Permisos
- ✅ Control de acceso basado en roles
- ✅ Registro de auditoría por usuario
- ✅ Tres niveles: Almacén, Compras, Administrador

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

## 👤 Credenciales de Prueba

**Operador de Almacén:** `almacen@pharma.com` / `password123`
**Administrador Compras:** `compras@pharma.com` / `password123`
**Administrador Sistema:** `admin@pharma.com` / `password123`

## 🎨 Tecnologías

- React 19.2 + Vite 7.2
- Tailwind CSS
- React Router DOM
- Lucide React (iconos)
- date-fns (fechas)

## 📊 Módulos

1. **Dashboard** - Vista general y KPIs
2. **Recepción** - Escaneo y registro de ingresos
3. **Compras** - Gestión de órdenes de compra
4. **Inventario** - Gestión FIFO/PEPS
5. **Alertas** - Panel de notificaciones

## ✨ Componentes Reutilizables

Todos los componentes en `/src/components` son reutilizables:
- Button, Card, Input, Table
- Alert, Badge, Modal
- Scanner, Layout

Ver documentación completa en el código fuente.
