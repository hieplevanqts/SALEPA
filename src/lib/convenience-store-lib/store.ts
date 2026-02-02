import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Language } from "./i18n";
// import { supabaseService } from './supabaseService'; // Removed - using localStorage only
import { getIndustryData } from "./industryData";
import type { IndustryType } from "../../modules/convenience-store/pages/system/IndustrySelection";
import {
  systemPermissions,
  defaultRoleGroups,
} from "./permissionData";
import { demoCustomers } from "./customerDemoData";

export interface TreatmentSessionDetail {
  sessionNumber: number;
  products: { id: string; quantity: number }[];
  services: { id: string; quantity: number }[];
}

export interface Product {
  _id: string;
  tenant_id?: string;
  industry_id?: string;
  product_type_id?: string;
  product_category_id?: string;
  code: string;
  title: string;
  brief?: string;
  content?: string;
  price: number;
  prices?: any; // jsonb - for multiple price types
  quantity: number;
  waiting_quantity?: number;
  is_sold_out?: boolean;
  status: 0 | 1; // 0 = inactive, 1 = active
  image?: string;
  other_images?: any; // jsonb
  created_at: string;
  updated_at: string;
  deleted_at?: string;

  // Legacy fields for backward compatibility
  id?: string; // alias for _id
  name?: string; // alias for title
  stock?: number; // alias for quantity
  category?: string; // For display when product_category_id is populated
  barcode?: string; // Can map to code
  description?: string; // Can map to brief or content

  // Spa-specific fields
  options?: ProductOption[];
  productType?: "product" | "service" | "treatment";
  duration?: number; // For services and treatments (in minutes)
  sessions?: number; // For treatments (number of sessions in package)
  sessionDetails?: TreatmentSessionDetail[]; // Chi tiết từng buổi cho liệu trình
}

export interface ProductOption {
  id: string;
  name: string;
  type: "single" | "multiple";
  required: boolean;
  choices: ProductOptionChoice[];
}

export interface ProductOptionChoice {
  id: string;
  name: string;
  priceModifier: number; // +10000 for extra, 0 for no change, -5000 for discount
}

export interface SelectedOption {
  optionId: string;
  optionName: string;
  choiceId: string;
  choiceName: string;
  priceModifier: number;
}

export interface CartItem extends Product {
  quantity: number;
  discount: number;
  note?: string;
  selectedOptions?: SelectedOption[];
}

export interface ChatMessage {
  id: string;
  sender: "customer" | "staff";
  senderName: string;
  message: string;
  timestamp: string;
}

export interface PaymentHistory {
  id: string;
  amount: number;
  paymentMethod:
    | "cash"
    | "card"
    | "transfer"
    | "momo"
    | "zalopay"
    | "vnpay";
  paidAt: string;
  paidBy: string; // Username of the person who collected payment
  note?: string;
  changeAmount?: number; // Change returned to customer
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  date: string;
  timestamp: string; // Add this for better time tracking
  paymentMethod:
    | "cash"
    | "card"
    | "transfer"
    | "momo"
    | "zalopay"
    | "vnpay";
  paymentMethods?: { method: string; amount: number }[]; // For split payment
  customerName?: string;
  customerPhone?: string;
  note?: string;
  shiftId?: string;
  messages?: ChatMessage[];
  status?: "pending" | "completed" | "cancelled"; // Add status
  paidAt?: string; // When payment was collected
  receivedAmount?: number; // Amount received from customer
  changeAmount?: number; // Change returned to customer
  paymentHistory?: PaymentHistory[]; // History of all payments
  createdBy?: string; // Người tạo hóa đơn
}

export interface Shift {
  id: string;
  openedBy: string;
  closedBy?: string;
  openTime: string;
  closeTime?: string;
  openingCash: number;
  closingCash?: number;
  expectedCash?: number;
  actualCash?: number;
  difference?: number;
  totalOrders: number;
  totalRevenue: number;
  note?: string;
  status: "open" | "closed";
}

export interface HeldBill {
  id: string;
  items: CartItem[];
  discount: number;
  customerName?: string;
  note?: string;
  heldAt: string;
}

export interface Customer {
  _id: string;
  tenant_id: string;
  code: string;
  full_name: string;
  phone?: string;
  email?: string;
  address?: string;
  customer_type_id?: string;
  total_spent: number;
  total_orders: number;
  loyalty_points: number;
  status: "ACTIVE" | "INACTIVE" | "BLOCKED";
  metadata: {
    dateOfBirth?: string;
    gender?: "male" | "female" | "other";
    notes?: string;
    avatar?: string;
    tags?: string[];
    [key: string]: any;
  };
  last_purchase_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;

  // Legacy fields for backward compatibility
  id?: string; // alias for _id
  name?: string; // alias for full_name
  debt?: number; // customer debt amount
  customerGroup?: string;
  notes?: string;
  totalSpent?: number;
  orderCount?: number;
  createdAt?: string;
  updatedAt?: string;
  
  // Invoice information fields (both snake_case and camelCase for compatibility)
  company_name?: string;
  tax_code?: string;
  company_address?: string;
  invoice_email?: string;
  
  // Additional metadata fields exposed at top level for easier access
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
  avatar?: string;
  customerType?: "individual" | "organization";
  companyName?: string;
  taxCode?: string;
  buyerName?: string;
  invoiceAddress?: string;
  province?: string;
  ward?: string;
  idNumber?: string;
  phoneInvoice?: string;
  bank?: string;
  bankAccount?: string;
  accountHolder?: string;
}

export interface User {
  id: string;
  username: string; // Tên đăng nhập (unique)
  password: string; // Mật khẩu (trong thực tế nên hash)
  fullName: string; // Họ tên đầy đủ
  email?: string; // Email
  phone?: string; // Số điện thoại
  roleGroupId: string; // ID nhóm quyền
  avatar?: string; // URL ảnh đại diện
  isActive: boolean; // Trạng thái hoạt động
  createdAt: string; // Ngày tạo
  lastLogin?: string; // Lần đăng nhập cuối
  createdBy?: string; // Người tạo
  notes?: string; // Ghi chú
  customPermissions?: string[]; // Quyền custom override từ nhóm quyền
}

// Permission System
export interface Permission {
  id: string;
  name: string;
  description: string;
  category: "system" | "sales" | "management" | "reports";
}

export interface RoleGroup {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // Array of permission IDs
  isSystem: boolean; // System roles cannot be deleted
  createdAt: string;
  updatedAt?: string;
}

export interface UserPermissionOverride {
  userId: string;
  addedPermissions: string[]; // Permissions added to user beyond their role
  removedPermissions: string[]; // Permissions removed from user's role
}

export interface Settings {
  enableTip: boolean;
  defaultTipPercent: number;
  taxRate: number;
  currencySymbol: string;
  receiptFooter: string;
  lowStockThreshold: number;
  // Bank transfer settings
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
  // E-wallet settings
  walletType?: string; // MoMo, ZaloPay, VNPay, etc.
  walletAccountNumber?: string;
  walletAccountHolder?: string;
}

export interface Table {
  id: string;
  name: string;
  qrCode: string;
  status: "available" | "occupied" | "reserved";
  area: string;
}

export interface SelfServiceOrder extends Order {
  tableId?: string;
  tableName?: string;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "served"
    | "cancelled";
  orderType: "dine-in" | "takeaway";
}

export interface AppointmentService {
  instanceId?: string;
  productId: string;
  productName: string;
  productType?: "product" | "service" | "treatment";
  duration: number; // in minutes
  price?: number;
  quantity?: number; // For products from treatment packages
  sessionNumber?: number; // For treatment packages
  maxSessions?: number; // Total sessions in treatment package
  // New fields for treatment package usage
  useTreatmentPackage?: boolean; // True if using session from package
  treatmentPackageId?: string; // ID of the treatment package being used
  // NEW: Technician assigned to this specific service
  technicianId?: string;
  technicianName?: string;
  // ⭐ NEW: Time slot for each service
  startTime?: string; // HH:mm format (e.g., "09:00")
  endTime?: string; // HH:mm format (e.g., "10:00")
}

export interface Appointment {
  id: string;
  code?: string; // Appointment code (e.g., "LH000001")
  customerId: string;
  customerName: string;
  customerPhone: string;
  appointmentDate: string; // ISO date (YYYY-MM-DD)
  startTime?: string; // HH:mm format (e.g., "09:00")
  endTime?: string; // HH:mm format - calculated from duration
  appointmentTime?: string; // Legacy field for HH:mm format
  services: AppointmentService[];
  totalDuration?: number; // Legacy summary duration in minutes
  technicianId?: string; // DEPRECATED - now each service has its own technician
  technicianName?: string; // DEPRECATED - now each service has its own technician
  status: "pending" | "in-progress" | "completed" | "cancelled";
  notes?: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
}

// Notification for technicians about appointments
export interface TechnicianNotification {
  id: string;
  userId: string; // Technician user ID
  appointmentId: string;
  appointmentCode: string;
  title: string;
  message: string;
  type:
    | "new_appointment"
    | "updated_appointment"
    | "cancelled_appointment";
  isRead: boolean;
  createdAt: string;
}

// Session detail for treatment package
export interface TreatmentPackageSessionItem {
  productId: string;
  productName: string;
  productType: "service" | "product";
  quantity: number;
  duration?: number; // For services
}

export interface TreatmentPackageSession {
  sessionNumber: number;
  sessionName: string; // "Buổi 1", "Buổi 2", etc.
  items: TreatmentPackageSessionItem[];
}

// Customer Treatment Package - tracks purchased treatment packages
export interface CustomerTreatmentPackage {
  id: string;
  customerId: string;
  customerName: string;
  treatmentProductId: string; // ID of the treatment product
  treatmentName: string;
  totalSessions: number; // Total sessions in package
  usedSessionNumbers: number[]; // Array of session numbers that have been used [1, 3, 5]
  remainingSessions: number; // Remaining sessions
  sessions: TreatmentPackageSession[]; // Detailed session plan
  purchaseDate: string;
  expiryDate?: string; // Optional expiry date
  orderId: string; // Reference to the order where this was purchased
  isActive: boolean; // Active if not expired and has remaining sessions
  createdAt: string;
  updatedAt?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
}

export interface CustomerType {
  _id: string;
  tenant_id: string;
  code: string;
  name: string;
  priority: number;
  min_spent: number; // Ngưỡng chi tiêu tối thiểu để được hạng này
  status: 0 | 1; // 0 = inactive, 1 = active
  created_at: string;
  updated_at: string;
}

// Stock Management Interfaces
export interface StockInItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number; // Đơn giá nhập
  totalPrice: number; // Thành tiền
}

export interface StockInReceipt {
  id: string;
  receiptNumber: string; // Auto-generated: IN-YYYYMMDD-XXX
  date: string; // YYYY-MM-DD
  supplier: string;
  items: StockInItem[];
  subtotal: number; // Tổng trước giảm giá
  supplierDiscount: number; // Giảm giá từ NCC (số tiền)
  totalAmount: number; // Tổng sau giảm giá
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface StockOutItem {
  productId: string;
  productName: string;
  quantity: number;
  costPrice: number; // Giá vốn
  totalPrice: number;
}

export interface StockOutReceipt {
  id: string;
  receiptNumber: string; // Auto-generated: OUT-YYYYMMDD-XXX
  date: string; // YYYY-MM-DD
  reason:
    | "damaged"
    | "lost"
    | "transfer"
    | "internal_use"
    | "return_to_supplier"
    | "other";
  staffName: string;
  items: StockOutItem[];
  totalAmount: number;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

interface Store {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  categories: string[];
  productCategories: ProductCategory[];
  customerTypes: CustomerType[];
  language: Language;
  theme: "light" | "dark" | "auto";
  fontSize: "small" | "medium" | "large";
  compactMode: boolean;
  shifts: Shift[];
  currentShift: Shift | null;
  heldBills: HeldBill[];
  recentProducts: Product[]; // Changed to full products
  favoriteProducts: Product[]; // Changed to full products
  isOnline: boolean;
  pendingSyncCount: number;
  customers: Customer[];
  users: User[];
  currentUser: User | null;
  appointments: Appointment[];
  customerTreatmentPackages: CustomerTreatmentPackage[];
  technicianNotifications: TechnicianNotification[]; // NEW: Notifications for technicians
  settings: Settings;
  sidebarCollapsed: boolean;

