import type { Tab } from './tabs';

export const TAB_ROUTE_MAP: Record<Tab, string> = {
  dashboard: '',

  // Sales / Products
  sales: 'sales',
  products: 'products',

  // Inventory
  'stock-in': 'inventory/stock-in',
  'stock-out': 'inventory/stock-out',

  // Orders
  orders: 'orders',
  'order-management': 'orders/manage',

  // Revenue
  reports: 'reports',
  'revenue-overview': 'reports/revenue-overview',
  'revenue-staff': 'reports/revenue-staff',
  'revenue-service': 'reports/revenue-service',
  'revenue-package': 'reports/revenue-package',
  'revenue-product': 'reports/revenue-product',

  // Reports
  'customer-report': 'reports/customer-report',
  'appointment-report': 'reports/appointment-report',
  'inventory-report': 'reports/inventory-report',

  // Core
  customers: 'customers',
  'product-categories': 'product-categories',
  suppliers: 'suppliers',

  // Tables / Appointments / Kitchen
  tables: 'tables',
  'table-areas': 'tables/areas',
  appointments: 'appointments',
  kitchen: 'kitchen',
  'kitchen-orders': 'kitchen/orders',

  // System
  users: 'users',
  'role-groups': 'roles',
  settings: 'settings',

  // POS / Views
  cashier: 'cashier',
  'customer-view': 'customer-view',
  'self-service': 'self-service',
};
