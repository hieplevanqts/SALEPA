import type { Tab } from './tabs';

export const TAB_ROUTE_MAP: Record<Tab, string> = {
  dashboard: '',

  sales: 'sales',
  products: 'products',
  orders: 'orders',
  'order-management': 'orders/manage',
  "customer-types": 'customer-types',
  customers: 'customers',

  users: 'users',
  'role-groups': 'roles',

  'product-categories': 'product-categories',

  'stock-in': 'inventory/stock-in',
  'stock-out': 'inventory/stock-out',

  reports: 'reports',
  'revenue-overview': 'reports/revenue-overview',
  'revenue-staff': 'reports/revenue-staff',
  'revenue-product': 'reports/revenue-product',
  'customer-report': 'reports/customer-report',
  'inventory-report': 'reports/inventory-report',

  settings: 'settings',
  cashier: 'cashier',
  'customer-view': 'customer-view',
  'self-service': 'self-service',
};