  // Order editing
  editingOrder: Order | null; // Order being edited

  // Stock Management
  stockInReceipts: StockInReceipt[];
  stockOutReceipts: StockOutReceipt[];

  // Self-service
  tables: Table[];
  selfServiceOrders: SelfServiceOrder[];
  currentTable: Table | null;

  // Onboarding & Industry
  hasSeenOnboarding: boolean;
  hasSelectedIndustry: boolean;
  selectedIndustry: IndustryType | null;

  // Spa Role Management
  currentRole: "admin" | "cashier" | "technician" | null;

  // Permission System
  permissions: Permission[];
  roleGroups: RoleGroup[];
  userPermissionOverrides: UserPermissionOverride[];

  // Product actions
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (
    id: string,
    product: Partial<Product>,
  ) => void;
  deleteProduct: (id: string) => void;

  // Cart actions
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (
    productId: string,
    quantity: number,
  ) => void;
  updateCartDiscount: (
    productId: string,
    discount: number,
  ) => void;
  updateCartNote: (productId: string, note: string) => void;
  clearCart: () => void;

  // Order actions
  createOrder: (
    orderData: Omit<
      Order,
      "id" | "items" | "subtotal" | "total" | "date"
    >,
  ) => Order;
  updateOrder: (
    orderId: string,
    updates: Partial<Order>,
  ) => void;
  deleteOrder: (orderId: string) => void;
  setEditingOrder: (order: Order | null) => void;

  // Category actions
  addCategory: (category: string) => void;

  // Product Category actions
  addProductCategory: (
    category: Omit<ProductCategory, "id" | "createdAt">,
  ) => void;
  updateProductCategory: (
    id: string,
    category: Partial<ProductCategory>,
  ) => void;
  deleteProductCategory: (id: string) => void;
  toggleProductCategoryStatus: (id: string) => void;

  // Customer Type actions
  addCustomerType: (
    customerType: Omit<
      CustomerType,
      "_id" | "tenant_id" | "created_at" | "updated_at"
    >,
  ) => void;
  updateCustomerType: (
    id: string,
    customerType: Partial<
      Omit<
        CustomerType,
        "_id" | "tenant_id" | "created_at" | "updated_at"
      >
    >,
  ) => void;
  deleteCustomerType: (id: string) => void;
  toggleCustomerTypeStatus: (id: string) => void;

  // Language actions
  setLanguage: (language: Language) => void;

  // Appearance actions
  setTheme: (theme: "light" | "dark" | "auto") => void;
  setFontSize: (fontSize: "small" | "medium" | "large") => void;
  setCompactMode: (compactMode: boolean) => void;

  // Shift actions
  openShift: (
    openingCash: number,
    openedBy: string,
    note?: string,
  ) => void;
  closeShift: (
    closingCash: number,
    closedBy: string,
    note?: string,
  ) => void;

  // Held bill actions
  holdBill: (customerName?: string, note?: string) => void;
  recallBill: (billId: string) => void;
  deleteHeldBill: (billId: string) => void;

  // Recent & Favorite products
  addToRecent: (productId: string) => void;
  toggleFavorite: (productId: string) => void;

  // Sync actions
  syncFromServer: () => Promise<void>;
  updateSyncStatus: () => void;

  // Clear all data
  clearAllData: () => void;

  // Settings actions
  updateSettings: (settings: Partial<Settings>) => void;

  // Sidebar actions
  toggleSidebar: () => void;

  // Self-service actions
  setCurrentTable: (table: Table | null) => void;
  createSelfServiceOrder: (
    orderData: Omit<
      SelfServiceOrder,
      "id" | "date" | "items" | "subtotal" | "total"
    >,
  ) => void;
  updateOrderStatus: (
    orderId: string,
    status: SelfServiceOrder["status"],
  ) => void;
  addMessageToOrder: (
    orderId: string,
    message: Omit<ChatMessage, "id" | "timestamp">,
  ) => void;

  // Industry selection
  loadIndustryData: (industry: IndustryType) => void;

  // Onboarding & Role actions
  setHasSeenOnboarding: (value: boolean) => void;

  setCurrentRole: (
    role: "admin" | "cashier" | "technician" | null,
  ) => void;

  // Customer actions
  addCustomer: (
    customer: Omit<
      Customer,
      | "_id"
      | "tenant_id"
      | "total_spent"
      | "total_orders"
      | "loyalty_points"
      | "created_at"
      | "updated_at"
      | "deleted_at"
    >,
  ) => void;
  updateCustomer: (
    id: string,
    customer: Partial<Customer>,
  ) => void;
  deleteCustomer: (id: string) => void;
  getCustomerOrders: (customerId: string) => Order[];

  // User actions
  createUser: (
    userData: Omit<User, "id" | "createdAt" | "lastLogin">,
  ) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  toggleUserStatus: (userId: string) => void;
  changeUserPassword: (
    userId: string,
    newPassword: string,
  ) => void;
  login: (username: string, password: string) => User | null;
  logout: () => void;

  // Appointment actions
  createAppointment: (
    appointmentData: Omit<
      Appointment,
      "id" | "createdAt" | "updatedAt"
    >,
  ) => void;
  updateAppointment: (
    appointmentId: string,
    updates: Partial<Appointment>,
  ) => void;
  deleteAppointment: (appointmentId: string) => void;
  updateAppointmentStatus: (
    appointmentId: string,
    status: Appointment["status"],
  ) => void;
  isTechnicianBusy: (
    technicianId: string,
    date: string,
    startTime: string,
    duration: number,
    excludeAppointmentId?: string,
  ) => boolean;
  getTechnicianAppointments: (
    technicianId: string,
    date: string,
  ) => Appointment[];

  // Notification actions
  createNotification: (
    notification: Omit<
      TechnicianNotification,
      "id" | "createdAt"
    >,
  ) => void;
  markNotificationAsRead: (notificationId: string) => void;
  getUnreadNotificationCount: (userId: string) => number;
  getUserNotifications: (
    userId: string,
  ) => TechnicianNotification[];

  // Stock Management actions
  createStockInReceipt: (
    receiptData: Omit<
      StockInReceipt,
      "id" | "receiptNumber" | "createdAt" | "createdBy"
    >,
  ) => void;
  updateStockInReceipt: (
    receiptId: string,
    receiptData: Omit<
      StockInReceipt,
      "id" | "receiptNumber" | "createdAt" | "createdBy"
    >,
  ) => void;
  createStockOutReceipt: (
    receiptData: Omit<
      StockOutReceipt,
      "id" | "receiptNumber" | "createdAt" | "createdBy"
    >,
  ) => void;
  updateStockOutReceipt: (
    receiptId: string,
    receiptData: Omit<
      StockOutReceipt,
      "id" | "receiptNumber" | "createdAt" | "createdBy"
    >,
  ) => void;
  deleteStockInReceipt: (receiptId: string) => void;
  deleteStockOutReceipt: (receiptId: string) => void;
  getStockInReceipts: () => StockInReceipt[];
  getStockOutReceipts: () => StockOutReceipt[];

  // Customer Treatment Package actions
  createCustomerTreatmentPackage: (
    packageData: Omit<
      CustomerTreatmentPackage,
      "id" | "createdAt" | "updatedAt"
    >,
  ) => void;
  usePackageSession: (
    packageId: string,
    sessionNumber: number,
  ) => void;
  returnPackageSession: (
    packageId: string,
    sessionNumber: number,
  ) => void;
  getCustomerActivePackages: (
    customerId: string,
  ) => CustomerTreatmentPackage[];
  getPackageForService: (
    customerId: string,
    serviceId: string,
  ) => CustomerTreatmentPackage | null;
}

// Migration helper: Convert old product schema to new schema
const migrateProductToNewSchema = (
  oldProduct: any,
): Product => {
  const now = new Date().toISOString();
  const _id =
    oldProduct._id ||
    oldProduct.id ||
    `PROD-${Date.now()}-${Math.random()}`;

  return {
    // New schema fields
    _id,
    tenant_id: oldProduct.tenant_id,
    industry_id: oldProduct.industry_id,
    product_type_id: oldProduct.product_type_id,
    product_category_id: oldProduct.product_category_id,
    code: oldProduct.code || oldProduct.barcode || _id,
    title: oldProduct.title || oldProduct.name || "",
    brief: oldProduct.brief || oldProduct.description,
    content: oldProduct.content || oldProduct.description,
    price: oldProduct.price || 0,
    prices: oldProduct.prices,
    quantity: oldProduct.quantity ?? oldProduct.stock ?? 0,
    waiting_quantity: oldProduct.waiting_quantity ?? 0,
    is_sold_out: oldProduct.is_sold_out ?? false,
    status: oldProduct.status ?? 1,
    image: oldProduct.image,
    other_images: oldProduct.other_images,
    created_at: oldProduct.created_at || now,
    updated_at: oldProduct.updated_at || now,
    deleted_at: oldProduct.deleted_at,

    // Legacy fields for backward compatibility
    id: _id,
    name: oldProduct.title || oldProduct.name || "",
    stock: oldProduct.quantity ?? oldProduct.stock ?? 0,
    category: oldProduct.category,
    barcode: oldProduct.code || oldProduct.barcode,
    description: oldProduct.brief || oldProduct.description,

    // Spa-specific fields
    options: oldProduct.options,
    productType: oldProduct.productType || oldProduct.type,
    duration: oldProduct.duration,
    sessions: oldProduct.sessions,
    sessionDetails: oldProduct.sessionDetails,
  };
};
export const initialProducts: Product[] = [
  // Nước giải khát
  {
    id: '1',
    name: 'Coca Cola lon 330ml',
    price: 10000,
    category: 'Nước giải khát',
    stock: 120,
    barcode: '8934567890001',
    status: 1,
  },
  {
    id: '2',
    name: 'Pepsi lon 330ml',
    price: 10000,
    category: 'Nước giải khát',
    stock: 110,
    barcode: '8934567890002',
    status: 1,
  },
  {
    id: '3',
    name: '7Up lon 330ml',
    price: 10000,
    category: 'Nước giải khát',
    stock: 95,
    barcode: '8934567890003',
    status: 1,
  },
  {
    id: '4',
    name: 'Red Bull 250ml',
    price: 15000,
    category: 'Nước tăng lực',
    stock: 80,
    barcode: '8934567890004',
    status: 1,
  },
  {
    id: '5',
    name: 'Sting dâu 330ml',
    price: 11000,
    category: 'Nước tăng lực',
    stock: 90,
    barcode: '8934567890005',
    status: 1,
  },
  {
    id: '6',
    name: 'Aquafina 500ml',
    price: 6000,
    category: 'Nước suối',
    stock: 200,
    barcode: '8934567890006',
    status: 1,
  },
  {
    id: '7',
    name: 'Lavie 500ml',
    price: 6000,
    category: 'Nước suối',
    stock: 180,
    barcode: '8934567890007',
    status: 1,
  },

  // Mì – đồ khô
  {
    id: '8',
    name: 'Mì Hảo Hảo tôm chua cay',
    price: 4500,
    category: 'Mì ăn liền',
    stock: 300,
    barcode: '8934567890008',
    status: 1,
  },
  {
    id: '9',
    name: 'Mì Omachi sườn hầm',
    price: 9000,
    category: 'Mì ăn liền',
    stock: 220,
    barcode: '8934567890009',
    status: 1,
  },
  {
    id: '10',
    name: 'Phở Vifon bò',
    price: 8000,
    category: 'Mì ăn liền',
    stock: 160,
    barcode: '8934567890010',
    status: 1,
  },

  // Bánh kẹo
  {
    id: '11',
    name: 'Bánh Oreo Original',
    price: 15000,
    category: 'Bánh kẹo',
    stock: 140,
    barcode: '8934567890011',
    status: 1,
  },
  {
    id: '12',
    name: 'Bánh Cosy Marie',
    price: 18000,
    category: 'Bánh kẹo',
    stock: 130,
    barcode: '8934567890012',
    status: 1,
  },
  {
    id: '13',
    name: 'Snack Poca tôm',
    price: 12000,
    category: 'Snack',
    stock: 170,
    barcode: '8934567890013',
    status: 1,
  },
  {
    id: '14',
    name: 'Snack Oishi bắp ngọt',
    price: 10000,
    category: 'Snack',
    stock: 160,
    barcode: '8934567890014',
    status: 1,
  },

  // Sữa
  {
    id: '15',
    name: 'Sữa tươi Vinamilk 1L',
    price: 31000,
    category: 'Sữa',
    stock: 70,
    barcode: '8934567890015',
    status: 1,
  },
  {
    id: '16',
    name: 'Sữa tươi TH True Milk 1L',
    price: 32000,
    category: 'Sữa',
    stock: 65,
    barcode: '8934567890016',
    status: 1,
  },
  {
    id: '17',
    name: 'Sữa đặc Ông Thọ 380g',
    price: 26000,
    category: 'Sữa đặc',
    stock: 90,
    barcode: '8934567890017',
    status: 1,
  },

  // Gia vị
  {
    id: '18',
    name: 'Nước mắm Nam Ngư 500ml',
    price: 28000,
    category: 'Gia vị',
    stock: 85,
    barcode: '8934567890018',
    status: 1,
  },
  {
    id: '19',
    name: 'Nước tương Chinsu 500ml',
    price: 26000,
    category: 'Gia vị',
    stock: 80,
    barcode: '8934567890019',
    status: 1,
  },
  {
    id: '20',
    name: 'Tương ớt Chinsu 250g',
    price: 18000,
    category: 'Gia vị',
    stock: 95,
    barcode: '8934567890020',
    status: 1,
  },

  // Đông lạnh
  {
    id: '21',
    name: 'Xúc xích Đức Việt 200g',
    price: 35000,
    category: 'Đông lạnh',
    stock: 45,
    barcode: '8934567890021',
    status: 1,
  },
  {
    id: '22',
    name: 'Cá viên CP 500g',
    price: 45000,
    category: 'Đông lạnh',
    stock: 40,
    barcode: '8934567890022',
    status: 1,
  },

  // Hóa mỹ phẩm
  {
    id: '23',
    name: 'Bột giặt OMO 800g',
    price: 42000,
    category: 'Hóa mỹ phẩm',
    stock: 55,
    barcode: '8934567890023',
    status: 1,
  },
  {
    id: '24',
    name: 'Nước rửa chén Sunlight 750ml',
    price: 32000,
    category: 'Hóa mỹ phẩm',
    stock: 60,
    barcode: '8934567890024',
    status: 1,
  },
  {
    id: '25',
    name: 'Dầu gội Clear Men 650g',
    price: 85000,
    category: 'Chăm sóc cá nhân',
    stock: 35,
    barcode: '8934567890025',
    status: 1,
  },
];

