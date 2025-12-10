# Documentación Técnica - Sistema Farmacéutico

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

```
Frontend:
├── React 19.2          - UI Framework
├── Vite 7.2            - Build Tool & Dev Server
├── Tailwind CSS        - Utility-first CSS
├── React Router v6     - Client-side routing
├── Lucide React        - Icon library
└── date-fns            - Date manipulation

Estado:
├── Context API         - Global state management
├── LocalStorage        - Data persistence (dev)
└── Custom Hooks        - Reusable logic

Servicios:
├── validationService   - Business validation logic
├── fifoService         - FIFO/PEPS algorithms
└── alertService        - Alert generation & tracking
```

---

## 📦 Estructura de Componentes

### Componentes Reutilizables

#### Button Component
```jsx
<Button 
  variant="primary"       // primary|secondary|success|danger|warning|outline
  size="md"              // sm|md|lg
  disabled={false}
  type="button"          // button|submit|reset
  icon={IconComponent}   // Lucide React icon
  onClick={handler}
>
  Text
</Button>
```

#### Card Component
```jsx
<Card
  title="Optional Title"
  subtitle="Optional Subtitle"
  padding="md"           // sm|md|lg
  hover={false}          // Enable hover effect
  className=""           // Additional classes
>
  Content
</Card>
```

#### Input Component
```jsx
<Input
  label="Label Text"
  type="text"            // text|number|date|email|password
  value={state}
  onChange={handler}
  placeholder=""
  error=""               // Error message
  disabled={false}
  required={false}
  icon={IconComponent}
/>
```

#### Table Component
```jsx
<Table
  columns={[
    {
      header: 'Column Name',
      accessor: 'dataKey',
      render: (row) => <CustomCell data={row} />
    }
  ]}
  data={arrayOfObjects}
  onRowClick={(row) => handleClick(row)}
/>
```

#### Alert Component
```jsx
<Alert
  type="success"         // success|error|warning|info
  title="Optional Title"
  message="Message text"
  onClose={handler}      // Optional close button
/>
```

#### Modal Component
```jsx
<Modal
  isOpen={boolean}
  onClose={handler}
  title="Modal Title"
  size="md"              // sm|md|lg|xl
  showClose={true}
>
  Content
</Modal>
```

#### Badge Component
```jsx
<Badge
  variant="default"      // default|primary|success|danger|warning|info
  size="md"             // sm|md|lg
>
  Text
</Badge>
```

#### Scanner Component
```jsx
<Scanner
  onScan={(code) => handleScan(code)}
  label="Scan Label"
  placeholder="Placeholder text"
/>
```

---

## 🔐 Sistema de Autenticación

### AuthContext

```jsx
const { user, login, logout, loading, hasPermission } = useAuth();

// User object structure
{
  email: "user@example.com",
  name: "User Name",
  role: "warehouse|purchasing|admin",
  permissions: ["permission1", "permission2"]
}

// Methods
login({ email, password })  // Returns { success, user?, error? }
logout()                    // Clears session
hasPermission(permission)   // Boolean
```

### Roles y Permisos

```javascript
ROLES = {
  warehouse: {
    permissions: ['scan', 'register_intake', 'view_discrepancies']
  },
  purchasing: {
    permissions: ['manage_po', 'review_validations', 'approve_documents']
  },
  admin: {
    permissions: ['all']
  }
}
```

### Rutas Protegidas

```jsx
<ProtectedRoute>
  <Component />
</ProtectedRoute>

// Redirige a /login si no hay usuario
// Muestra loader mientras carga
```

---

## 📊 Gestión de Estado

### InventoryContext

```jsx
const {
  inventory,              // Array de items
  purchaseOrders,         // Array de OCs
  alerts,                 // Array de alertas
  auditLog,              // Array de logs
  addInventoryItem,      // (item, user) => newItem
  validateAndRelease,    // (itemId, validation, user) => void
  markAlertAsRead,       // (alertId) => void
  getActiveInventory,    // () => Array
  getPendingValidations, // () => Array
  setPurchaseOrders      // (orders) => void
} = useInventory();
```

