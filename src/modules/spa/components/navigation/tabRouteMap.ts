import type { Tab } from "./tabs";

export const TAB_ROUTE_MAP: Record<Tab, string> = {
  // Dashboard
  dashboard: "",

  // Sales / POS
  sales: "sales",
  cashier: "cashier",
  "self-service": "self-service",

  // Orders
  orders: "orders",
  "order-management": "orders/manage",

  // Products
  products: "products",
  "product-categories": "product-categories",

  // Customers
  customers: "customers",
  "customer-view": "customers/view",
  "customer-groups": "customer-groups",

  // Inventory
  "stock-in": "inventory/stock-in",
  "stock-out": "inventory/stock-out",
  beds: "beds",
  suppliers: "suppliers",

  // Users / RBAC
  users: "users",
  "role-groups": "users/roles",
  "user-permissions": "users/permissions",

  // Appointments
  appointments: "appointments",

  // Reports
  reports: "reports",
  "revenue-overview": "reports/revenue-overview",
  "revenue-staff": "reports/revenue-staff",
  "revenue-service": "reports/revenue-service",
  "revenue-package": "reports/revenue-package",
  "revenue-product": "reports/revenue-product",
  "customer-report": "reports/customer-report",
  "appointment-report": "reports/appointment-report",
  "inventory-report": "reports/inventory-report",

  // Settings
  settings: "settings",
};
