export type Tab =
  | 'dashboard'

  | 'sales'
  | 'products'

  | 'stock-in'
  | 'stock-out'

  | 'orders'
  | 'order-management'

  // Revenue
  | 'reports'
  | 'revenue-overview'
  | 'revenue-staff'
  | 'revenue-service'
  | 'revenue-package'
  | 'revenue-product'

  // Reports
  | 'customer-report'
  | 'appointment-report'
  | 'inventory-report'

  // Core
  | 'customers'
  | 'product-categories'
  | 'suppliers'

  // Tables / Kitchen / Appointments
  | 'tables'
  | 'table-areas'
  | 'appointments'
  | 'kitchen'
  | 'kitchen-orders'

  // System
  | 'users'
  | 'role-groups'
  | 'settings'

  // POS / Views
  | 'cashier'
  | 'customer-view'
  | 'self-service';