### Estructura de Datos

#### Inventory Item
```javascript
{
  id: "INV-12345",
  poId: "PO-001",
  productCode: "MED-001",
  productName: "Paracetamol 500mg",
  lotCode: "LOT-12345",
  quantity: 1000,
  originalQuantity: 1000,
  expirationDate: "2026-12-31",
  supplier: "Laboratorio Alpha",
  invoiceNumber: "FAC-001",
  deliveryNoteNumber: "GU-001",
  status: "active|pending_validation|rejected",
  registeredAt: "2025-12-10T10:00:00.000Z",
  registeredBy: "User Name",
  validatedAt: "2025-12-10T10:05:00.000Z",
  validatedBy: "User Name",
  validationResult: { ... }
}
```

#### Purchase Order
```javascript
{
  id: "PO-001",
  supplier: "Laboratorio Alpha",
  products: [
    {
      code: "MED-001",
      name: "Paracetamol 500mg",
      quantity: 1000,
      unitPrice: 0.5
    }
  ],
  status: "pending|partial|completed|cancelled",
  date: "2025-12-10T09:00:00.000Z",
  total: 500.00
}
```

#### Alert
```javascript
{
  id: "ALERT-12345",
  type: "expiration|expired|discrepancy|low_stock",
  severity: "danger|warning|info",
  title: "Alert Title",
  message: "Alert message",
  itemId: "INV-12345",
  createdAt: "2025-12-10T10:00:00.000Z",
  read: false
}
```

#### Audit Log
```javascript
{
  id: "LOG-12345",
  action: "add_item|validate_item|dispatch",
  data: { ... },
  user: "User Name",
  userEmail: "user@example.com",
  timestamp: "2025-12-10T10:00:00.000Z"
}
```

---

## 🔍 Servicios

### validationService

```javascript
// Validar contra orden de compra
validateAgainstPO(receivedItem, purchaseOrders)
// Returns: { isValid, errors[], warnings[], po }

// Validar fecha de caducidad
validateExpirationDate(expirationDate)
// Returns: { isValid, errors[], warnings[] }

// Validar documentos
validateDocuments(invoice, deliveryNote)
// Returns: { isValid, errors[], warnings[] }

// Validación completa
validateComplete(receivedItem, purchaseOrders, documents)
// Returns: {
//   isValid,
//   errors[],
//   warnings[],
//   details: { poValidation, dateValidation, docValidation }
// }
```

### fifoService

```javascript
// Ordenar por FIFO
sortByFIFO(inventoryItems)
// Returns: Array ordenado por expirationDate ASC, registeredAt ASC

// Obtener siguiente lote
getNextBatch(productCode, inventoryItems)
// Returns: Item | null

// Sugerir lotes para despacho
suggestBatchesForDispatch(productCode, quantity, inventoryItems)
// Returns: {
//   batches: Array con dispatchQuantity,
//   fulfilled: boolean,
//   shortfall: number
// }

// Verificar disponibilidad
checkAvailability(productCode, quantity, inventoryItems)
// Returns: {
//   available: boolean,
//   totalAvailable: number,
//   requested: number,
//   shortfall: number
// }
```

### alertService

```javascript
// Verificar alertas de caducidad
checkExpirationAlerts(inventoryItems, thresholdMonths = 6)
// Returns: Array de alertas

// Crear alerta de discrepancia
createDiscrepancyAlert(validationResult, item)
// Returns: Alert object

// Verificar stock bajo
checkLowStockAlerts(inventoryItems, thresholds)
// Returns: Array de alertas
```

### traceabilityService

```javascript
// Rastrear producto
traceProduct(productCode, inventoryItems, auditLog)
// Returns: {
//   product, totalBatches, activeBatches, totalQuantity,
//   batches[], history[]
// }

// Rastrear lote
traceLot(lotCode, inventoryItems, auditLog)
// Returns: {
//   lot, product, currentQuantity, movements[]
// }

// Generar reporte
generateTraceabilityReport(startDate, endDate, items, logs)
// Returns: { period, summary, items, logs }
```

---

## 🎨 Sistema de Diseño