 // Apply migration to initial data

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      products: initialProducts,
      cart: [],
      orders: [],
      categories: [
        "Đồ uống",
        "Đồ ăn",
        "Bánh kẹo",
        "Món ăn nhanh",
        "Món Hàn",
        "Món Nhật",
        "Món Thái",
      ],
      productCategories: [
        {
          id: "1",
          name: "Đồ ăn vặt",
          description: "Bánh kẹo, snack, đồ ăn nhanh các loại",
          color: "#F97316",
          status: true,
          createdAt: "2024-01-01T00:00:00.000Z",
          createdBy: "system",
        },
        {
          id: "2",
          name: "Nước giải khát",
          description:
            "Nước ngọt, nước suối, nước tăng lực, trà đóng chai",
          color: "#0EA5E9",
          isActive: true,
          createdAt: "2024-01-01T00:00:00.000Z",
          createdBy: "system",
        },
        {
          id: "3",
          name: "Gia vị",
          description:
            "Muối, đường, nước mắm, bột nêm, gia vị nấu ăn",
          color: "#F59E0B",
          isActive: true,
          createdAt: "2024-01-01T00:00:00.000Z",
          createdBy: "system",
        },
        {
          id: "4",
          name: "Hàng gia dụng",
          description:
            "Đồ dùng sinh hoạt hằng ngày trong gia đình",
          color: "#10B981",
          isActive: true,
          createdAt: "2024-01-01T00:00:00.000Z",
          createdBy: "system",
        },
        {
          id: "5",
          name: "Vệ sinh cá nhân",
          description:
            "Xà phòng, dầu gội, kem đánh răng, giấy vệ sinh",
          color: "#EC4899",
          isActive: true,
          createdAt: "2024-01-01T00:00:00.000Z",
          createdBy: "system",
        },
        {
          id: "6",
          name: "Đồ dùng học tập",
          description:
            "Vở, bút, thước, dụng cụ học tập các loại",
          color: "#8B5CF6",
          isActive: true,
          createdAt: "2024-01-01T00:00:00.000Z",
          createdBy: "system",
        },
      ],

