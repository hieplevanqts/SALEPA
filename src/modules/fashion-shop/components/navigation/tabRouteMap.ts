import type { Tab } from "./tabs";

export const TAB_ROUTE_MAP: Record<Tab, string> = {
  // Dashboard
  dashboard: "",

  // Sales / Orders
  sales: "sales",
  orders: "orders",
  "order-management": "orders/manage",

  // Products
  products: "products",
  "product-categories": "products/categories",
  categories: "products/categories",
  brands: "products/brands",

  // Customers
  customers: "customers",
  "customer-view": "customers/view",

  // Users / Roles
  users: "users",
  "role-groups": "roles",

  // Appointments
  appointments: "appointments",

  // Inventory
  inventory: "inventory",
  "stock-in": "inventory/stock-in",
  "stock-out": "inventory/stock-out",
  "inventory-history": "inventory/history",

  // Reports
  reports: "reports",
  "revenue-overview": "reports/revenue-overview",
  "revenue-staff": "reports/revenue-staff",
  "revenue-product": "reports/revenue-product",
  "customer-report": "reports/customer-report",
  "appointment-report": "reports/appointment-report",
  "inventory-report": "reports/inventory-report",

  // POS / Self service
  cashier: "cashier",
  "self-service": "self-service",

  // Settings
  settings: "settings",
};