### Paleta de Colores

```css
Primary:    #2563eb (blue-600)
Secondary:  #6b7280 (gray-500)
Success:    #16a34a (green-600)
Danger:     #dc2626 (red-600)
Warning:    #eab308 (yellow-500)
Info:       #06b6d4 (cyan-500)
```

### Espaciado

```
sm:  12px (0.75rem)
md:  16px (1rem)
lg:  24px (1.5rem)
xl:  32px (2rem)
```

### Tipografía

```
Heading 1: 30px (1.875rem) - font-bold
Heading 2: 24px (1.5rem) - font-bold
Heading 3: 20px (1.25rem) - font-semibold
Body:      16px (1rem) - font-normal
Small:     14px (0.875rem) - font-normal
```

### Sombras

```css
Card:   shadow-md (0 4px 6px rgba(0,0,0,0.1))
Hover:  shadow-xl (0 20px 25px rgba(0,0,0,0.15))
```

---

## 🚀 Optimizaciones

### Code Splitting
```jsx
// Lazy loading de módulos
const Dashboard = lazy(() => import('./modules/Dashboard'));
```

### Memoización
```jsx
// Memorizar cálculos costosos
const sortedInventory = useMemo(
  () => fifoService.sortByFIFO(inventory),
  [inventory]
);
```

### Debounce
```jsx
// Para búsquedas y filtros
const debouncedSearch = useDebounce(searchTerm, 300);
```

---

## 🧪 Testing

### Unit Tests (Recomendado)
```bash
npm install -D vitest @testing-library/react
```

```jsx
// Example test
import { render, screen } from '@testing-library/react';
import Button from './Button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

### E2E Tests (Recomendado)
```bash
npm install -D playwright
```

---

## 🔧 Variables de Entorno

```env
# .env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Sistema Farmacéutico
VITE_ALERT_THRESHOLD_MONTHS=6
```

Acceso en código:
```jsx
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## 📡 Integración Backend (Futuro)

### API Endpoints Sugeridos

```
POST   /auth/login
POST   /auth/logout
GET    /auth/me

GET    /inventory
POST   /inventory
GET    /inventory/:id
PUT    /inventory/:id
DELETE /inventory/:id

GET    /purchase-orders
POST   /purchase-orders
GET    /purchase-orders/:id
PUT    /purchase-orders/:id

GET    /alerts
PUT    /alerts/:id/read

GET    /audit-logs
GET    /audit-logs?startDate=&endDate=

POST   /validate
```

### Estructura de Request/Response

```javascript
// POST /inventory
Request: {
  poId: "PO-001",
  productCode: "MED-001",
  // ... resto de campos
}

Response: {
  success: true,
  data: { id: "INV-12345", ... },
  message: "Ingreso registrado correctamente"
}
```

---

## 🐛 Debugging

### React DevTools
```bash
# Instalar extensión
https://chrome.google.com/webstore/detail/react-developer-tools
```

### Console Logging
```jsx
// En desarrollo
if (import.meta.env.DEV) {
  console.log('Debug info:', data);
}
```

### Error Boundaries
```jsx
class ErrorBoundary extends React.Component {
  componentDidCatch(error, info) {
    console.error('Error:', error, info);
  }
  
  render() {
    return this.props.children;
  }
}
```

---

## 📈 Performance

### Lighthouse Targets
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

### Optimizaciones Aplicadas
- Tree shaking automático (Vite)
- Code splitting por ruta
- CSS purging (Tailwind)
- Lazy loading de imágenes
- Memoización de cálculos

---

## 🔒 Seguridad

### Implementado
- Input sanitization
- XSS protection (React default)
- CSRF tokens (pendiente backend)
- Role-based access control
- Audit logging

### Pendiente
- Rate limiting
- API authentication (JWT)
- HTTPS enforcement
- Content Security Policy
- SQL injection prevention (backend)

---

## 📚 Recursos Adicionales

- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite Guide](https://vite.dev/guide)
- [date-fns](https://date-fns.org)
- [Lucide Icons](https://lucide.dev)

---

**Última actualización: Diciembre 2025**