      customerTypes: [
        {
          _id: "ct-001",
          tenant_id: "tenant-001",
          code: "NEW",
          name: "Khách hàng mới",
          priority: 0,
          min_spent: 0, // Không có ngưỡng
          status: 1,
          created_at: "2024-01-01T00:00:00.000Z",
          updated_at: "2024-01-01T00:00:00.000Z",
        },
        {
          _id: "ct-002",
          tenant_id: "tenant-001",
          code: "REGULAR",
          name: "Khách hàng thường",
          priority: 10,
          min_spent: 1000000, // >= 1 triệu
          status: 1,
          created_at: "2024-01-01T00:00:00.000Z",
          updated_at: "2024-01-01T00:00:00.000Z",
        },
        {
          _id: "ct-003",
          tenant_id: "tenant-001",
          code: "SILVER",
          name: "Khách hàng Bạc",
          priority: 20,
          min_spent: 5000000, // >= 5 triệu
          status: 1,
          created_at: "2024-01-01T00:00:00.000Z",
          updated_at: "2024-01-01T00:00:00.000Z",
        },
        {
          _id: "ct-004",
          tenant_id: "tenant-001",
          code: "GOLD",
          name: "Khách hàng Vàng",
          priority: 30,
          min_spent: 10000000, // >= 10 triệu
          status: 1,
          created_at: "2024-01-01T00:00:00.000Z",
          updated_at: "2024-01-01T00:00:00.000Z",
        },
        {
          _id: "ct-005",
          tenant_id: "tenant-001",
          code: "PLATINUM",
          name: "Khách hàng Bạch Kim",
          priority: 40,
          min_spent: 50000000, // >= 50 triệu
          status: 1,
          created_at: "2024-01-01T00:00:00.000Z",
          updated_at: "2024-01-01T00:00:00.000Z",
        },
        {
          _id: "ct-006",
          tenant_id: "tenant-001",
          code: "VIP",
          name: "Khách hàng VIP",
          priority: 50,
          status: 1,
          created_at: "2024-01-01T00:00:00.000Z",
          updated_at: "2024-01-01T00:00:00.000Z",
        },
        {
          _id: "ct-007",
          tenant_id: "tenant-001",
          code: "EMPLOYEE",
          name: "Nhân viên",
          priority: 100,
          status: 1,
          created_at: "2024-01-01T00:00:00.000Z",
          updated_at: "2024-01-01T00:00:00.000Z",
        },
        {
          _id: "ct-008",
          tenant_id: "tenant-001",
          code: "ACQUAINTANCE",
          name: "Người quen",
          priority: 90,
          status: 1,
          created_at: "2024-01-01T00:00:00.000Z",
          updated_at: "2024-01-01T00:00:00.000Z",
        },
        {
          _id: "ct-009",
          tenant_id: "tenant-001",
          code: "WHOLESALE",
          name: "Khách buôn/Đại lý",
          priority: 35,
          status: 1,
          created_at: "2024-02-15T00:00:00.000Z",
          updated_at: "2024-02-15T00:00:00.000Z",
        },
        {
          _id: "ct-010",
          tenant_id: "tenant-001",
          code: "INACTIVE",
          name: "Khách hàng ngừng hoạt động",
          priority: -10,
          status: 0,
          created_at: "2024-03-20T00:00:00.000Z",
          updated_at: "2024-03-20T00:00:00.000Z",
        },
      ],
      language: "vi",
      theme: "light",
      fontSize: "medium",
      compactMode: false,
      shifts: [],
      currentShift: null,
      heldBills: [],
      recentProducts: [],
      favoriteProducts: [],
      isOnline: false,
      pendingSyncCount: 0,
      customers: demoCustomers,
      // Keeping this comment for reference - old customer data has been moved to customerDemoData.ts
      /*customers: [
        {
          id: 'CUST-0987654321',
          name: 'Trần Minh Anh',
          phone: '0987654321',
          email: 'minhanh@email.com',
          address: '789 Nguyễn Trãi, Q.5, TP.HCM',
          dateOfBirth: '1992-03-10',
          gender: 'female' as const,
          customerGroup: 'vip' as const,
          notes: 'Đã mua liệu trình trị mụn 10 buổi',
          totalSpent: 3500000,
          orderCount: 1,
          createdAt: '2024-01-10T09:00:00.000Z',
          updatedAt: '2025-01-16T10:00:00.000Z',
        },
        {
          id: '1',
          name: 'Nguyễn Thị Lan Anh',
          phone: '0901234567',
          email: 'lananh@email.com',
          address: '123 Trần Hưng Đạo, Q.1, TP.HCM',
          dateOfBirth: '1990-05-15',
          gender: 'female' as const,
          customerGroup: 'vip' as const,
          notes: 'Khách hàng thân thiết, thường đặt dịch vụ cao cấp',
          totalSpent: 15800000,
          orderCount: 23,
          createdAt: '2024-01-15T08:30:00.000Z',
          updatedAt: '2025-01-10T14:20:00.000Z',
        },
        {
          id: '2',
          name: 'Trần Minh Quân',
          phone: '0912345678',
          email: 'minhquan@email.com',
          address: '456 Lê Lợi, Q.3, TP.HCM',
          dateOfBirth: '1985-08-22',
          gender: 'male' as const,
          customerGroup: 'regular' as const,
          notes: 'Ưa thích massage thư giãn',
          totalSpent: 5600000,
          orderCount: 12,
          createdAt: '2024-03-20T10:15:00.000Z',
          updatedAt: '2025-01-08T16:45:00.000Z',
        },
        {
          id: '3',
          name: 'Phạm Thu Hương',
          phone: '0923456789',
          email: 'thuhuong@email.com',
          address: '789 Nguyễn Huệ, Q.1, TP.HCM',
          dateOfBirth: '1995-12-10',
          gender: 'female' as const,
          customerGroup: 'vip' as const,
          notes: 'Đã đặt liệu trình chăm sóc da 10 buổi',
          totalSpent: 28500000,
          orderCount: 35,
          createdAt: '2024-02-10T09:00:00.000Z',
          updatedAt: '2025-01-12T11:30:00.000Z',
        },
        {
          id: '4',
          name: 'Lê Văn Hùng',
          phone: '0934567890',
          email: 'vanhung@email.com',
          address: '321 Hai Bà Trưng, Q.3, TP.HCM',
          dateOfBirth: '1988-03-18',
          gender: 'male' as const,
          customerGroup: 'acquaintance' as const,
          notes: 'Bạn của chủ spa',
          totalSpent: 3200000,
          orderCount: 8,
          createdAt: '2024-04-05T13:20:00.000Z',
          updatedAt: '2025-01-05T09:15:00.000Z',
        },
        {
          id: '5',
          name: 'Hoàng Thị Mai',
          phone: '0945678901',
          email: 'thimai@email.com',
          address: '654 Võ Văn Tần, Q.3, TP.HCM',
          dateOfBirth: '1992-07-25',
          gender: 'female' as const,
          customerGroup: 'regular' as const,
          notes: 'Thích dịch vụ chăm sóc móng',
          totalSpent: 4800000,
          orderCount: 15,
          createdAt: '2024-05-12T14:45:00.000Z',
          updatedAt: '2025-01-11T10:20:00.000Z',
        },
        {
          id: '6',
          name: 'Đặng Quốc Bảo',
          phone: '0956789012',
          email: 'quocbao@email.com',
          address: '987 Pasteur, Q.1, TP.HCM',
          dateOfBirth: '1993-11-30',
          gender: 'male' as const,
          customerGroup: 'regular' as const,
          notes: 'Khách hàng mới, lần đầu sử dụng dịch vụ',
          totalSpent: 1200000,
          orderCount: 3,
          createdAt: '2024-11-20T11:00:00.000Z',
          updatedAt: '2025-01-13T15:30:00.000Z',
        },
        {
          id: '7',
          name: 'Vũ Thị Ngọc',
          phone: '0967890123',
          email: 'thingoc@email.com',
          address: '147 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM',
          dateOfBirth: '1987-04-08',
          gender: 'female' as const,
          customerGroup: 'vip' as const,
          notes: 'Khách VIP, thường đặt combo dịch vụ cao cấp',
          totalSpent: 42300000,
          orderCount: 48,
          createdAt: '2023-12-01T08:00:00.000Z',
          updatedAt: '2025-01-13T12:00:00.000Z',
        },
        {
          id: '8',
          name: 'Bùi Minh Tuấn',
          phone: '0978901234',
          address: '258 Cách Mạng Tháng 8, Q.10, TP.HCM',
          dateOfBirth: '1991-09-14',
          gender: 'male' as const,
          customerGroup: 'employee' as const,
          notes: 'Nhân viên spa - giảm giá 30%',
          totalSpent: 2100000,
          orderCount: 6,
          createdAt: '2024-06-15T10:30:00.000Z',
          updatedAt: '2024-12-28T14:00:00.000Z',
        },
        {
          id: '9',
          name: 'Đinh Thị Hồng',
          phone: '0989012345',
          email: 'thihong@email.com',
          address: '369 Lý Thường Kiệt, Q.Tân Bình, TP.HCM',
          dateOfBirth: '1994-06-20',
          gender: 'female' as const,
          customerGroup: 'regular' as const,
          notes: 'Thích dịch vụ tắm trắng',
          totalSpent: 7900000,
          orderCount: 18,
          createdAt: '2024-07-08T15:15:00.000Z',
          updatedAt: '2025-01-09T13:40:00.000Z',
        },
        {
          id: '10',
          name: 'Trịnh Văn Tâm',
          phone: '0990123456',
          email: 'vantam@email.com',
          address: '741 Cộng Hòa, Q.Tân Bình, TP.HCM',
          dateOfBirth: '1989-02-28',
          gender: 'male' as const,
          customerGroup: 'acquaintance' as const,
          notes: 'Bạn của quản lý',
          totalSpent: 6500000,
          orderCount: 14,
          createdAt: '2024-08-25T12:00:00.000Z',
          updatedAt: '2025-01-07T16:20:00.000Z',
        },
      ], */
      users: [
        {
          id: "1",
          username: "admin",
          password: "admin123",
          fullName: "Nguyễn Văn A",
          email: "admin@example.com",
          phone: "0901234567",
          roleGroupId: "1",
          avatar: "https://via.placeholder.com/150",
          isActive: true,
          createdAt: "2024-01-01T00:00:00.000Z",
          lastLogin: "2024-01-01T00:00:00.000Z",
          createdBy: "system",
          notes: "Quản trị viên hệ thống",
        },
        {
          id: "2",
          username: "cashier",
          password: "cashier123",
          fullName: "Nguyễn Thị B",
          email: "cashier@example.com",
          phone: "0912345678",
          roleGroupId: "2",
          avatar: "https://via.placeholder.com/150",
          isActive: true,
          createdAt: "2024-01-01T00:00:00.000Z",
          lastLogin: "2024-01-01T00:00:00.000Z",
          createdBy: "system",
          notes: "Thu ngân chính",
        },
        {
          id: "8",
          username: "cashier2",
          password: "cashier123",
          fullName: "Đặng Thị H",
          email: "dangthih@example.com",
          phone: "0978901234",
          roleGroupId: "2",
          avatar: "https://via.placeholder.com/150",
          isActive: true,
          createdAt: "2024-03-15T00:00:00.000Z",
          lastLogin: "2024-03-15T00:00:00.000Z",
          createdBy: "admin",
          notes: "Thu ngân ca chiều",
        },
      ],
      currentUser: null,
      appointments: [
        {
          id: "apt-001",
          code: "LH000001",
          customerId: "1",
          customerName: "Nguyễn Thị Lan Anh",
          customerPhone: "0901234567",
          appointmentDate: "2026-01-18",
          startTime: "09:00",
          endTime: "10:30",
          services: [
            {
              productId: "5",
              productName: "Massage body 90 phút",
              productType: "service",
              duration: 90,
              price: 200000,
            },
          ],
          technicianId: "",
          technicianName: "",
          status: "pending",
          notes: "",
          createdAt: "2026-01-10T08:00:00.000Z",
          createdBy: "admin",
          updatedAt: "2026-01-12T10:30:00.000Z",
        },
        {
          id: "apt-002",
          code: "LH000002",
          customerId: "2",
          customerName: "Trần Văn Hùng",
          customerPhone: "0923456789",
          appointmentDate: "2026-01-16",
          startTime: "11:00",
          endTime: "12:00",
          services: [
            {
              productId: "4",
              productName: "Chăm sóc da mặt cơ bản",
              productType: "service",
              duration: 60,
              price: 350000,
            },
          ],
          technicianId: "3",
          technicianName: "Nguyễn Văn C",
          status: "pending",
          notes: "",
          createdAt: "2026-01-11T09:15:00.000Z",
          createdBy: "cashier",
        },
        {
          id: "apt-003",
          code: "LH000003",
          customerId: "3",
          customerName: "Lê Thị Mai",
          customerPhone: "0934567890",
          appointmentDate: "2026-01-16",
          startTime: "14:00",
          endTime: "15:30",
          services: [
            {
              productId: "6",
              productName: "Liệu trình giảm béo",
              productType: "treatment",
              duration: 90,
              price: 2500000,
              sessionNumber: 1,
              maxSessions: 10,
            },
          ],
          technicianId: "3",
          technicianName: "Nguyễn Văn C",
          status: "in-progress",
          notes: "Buổi 1/10",
          createdAt: "2026-01-09T14:20:00.000Z",
          createdBy: "admin",
          updatedAt: "2026-01-10T11:00:00.000Z",
        },
        {
          id: "apt-004",
          code: "LH000004",
          customerId: "4",
          customerName: "Phạm Minh Tuấn",
          customerPhone: "0945678901",
          appointmentDate: "2026-01-17",
          startTime: "10:00",
          endTime: "11:30",
          services: [
            {
              productId: "5",
              productName: "Massage body",
              productType: "service",
              duration: 90,
              price: 200000,
            },
          ],
          technicianId: "3",
          technicianName: "Nguyễn Văn C",
          status: "pending",
          notes: "",
          createdAt: "2026-01-13T16:45:00.000Z",
          createdBy: "cashier",
        },
        {
          id: "apt-005",
          code: "LH000005",
          customerId: "5",
          customerName: "Hoàng Thị Hồng",
          customerPhone: "0956789012",
          appointmentDate: "2026-01-17",
          startTime: "15:00",
          endTime: "16:00",
          services: [
            {
              productId: "4",
              productName: "Chăm sóc da mặt cơ bản",
              productType: "service",
              duration: 60,
              price: 350000,
            },
          ],
          technicianId: "3",
          technicianName: "Nguyễn Văn C",
          status: "pending",
          notes: "",
          createdAt: "2026-01-14T11:30:00.000Z",
          createdBy: "admin",
        },
        {
          id: "apt-006",
          code: "LH000006",
          customerId: "1",
          customerName: "Nguyễn Thị Lan Anh",
          customerPhone: "0901234567",
          appointmentDate: "2026-01-15",
          startTime: "09:30",
          endTime: "11:00",
          services: [
            {
              productId: "5",
              productName: "Massage body 90 phút",
              productType: "service",
              duration: 90,
              price: 200000,
            },
          ],
          technicianId: "",
          technicianName: "",
          status: "completed",
          notes: "",
          createdAt: "2026-01-08T10:00:00.000Z",
          createdBy: "admin",
          updatedAt: "2026-01-15T11:00:00.000Z",
        },
        {
          id: "apt-007",
          code: "LH000007",
          customerId: "6",
          customerName: "Vũ Văn Tâm",
          customerPhone: "0967890123",
          appointmentDate: "2026-01-14",
          startTime: "14:00",
          endTime: "14:30",
          services: [
            {
              productId: "4",
              productName: "Chăm sóc da mặt cơ bản",
              productType: "service",
              duration: 30,
              price: 350000,
            },
          ],
          technicianId: "3",
          technicianName: "Nguyễn Văn C",
          status: "cancelled",
          notes: "Khách hủy lịch",
          createdAt: "2026-01-07T09:00:00.000Z",
          createdBy: "cashier",
          updatedAt: "2026-01-14T14:35:00.000Z",
        },
        {
          id: "apt-008",
          code: "LH000008",
          customerId: "2",
          customerName: "Trần Văn Hùng",
          customerPhone: "0923456789",
          appointmentDate: "2026-01-18",
          startTime: "09:00",
          endTime: "10:30",
          services: [
            {
              productId: "6",
              productName: "Liệu trình giảm béo",
              productType: "treatment",
              duration: 90,
              price: 2500000,
              sessionNumber: 2,
              maxSessions: 10,
            },
          ],
          technicianId: "3",
          technicianName: "Nguyễn Văn C",
          status: "pending",
          notes: "Buổi 2/10",
          createdAt: "2026-01-10T15:00:00.000Z",
          createdBy: "admin",
        },
        {
          id: "apt-009",
          code: "LH000009",
          customerId: "7",
          customerName: "Trần Minh Quân",
          customerPhone: "0912345678",
          appointmentDate: "2026-01-17",
          startTime: "09:00",
          endTime: "10:00",
          services: [
            {
              productId: "5",
              productName: "Massage body 60 phút",
              productType: "service",
              duration: 60,
              price: 200000,
            },
          ],
          technicianId: "",
          technicianName: "",
          status: "pending",
          notes: "",
          createdAt: "2026-01-12T14:20:00.000Z",
          createdBy: "cashier",
        },
        {
          id: "apt-010",
          code: "LH000010",
          customerId: "1",
          customerName: "Nguyễn Thị Lan Anh",
          customerPhone: "0901234567",
          appointmentDate: "2026-01-17",
          startTime: "09:00",
          endTime: "10:30",
          services: [
            {
              productId: "5",
              productName: "Massage body 90 phút",
              productType: "service",
              duration: 90,
              price: 200000,
            },
          ],
          technicianId: "",
          technicianName: "",
          status: "pending",
          notes: "",
          createdAt: "2026-01-13T10:15:00.000Z",
          createdBy: "admin",
        },
      ],
      settings: {
        enableTip: false,
        defaultTipPercent: 10,
        taxRate: 10,
        currencySymbol: "VNĐ",
        receiptFooter: "Cảm ơn bạn đã đến với chúng tôi!",
        lowStockThreshold: 10,
      },
      sidebarCollapsed: false,
      tables: [],
      selfServiceOrders: [],
      currentTable: null,
      hasSeenOnboarding: false,
      hasSelectedIndustry: false,
      selectedIndustry: null,
      currentRole: null,
      permissions: systemPermissions,
      roleGroups: defaultRoleGroups,
      userPermissionOverrides: [],
      customerTreatmentPackages: [],
      technicianNotifications: [],
      editingOrder: null,

      addProduct: (product) => {
        const _id = `PROD-${Date.now()}`;
        const now = new Date().toISOString();
        set((state) => ({
          products: [
            ...state.products,
            {
              ...product,
              _id,
              id: _id, // For backward compatibility
              created_at: now,
              updated_at: now,
              status: product.status ?? 1,
              waiting_quantity: product.waiting_quantity ?? 0,
              is_sold_out: product.is_sold_out ?? false,
              // Map legacy fields
              title: product.title || product.name || "",
              name: product.title || product.name || "",
              quantity: product.quantity ?? product.stock ?? 0,
              stock: product.quantity ?? product.stock ?? 0,
              code: product.code || product.barcode || _id,
              barcode: product.code || product.barcode,
            },
          ],
        }));
      },

      updateProduct: (id, updates) => {
        set((state) => ({
          products: state.products.map((p) =>
            p._id === id || p.id === id
              ? {
                  ...p,
                  ...updates,
                  updated_at: new Date().toISOString(),
                  // Sync legacy fields
                  ...(updates.title && { name: updates.title }),
                  ...(updates.name && { title: updates.name }),
                  ...(updates.quantity !== undefined && {
                    stock: updates.quantity,
                  }),
                  ...(updates.stock !== undefined && {
                    quantity: updates.stock,
                  }),
                  ...(updates.code && {
                    barcode: updates.code,
                  }),
                  ...(updates.barcode && {
                    code: updates.barcode,
                  }),
                }
              : p,
          ),
        }));
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products
            .map((p) =>
              p._id === id || p.id === id
                ? { ...p, deleted_at: new Date().toISOString() }
                : p,
            )
            .filter((p) => !p.deleted_at), // Actually remove from array for now
        }));
      },

      addToCart: (product) => {
        set((state) => {
          const existing = state.cart.find(
            (item) => item.id === product.id,
          );
          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              ),
            };
          }
          return {
            cart: [
              ...state.cart,
              { ...product, quantity: 1, discount: 0 },
            ],
          };
        });
      },

      removeFromCart: (productId) => {
        set((state) => ({
          cart: state.cart.filter(
            (item) => item.id !== productId,
          ),
        }));
      },

      updateCartQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === productId
              ? { ...item, quantity }
              : item,
          ),
        }));
      },

      updateCartDiscount: (productId, discount) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === productId
              ? { ...item, discount }
              : item,
          ),
        })),

      updateCartNote: (productId, note) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === productId ? { ...item, note } : item,
          ),
        })),

      clearCart: () => {
        set({ cart: [] });
      },

      createOrder: (orderData) => {
        const { cart, currentShift, currentUser } = get();
        const subtotal = cart.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
        const totalDiscount =
          cart.reduce(
            (sum, item) => sum + item.discount * item.quantity,
            0,
          ) + (orderData.discount || 0);
        const total = subtotal - totalDiscount;

        // Get current user info from localStorage
        const currentUsername =
          localStorage.getItem("salepa_username") || "System";

        // Ensure paymentHistory always exists with at least one initial record
        const initialPaymentHistory: PaymentHistory[] =
          orderData.paymentHistory || [
            {
              id: `PAY-${Date.now()}`,
              amount: orderData.receivedAmount || total,
              paymentMethod: orderData.paymentMethod || "cash",
              paidAt: new Date().toISOString(),
              paidBy: currentUsername,
              note: orderData.note || "",
              changeAmount:
                orderData.changeAmount ||
                (orderData.receivedAmount || total) - total,
            },
          ];

        const order: Order = {
          id: Date.now().toString(),
          items: cart,
          subtotal,
          discount: totalDiscount,
          total,
          date: new Date().toISOString(),
          timestamp: new Date().toISOString(),
          shiftId: currentShift?.id,
          status: "pending",
          createdBy: currentUser?.fullName || currentUsername,
          ...orderData,
          paymentHistory: initialPaymentHistory, // Always ensure paymentHistory exists
        };

        console.log("🔍 Creating order with data:", orderData);
        console.log("📦 Final order object:", order);
        console.log("💳 PaymentMethod:", order.paymentMethod);
        console.log("📜 PaymentHistory:", order.paymentHistory);

        set((state) => {
          const newState: any = {
            orders: [order, ...state.orders],
            cart: [],
            products: state.products.map((p) => {
              const cartItem = cart.find(
                (item) => item.id === p.id,
              );
              if (cartItem) {
                return {
                  ...p,
                  stock: p.stock - cartItem.quantity,
                };
              }
              return p;
            }),
            currentShift: state.currentShift
              ? {
                  ...state.currentShift,
                  totalOrders:
                    state.currentShift.totalOrders + 1,
                  totalRevenue:
                    state.currentShift.totalRevenue + total,
                }
              : null,
          };

          // Auto-create or update customer if customerPhone is provided
          if (
            orderData.customerPhone &&
            orderData.customerName
          ) {
            const existingCustomer = state.customers.find(
              (c: Customer) =>
                c.phone === orderData.customerPhone,
            );

            if (!existingCustomer) {
              // Create new customer
              const newCustomer: Customer = {
                id: `CUST-${Date.now()}`,
                name: orderData.customerName,
                phone: orderData.customerPhone,
                email: "",
                customerGroup: "regular",
                createdAt: new Date().toISOString(),
                address: "",
                notes: "",
              };
              newState.customers = [
                newCustomer,
                ...state.customers,
              ];
            }
          }

          // 🆕 AUTO-CREATE TREATMENT PACKAGES when treatment products are purchased
          const treatmentItems = cart.filter(
            (item) => item.productType === "treatment",
          );

          if (
            treatmentItems.length > 0 &&
            orderData.customerPhone &&
            orderData.customerName
          ) {
            console.log(
              "🎯 Found treatment items in cart:",
              treatmentItems,
            );

            // Find or get customer ID
            let customerId = state.customers.find(
              (c) => c.phone === orderData.customerPhone,
            )?.id;
            if (!customerId && newState.customers) {
              customerId = newState.customers[0]?.id; // Use newly created customer
            }

            if (customerId) {
              const newPackages: CustomerTreatmentPackage[] =
                [];

              treatmentItems.forEach((item) => {
                // Get full product details to access sessionDetails
                const fullProduct = state.products.find(
                  (p) => p.id === item.id,
                );

                if (fullProduct && fullProduct.sessions) {
                  // Create sessions array from sessionDetails if available
                  let sessions: TreatmentPackageSession[] = [];

                  if (
                    fullProduct.sessionDetails &&
                    fullProduct.sessionDetails.length > 0
                  ) {
                    // Convert old sessionDetails format to new TreatmentPackageSession format
                    sessions = fullProduct.sessionDetails.map(
                      (detail) => {
                        const sessionItems: TreatmentPackageSessionItem[] =
                          [];

                        // Add products from session
                        detail.products?.forEach((prod) => {
                          const product = state.products.find(
                            (p) => p.id === prod.id,
                          );
                          if (product) {
                            sessionItems.push({
                              productId: prod.id,
                              productName: product.name,
                              productType: "product",
                              quantity: prod.quantity,
                            });
                          }
                        });

                        // Add services from session
                        detail.services?.forEach((serv) => {
                          const service = state.products.find(
                            (p) => p.id === serv.id,
                          );
                          if (service) {
                            sessionItems.push({
                              productId: serv.id,
                              productName: service.name,
                              productType: "service",
                              quantity: serv.quantity,
                              duration: service.duration,
                            });
                          }
                        });

                        return {
                          sessionNumber: detail.sessionNumber,
                          sessionName: `Buổi ${detail.sessionNumber}`,
                          items: sessionItems,
                        };
                      },
                    );
                  } else {
                    // No sessionDetails, create basic sessions
                    sessions = Array.from(
                      { length: fullProduct.sessions },
                      (_, i) => ({
                        sessionNumber: i + 1,
                        sessionName: `Buổi ${i + 1}`,
                        items: [
                          {
                            productId: fullProduct.id,
                            productName: fullProduct.name,
                            productType: "service",
                            quantity: 1,
                            duration: fullProduct.duration,
                          },
                        ],
                      }),
                    );
                  }

                  // Create treatment package for each quantity
                  for (let i = 0; i < item.quantity; i++) {
                    const packageId = `PKG-${Date.now()}-${i}`;
                    const newPackage: CustomerTreatmentPackage =
                      {
                        id: packageId,
                        customerId: customerId,
                        customerName: orderData.customerName,
                        treatmentProductId: item.id,
                        treatmentName: item.name,
                        totalSessions: fullProduct.sessions,
                        usedSessionNumbers: [],
                        remainingSessions: fullProduct.sessions,
                        sessions: sessions,
                        purchaseDate: new Date().toISOString(),
                        orderId: order.id,
                        isActive: true,
                        createdAt: new Date().toISOString(),
                      };

                    newPackages.push(newPackage);
                    console.log(
                      "✅ Created treatment package:",
                      newPackage,
                    );
                  }
                }
              });

              if (newPackages.length > 0) {
                newState.customerTreatmentPackages = [
                  ...newPackages,
                  ...(state.customerTreatmentPackages || []),
                ];
                console.log(
                  `🎉 Auto-created ${newPackages.length} treatment package(s) for customer ${orderData.customerName}`,
                );
              }
            } else {
              console.warn(
                "⚠️ Cannot create treatment package: customer ID not found",
              );
            }
          }

          return newState;
        });

        return order;
      },

      updateOrder: (orderId, updates) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? { ...order, ...updates }
              : order,
          ),
        }));
      },

      deleteOrder: (orderId) => {
        set((state) => ({
          orders: state.orders.filter(
            (order) => order.id !== orderId,
          ),
        }));
      },

      setEditingOrder: (order) => {
        set({ editingOrder: order });
      },

      addCategory: (category) => {
        set((state) => ({
          categories: [...state.categories, category],
        }));
      },

      // Product Category actions
      addProductCategory: (category) => {
        const id = Date.now().toString();
        const newCategory: ProductCategory = {
          ...category,
          id,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          productCategories: [
            ...state.productCategories,
            newCategory,
          ],
        }));
      },

      updateProductCategory: (id, category) => {
        set((state) => ({
          productCategories: state.productCategories.map((c) =>
            c.id === id
              ? {
                  ...c,
                  ...category,
                  updatedAt: new Date().toISOString(),
                }
              : c,
          ),
        }));
      },

      deleteProductCategory: (id) => {
        set((state) => ({
          productCategories: state.productCategories.filter(
            (c) => c.id !== id,
          ),
        }));
      },

      toggleProductCategoryStatus: (id) => {
        set((state) => ({
          productCategories: state.productCategories.map((c) =>
            c.id === id
              ? {
                  ...c,
                  isActive: !c.isActive,
                  updatedAt: new Date().toISOString(),
                }
              : c,
          ),
        }));
      },

      // Customer Type actions
      addCustomerType: (customerType) => {
        const _id = `ct-${Date.now()}`;
        const newCustomerType: CustomerType = {
          ...customerType,
          _id,
          tenant_id: "tenant-001",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set((state) => ({
          customerTypes: [
            ...state.customerTypes,
            newCustomerType,
          ],
        }));
      },

      updateCustomerType: (id, customerType) => {
        set((state) => ({
          customerTypes: state.customerTypes.map((ct) =>
            ct._id === id
              ? {
                  ...ct,
                  ...customerType,
                  updated_at: new Date().toISOString(),
                }
              : ct,
          ),
        }));
      },

      deleteCustomerType: (id) => {
        set((state) => ({
          customerTypes: state.customerTypes.filter(
            (ct) => ct._id !== id,
          ),
        }));
      },

      toggleCustomerTypeStatus: (id) => {
        set((state) => ({
          customerTypes: state.customerTypes.map((ct) =>
            ct._id === id
              ? {
                  ...ct,
                  status: ct.status === 1 ? 0 : 1,
                  updated_at: new Date().toISOString(),
                }
              : ct,
          ),
        }));
      },

      setLanguage: (language) => {
        set({ language });
      },

      setTheme: (theme) => {
        console.log("🎨 Setting theme to:", theme);
        set({ theme });
        // Apply theme to document
        if (theme === "dark") {
          console.log("Adding dark class");
          document.documentElement.classList.add("dark");
        } else if (theme === "light") {
          console.log("Removing dark class");
          document.documentElement.classList.remove("dark");
        } else {
          // Auto mode - check system preference
          const isDark = window.matchMedia(
            "(prefers-color-scheme: dark)",
          ).matches;
          console.log(
            "Auto mode - system prefers dark:",
            isDark,
          );
          if (isDark) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
        console.log(
          "Current classes:",
          document.documentElement.classList.toString(),
        );
      },

      setFontSize: (fontSize) => {
        set({ fontSize });
        // Apply font size to document
        const rootElement = document.documentElement;
        rootElement.classList.remove(
          "text-sm",
          "text-base",
          "text-lg",
        );
        if (fontSize === "small") {
          rootElement.classList.add("text-sm");
        } else if (fontSize === "large") {
          rootElement.classList.add("text-lg");
        } else {
          rootElement.classList.add("text-base");
        }
      },

      setCompactMode: (compactMode) => {
        set({ compactMode });
        // Apply compact mode class to document
        if (compactMode) {
          document.documentElement.classList.add(
            "compact-mode",
          );
        } else {
          document.documentElement.classList.remove(
            "compact-mode",
          );
        }
      },

      openShift: (openingCash, openedBy, note) => {
        const shift: Shift = {
          id: Date.now().toString(),
          openedBy,
          openTime: new Date().toISOString(),
          openingCash,
          totalOrders: 0,
          totalRevenue: 0,
          note,
          status: "open",
        };
        set((state) => ({
          currentShift: shift,
          shifts: [shift, ...state.shifts],
        }));
      },

      closeShift: (closingCash, closedBy, note) => {
        const { currentShift } = get();
        if (!currentShift) return;

        const expectedCash =
          currentShift.openingCash + currentShift.totalRevenue;
        const difference = closingCash - expectedCash;

        const closedShift: Shift = {
          ...currentShift,
          closedBy,
          closeTime: new Date().toISOString(),
          closingCash,
          actualCash: closingCash,
          expectedCash,
          difference,
          note: note || currentShift.note,
          status: "closed",
        };

        set((state) => ({
          currentShift: null,
          shifts: state.shifts.map((s) =>
            s.id === currentShift.id ? closedShift : s,
          ),
        }));
      },

      holdBill: (customerName, note) => {
        const { cart } = get();
        if (cart.length === 0) return;

        const heldBill: HeldBill = {
          id: Date.now().toString(),
          items: [...cart],
          discount: 0,
          customerName,
          note,
          heldAt: new Date().toISOString(),
        };

        set((state) => ({
          heldBills: [...state.heldBills, heldBill],
          cart: [],
        }));
      },

      recallBill: (billId) => {
        const { heldBills } = get();
        const bill = heldBills.find((b) => b.id === billId);
        if (!bill) return;

        set((state) => ({
          cart: bill.items,
          heldBills: state.heldBills.filter(
            (b) => b.id !== billId,
          ),
        }));
      },

      deleteHeldBill: (billId) =>
        set((state) => ({
          heldBills: state.heldBills.filter(
            (bill) => bill.id !== billId,
          ),
        })),

      addToRecent: (productId) => {
        set((state) => {
          const product = state.products.find(
            (p) => p.id === productId,
          );
          if (!product) return state;

          return {
            recentProducts: [
              product,
              ...state.recentProducts.filter(
                (p) => p.id !== productId,
              ),
            ].slice(0, 10), // Keep only last 10
          };
        });
      },

      toggleFavorite: (productId) => {
        set((state) => {
          const product = state.products.find(
            (p) => p.id === productId,
          );
          if (!product) return state;

          const isFavorite = state.favoriteProducts.some(
            (p) => p.id === productId,
          );

          return {
            favoriteProducts: isFavorite
              ? state.favoriteProducts.filter(
                  (p) => p.id !== productId,
                )
              : [...state.favoriteProducts, product],
          };
        });
      },

      syncFromServer: async () => {
        // Removed - app uses localStorage only, no server sync
        // const { data, error } = await supabaseService.getProducts();
        // if (error) {
        //   console.error('Error syncing products:', error);
        //   return;
        // }
        // set({ products: data });
        set({ pendingSyncCount: 0 });
      },

      updateSyncStatus: () => {
        set((state) => ({
          pendingSyncCount: state.pendingSyncCount + 1,
        }));
      },

      clearAllData: () => {
        if (typeof window !== "undefined") {
          localStorage.clear();
        }
        set({
          products: initialProducts,
          orders: [],
          cart: [],
          language: "vi",
          shifts: [],
          currentShift: null,
          heldBills: [],
          recentProducts: [],
          favoriteProducts: [],
          isOnline: false,
          pendingSyncCount: 0,
          customers: [],
          users: [],
          currentUser: null,
          appointments: [],
          productCategories: [],
          stockInReceipts: [],
          stockOutReceipts: [],
          settings: {
            enableTip: false,
            defaultTipPercent: 10,
            taxRate: 10,
            currencySymbol: "VNĐ",
            receiptFooter: "Cảm ơn bạn đã đến với chúng tôi!",
            lowStockThreshold: 10,
          },
          sidebarCollapsed: false,
          tables: [],
          selfServiceOrders: [],
          currentTable: null,
          hasSeenOnboarding: false,
          hasSelectedIndustry: false,
          selectedIndustry: null,
          currentRole: null,
          permissions: systemPermissions,
          roleGroups: defaultRoleGroups,
          userPermissionOverrides: [],
        });
      },

      // Settings actions
      updateSettings: (settings) =>
        set((state) => ({
          settings: { ...state.settings, ...settings },
        })),

      // Sidebar actions
      toggleSidebar: () =>
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        })),

      // Self-service actions
      setCurrentTable: (table) => {
        set({ currentTable: table });
      },

      createSelfServiceOrder: (orderData) => {
        const { cart, currentShift } = get();
        const subtotal = cart.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
        const totalDiscount =
          cart.reduce(
            (sum, item) => sum + item.discount * item.quantity,
            0,
          ) + (orderData.discount || 0);
        const total = subtotal - totalDiscount;

        const order: SelfServiceOrder = {
          id: Date.now().toString(),
          items: cart,
          subtotal,
          discount: totalDiscount,
          total,
          date: new Date().toISOString(),
          timestamp: new Date().toISOString(),
          shiftId: currentShift?.id,
          ...orderData,
        };

        set((state) => ({
          selfServiceOrders: [
            order,
            ...state.selfServiceOrders,
          ],
          cart: [],
          products: state.products.map((p) => {
            const cartItem = cart.find(
              (item) => item.id === p.id,
            );
            if (cartItem) {
              return {
                ...p,
                stock: p.stock - cartItem.quantity,
              };
            }
            return p;
          }),
          currentShift: state.currentShift
            ? {
                ...state.currentShift,
                totalOrders: state.currentShift.totalOrders + 1,
                totalRevenue:
                  state.currentShift.totalRevenue + total,
              }
            : null,
        }));
      },

      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          selfServiceOrders: state.selfServiceOrders.map(
            (order) =>
              order.id === orderId
                ? { ...order, status }
                : order,
          ),
        }));
      },

      addMessageToOrder: (orderId, message) => {
        set((state) => ({
          selfServiceOrders: state.selfServiceOrders.map(
            (order) =>
              order.id === orderId
                ? {
                    ...order,
                    messages: [
                      ...(order.messages || []),
                      {
                        ...message,
                        id: Date.now().toString(),
                        timestamp: new Date().toISOString(),
                      },
                    ],
                  }
                : order,
          ),
        }));
      },

      // Industry selection
      loadIndustryData: (industry) => {
        const data = getIndustryData(industry);
        // Convert products and add predictable IDs based on index
        const productsWithIds = data.products.map(
          (p, index) => {
            // Generate predictable ID based on industry and index
            let prefix = "prod";
            if (p.productType === "service") prefix = "serv";
            if (p.productType === "treatment") prefix = "treat";

            return {
              ...p,
              id: `${industry}-${prefix}-${String(index + 1).padStart(2, "0")}`,
            };
          },
        );
        set({
          products: productsWithIds,
          categories: data.categories,
          orders: data.orders || [],
          selectedIndustry: industry,
          hasSelectedIndustry: true,
        });
      },

      // Onboarding & Role actions
      setHasSeenOnboarding: (value: boolean) => {
        set({ hasSeenOnboarding: value });
      },

      setCurrentRole: (
        role: "admin" | "cashier" | "technician" | null,
      ) => {
        set({ currentRole: role });
      },

      // Customer actions
      addCustomer: (customer) => {
        const _id = `cust-${Date.now()}`;
        const state = get();

        // Generate customer code: KH-YYYYMMDD-XXX
        const today = new Date();
        const dateStr = today
          .toISOString()
          .slice(0, 10)
          .replace(/-/g, "");
        const existingCodesForToday = state.customers.filter(
          (c) => c.code?.startsWith(`KH-${dateStr}`),
        ).length;
        const sequence = String(
          existingCodesForToday + 1,
        ).padStart(3, "0");
        const code = `KH-${dateStr}-${sequence}`;

        // Find the "Mới" (New) customer type
        const newCustomerType = state.customerTypes.find(
          (ct) => ct.name === "Mới" || ct.code === "NEW",
        );

        // Build metadata object from customer fields
        const metadata: any = {};
        if (customer.dateOfBirth)
          metadata.dateOfBirth = customer.dateOfBirth;
        if (customer.gender) metadata.gender = customer.gender;
        if (customer.avatar) metadata.avatar = customer.avatar;
        if (customer.taxCode)
          metadata.taxCode = customer.taxCode;
        if (customer.customerType)
          metadata.customerType = customer.customerType;
        if (customer.companyName)
          metadata.companyName = customer.companyName;
        if (customer.buyerName)
          metadata.buyerName = customer.buyerName;
        if (customer.invoiceAddress)
          metadata.invoiceAddress = customer.invoiceAddress;
        if (customer.province)
          metadata.province = customer.province;
        if (customer.ward) metadata.ward = customer.ward;
        if (customer.idNumber)
          metadata.idNumber = customer.idNumber;
        if (customer.phoneInvoice)
          metadata.phoneInvoice = customer.phoneInvoice;
        if (customer.bank) metadata.bank = customer.bank;
        if (customer.bankAccount)
          metadata.bankAccount = customer.bankAccount;
        if (customer.accountHolder)
          metadata.accountHolder = customer.accountHolder;
        
        // Also handle snake_case fields from form (convert to camelCase for metadata)
        if (customer.company_name)
          metadata.companyName = customer.company_name;
        if (customer.tax_code)
          metadata.taxCode = customer.tax_code;
        if (customer.company_address)
          metadata.companyAddress = customer.company_address;
        if (customer.invoice_email)
          metadata.invoiceEmail = customer.invoice_email;

        const newCustomer: Customer = {
          _id,
          tenant_id: "tenant-001",
          code,
          full_name: customer.full_name,
          phone: customer.phone,
          email: customer.email,
          address: customer.address,
          customer_type_id: newCustomerType?._id,
          total_spent: 0,
          total_orders: 0,
          loyalty_points: 0,
          status: "ACTIVE",
          metadata,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // Add all invoice and additional fields to top level
          company_name: customer.company_name,
          tax_code: customer.tax_code,
          company_address: customer.company_address,
          invoice_email: customer.invoice_email,
          dateOfBirth: customer.dateOfBirth,
          gender: customer.gender,
          avatar: customer.avatar,
          customerType: customer.customerType,
          companyName: customer.companyName || customer.company_name,
          taxCode: customer.taxCode || customer.tax_code,
          buyerName: customer.buyerName,
          invoiceAddress: customer.invoiceAddress || customer.company_address,
          province: customer.province,
          ward: customer.ward,
          idNumber: customer.idNumber,
          phoneInvoice: customer.phoneInvoice,
          bank: customer.bank,
          bankAccount: customer.bankAccount,
          accountHolder: customer.accountHolder,
        };

        console.log("✅ Customer created:", {
          _id: newCustomer._id,
          code: newCustomer.code,
          full_name: newCustomer.full_name,
          phone: newCustomer.phone,
          customerInput: customer,
        });

        set((state) => ({
          customers: [...state.customers, newCustomer],
        }));
      },

      updateCustomer: (id, customer) => {
        console.log('🔄 updateCustomer called:', { id, customer });
        
        set((state) => {
          const updatedCustomers = state.customers.map((c) => {
            if (c._id !== id) return c;
            
            const metadata: any = { ...c.metadata };
            
            if (customer.dateOfBirth !== undefined) metadata.dateOfBirth = customer.dateOfBirth;
            if (customer.gender !== undefined) metadata.gender = customer.gender;
            if (customer.avatar !== undefined) metadata.avatar = customer.avatar;
            if (customer.customerType !== undefined) metadata.customerType = customer.customerType;
            if (customer.companyName !== undefined) metadata.companyName = customer.companyName;
            if (customer.company_name !== undefined) metadata.companyName = customer.company_name;
            if (customer.taxCode !== undefined) metadata.taxCode = customer.taxCode;
            if (customer.tax_code !== undefined) metadata.taxCode = customer.tax_code;
            if (customer.buyerName !== undefined) metadata.buyerName = customer.buyerName;
            if (customer.invoiceAddress !== undefined) metadata.invoiceAddress = customer.invoiceAddress;
            if (customer.company_address !== undefined) metadata.companyAddress = customer.company_address;
            if (customer.invoice_email !== undefined) metadata.invoiceEmail = customer.invoice_email;
            if (customer.province !== undefined) metadata.province = customer.province;
            if (customer.ward !== undefined) metadata.ward = customer.ward;
            if (customer.idNumber !== undefined) metadata.idNumber = customer.idNumber;
            if (customer.phoneInvoice !== undefined) metadata.phoneInvoice = customer.phoneInvoice;
            if (customer.bank !== undefined) metadata.bank = customer.bank;
            if (customer.bankAccount !== undefined) metadata.bankAccount = customer.bankAccount;
            if (customer.accountHolder !== undefined) metadata.accountHolder = customer.accountHolder;
            
            const updatedCustomer: Customer = {
              ...c,
              full_name: customer.full_name !== undefined ? customer.full_name : c.full_name,
              phone: customer.phone !== undefined ? customer.phone : c.phone,
              email: customer.email !== undefined ? customer.email : c.email,
              address: customer.address !== undefined ? customer.address : c.address,
              status: customer.status !== undefined ? customer.status : c.status,
              metadata,
              dateOfBirth: metadata.dateOfBirth,
              gender: metadata.gender,
              avatar: metadata.avatar,
              customerType: metadata.customerType,
              companyName: metadata.companyName,
              taxCode: metadata.taxCode,
              buyerName: metadata.buyerName,
              invoiceAddress: metadata.invoiceAddress || metadata.companyAddress,
              province: metadata.province,
              ward: metadata.ward,
              idNumber: metadata.idNumber,
              phoneInvoice: metadata.phoneInvoice,
              bank: metadata.bank,
              bankAccount: metadata.bankAccount,
              accountHolder: metadata.accountHolder,
              company_name: metadata.companyName,
              tax_code: metadata.taxCode,
              company_address: metadata.companyAddress || metadata.invoiceAddress,
              invoice_email: metadata.invoiceEmail,
              updated_at: new Date().toISOString(),
            };
            
            console.log('✅ Updated customer:', updatedCustomer._id, updatedCustomer.full_name);
            return updatedCustomer;
          });
          
          return { customers: updatedCustomers };
        });
      },

      deleteCustomer: (id) => {
        set((state) => ({
          customers: state.customers.map((c) =>
            c._id === id
              ? { ...c, deleted_at: new Date().toISOString() }
              : c,
          ),
        }));
      },

      getCustomerOrders: (customerId) => {
        const { orders } = get();
        return orders.filter(
          (order) => order.customerPhone === customerId,
        );
      },

      // User actions
      createUser: (userData) => {
        const id = Date.now().toString();
        set((state) => ({
          users: [
            ...state.users,
            {
              ...userData,
              id,
              createdAt: new Date().toISOString(),
            },
          ],
        }));
      },

      updateUser: (userId, updates) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, ...updates } : u,
          ),
        }));
      },

      deleteUser: (userId) => {
        set((state) => ({
          users: state.users.filter((u) => u.id !== userId),
        }));
      },

      toggleUserStatus: (userId) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId
              ? { ...u, isActive: !u.isActive }
              : u,
          ),
        }));
      },

      changeUserPassword: (userId, newPassword) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId
              ? { ...u, password: newPassword }
              : u,
          ),
        }));
      },

      login: (username, password) => {
        const { users } = get();
        const user = users.find(
          (u) =>
            u.username === username && u.password === password,
        );
        if (user) {
          set({ currentUser: user });
          return user;
        }
        return null;
      },

      logout: () => {
        set({ currentUser: null });
      },

      // Appointment actions
      createAppointment: (appointmentData) => {
        const id = Date.now().toString();
        const { appointments } = get();
        // Generate appointment code (LH000001, LH000002, etc.)
        const maxCode = appointments.reduce((max, apt) => {
          const codeNum = parseInt(apt.code.replace("LH", ""));
          return codeNum > max ? codeNum : max;
        }, 0);
        const code = `LH${String(maxCode + 1).padStart(6, "0")}`;

        const newAppointment = {
          ...appointmentData,
          id,
          code,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          appointments: [...state.appointments, newAppointment],
        }));

        // Create notifications for all technicians assigned to services
        const technicianIds = new Set(
          appointmentData.services
            .map((s) => s.technicianId)
            .filter(Boolean) as string[],
        );
        technicianIds.forEach((techId) => {
          const technician = get().users.find(
            (u) => u.id === techId,
          );
          if (technician) {
            get().createNotification({
              userId: techId,
              appointmentId: id,
              appointmentCode: code,
              title: "Lịch hẹn mới",
              message: `Bạn được gán vào lịch hẹn ${code} - ${appointmentData.customerName} vào ${appointmentData.appointmentDate} lúc ${appointmentData.startTime}`,
              type: "new_appointment",
              isRead: false,
            });
          }
        });
      },

      updateAppointment: (appointmentId, updates) => {
        const oldAppointment = get().appointments.find(
          (a) => a.id === appointmentId,
        );

        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === appointmentId
              ? {
                  ...a,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : a,
          ),
        }));

        // Create notifications for updated technicians
        if (updates.services && oldAppointment) {
          const oldTechIds = new Set(
            oldAppointment.services
              .map((s) => s.technicianId)
              .filter(Boolean) as string[],
          );
          const newTechIds = new Set(
            updates.services
              .map((s) => s.technicianId)
              .filter(Boolean) as string[],
          );

          // Notify all technicians in updated appointment
          newTechIds.forEach((techId) => {
            get().createNotification({
              userId: techId,
              appointmentId,
              appointmentCode: oldAppointment.code,
              title: "Lịch hẹn cập nhật",
              message: `Lịch hẹn ${oldAppointment.code} - ${oldAppointment.customerName} đã được cập nhật`,
              type: "updated_appointment",
              isRead: false,
            });
          });
        }
      },

      deleteAppointment: (appointmentId) => {
        const appointment = get().appointments.find(
          (a) => a.id === appointmentId,
        );

        set((state) => ({
          appointments: state.appointments.filter(
            (a) => a.id !== appointmentId,
          ),
        }));

        // Notify technicians about cancellation
        if (appointment) {
          const technicianIds = new Set(
            appointment.services
              .map((s) => s.technicianId)
              .filter(Boolean) as string[],
          );
          technicianIds.forEach((techId) => {
            get().createNotification({
              userId: techId,
              appointmentId,
              appointmentCode: appointment.code,
              title: "Lịch hẹn đã hủy",
              message: `Lịch hẹn ${appointment.code} - ${appointment.customerName} đã bị hủy`,
              type: "cancelled_appointment",
              isRead: false,
            });
          });
        }
      },

      updateAppointmentStatus: (appointmentId, status) => {
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === appointmentId
              ? {
                  ...a,
                  status,
                  updatedAt: new Date().toISOString(),
                }
              : a,
          ),
        }));
      },

      // Check if technician is busy at specific time
      isTechnicianBusy: (
        technicianId,
        date,
        startTime,
        duration,
        excludeAppointmentId,
      ) => {
        const { appointments } = get();

        const [startHour, startMin] = startTime
          .split(":")
          .map(Number);
        const newStartMinutes = startHour * 60 + startMin;
        const newEndMinutes = newStartMinutes + duration;

        return appointments.some((apt) => {
          if (apt.id === excludeAppointmentId) return false;
          if (apt.appointmentDate !== date) return false;
          if (apt.status === "cancelled") return false;

          // Check if any service in this appointment is assigned to this technician
          const hasTechnicianAssigned = apt.services.some(
            (svc) => svc.technicianId === technicianId,
          );
          if (!hasTechnicianAssigned) return false;

          const [aptStartHour, aptStartMin] = apt.startTime
            .split(":")
            .map(Number);
          const [aptEndHour, aptEndMin] = apt.endTime
            .split(":")
            .map(Number);
          const aptStartMinutes =
            aptStartHour * 60 + aptStartMin;
          const aptEndMinutes = aptEndHour * 60 + aptEndMin;

          // Check for overlap
          return (
            newStartMinutes < aptEndMinutes &&
            newEndMinutes > aptStartMinutes
          );
        });
      },

      // Get all appointments for a technician on a specific date
      getTechnicianAppointments: (technicianId, date) => {
        const { appointments } = get();
        return appointments.filter(
          (apt) =>
            apt.appointmentDate === date &&
            apt.status !== "cancelled" &&
            apt.services.some(
              (svc) => svc.technicianId === technicianId,
            ),
        );
      },

      // Notification actions
      createNotification: (notificationData) => {
        const id =
          Date.now().toString() +
          Math.random().toString(36).substr(2, 9);
        const newNotification: TechnicianNotification = {
          ...notificationData,
          id,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          technicianNotifications: [
            ...state.technicianNotifications,
            newNotification,
          ],
        }));
      },

      markNotificationAsRead: (notificationId) => {
        set((state) => ({
          technicianNotifications:
            state.technicianNotifications.map((n) =>
              n.id === notificationId
                ? { ...n, isRead: true }
                : n,
            ),
        }));
      },

      getUnreadNotificationCount: (userId) => {
        const { technicianNotifications } = get();
        return technicianNotifications.filter(
          (n) => n.userId === userId && !n.isRead,
        ).length;
      },

      getUserNotifications: (userId) => {
        const { technicianNotifications } = get();
        return technicianNotifications
          .filter((n) => n.userId === userId)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime(),
          );
      },

      // Stock Management actions
      createStockInReceipt: (receiptData) => {
        const { currentUser, products, stockInReceipts } =
          get();
        const id = Date.now().toString();
        const now = new Date().toISOString();
        const today = new Date()
          .toISOString()
          .split("T")[0]
          .replace(/-/g, "");

        // Generate receipt number: IN-YYYYMMDD-XXX
        const existingReceipts = (stockInReceipts || []).filter(
          (r) => r.receiptNumber.startsWith(`IN-${today}`),
        );
        const sequenceNum = String(
          existingReceipts.length + 1,
        ).padStart(3, "0");
        const receiptNumber = `IN-${today}-${sequenceNum}`;

        const newReceipt: StockInReceipt = {
          ...receiptData,
          id,
          receiptNumber,
          createdAt: now,
          createdBy: currentUser?.username || "system",
        };

        // Update product stock
        const updatedProducts = products.map((p) => {
          const item = receiptData.items.find(
            (i) => i.productId === p.id,
          );
          if (item) {
            return {
              ...p,
              stock: p.stock + item.quantity,
            };
          }
          return p;
        });

        set((state) => ({
          stockInReceipts: [
            ...(state.stockInReceipts || []),
            newReceipt,
          ],
          products: updatedProducts,
        }));
      },

      updateStockInReceipt: (receiptId, receiptData) => {
        const { stockInReceipts, products } = get();
        const oldReceipt = (stockInReceipts || []).find(
          (r) => r.id === receiptId,
        );

        if (!oldReceipt) return;

        // Reverse old stock changes first
        let updatedProducts = products.map((p) => {
          const oldItem = oldReceipt.items.find(
            (i) => i.productId === p.id,
          );
          if (oldItem) {
            return {
              ...p,
              stock: Math.max(0, p.stock - oldItem.quantity),
            };
          }
          return p;
        });

        // Apply new stock changes
        updatedProducts = updatedProducts.map((p) => {
          const newItem = receiptData.items.find(
            (i) => i.productId === p.id,
          );
          if (newItem) {
            return {
              ...p,
              stock: p.stock + newItem.quantity,
            };
          }
          return p;
        });

        const updatedReceipt: StockInReceipt = {
          ...oldReceipt,
          ...receiptData,
        };

        set((state) => ({
          stockInReceipts: (state.stockInReceipts || []).map(
            (r) => (r.id === receiptId ? updatedReceipt : r),
          ),
          products: updatedProducts,
        }));
      },

      createStockOutReceipt: (receiptData) => {
        const { currentUser, products, stockOutReceipts } =
          get();
        const id = Date.now().toString();
        const now = new Date().toISOString();
        const today = new Date()
          .toISOString()
          .split("T")[0]
          .replace(/-/g, "");

        // Generate receipt number: OUT-YYYYMMDD-XXX
        const existingReceipts = (
          stockOutReceipts || []
        ).filter((r) =>
          r.receiptNumber.startsWith(`OUT-${today}`),
        );
        const sequenceNum = String(
          existingReceipts.length + 1,
        ).padStart(3, "0");
        const receiptNumber = `OUT-${today}-${sequenceNum}`;

        const newReceipt: StockOutReceipt = {
          ...receiptData,
          id,
          receiptNumber,
          createdAt: now,
          createdBy: currentUser?.username || "system",
        };

        // Update product stock (reduce)
        const updatedProducts = products.map((p) => {
          const item = receiptData.items.find(
            (i) => i.productId === p.id,
          );
          if (item) {
            return {
              ...p,
              stock: Math.max(0, p.stock - item.quantity),
            };
          }
          return p;
        });

        set((state) => ({
          stockOutReceipts: [
            ...(state.stockOutReceipts || []),
            newReceipt,
          ],
          products: updatedProducts,
        }));
      },

      deleteStockInReceipt: (receiptId) => {
        const { stockInReceipts, products } = get();
        const receipt = (stockInReceipts || []).find(
          (r) => r.id === receiptId,
        );

        if (receipt) {
          // Reverse stock changes
          const updatedProducts = products.map((p) => {
            const item = receipt.items.find(
              (i) => i.productId === p.id,
            );
            if (item) {
              return {
                ...p,
                stock: Math.max(0, p.stock - item.quantity),
              };
            }
            return p;
          });

          set((state) => ({
            stockInReceipts: (
              state.stockInReceipts || []
            ).filter((r) => r.id !== receiptId),
            products: updatedProducts,
          }));
        }
      },

      updateStockOutReceipt: (receiptId, receiptData) => {
        const { stockOutReceipts, products, currentUser } =
          get();
        const oldReceipt = (stockOutReceipts || []).find(
          (r) => r.id === receiptId,
        );

        if (oldReceipt) {
          // 1. Reverse old stock changes (add back old quantities)
          let updatedProducts = products.map((p) => {
            const oldItem = oldReceipt.items.find(
              (i) => i.productId === p.id,
            );
            if (oldItem) {
              return {
                ...p,
                stock: p.stock + oldItem.quantity,
              };
            }
            return p;
          });

          // 2. Apply new stock changes (subtract new quantities)
          updatedProducts = updatedProducts.map((p) => {
            const newItem = receiptData.items.find(
              (i) => i.productId === p.id,
            );
            if (newItem) {
              return {
                ...p,
                stock: Math.max(0, p.stock - newItem.quantity),
              };
            }
            return p;
          });

          // 3. Update receipt
          const updatedReceipt: StockOutReceipt = {
            ...oldReceipt,
            ...receiptData,
          };

          set((state) => ({
            stockOutReceipts: (
              state.stockOutReceipts || []
            ).map((r) =>
              r.id === receiptId ? updatedReceipt : r,
            ),
            products: updatedProducts,
          }));
        }
      },

      deleteStockOutReceipt: (receiptId) => {
        const { stockOutReceipts, products } = get();
        const receipt = (stockOutReceipts || []).find(
          (r) => r.id === receiptId,
        );

        if (receipt) {
          // Reverse stock changes (add back)
          const updatedProducts = products.map((p) => {
            const item = receipt.items.find(
              (i) => i.productId === p.id,
            );
            if (item) {
              return {
                ...p,
                stock: p.stock + item.quantity,
              };
            }
            return p;
          });

          set((state) => ({
            stockOutReceipts: (
              state.stockOutReceipts || []
            ).filter((r) => r.id !== receiptId),
            products: updatedProducts,
          }));
        }
      },

      getStockInReceipts: () => {
        return (get().stockInReceipts || []).sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime(),
        );
      },

      getStockOutReceipts: () => {
        return (get().stockOutReceipts || []).sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime(),
        );
      },

      // Customer Treatment Package actions
      createCustomerTreatmentPackage: (packageData) => {
        const id = Date.now().toString();
        const now = new Date().toISOString();
        const newPackage: CustomerTreatmentPackage = {
          ...packageData,
          id,
          createdAt: now,
          updatedAt: now,
        };
        console.log(
          "🎯 createCustomerTreatmentPackage called:",
          {
            input: packageData,
            output: newPackage,
            hasSessions: !!newPackage.sessions,
            sessionsCount: newPackage.sessions?.length || 0,
          },
        );
        set((state) => {
          const updated = [
            ...state.customerTreatmentPackages,
            newPackage,
          ];
          console.log("📦 Updated customerTreatmentPackages:", {
            before: state.customerTreatmentPackages.length,
            after: updated.length,
            newPackageId: newPackage.id,
          });
          return {
            customerTreatmentPackages: updated,
          };
        });
      },

      usePackageSession: (packageId, sessionNumber) => {
        set((state) => ({
          customerTreatmentPackages:
            state.customerTreatmentPackages.map((pkg) =>
              pkg.id === packageId
                ? {
                    ...pkg,
                    usedSessionNumbers: [
                      ...pkg.usedSessionNumbers,
                      sessionNumber,
                    ],
                    remainingSessions:
                      pkg.remainingSessions - 1,
                    isActive: pkg.remainingSessions - 1 > 0,
                    updatedAt: new Date().toISOString(),
                  }
                : pkg,
            ),
        }));
      },

      // Return (refund) a session when appointment is cancelled
      returnPackageSession: (packageId, sessionNumber) => {
        set((state) => ({
          customerTreatmentPackages:
            state.customerTreatmentPackages.map((pkg) =>
              pkg.id === packageId &&
              pkg.usedSessionNumbers.includes(sessionNumber)
                ? {
                    ...pkg,
                    usedSessionNumbers:
                      pkg.usedSessionNumbers.filter(
                        (n) => n !== sessionNumber,
                      ),
                    remainingSessions:
                      pkg.remainingSessions + 1,
                    isActive: true,
                    updatedAt: new Date().toISOString(),
                  }
                : pkg,
            ),
        }));
      },

      getCustomerActivePackages: (customerId) => {
        const { customerTreatmentPackages } = get();
        return customerTreatmentPackages.filter(
          (pkg) =>
            pkg.customerId === customerId &&
            pkg.isActive &&
            pkg.remainingSessions > 0,
        );
      },

      getPackageForService: (customerId, serviceId) => {
        const { customerTreatmentPackages } = get();
        const activePackages = customerTreatmentPackages.filter(
          (pkg) =>
            pkg.customerId === customerId &&
            pkg.isActive &&
            pkg.remainingSessions > 0,
        );

        // Find package that includes this service
        for (const pkg of activePackages) {
          if (pkg.serviceIds.includes(serviceId)) {
            return pkg;
          }
        }

        return null;
      },
    }),
    {
      name: "pos-storage",
      version: 3, // Tăng version để trigger migration
      migrate: (persistedState: any, version: number) => {
        // Migration function để xử lý khi version thay đổi
        if (version < 3) {
          // Migration v3: Remove "Kỹ thuật viên" role group and users with roleGroupId '3'
          if (persistedState) {
            // Force update roleGroups to only include 2 groups (remove id '3')
            persistedState.roleGroups =
              defaultRoleGroups.filter((rg) => rg.id !== "3");

            // Remove users with roleGroupId '3'
            if (persistedState.users) {
              persistedState.users =
                persistedState.users.filter(
                  (u: User) => u.roleGroupId !== "3",
                );
            }

            // Update permissions from latest systemPermissions
            persistedState.permissions = systemPermissions;
          }
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        // Migration: Clean up invalid appointment statuses and add missing codes
        if (state?.appointments) {
          const validStatuses: Appointment["status"][] = [
            "pending",
            "in-progress",
            "completed",
            "cancelled",
          ];

          // First pass: Fix statuses
          state.appointments = state.appointments.map((apt) => {
            // Nếu status không hợp lệ, mặc định về 'pending'
            if (!validStatuses.includes(apt.status)) {
              return {
                ...apt,
                status: "pending" as Appointment["status"],
              };
            }
            return apt;
          });

          // Second pass: Add missing codes
          let codeCounter = 1;
          state.appointments = state.appointments.map(
            (apt, index) => {
              if (!apt.code) {
                // Generate code for old appointments
                const code = `LH${String(codeCounter).padStart(6, "0")}`;
                codeCounter++;
                return { ...apt, code };
              } else {
                // Track existing codes to avoid duplicates
                const codeNum = parseInt(
                  apt.code.replace("LH", ""),
                );
                if (codeNum >= codeCounter) {
                  codeCounter = codeNum + 1;
                }
              }
              return apt;
            },
          );
        }

        // Migration: Migrate products from old schema to new schema
        if (state?.products && Array.isArray(state.products)) {
          state.products = state.products.map((p: any) => {
            // If product already has new schema fields, skip migration
            if (
              p._id &&
              p.title &&
              p.quantity !== undefined &&
              p.code &&
              p.created_at
            ) {
              return p;
            }
            // Otherwise, migrate it
            return migrateProductToNewSchema(p);
          });
        }
      },
    },
  ),
);