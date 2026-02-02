import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language } from './i18n';
// import { supabaseService } from './supabaseService'; // Removed - using localStorage only
import { getIndustryData } from './industryData';
import type { IndustryType } from '../../modules/spa/pages/settings/IndustrySelection';
import { systemPermissions, defaultRoleGroups } from './permissionData';

// Helper function to generate order ID in format: HD + DDMMYY + 0001
function generateOrderId(existingOrders: any[]): string {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear().toString().slice(-2); // Last 2 digits of year
  const datePrefix = `${day}${month}${year}`;
  
  // Filter orders from today
  const todayPrefix = `HD${datePrefix}`;
  const todayOrders = existingOrders.filter(order => order.id.startsWith(todayPrefix));
  
  // Get next sequence number
  const nextSequence = todayOrders.length + 1;
  const sequenceStr = nextSequence.toString().padStart(4, '0');
  
  return `HD${datePrefix}${sequenceStr}`;
}

export interface TreatmentSessionDetail {
  sessionNumber: number;
  products: { id: string; quantity: number }[];
  services: { id: string; quantity: number }[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  costPrice?: number; // Giá vốn
  category: string;
  stock: number;
  image?: string;
  barcode?: string;
  description?: string;
  options?: ProductOption[];
  productType?: 'product' | 'service' | 'treatment'; // For Spa industry
  duration?: number; // For services and treatments (in minutes)
  sessions?: number; // For treatments (number of sessions in package)
  sessionDetails?: TreatmentSessionDetail[]; // Chi tiết từng buổi cho liệu trình
}

export interface ProductOption {
  id: string;
  name: string;
  type: 'single' | 'multiple';
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
  sender: 'customer' | 'staff';
  senderName: string;
  message: string;
  timestamp: string;
}

export interface PaymentHistory {
  id: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'momo' | 'zalopay' | 'vnpay';
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
  voucherCode?: string; // Mã voucher đã áp dụng
  voucherDiscount?: number; // Số tiền giảm giá từ voucher
  total: number;
  date: string;
  timestamp: string; // Add this for better time tracking
  paymentMethod: 'cash' | 'card' | 'transfer' | 'momo' | 'zalopay' | 'vnpay';
  paymentMethods?: { method: string; amount: number }[]; // For split payment
  customerId?: string; // ID khách hàng để lấy thông tin chi tiết
  customerName?: string;
  customerPhone?: string;
  note?: string;
  shiftId?: string;
  messages?: ChatMessage[];
  status?: 'pending' | 'completed' | 'cancelled'; // Add status
  paidAt?: string; // When payment was collected
  receivedAmount?: number; // Amount received from customer
  changeAmount?: number; // Change returned to customer
  paymentHistory?: PaymentHistory[]; // History of all payments
  createdBy?: string; // Người tạo hóa đơn
  invoiceStatus?: 'not_issued' | 'issued' | 'error'; // Trạng thái HĐDT: Chưa phát hành, Đã phát hành, Phát hành lỗi
}

export type CreateOrderInput = Omit<
  Order,
  'id' | 'items' | 'subtotal' | 'total' | 'date' | 'timestamp' | 'discount'
> & {
  date?: string;
  timestamp?: string;
  discount?: number;
};

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
  status: 'open' | 'closed';
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
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  customerGroupId?: string; // ID của nhóm khách hàng
  notes?: string;
  taxCode?: string;
  avatar?: string;
  totalSpent?: number;
  orderCount?: number;
  createdAt: string;
  updatedAt?: string;
  
  // Invoice Information Fields
  customerType?: 'individual' | 'organization';
  companyName?: string;
  buyerName?: string;
  invoiceAddress?: string;
  province?: string;
  district?: string;
  ward?: string;
  idNumber?: string;
  phoneInvoice?: string;
  bank?: string;
  bankAccount?: string;
  accountHolder?: string;
}

export interface User {
  id: string;
  username: string;              // Tên đăng nhập (unique)
  password: string;              // Mật khẩu (trong thực tế nên hash)
  fullName: string;              // Họ tên đầy đủ
  email?: string;                // Email
  phone?: string;                // Số điện thoại
  roleGroupId: string;           // ID nhóm quyền
  avatar?: string;               // URL ảnh đại diện
  isActive: boolean;             // Trạng thái hoạt động
  createdAt: string;             // Ngày tạo
  lastLogin?: string;            // Lần đăng nhập cuối
  createdBy?: string;            // Người tạo
  notes?: string;                // Ghi chú
  customPermissions?: string[];  // Quyền custom override từ nhóm quyền
}

// Permission System
export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'system' | 'sales' | 'orders' | 'order_management' | 'products' | 'customers' | 'appointments' | 'stock' | 'categories' | 'account' | 'reports';
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
  status: 'available' | 'occupied' | 'reserved';
  area: string;
}

export interface Bed {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SelfServiceOrder extends Order {
  tableId?: string;
  tableName?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled';
  orderType: 'dine-in' | 'takeaway';
}

export type CreateSelfServiceOrderInput = Omit<
  SelfServiceOrder,
  'id' | 'items' | 'subtotal' | 'total' | 'date' | 'timestamp' | 'discount'
> & {
  date?: string;
  timestamp?: string;
  discount?: number;
};

export interface AppointmentService {
  productId: string;
  productName: string;
  productType: 'product' | 'service' | 'treatment';
  duration: number; // in minutes
  price: number;
  quantity?: number; // For products from treatment packages
  sessionNumber?: number; // For treatment packages
  maxSessions?: number; // Total sessions in treatment package
  // New fields for treatment package usage
  useTreatmentPackage?: boolean; // True if using session from package
  treatmentPackageId?: string; // ID of the treatment package being used
  // NEW: Multiple technicians assigned to this specific service
  technicianIds?: string[]; // Array of technician IDs
  technicianNames?: string[]; // Array of technician names
  // ⭐ NEW: Time slot for each service
  startTime: string; // HH:mm format (e.g., "09:00")
  endTime: string;   // HH:mm format (e.g., "10:00")
  // ⭐ NEW: Bed assignment for service (optional)
  bedId?: string; // ID of the bed assigned to this service
  bedName?: string; // Name of the bed
}

export interface Appointment {
  id: string;
  code: string; // Appointment code (e.g., "LH000001")
  customerId: string;
  customerName: string;
  customerPhone: string;
  appointmentDate: string; // ISO date (YYYY-MM-DD)
  startTime: string; // HH:mm format (e.g., "09:00")
  endTime: string; // HH:mm format - calculated from duration
  services: AppointmentService[];
  technicianId?: string; // DEPRECATED - now each service has its own technician
  technicianName?: string; // DEPRECATED - now each service has its own technician
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
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
  type: 'new_appointment' | 'updated_appointment' | 'cancelled_appointment';
  isRead: boolean;
  createdAt: string;
}

// Session detail for treatment package
export interface TreatmentPackageSessionItem {
  productId: string;
  productName: string;
  productType: 'service' | 'product';
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
  usedSessionNumbers: number[]; // DEPRECATED: Keep for backward compatibility
  
  // NEW V2.1: Track used items per session
  // Format: { 1: ['prod-1', 'prod-2'], 2: ['prod-1'] }
  // Session 1 đã dùng 2 sản phẩm, Session 2 đã dùng 1 sản phẩm
  usedSessionItems?: { [sessionNumber: number]: string[] };
  
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

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxCode?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
}

// Customer Group Interface
export interface CustomerGroup {
  id: string;
  name: string;
  description?: string;
  color?: string; // Màu badge
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
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
  reason: 'damaged' | 'lost' | 'transfer' | 'internal_use' | 'return_to_supplier' | 'other';
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
  orders: Order[]
  categories: string[];
  productCategories: ProductCategory[];
  suppliers: Supplier[];
  customerGroups: CustomerGroup[];
  language: Language;
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
  
  // Bed Management (for Spa)
  beds: Bed[];
  
  // Onboarding & Industry
  hasSeenOnboarding: boolean;
  hasSelectedIndustry: boolean;
  selectedIndustry: IndustryType | null;
  
  // Spa Role Management
  currentRole: 'admin' | 'cashier' | 'technician' | null;
  
  // Permission System
  permissions: Permission[];
  roleGroups: RoleGroup[];
  userPermissionOverrides: UserPermissionOverride[];
  
  // Product actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Cart actions
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  updateCartDiscount: (productId: string, discount: number) => void;
  updateCartNote: (productId: string, note: string) => void;
  clearCart: () => void;
  
  // Order actions
  createOrder: (orderData: CreateOrderInput) => Order;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  deleteOrder: (orderId: string) => void;
  setEditingOrder: (order: Order | null) => void;
  
  // Category actions
  addCategory: (category: string) => void;
  
  // Product Category actions
  addProductCategory: (category: Omit<ProductCategory, 'id' | 'createdAt'>) => void;
  updateProductCategory: (id: string, category: Partial<ProductCategory>) => void;
  deleteProductCategory: (id: string) => void;
  toggleProductCategoryStatus: (id: string) => void;
  
  // Supplier actions
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  toggleSupplierStatus: (id: string) => void;
  
  // Customer Group actions
  addCustomerGroup: (group: Omit<CustomerGroup, 'id' | 'createdAt'>) => void;
  updateCustomerGroup: (id: string, group: Partial<CustomerGroup>) => void;
  deleteCustomerGroup: (id: string) => void;
  toggleCustomerGroupStatus: (id: string) => void;
  
  // Language actions
  setLanguage: (language: Language) => void;
  
  // Shift actions
  openShift: (openingCash: number, openedBy: string, note?: string) => void;
  closeShift: (closingCash: number, closedBy: string, note?: string) => void;
  
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
  createSelfServiceOrder: (orderData: CreateSelfServiceOrderInput) => void;
  updateOrderStatus: (orderId: string, status: SelfServiceOrder['status']) => void;
  addMessageToOrder: (orderId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  
  // Industry selection
  loadIndustryData: (industry: IndustryType) => void;
  
  // Onboarding & Role actions
  setHasSeenOnboarding: (value: boolean) => void;
  
  setCurrentRole: (role: 'admin' | 'cashier' | 'technician' | null) => void;
  
  // Customer actions
  addCustomer: (customer: Omit<Customer, 'id' | 'totalSpent' | 'orderCount' | 'createdAt' | 'updatedAt'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  getCustomerOrders: (customerId: string) => Order[];
  
  // User actions
  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'>) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  toggleUserStatus: (userId: string) => void;
  changeUserPassword: (userId: string, newPassword: string) => void;
  login: (username: string, password: string) => User | null;
  logout: () => void;
  
  // Appointment actions
  createAppointment: (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAppointment: (appointmentId: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (appointmentId: string) => void;
  updateAppointmentStatus: (appointmentId: string, status: Appointment['status']) => void;
  isTechnicianBusy: (technicianId: string, date: string, startTime: string, duration: number, excludeAppointmentId?: string) => boolean;
  getTechnicianAppointments: (technicianId: string, date: string) => Appointment[];
  isBedBusy: (bedId: string, date: string, startTime: string, duration: number, excludeAppointmentId?: string) => boolean;
  
  // Notification actions
  createNotification: (notification: Omit<TechnicianNotification, 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  getUnreadNotificationCount: (userId: string) => number;
  getUserNotifications: (userId: string) => TechnicianNotification[];
  
  // Stock Management actions
  createStockInReceipt: (receiptData: Omit<StockInReceipt, 'id' | 'receiptNumber' | 'createdAt' | 'createdBy'>) => void;
  updateStockInReceipt: (receiptId: string, receiptData: Omit<StockInReceipt, 'id' | 'receiptNumber' | 'createdAt' | 'createdBy'>) => void;
  createStockOutReceipt: (receiptData: Omit<StockOutReceipt, 'id' | 'receiptNumber' | 'createdAt' | 'createdBy'>) => void;
  updateStockOutReceipt: (receiptId: string, receiptData: Omit<StockOutReceipt, 'id' | 'receiptNumber' | 'createdAt' | 'createdBy'>) => void;
  deleteStockInReceipt: (receiptId: string) => void;
  deleteStockOutReceipt: (receiptId: string) => void;
  getStockInReceipts: () => StockInReceipt[];
  getStockOutReceipts: () => StockOutReceipt[];
  
  // Customer Treatment Package actions
  createCustomerTreatmentPackage: (packageData: Omit<CustomerTreatmentPackage, 'id' | 'createdAt' | 'updatedAt'>) => void;
  usePackageSession: (packageId: string, sessionNumber: number, productId: string) => void;
  returnPackageSession: (packageId: string, sessionNumber: number, productId: string) => void;
  getCustomerActivePackages: (customerId: string) => CustomerTreatmentPackage[];
  getPackageForService: (customerId: string, serviceId: string) => CustomerTreatmentPackage | null;
  
  // Bed Management actions
  createBed: (bedData: Omit<Bed, 'id' | 'createdAt'>) => void;
  updateBed: (bedId: string, updates: Partial<Bed>) => void;
  deleteBed: (bedId: string) => void;
  toggleBedStatus: (bedId: string) => void;
}

const initialProducts: Product[] = [
  // Đồ uống
  // SPA SERVICES
  {
    id: 'spa-001',
    name: 'Chăm sóc da mặt cơ bản',
    price: 350000,
    category: 'Chăm sóc da mặt',
    stock: 0,
    type: 'service',
    duration: 60,
    barcode: 'SPA001',
    description: 'Làm sạch da, massage mặt, đắp mặt nạ',
  },
  {
    id: 'spa-002',
    name: 'Chăm sóc da mặt cao cấp',
    price: 650000,
    category: 'Chăm sóc da mặt',
    stock: 0,
    type: 'service',
    duration: 90,
    barcode: 'SPA002',
    description: 'Làm sạch sâu, massage mặt đá nóng, đắp mặt nạ collagen',
  },
  {
    id: 'spa-003',
    name: 'Trị mụn chuyên sâu',
    price: 450000,
    category: 'Chăm sóc da m��t',
    stock: 0,
    type: 'service',
    duration: 75,
    barcode: 'SPA003',
    description: 'Điều trị mụn, làm sạch lỗ chân lông',
  },
  {
    id: 'spa-004',
    name: 'Massage body thư giãn 60 phút',
    price: 300000,
    category: 'Massage',
    stock: 0,
    type: 'service',
    duration: 60,
    barcode: 'SPA004',
    description: 'Massage toàn thân thư giãn',
  },
  {
    id: 'spa-005',
    name: 'Massage body thư giãn 90 phút',
    price: 400000,
    category: 'Massage',
    stock: 0,
    type: 'service',
    duration: 90,
    barcode: 'SPA005',
    description: 'Massage toàn thân thư giãn cao cấp',
  },
  {
    id: 'spa-006',
    name: 'Massage đá nóng',
    price: 550000,
    category: 'Massage',
    stock: 0,
    type: 'service',
    duration: 90,
    barcode: 'SPA006',
    description: 'Massage với đá nóng thiên nhiên',
  },
  {
    id: 'spa-007',
    name: 'Massage foot 30 phút',
    price: 150000,
    category: 'Massage',
    stock: 0,
    type: 'service',
    duration: 30,
    barcode: 'SPA007',
    description: 'Massage chân thư giãn',
  },
  {
    id: 'spa-008',
    name: 'Nail cơ bản',
    price: 100000,
    category: 'Nail & Spa',
    stock: 0,
    type: 'service',
    duration: 45,
    barcode: 'SPA008',
    description: 'Cắt, dũa móng, sơn màu cơ bản',
  },
  {
    id: 'spa-009',
    name: 'Nail gel',
    price: 200000,
    category: 'Nail & Spa',
    stock: 0,
    type: 'service',
    duration: 60,
    barcode: 'SPA009',
    description: 'Sơn gel bền màu lâu phai',
  },
  {
    id: 'spa-010',
    name: 'Nail art (vẽ họa tiết)',
    price: 50000,
    category: 'Nail & Spa',
    stock: 0,
    type: 'service',
    duration: 20,
    barcode: 'SPA010',
    description: 'Vẽ họa tiết nghệ thuật trên móng',
  },
  {
    id: 'spa-011',
    name: 'Gội đầu dưỡng sinh',
    price: 120000,
    category: 'Massage',
    stock: 0,
    type: 'service',
    duration: 30,
    barcode: 'SPA011',
    description: 'Gội đầu massage thư giãn',
  },
  {
    id: 'spa-012',
    name: 'Tẩy tế bào chết toàn thân',
    price: 250000,
    category: 'Massage',
    stock: 0,
    type: 'service',
    duration: 45,
    barcode: 'SPA012',
    description: 'Tẩy da chết, làm mịn da',
  },

  // SPA PRODUCTS
  {
    id: 'spa-p001',
    name: 'Serum vitamin C',
    price: 450000,
    category: 'Sản phẩm chăm sóc da',
    stock: 50,
    type: 'product',
    barcode: 'SPAP001',
    description: 'Serum dưỡng trắng da với vitamin C',
  },
  {
    id: 'spa-p002',
    name: 'Kem chống nắng SPF50',
    price: 380000,
    category: 'Sản phẩm chăm sóc da',
    stock: 80,
    type: 'product',
    barcode: 'SPAP002',
    description: 'Kem chống nắng phổ rộng',
  },
  {
    id: 'spa-p003',
    name: 'Mặt nạ collagen',
    price: 150000,
    category: 'Sản phẩm chăm sóc da',
    stock: 100,
    type: 'product',
    barcode: 'SPAP003',
    description: 'Mặt nạ dưỡng ẩm collagen',
  },
  {
    id: 'spa-p004',
    name: 'Toner hoa hồng',
    price: 280000,
    category: 'Sản phẩm chăm sóc da',
    stock: 60,
    type: 'product',
    barcode: 'SPAP004',
    description: 'Nước hoa hồng cân bằng da',
  },
  {
    id: 'spa-p005',
    name: 'Kem dưỡng ẩm ban đêm',
    price: 520000,
    category: 'Sản phẩm chăm sóc da',
    stock: 40,
    type: 'product',
    barcode: 'SPAP005',
    description: 'Kem dưỡng phục hồi da ban đêm',
  },
  {
    id: 'spa-p006',
    name: 'Sữa rửa mặt trà xanh',
    price: 180000,
    category: 'Sản phẩm chăm sóc da',
    stock: 90,
    type: 'product',
    barcode: 'SPAP006',
    description: 'Sữa rửa mặt làm sạch sâu',
  },
  {
    id: 'spa-p007',
    name: 'Tinh dầu massage hoa lavender',
    price: 220000,
    category: 'Sản phẩm chăm sóc da',
    stock: 35,
    type: 'product',
    barcode: 'SPAP007',
    description: 'Tinh dầu thư giãn 100ml',
  },
  {
    id: 'spa-p008',
    name: 'Dầu dưỡng móng',
    price: 120000,
    category: 'Sản phẩm chăm sóc da',
    stock: 70,
    type: 'product',
    barcode: 'SPAP008',
    description: 'Dưỡng móng chắc khỏe',
  },

  // SPA TREATMENT PACKAGES
  {
    id: 'spa-t001',
    name: 'Liệu trình trị mụn 10 buổi',
    price: 4000000,
    category: 'Liệu trình trị liệu',
    stock: 0,
    type: 'treatment',
    duration: 75,
    sessions: 10,
    barcode: 'SPAT001',
    description: 'Gói 10 buổi điều trị mụn chuyên sâu',
  },
  {
    id: 'spa-t002',
    name: 'Liệu trình dưỡng trắng da 8 buổi',
    price: 5200000,
    category: 'Liệu trình trị liệu',
    stock: 0,
    type: 'treatment',
    duration: 90,
    sessions: 8,
    barcode: 'SPAT002',
    description: 'Gói 8 buổi chăm sóc da mặt cao cấp dưỡng trắng',
  },
  {
    id: 'spa-t003',
    name: 'Liệu trình massage thư giãn 12 buổi',
    price: 4500000,
    category: 'Liệu trình trị liệu',
    stock: 0,
    type: 'treatment',
    duration: 90,
    sessions: 12,
    barcode: 'SPAT003',
    description: 'Gói 12 buổi massage body 90 phút',
  },
  {
    id: 'spa-t004',
    name: 'Liệu trình chăm sóc da toàn diện 15 buổi',
    price: 8500000,
    category: 'Liệu trình trị liệu',
    stock: 0,
    type: 'treatment',
    duration: 120,
    sessions: 15,
    barcode: 'SPAT004',
    description: 'Gói VIP 15 buổi chăm sóc da mặt + massage toàn thân',
  },
];

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      products: initialProducts,
      cart: [],
      orders: [],
      categories: ['Đồ uống', 'Đồ ăn', 'Bánh kẹo', 'Món ăn nhanh', 'Món Hàn', 'Món Nhật', 'Món Thái'],
      productCategories: [
        {
          id: '1',
          name: 'Chăm sóc da mặt',
          description: 'Các dịch vụ và sản phẩm chăm sóc da mặt',
          color: '#FE7410',
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          createdBy: 'system',
        },
        {
          id: '2',
          name: 'Nail & Spa',
          description: 'Dịch vụ làm móng và chăm sóc tay chân',
          color: '#EC4899',
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          createdBy: 'system',
        },
        {
          id: '3',
          name: 'Massage',
          description: 'Các dịch vụ massage thư giãn và trị liệu',
          color: '#8B5CF6',
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          createdBy: 'system',
        },
        {
          id: '4',
          name: 'Sản phẩm chăm sóc da',
          description: 'Mỹ phẩm và sản phẩm chăm sóc da',
          color: '#10B981',
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          createdBy: 'system',
        },
        {
          id: '5',
          name: 'Liệu trình trị liệu',
          description: 'Các gói liệu trình dài hạn',
          color: '#3B82F6',
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          createdBy: 'system',
        },
      ],
      suppliers: [
        {
          id: 'sup-1',
          name: 'Công ty TNHH Mỹ phẩm Sài Gòn',
          contactPerson: 'Nguyễn Văn A',
          phone: '0901234567',
          email: 'contact@myphamsg.com',
          address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
          taxCode: '0123456789',
          notes: 'Nhà cung cấp mỹ phẩm chính',
          isActive: true,
          createdAt: '2024-01-15T08:00:00.000Z',
          createdBy: 'admin',
        },
        {
          id: 'sup-2',
          name: 'Công ty CP Thiết bị Spa Việt',
          contactPerson: 'Trần Thị B',
          phone: '0909876543',
          email: 'sales@spaviet.vn',
          address: '456 Lê Lợi, Quận 3, TP.HCM',
          taxCode: '0987654321',
          notes: 'Cung cấp thiết bị spa, giường massage',
          isActive: true,
          createdAt: '2024-01-20T09:30:00.000Z',
          createdBy: 'admin',
        },
        {
          id: 'sup-3',
          name: 'Nhà Phân Phối Dermalogica Việt Nam',
          contactPerson: 'Lê Văn C',
          phone: '0912345678',
          email: 'info@dermalogica.vn',
          address: '789 Trần Hưng Đạo, Quận 5, TP.HCM',
          taxCode: '0369258147',
          notes: 'Thương hiệu mỹ phẩm cao cấp',
          isActive: true,
          createdAt: '2024-02-01T10:00:00.000Z',
          createdBy: 'admin',
        },
        {
          id: 'sup-4',
          name: 'Công ty TNHH Tinh Dầu Thiên Nhiên',
          contactPerson: 'Phạm Thị D',
          phone: '0923456789',
          email: 'sale@tinhdau.com.vn',
          address: '321 Nguyễn Trãi, Quận 1, TP.HCM',
          taxCode: '0147258369',
          notes: 'Chuyên cung cấp tinh dầu thiên nhiên',
          isActive: true,
          createdAt: '2024-02-10T11:15:00.000Z',
          createdBy: 'admin',
        },
        {
          id: 'sup-5',
          name: 'Công ty CP Dược Mỹ Phẩm An Khang',
          contactPerson: 'Hoàng Văn E',
          phone: '0934567890',
          email: 'ankhangspa@gmail.com',
          address: '654 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM',
          taxCode: '0258369147',
          notes: 'Sản phẩm chăm sóc da chuyên nghiệp',
          isActive: true,
          createdAt: '2024-02-15T14:20:00.000Z',
          createdBy: 'admin',
        },
        {
          id: 'sup-6',
          name: 'Nhà Máy Khăn Spa Hồng Phát',
          contactPerson: 'Vũ Thị F',
          phone: '0945678901',
          email: 'hongphat.towel@outlook.com',
          address: '987 Quang Trung, Quận Gò Vấp, TP.HCM',
          taxCode: '0753951842',
          notes: 'Cung cấp khăn spa, áo choàng',
          isActive: true,
          createdAt: '2024-02-20T15:45:00.000Z',
          createdBy: 'admin',
        },
        {
          id: 'sup-7',
          name: 'Công ty TNHH Nến Thơm Luxury',
          contactPerson: 'Đặng Văn G',
          phone: '0956789012',
          email: 'luxurycandle@yahoo.com',
          address: '147 Võ Văn Tần, Quận 3, TP.HCM',
          taxCode: '0159753486',
          notes: 'Nến thơm, tinh dầu khuếch tán',
          isActive: true,
          createdAt: '2024-03-01T08:30:00.000Z',
          createdBy: 'admin',
        },
        {
          id: 'sup-8',
          name: 'Công ty CP Hóa Chất Spa Pro',
          contactPerson: 'Bùi Thị H',
          phone: '0967890123',
          email: 'spapro@hotmail.com',
          address: '258 Cách Mạng Tháng 8, Quận 10, TP.HCM',
          taxCode: '0357159846',
          isActive: false,
          notes: 'Tạm ngưng hợp tác do chất lượng không đảm bảo',
          createdAt: '2024-03-10T09:00:00.000Z',
          createdBy: 'admin',
        },
        {
          id: 'sup-9',
          name: 'Nhà Cung Cấp Mặt Nạ Korea Beauty',
          contactPerson: 'Kim Min Seo',
          phone: '0978901234',
          email: 'koreabeauty@naver.com',
          address: '369 Nguyễn Đình Chiểu, Quận 3, TP.HCM',
          taxCode: '0852741963',
          notes: 'Nhập khẩu mặt nạ Hàn Quốc chính hãng',
          isActive: true,
          createdAt: '2024-03-15T10:30:00.000Z',
          createdBy: 'admin',
        },
        {
          id: 'sup-10',
          name: 'Công ty TNHH Đồng Phục Spa Elite',
          contactPerson: 'Ngô Văn I',
          phone: '0989012345',
          email: 'elite.uniform@gmail.com',
          address: '741 Lý Thường Kiệt, Quận 11, TP.HCM',
          taxCode: '0654987321',
          notes: 'May đo đồng phục nhân viên spa',
          isActive: true,
          createdAt: '2024-03-20T13:00:00.000Z',
          createdBy: 'admin',
        },
      ],
      customerGroups: [
        {
          id: '1',
          name: 'Khách hàng thường',
          description: 'Khách hàng mua sản phẩm/dịch vụ thông thường',
          color: '#6B7280',
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          createdBy: 'system',
        },
        {
          id: '2',
          name: 'Khách hàng VIP',
          description: 'Khách hàng có tổng chi tiêu từ 5 triệu trở lên',
          color: '#F59E0B',
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          createdBy: 'system',
        },
        {
          id: '3',
          name: 'Bạn bè/Người quen',
          description: 'Bạn bè hoặc người quen của chủ spa',
          color: '#3B82F6',
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          createdBy: 'system',
        },
        {
          id: '4',
          name: 'Nhân viên',
          description: 'Nhân viên spa được hưởng ưu đãi đặc biệt',
          color: '#10B981',
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          createdBy: 'system',
        },
      ],
      language: 'vi',
      shifts: [],
      currentShift: null,
      heldBills: [],
      recentProducts: [],
      favoriteProducts: [],
      isOnline: false,
      pendingSyncCount: 0,
      customers: [
        {
          id: 'CUST-0987654321',
          name: 'Trần Minh Anh',
          phone: '0987654321',
          email: 'minhanh@email.com',
          address: '789 Nguyễn Trãi, Q.5, TP.HCM',
          dateOfBirth: '1992-03-10',
          gender: 'female' as const,
          customerGroupId: '2', // VIP
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
          customerGroupId: '2', // VIP
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
          customerGroupId: '1', // Thường xuyên
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
          customerGroupId: '2', // VIP
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
          customerGroupId: '3', // Bạn bè
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
          customerGroupId: '1', // Thường xuyên
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
          customerGroupId: '1', // Thường xuyên
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
          customerGroupId: '2', // VIP
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
          customerGroupId: '4', // Nhân viên
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
          customerGroupId: '1', // Thường xuyên
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
          customerGroupId: '3', // Bạn bè
          notes: 'Bạn của quản lý',
          totalSpent: 6500000,
          orderCount: 14,
          createdAt: '2024-08-25T12:00:00.000Z',
          updatedAt: '2025-01-07T16:20:00.000Z',
        },
      ],
      users: [
        {
          id: '1',
          username: 'admin',
          password: 'admin123',
          fullName: 'Nguyễn Văn A',
          email: 'admin@example.com',
          phone: '0901234567',
          roleGroupId: '1',
          avatar: 'https://via.placeholder.com/150',
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          lastLogin: '2024-01-01T00:00:00.000Z',
          createdBy: 'system',
          notes: 'Quản trị viên hệ thống',
        },
        {
          id: '2',
          username: 'cashier',
          password: 'cashier123',
          fullName: 'Nguyễn Thị B',
          email: 'cashier@example.com',
          phone: '0912345678',
          roleGroupId: '2',
          avatar: 'https://via.placeholder.com/150',
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          lastLogin: '2024-01-01T00:00:00.000Z',
          createdBy: 'system',
          notes: 'Thu ngân chính',
        },
        {
          id: '3',
          username: 'technician',
          password: 'technician123',
          fullName: 'Nguyễn Văn C',
          email: 'technician@example.com',
          phone: '0923456789',
          roleGroupId: '3',
          avatar: 'https://via.placeholder.com/150',
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          lastLogin: '2024-01-01T00:00:00.000Z',
          createdBy: 'system',
          notes: 'Kỹ thuật viên chính',
        },
        {
          id: '4',
          username: 'technician2',
          password: 'tech123',
          fullName: 'Trần Thị D',
          email: 'tranthid@example.com',
          phone: '0934567890',
          roleGroupId: '3',
          avatar: 'https://via.placeholder.com/150',
          isActive: true,
          createdAt: '2024-01-15T00:00:00.000Z',
          lastLogin: '2024-01-15T00:00:00.000Z',
          createdBy: 'admin',
          notes: 'Kỹ thuật viên spa, chuyên chăm sóc da',
        },
        {
          id: '5',
          username: 'technician3',
          password: 'tech123',
          fullName: 'Lê Văn E',
          email: 'levane@example.com',
          phone: '0945678901',
          roleGroupId: '3',
          avatar: 'https://via.placeholder.com/150',
          isActive: true,
          createdAt: '2024-02-01T00:00:00.000Z',
          lastLogin: '2024-02-01T00:00:00.000Z',
          createdBy: 'admin',
          notes: 'Kỹ thuật viên massage',
        },
        {
          id: '6',
          username: 'technician4',
          password: 'tech123',
          fullName: 'Phạm Thị F',
          email: 'phamthif@example.com',
          phone: '0956789012',
          roleGroupId: '3',
          avatar: 'https://via.placeholder.com/150',
          isActive: true,
          createdAt: '2024-02-15T00:00:00.000Z',
          lastLogin: '2024-02-15T00:00:00.000Z',
          createdBy: 'admin',
          notes: 'Kỹ thuật viên nail & spa',
        },
        {
          id: '7',
          username: 'technician5',
          password: 'tech123',
          fullName: 'Hoàng Văn G',
          email: 'hoangvang@example.com',
          phone: '0967890123',
          roleGroupId: '3',
          avatar: 'https://via.placeholder.com/150',
          isActive: true,
          createdAt: '2024-03-01T00:00:00.000Z',
          lastLogin: '2024-03-01T00:00:00.000Z',
          createdBy: 'admin',
          notes: 'Kỹ thuật viên liệu trình',
        },
        {
          id: '8',
          username: 'cashier2',
          password: 'cashier123',
          fullName: 'Đặng Thị H',
          email: 'dangthih@example.com',
          phone: '0978901234',
          roleGroupId: '2',
          avatar: 'https://via.placeholder.com/150',
          isActive: true,
          createdAt: '2024-03-15T00:00:00.000Z',
          lastLogin: '2024-03-15T00:00:00.000Z',
          createdBy: 'admin',
          notes: 'Thu ngân ca chiều',
        },
        {
          id: '9',
          username: 'technician6',
          password: 'tech123',
          fullName: 'Võ Thị I',
          email: 'vothii@example.com',
          phone: '0989012345',
          roleGroupId: '3',
          avatar: 'https://via.placeholder.com/150',
          isActive: true,
          createdAt: '2024-03-20T00:00:00.000Z',
          lastLogin: '2024-03-20T00:00:00.000Z',
          createdBy: 'admin',
          notes: 'Kỹ thuật viên chăm sóc da cao cấp',
        },
        {
          id: '10',
          username: 'technician7',
          password: 'tech123',
          fullName: 'Ngô Văn K',
          email: 'ngovank@example.com',
          phone: '0990123456',
          roleGroupId: '3',
          avatar: 'https://via.placeholder.com/150',
          isActive: true,
          createdAt: '2024-04-01T00:00:00.000Z',
          lastLogin: '2024-04-01T00:00:00.000Z',
          createdBy: 'admin',
          notes: 'Kỹ thuật viên massage trị liệu',
        },
        {
          id: '11',
          username: 'technician8',
          password: 'tech123',
          fullName: 'Lý Thị L',
          email: 'lythil@example.com',
          phone: '0901234568',
          roleGroupId: '3',
          avatar: 'https://via.placeholder.com/150',
          isActive: true,
          createdAt: '2024-04-10T00:00:00.000Z',
          lastLogin: '2024-04-10T00:00:00.000Z',
          createdBy: 'admin',
          notes: 'Kỹ thuật viên waxing & threading',
        },
        {
          id: '12',
          username: 'technician9',
          password: 'tech123',
          fullName: 'Dương Văn M',
          email: 'duongvanm@example.com',
          phone: '0912345679',
          roleGroupId: '3',
          avatar: 'https://via.placeholder.com/150',
          isActive: true,
          createdAt: '2024-04-20T00:00:00.000Z',
          lastLogin: '2024-04-20T00:00:00.000Z',
          createdBy: 'admin',
          notes: 'Kỹ thuật viên tắm trắng',
        },
        {
          id: '13',
          username: 'technician10',
          password: 'tech123',
          fullName: 'Mai Thị N',
          email: 'maithin@example.com',
          phone: '0923456780',
          roleGroupId: '3',
          avatar: 'https://via.placeholder.com/150',
          isActive: true,
          createdAt: '2024-05-01T00:00:00.000Z',
          lastLogin: '2024-05-01T00:00:00.000Z',
          createdBy: 'admin',
          notes: 'Kỹ thuật viên làm đẹp tổng hợp',
        },
        {
          id: '14',
          username: 'technician11',
          password: 'tech123',
          fullName: 'Trương Văn O',
          email: 'truongvano@example.com',
          phone: '0934567891',
          roleGroupId: '3',
          avatar: 'https://via.placeholder.com/150',
          isActive: true,
          createdAt: '2024-05-10T00:00:00.000Z',
          lastLogin: '2024-05-10T00:00:00.000Z',
          createdBy: 'admin',
          notes: 'Kỹ thuật viên phun xăm thẩm mỹ',
        },
        {
          id: '15',
          username: 'technician12',
          password: 'tech123',
          fullName: 'Hồ Thị P',
          email: 'hothip@example.com',
          phone: '0945678902',
          roleGroupId: '3',
          avatar: 'https://via.placeholder.com/150',
          isActive: true,
          createdAt: '2024-05-20T00:00:00.000Z',
          lastLogin: '2024-05-20T00:00:00.000Z',
          createdBy: 'admin',
          notes: 'Kỹ thuật viên làm móng cao cấp',
        },
        {
          id: '16',
          username: 'technician13',
          password: 'tech123',
          fullName: 'Phan Văn Q',
          email: 'phanvanq@example.com',
          phone: '0956789013',
          roleGroupId: '3',
          avatar: 'https://via.placeholder.com/150',
          isActive: true,
          createdAt: '2024-06-01T00:00:00.000Z',
          lastLogin: '2024-06-01T00:00:00.000Z',
          createdBy: 'admin',
          notes: 'Kỹ thuật viên cấy mi - nối mi',
        },
        {
          id: '17',
          username: 'technician14',
          password: 'tech123',
          fullName: 'Lâm Thị R',
          email: 'lamthir@example.com',
          phone: '0967890124',
          roleGroupId: '3',
          avatar: 'https://via.placeholder.com/150',
          isActive: true,
          createdAt: '2024-06-10T00:00:00.000Z',
          lastLogin: '2024-06-10T00:00:00.000Z',
          createdBy: 'admin',
          notes: 'Kỹ thuật viên triệt lông công nghệ cao',
        },
        {
          id: '18',
          username: 'technician15',
          password: 'tech123',
          fullName: 'Tô Văn S',
          email: 'tovans@example.com',
          phone: '0978901235',
          roleGroupId: '3',
          avatar: 'https://via.placeholder.com/150',
          isActive: true,
          createdAt: '2024-06-20T00:00:00.000Z',
          lastLogin: '2024-06-20T00:00:00.000Z',
          createdBy: 'admin',
          notes: 'Kỹ thuật viên giảm béo công nghệ',
        },
      ],
      currentUser: null,
      appointments: [
        {
          id: 'apt-001',
          code: 'LH000001',
          customerId: '1',
          customerName: 'Nguyễn Thị Lan Anh',
          customerPhone: '0901234567',
          appointmentDate: '2026-01-18',
          startTime: '09:00',
          endTime: '10:30',
          services: [
            {
              productId: '5',
              productName: 'Massage body 90 phút',
              productType: 'service',
              duration: 90,
              price: 200000,
            },
          ],
          technicianId: '',
          technicianName: '',
          status: 'pending',
          notes: '',
          createdAt: '2026-01-10T08:00:00.000Z',
          createdBy: 'admin',
          updatedAt: '2026-01-12T10:30:00.000Z',
        },
        {
          id: 'apt-002',
          code: 'LH000002',
          customerId: '2',
          customerName: 'Trần Văn Hùng',
          customerPhone: '0923456789',
          appointmentDate: '2026-01-16',
          startTime: '11:00',
          endTime: '12:00',
          services: [
            {
              productId: '4',
              productName: 'Chăm sóc da mặt cơ bản',
              productType: 'service',
              duration: 60,
              price: 350000,
            },
          ],
          technicianId: '3',
          technicianName: 'Nguyễn Văn C',
          status: 'pending',
          notes: '',
          createdAt: '2026-01-11T09:15:00.000Z',
          createdBy: 'cashier',
        },
        {
          id: 'apt-003',
          code: 'LH000003',
          customerId: '3',
          customerName: 'Lê Thị Mai',
          customerPhone: '0934567890',
          appointmentDate: '2026-01-16',
          startTime: '14:00',
          endTime: '15:30',
          services: [
            {
              productId: '6',
              productName: 'Liệu trình giảm béo',
              productType: 'treatment',
              duration: 90,
              price: 2500000,
              sessionNumber: 1,
              maxSessions: 10,
            },
          ],
          technicianId: '3',
          technicianName: 'Nguyễn Văn C',
          status: 'in-progress',
          notes: 'Buổi 1/10',
          createdAt: '2026-01-09T14:20:00.000Z',
          createdBy: 'admin',
          updatedAt: '2026-01-10T11:00:00.000Z',
        },
        {
          id: 'apt-004',
          code: 'LH000004',
          customerId: '4',
          customerName: 'Phạm Minh Tuấn',
          customerPhone: '0945678901',
          appointmentDate: '2026-01-17',
          startTime: '10:00',
          endTime: '11:30',
          services: [
            {
              productId: '5',
              productName: 'Massage body',
              productType: 'service',
              duration: 90,
              price: 200000,
            },
          ],
          technicianId: '3',
          technicianName: 'Nguyễn Văn C',
          status: 'pending',
          notes: '',
          createdAt: '2026-01-13T16:45:00.000Z',
          createdBy: 'cashier',
        },
        {
          id: 'apt-005',
          code: 'LH000005',
          customerId: '5',
          customerName: 'Hoàng Thị Hồng',
          customerPhone: '0956789012',
          appointmentDate: '2026-01-17',
          startTime: '15:00',
          endTime: '16:00',
          services: [
            {
              productId: '4',
              productName: 'Chăm sóc da mặt cơ bản',
              productType: 'service',
              duration: 60,
              price: 350000,
            },
          ],
          technicianId: '3',
          technicianName: 'Nguyễn Văn C',
          status: 'pending',
          notes: '',
          createdAt: '2026-01-14T11:30:00.000Z',
          createdBy: 'admin',
        },
        {
          id: 'apt-006',
          code: 'LH000006',
          customerId: '1',
          customerName: 'Nguyễn Thị Lan Anh',
          customerPhone: '0901234567',
          appointmentDate: '2026-01-15',
          startTime: '09:30',
          endTime: '11:00',
          services: [
            {
              productId: '5',
              productName: 'Massage body 90 phút',
              productType: 'service',
              duration: 90,
              price: 200000,
            },
          ],
          technicianId: '',
          technicianName: '',
          status: 'completed',
          notes: '',
          createdAt: '2026-01-08T10:00:00.000Z',
          createdBy: 'admin',
          updatedAt: '2026-01-15T11:00:00.000Z',
        },
        {
          id: 'apt-007',
          code: 'LH000007',
          customerId: '6',
          customerName: 'Vũ Văn Tâm',
          customerPhone: '0967890123',
          appointmentDate: '2026-01-14',
          startTime: '14:00',
          endTime: '14:30',
          services: [
            {
              productId: '4',
              productName: 'Chăm sóc da mặt cơ bản',
              productType: 'service',
              duration: 30,
              price: 350000,
            },
          ],
          technicianId: '3',
          technicianName: 'Nguyễn Văn C',
          status: 'cancelled',
          notes: 'Khách hủy lịch',
          createdAt: '2026-01-07T09:00:00.000Z',
          createdBy: 'cashier',
          updatedAt: '2026-01-14T14:35:00.000Z',
        },
        {
          id: 'apt-008',
          code: 'LH000008',
          customerId: '2',
          customerName: 'Trần Văn Hùng',
          customerPhone: '0923456789',
          appointmentDate: '2026-01-18',
          startTime: '09:00',
          endTime: '10:30',
          services: [
            {
              productId: '6',
              productName: 'Liệu trình giảm béo',
              productType: 'treatment',
              duration: 90,
              price: 2500000,
              sessionNumber: 2,
              maxSessions: 10,
            },
          ],
          technicianId: '3',
          technicianName: 'Nguyễn Văn C',
          status: 'pending',
          notes: 'Buổi 2/10',
          createdAt: '2026-01-10T15:00:00.000Z',
          createdBy: 'admin',
        },
        {
          id: 'apt-009',
          code: 'LH000009',
          customerId: '7',
          customerName: 'Trần Minh Quân',
          customerPhone: '0912345678',
          appointmentDate: '2026-01-17',
          startTime: '09:00',
          endTime: '10:00',
          services: [
            {
              productId: '5',
              productName: 'Massage body 60 phút',
              productType: 'service',
              duration: 60,
              price: 200000,
            },
          ],
          technicianId: '',
          technicianName: '',
          status: 'pending',
          notes: '',
          createdAt: '2026-01-12T14:20:00.000Z',
          createdBy: 'cashier',
        },
        {
          id: 'apt-010',
          code: 'LH000010',
          customerId: '1',
          customerName: 'Nguyễn Thị Lan Anh',
          customerPhone: '0901234567',
          appointmentDate: '2026-01-17',
          startTime: '09:00',
          endTime: '10:30',
          services: [
            {
              productId: '5',
              productName: 'Massage body 90 phút',
              productType: 'service',
              duration: 90,
              price: 200000,
            },
          ],
          technicianId: '',
          technicianName: '',
          status: 'pending',
          notes: '',
          createdAt: '2026-01-13T10:15:00.000Z',
          createdBy: 'admin',
        },
      ],
      settings: {
        enableTip: false,
        defaultTipPercent: 10,
        taxRate: 10,
        currencySymbol: 'VNĐ',
        receiptFooter: 'Cảm ơn bạn đã đến với chúng tôi!',
        lowStockThreshold: 10,
      },
      sidebarCollapsed: false,
      tables: [],
      selfServiceOrders: [],
      currentTable: null,
      beds: [
        {
          id: 'bed-1',
          name: 'Giường 01',
          status: 'active',
          notes: 'Phòng VIP 1 - Giường massage cao cấp',
          createdAt: '2024-01-10T08:00:00.000Z',
          updatedAt: '2024-01-10T08:00:00.000Z',
        },
        {
          id: 'bed-2',
          name: 'Giường 02',
          status: 'active',
          notes: 'Phòng VIP 1 - Giường massage cao cấp',
          createdAt: '2024-01-10T08:05:00.000Z',
          updatedAt: '2024-01-10T08:05:00.000Z',
        },
        {
          id: 'bed-3',
          name: 'Giường 03',
          status: 'active',
          notes: 'Phòng VIP 2 - Giường massage điều chỉnh tự động',
          createdAt: '2024-01-10T08:10:00.000Z',
          updatedAt: '2024-01-10T08:10:00.000Z',
        },
        {
          id: 'bed-4',
          name: 'Giường 04',
          status: 'active',
          notes: 'Phòng VIP 2 - Giường massage điều chỉnh tự động',
          createdAt: '2024-01-10T08:15:00.000Z',
          updatedAt: '2024-01-10T08:15:00.000Z',
        },
        {
          id: 'bed-5',
          name: 'Giường 05',
          status: 'active',
          notes: 'Khu chăm sóc da mặt',
          createdAt: '2024-01-10T08:20:00.000Z',
          updatedAt: '2024-01-10T08:20:00.000Z',
        },
        {
          id: 'bed-6',
          name: 'Giường 06',
          status: 'active',
          notes: 'Khu chăm sóc da mặt',
          createdAt: '2024-01-10T08:25:00.000Z',
          updatedAt: '2024-01-10T08:25:00.000Z',
        },
        {
          id: 'bed-7',
          name: 'Giường 07',
          status: 'active',
          notes: 'Khu massage body',
          createdAt: '2024-01-10T08:30:00.000Z',
          updatedAt: '2024-01-10T08:30:00.000Z',
        },
        {
          id: 'bed-8',
          name: 'Giường 08',
          status: 'active',
          notes: 'Khu massage body',
          createdAt: '2024-01-10T08:35:00.000Z',
          updatedAt: '2024-01-10T08:35:00.000Z',
        },
        {
          id: 'bed-9',
          name: 'Giường 09',
          status: 'inactive',
          notes: 'Đang bảo trì - Cần thay vỏ bọc',
          createdAt: '2024-01-10T08:40:00.000Z',
          updatedAt: '2024-01-25T14:30:00.000Z',
        },
        {
          id: 'bed-10',
          name: 'Giường 10',
          status: 'active',
          notes: 'Khu massage foot',
          createdAt: '2024-01-10T08:45:00.000Z',
          updatedAt: '2024-01-10T08:45:00.000Z',
        },
      ],
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
        const id = Date.now().toString();
        set((state) => ({
          products: [...state.products, { ...product, id }],
        }));
      },
      
      updateProduct: (id, updates) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },
      
      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
      },
      
      addToCart: (product) => {
        set((state) => {
          const existing = state.cart.find((item) => item.id === product.id);
          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return {
            cart: [...state.cart, { ...product, quantity: 1, discount: 0 }],
          };
        });
      },
      
      removeFromCart: (productId) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== productId),
        }));
      },
      
      updateCartQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        }));
      },
      
      updateCartDiscount: (productId, discount) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === productId ? { ...item, discount } : item
          ),
        })),
      
      updateCartNote: (productId, note) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === productId ? { ...item, note } : item
          ),
        })),
      
      clearCart: () => {
        set({ cart: [] });
      },
      
      createOrder: (orderData) => {
        const {
          discount: orderLevelDiscount = 0,
          timestamp: orderTimestamp,
          date: orderDate,
          ...restOrderData
        } = orderData;
        const { cart, currentShift, currentUser, orders } = get();
        const subtotal = cart.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        const totalDiscount = cart.reduce(
          (sum, item) => sum + (item.discount * item.quantity),
          0
        ) + orderLevelDiscount;
        const total = subtotal - totalDiscount;
        
        // Get current user info from localStorage
        const currentUsername = localStorage.getItem('salepa_username') || 'System';
        
        // Ensure paymentHistory always exists with at least one initial record
        const initialPaymentHistory: PaymentHistory[] = orderData.paymentHistory || [{
          id: `PAY-${Date.now()}`,
          amount: orderData.receivedAmount || total,
          paymentMethod: orderData.paymentMethod || 'cash',
          paidAt: new Date().toISOString(),
          paidBy: currentUsername,
          note: orderData.note || '',
          changeAmount: orderData.changeAmount || ((orderData.receivedAmount || total) - total),
        }];
        
        const order: Order = {
          id: generateOrderId(orders),
          items: cart,
          subtotal,
          discount: totalDiscount,
          total,
          date: orderDate || new Date().toISOString(),
          timestamp: orderTimestamp || new Date().toISOString(),
          shiftId: currentShift?.id,
          status: 'pending',
          createdBy: currentUser?.fullName || currentUsername,
          ...restOrderData,
          paymentHistory: initialPaymentHistory, // Always ensure paymentHistory exists
        };
        
        console.log('🔍 Creating order with data:', orderData);
        console.log('📦 Final order object:', order);
        console.log('💳 PaymentMethod:', order.paymentMethod);
        console.log('📜 PaymentHistory:', order.paymentHistory);
        
        set((state) => {
          const newState: any = {
            orders: [order, ...state.orders],
            cart: [],
            products: state.products.map((p) => {
              const cartItem = cart.find((item) => item.id === p.id);
              if (cartItem) {
                return { ...p, stock: p.stock - cartItem.quantity };
              }
              return p;
            }),
            currentShift: state.currentShift ? {
              ...state.currentShift,
              totalOrders: state.currentShift.totalOrders + 1,
              totalRevenue: state.currentShift.totalRevenue + total,
            } : null,
          };
          
          // Auto-create or update customer if customerPhone is provided
          if (orderData.customerPhone && orderData.customerName) {
            const existingCustomer = state.customers.find(
              (c: Customer) => c.phone === orderData.customerPhone
            );
            
            if (!existingCustomer) {
              // Create new customer
              const newCustomer: Customer = {
                id: `CUST-${Date.now()}`,
                name: orderData.customerName,
                phone: orderData.customerPhone,
                email: '',
                customerGroupId: '1', // Default: Thường xuyên
                createdAt: new Date().toISOString(),
                address: '',
                notes: '',
              };
              newState.customers = [newCustomer, ...state.customers];
            }
          }
          
          // 🆕 AUTO-CREATE TREATMENT PACKAGES when treatment products are purchased
          const treatmentItems = cart.filter(item => item.productType === 'treatment');
          
          if (treatmentItems.length > 0 && orderData.customerPhone && orderData.customerName) {
            console.log('🎯 Found treatment items in cart:', treatmentItems);
            
            // Find or get customer ID
            let customerId = state.customers.find(c => c.phone === orderData.customerPhone)?.id;
            if (!customerId && newState.customers) {
              customerId = newState.customers[0]?.id; // Use newly created customer
            }
            
            if (customerId) {
              const newPackages: CustomerTreatmentPackage[] = [];
              
              treatmentItems.forEach((item) => {
                // Get full product details to access sessionDetails
                const fullProduct = state.products.find(p => p.id === item.id);
                
                if (fullProduct && fullProduct.sessions) {
                  // Create sessions array from sessionDetails if available
                  let sessions: TreatmentPackageSession[] = [];
                  
                  if (fullProduct.sessionDetails && fullProduct.sessionDetails.length > 0) {
                    // Convert old sessionDetails format to new TreatmentPackageSession format
                    sessions = fullProduct.sessionDetails.map((detail) => {
                      const sessionItems: TreatmentPackageSessionItem[] = [];
                      
                      // Add products from session
                      detail.products?.forEach((prod) => {
                        const product = state.products.find(p => p.id === prod.id);
                        if (product) {
                          sessionItems.push({
                            productId: prod.id,
                            productName: product.name,
                            productType: 'product',
                            quantity: prod.quantity,
                          });
                        }
                      });
                      
                      // Add services from session
                      detail.services?.forEach((serv) => {
                        const service = state.products.find(p => p.id === serv.id);
                        if (service) {
                          sessionItems.push({
                            productId: serv.id,
                            productName: service.name,
                            productType: 'service',
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
                    });
                  } else {
                    // No sessionDetails, create basic sessions
                    sessions = Array.from({ length: fullProduct.sessions }, (_, i) => ({
                      sessionNumber: i + 1,
                      sessionName: `Buổi ${i + 1}`,
                      items: [{
                        productId: fullProduct.id,
                        productName: fullProduct.name,
                        productType: 'service',
                        quantity: 1,
                        duration: fullProduct.duration,
                      }],
                    }));
                  }
                  
                  // Create treatment package for each quantity
                  for (let i = 0; i < item.quantity; i++) {
                    const packageId = `PKG-${Date.now()}-${i}`;
                    const newPackage: CustomerTreatmentPackage = {
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
                    console.log('✅ Created treatment package:', newPackage);
                  }
                }
              });
              
              if (newPackages.length > 0) {
                newState.customerTreatmentPackages = [
                  ...newPackages,
                  ...(state.customerTreatmentPackages || []),
                ];
                console.log(`🎉 Auto-created ${newPackages.length} treatment package(s) for customer ${orderData.customerName}`);
              }
            } else {
              console.warn('⚠️ Cannot create treatment package: customer ID not found');
            }
          }
          
          return newState;
        });
        
        return order;
      },
      
      updateOrder: (orderId, updates) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, ...updates } : order
          ),
        }));
      },
      
      deleteOrder: (orderId) => {
        set((state) => ({
          orders: state.orders.filter((order) => order.id !== orderId),
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
          productCategories: [...state.productCategories, newCategory],
        }));
      },
      
      updateProductCategory: (id, category) => {
        set((state) => ({
          productCategories: state.productCategories.map((c) =>
            c.id === id ? { ...c, ...category, updatedAt: new Date().toISOString() } : c
          ),
        }));
      },
      
      deleteProductCategory: (id) => {
        set((state) => ({
          productCategories: state.productCategories.filter((c) => c.id !== id),
        }));
      },
      
      toggleProductCategoryStatus: (id) => {
        set((state) => ({
          productCategories: state.productCategories.map((c) =>
            c.id === id ? { ...c, isActive: !c.isActive, updatedAt: new Date().toISOString() } : c
          ),
        }));
      },
      
      // Supplier actions
      addSupplier: (supplier) => {
        const id = Date.now().toString();
        const newSupplier: Supplier = {
          ...supplier,
          id,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          suppliers: [...state.suppliers, newSupplier],
        }));
      },
      
      updateSupplier: (id, supplier) => {
        set((state) => ({
          suppliers: state.suppliers.map((s) =>
            s.id === id ? { ...s, ...supplier, updatedAt: new Date().toISOString() } : s
          ),
        }));
      },
      
      deleteSupplier: (id) => {
        set((state) => ({
          suppliers: state.suppliers.filter((s) => s.id !== id),
        }));
      },
      
      toggleSupplierStatus: (id) => {
        set((state) => ({
          suppliers: state.suppliers.map((s) =>
            s.id === id ? { ...s, isActive: !s.isActive, updatedAt: new Date().toISOString() } : s
          ),
        }));
      },
      
      // Customer Group actions
      addCustomerGroup: (group) => {
        const id = Date.now().toString();
        const newGroup: CustomerGroup = {
          ...group,
          id,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          customerGroups: [...state.customerGroups, newGroup],
        }));
      },
      
      updateCustomerGroup: (id, group) => {
        set((state) => ({
          customerGroups: state.customerGroups.map((g) =>
            g.id === id ? { ...g, ...group, updatedAt: new Date().toISOString() } : g
          ),
        }));
      },
      
      deleteCustomerGroup: (id) => {
        set((state) => ({
          customerGroups: state.customerGroups.filter((g) => g.id !== id),
        }));
      },
      
      toggleCustomerGroupStatus: (id) => {
        set((state) => ({
          customerGroups: state.customerGroups.map((g) =>
            g.id === id ? { ...g, isActive: !g.isActive, updatedAt: new Date().toISOString() } : g
          ),
        }));
      },
      
      setLanguage: (language) => {
        set({ language });
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
          status: 'open',
        };
        set((state) => ({
          currentShift: shift,
          shifts: [shift, ...state.shifts],
        }));
      },
      
      closeShift: (closingCash, closedBy, note) => {
        const { currentShift } = get();
        if (!currentShift) return;
        
        const expectedCash = currentShift.openingCash + currentShift.totalRevenue;
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
          status: 'closed',
        };
        
        set((state) => ({
          currentShift: null,
          shifts: state.shifts.map((s) =>
            s.id === currentShift.id ? closedShift : s
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
          heldBills: state.heldBills.filter((b) => b.id !== billId),
        }));
      },
      
      deleteHeldBill: (billId) =>
        set((state) => ({
          heldBills: state.heldBills.filter((bill) => bill.id !== billId),
        })),
      
      addToRecent: (productId) => {
        set((state) => {
          const product = state.products.find((p) => p.id === productId);
          if (!product) return state;
          
          return {
            recentProducts: [
              product,
              ...state.recentProducts.filter((p) => p.id !== productId),
            ].slice(0, 10), // Keep only last 10
          };
        });
      },
      
      toggleFavorite: (productId) => {
        set((state) => {
          const product = state.products.find((p) => p.id === productId);
          if (!product) return state;
          
          const isFavorite = state.favoriteProducts.some((p) => p.id === productId);
          
          return {
            favoriteProducts: isFavorite
              ? state.favoriteProducts.filter((p) => p.id !== productId)
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
        if (typeof window !== 'undefined') {
          localStorage.clear();
        }
        set({
          products: initialProducts,
          orders: [],
          cart: [],
          language: 'vi',
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
            currencySymbol: 'VNĐ',
            receiptFooter: 'Cảm ơn bạn đã đến với chúng tôi!',
            lowStockThreshold: 10,
          },
          sidebarCollapsed: false,
          tables: [],
          selfServiceOrders: [],
          currentTable: null,
          beds: [],
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
        const {
          discount: orderLevelDiscount = 0,
          timestamp: orderTimestamp,
          date: orderDate,
          ...restOrderData
        } = orderData;
        const { cart, currentShift, selfServiceOrders } = get();
        const subtotal = cart.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        const totalDiscount = cart.reduce(
          (sum, item) => sum + (item.discount * item.quantity),
          0
        ) + orderLevelDiscount;
        const total = subtotal - totalDiscount;
        
        const order: SelfServiceOrder = {
          id: generateOrderId(selfServiceOrders),
          items: cart,
          subtotal,
          discount: totalDiscount,
          total,
          date: orderDate || new Date().toISOString(),
          timestamp: orderTimestamp || new Date().toISOString(),
          shiftId: currentShift?.id,
          ...restOrderData,
        };
        
        set((state) => ({
          selfServiceOrders: [order, ...state.selfServiceOrders],
          cart: [],
          products: state.products.map((p) => {
            const cartItem = cart.find((item) => item.id === p.id);
            if (cartItem) {
              return { ...p, stock: p.stock - cartItem.quantity };
            }
            return p;
          }),
          currentShift: state.currentShift ? {
            ...state.currentShift,
            totalOrders: state.currentShift.totalOrders + 1,
            totalRevenue: state.currentShift.totalRevenue + total,
          } : null,
        }));
      },
      
      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          selfServiceOrders: state.selfServiceOrders.map((order) =>
            order.id === orderId ? { ...order, status } : order
          ),
        }));
      },
      
      addMessageToOrder: (orderId, message) => {
        set((state) => ({
          selfServiceOrders: state.selfServiceOrders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  messages: [
                    ...(order.messages || []),
                    { ...message, id: Date.now().toString(), timestamp: new Date().toISOString() },
                  ],
                }
              : order
          ),
        }));
      },
      
      // Industry selection
      loadIndustryData: (industry) => {
        const data = getIndustryData(industry);
        // Convert products and add predictable IDs based on index
        const productsWithIds = data.products.map((p, index) => {
          // Generate predictable ID based on industry and index
          let prefix = 'prod';
          if (p.productType === 'service') prefix = 'serv';
          if (p.productType === 'treatment') prefix = 'treat';
          
          return {
            ...p,
            id: `${industry}-${prefix}-${String(index + 1).padStart(2, '0')}`,
          };
        });
        set({ 
          products: productsWithIds, 
          categories: data.categories,
          selectedIndustry: industry,
          hasSelectedIndustry: true,
        });
      },
      
      // Onboarding & Role actions
      setHasSeenOnboarding: (value: boolean) => {
        set({ hasSeenOnboarding: value });
      },
      
      setCurrentRole: (role: 'admin' | 'cashier' | 'technician' | null) => {
        set({ currentRole: role });
      },
      
      // Customer actions
      addCustomer: (customer) => {
        const id = Date.now().toString();
        set((state) => ({
          customers: [...state.customers, { ...customer, id, totalSpent: 0, orderCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
        }));
      },
      
      updateCustomer: (id, customer) => {
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === id ? { ...c, ...customer, updatedAt: new Date().toISOString() } : c
          ),
        }));
      },
      
      deleteCustomer: (id) => {
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== id),
        }));
      },
      
      getCustomerOrders: (customerId) => {
        const { orders } = get();
        return orders.filter((order) => order.customerPhone === customerId);
      },
      
      // User actions
      createUser: (userData) => {
        const id = Date.now().toString();
        set((state) => ({
          users: [...state.users, { ...userData, id, createdAt: new Date().toISOString() }],
        }));
      },
      
      updateUser: (userId, updates) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, ...updates } : u
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
            u.id === userId ? { ...u, isActive: !u.isActive } : u
          ),
        }));
      },
      
      changeUserPassword: (userId, newPassword) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, password: newPassword } : u
          ),
        }));
      },
      
      login: (username, password) => {
        const { users } = get();
        const user = users.find((u) => u.username === username && u.password === password);
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
          const codeNum = parseInt(apt.code.replace('LH', ''));
          return codeNum > max ? codeNum : max;
        }, 0);
        const code = `LH${String(maxCode + 1).padStart(6, '0')}`;
        
        const newAppointment = { ...appointmentData, id, code, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        
        set((state) => ({
          appointments: [...state.appointments, newAppointment],
        }));
        
        // Create notifications for all technicians assigned to services
        const technicianIds = new Set<string>();
        appointmentData.services.forEach(s => {
          if (s.technicianIds && s.technicianIds.length > 0) {
            s.technicianIds.forEach(id => technicianIds.add(id));
          } else if (s.technicianId) {
            technicianIds.add(s.technicianId); // Backward compatibility
          }
        });
        
        technicianIds.forEach(techId => {
          const technician = get().users.find(u => u.id === techId);
          if (technician) {
            get().createNotification({
              userId: techId,
              appointmentId: id,
              appointmentCode: code,
              title: 'Lịch hẹn mới',
              message: `Bạn được gán vào lịch hẹn ${code} - ${appointmentData.customerName} vào ${appointmentData.appointmentDate} lúc ${appointmentData.startTime}`,
              type: 'new_appointment',
              isRead: false,
            });
          }
        });
      },
      
      updateAppointment: (appointmentId, updates) => {
        const oldAppointment = get().appointments.find(a => a.id === appointmentId);
        
        // ⭐ CHECK STATUS CHANGE: Handle package return when status changes to/from cancelled
        if (oldAppointment && updates.status && oldAppointment.status !== updates.status) {
          const oldStatus = oldAppointment.status;
          const newStatus = updates.status;
          
          console.log(`📝 Status change detected: ${oldStatus} → ${newStatus}`);
          
          // Khi status → cancelled: Hoàn lại dịch vụ
          if (oldStatus !== 'cancelled' && newStatus === 'cancelled') {
            console.log('❌ Cancelling appointment → Returning package services');
            
            oldAppointment.services.forEach(svc => {
              if (svc.useTreatmentPackage && svc.treatmentPackageId && svc.sessionNumber && svc.productId) {
                console.log(`♻️ Returning: ${svc.productName} from session ${svc.sessionNumber}`);
                get().returnPackageSession(svc.treatmentPackageId, svc.sessionNumber, svc.productId);
              }
            });
          }
          
          // Khi status từ cancelled → active: Trừ lại dịch vụ
          if (oldStatus === 'cancelled' && newStatus !== 'cancelled') {
            console.log('✅ Reactivating appointment → Using package services again');
            
            oldAppointment.services.forEach(svc => {
              if (svc.useTreatmentPackage && svc.treatmentPackageId && svc.sessionNumber && svc.productId) {
                console.log(`➕ Using: ${svc.productName} from session ${svc.sessionNumber}`);
                get().usePackageSession(svc.treatmentPackageId, svc.sessionNumber, svc.productId);
              }
            });
          }
        }
        
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === appointmentId ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
          ),
        }));
        
        // Create notifications for updated technicians
        if (updates.services && oldAppointment) {
          const oldTechIds = new Set<string>();
          oldAppointment.services.forEach(s => {
            if (s.technicianIds && s.technicianIds.length > 0) {
              s.technicianIds.forEach(id => oldTechIds.add(id));
            } else if (s.technicianId) {
              oldTechIds.add(s.technicianId);
            }
          });
          
          const newTechIds = new Set<string>();
          updates.services.forEach(s => {
            if (s.technicianIds && s.technicianIds.length > 0) {
              s.technicianIds.forEach(id => newTechIds.add(id));
            } else if (s.technicianId) {
              newTechIds.add(s.technicianId);
            }
          });
          
          // Notify all technicians in updated appointment
          newTechIds.forEach(techId => {
            get().createNotification({
              userId: techId,
              appointmentId,
              appointmentCode: oldAppointment.code,
              title: 'Lịch hẹn cập nhật',
              message: `Lịch hẹn ${oldAppointment.code} - ${oldAppointment.customerName} đã được cập nhật`,
              type: 'updated_appointment',
              isRead: false,
            });
          });
        }
      },
      
      deleteAppointment: (appointmentId) => {
        const appointment = get().appointments.find(a => a.id === appointmentId);
        
        set((state) => ({
          appointments: state.appointments.filter((a) => a.id !== appointmentId),
        }));
        
        // Notify technicians about cancellation
        if (appointment) {
          const technicianIds = new Set<string>();
          appointment.services.forEach(s => {
            if (s.technicianIds && s.technicianIds.length > 0) {
              s.technicianIds.forEach(id => technicianIds.add(id));
            } else if (s.technicianId) {
              technicianIds.add(s.technicianId);
            }
          });
          
          technicianIds.forEach(techId => {
            get().createNotification({
              userId: techId,
              appointmentId,
              appointmentCode: appointment.code,
              title: 'Lịch hẹn đã hủy',
              message: `Lịch hẹn ${appointment.code} - ${appointment.customerName} đã bị hủy`,
              type: 'cancelled_appointment',
              isRead: false,
            });
          });
        }
      },
      
      updateAppointmentStatus: (appointmentId, status) => {
        const { appointments } = get();
        const appointment = appointments.find(a => a.id === appointmentId);
        
        if (!appointment) return;
        
        const oldStatus = appointment.status;
        const newStatus = status;
        
        console.log(`📝 Updating appointment ${appointment.code}: ${oldStatus} → ${newStatus}`);
        
        // ⭐ RULE: Khi status thay đổi thành "cancelled" → Hoàn lại dịch vụ từ gói
        if (oldStatus !== 'cancelled' && newStatus === 'cancelled') {
          console.log('❌ Appointment cancelled → Returning package services');
          
          appointment.services.forEach(svc => {
            if (svc.useTreatmentPackage && svc.treatmentPackageId && svc.sessionNumber && svc.productId) {
              console.log(`♻️ Returning: ${svc.productName} from session ${svc.sessionNumber}`);
              get().returnPackageSession(svc.treatmentPackageId, svc.sessionNumber, svc.productId);
            }
          });
        }
        
        // ⭐ RULE: Khi status thay đổi từ "cancelled" → active status → Trừ lại dịch vụ
        if (oldStatus === 'cancelled' && newStatus !== 'cancelled') {
          console.log('✅ Appointment reactivated → Using package services again');
          
          appointment.services.forEach(svc => {
            if (svc.useTreatmentPackage && svc.treatmentPackageId && svc.sessionNumber && svc.productId) {
              console.log(`➕ Using: ${svc.productName} from session ${svc.sessionNumber}`);
              get().usePackageSession(svc.treatmentPackageId, svc.sessionNumber, svc.productId);
            }
          });
        }
        
        // Update status
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === appointmentId ? { ...a, status, updatedAt: new Date().toISOString() } : a
          ),
        }));
      },
      
      // Check if technician is busy at specific time
      isTechnicianBusy: (technicianId, date, startTime, duration, excludeAppointmentId) => {
        const { appointments } = get();
        
        const [startHour, startMin] = startTime.split(':').map(Number);
        const newStartMinutes = startHour * 60 + startMin;
        const newEndMinutes = newStartMinutes + duration;
        
        return appointments.some(apt => {
          if (apt.id === excludeAppointmentId) return false;
          if (apt.appointmentDate !== date) return false;
          if (apt.status === 'cancelled') return false;
          
          // Check if any service in this appointment is assigned to this technician
          const hasTechnicianAssigned = apt.services.some(svc => 
            svc.technicianIds?.includes(technicianId) || svc.technicianId === technicianId // Support both old and new format
          );
          if (!hasTechnicianAssigned) return false;
          
          const [aptStartHour, aptStartMin] = apt.startTime.split(':').map(Number);
          const [aptEndHour, aptEndMin] = apt.endTime.split(':').map(Number);
          const aptStartMinutes = aptStartHour * 60 + aptStartMin;
          const aptEndMinutes = aptEndHour * 60 + aptEndMin;
          
          // Check for overlap
          return (newStartMinutes < aptEndMinutes && newEndMinutes > aptStartMinutes);
        });
      },
      
      // Get all appointments for a technician on a specific date
      getTechnicianAppointments: (technicianId, date) => {
        const { appointments } = get();
        return appointments.filter(apt => 
          apt.appointmentDate === date && 
          apt.status !== 'cancelled' &&
          apt.services.some(svc => svc.technicianIds?.includes(technicianId) || svc.technicianId === technicianId)
        );
      },
      
      // Check if bed is busy at specific time
      isBedBusy: (bedId, date, startTime, duration, excludeAppointmentId) => {
        const { appointments } = get();
        
        const [startHour, startMin] = startTime.split(':').map(Number);
        const newStartMinutes = startHour * 60 + startMin;
        const newEndMinutes = newStartMinutes + duration;
        
        // Validate input
        if (!bedId || !date || !startTime || duration <= 0) {
          return false;
        }
        
        return appointments.some(apt => {
          // Skip excluded appointment (when editing)
          if (apt.id === excludeAppointmentId) return false;
          // Only check same date
          if (apt.appointmentDate !== date) return false;
          // Skip cancelled appointments
          if (apt.status === 'cancelled') return false;
          
          // Check if any service in this appointment uses this bed
          return apt.services.some(svc => {
            // Only check services using the same bed
            if (svc.bedId !== bedId) return false;
            // Skip services without time info
            if (!svc.startTime || !svc.endTime) return false;
            
            const [svcStartHour, svcStartMin] = svc.startTime.split(':').map(Number);
            const [svcEndHour, svcEndMin] = svc.endTime.split(':').map(Number);
            const svcStartMinutes = svcStartHour * 60 + svcStartMin;
            const svcEndMinutes = svcEndHour * 60 + svcEndMin;
            
            // Check for time overlap - Two time ranges overlap if:
            // New start < Existing end AND New end > Existing start
            // Example overlaps:
            // - Existing: 9:00-10:00, New: 9:30-10:30 → Overlap
            // - Existing: 9:00-10:00, New: 8:30-9:30 → Overlap
            // - Existing: 9:00-10:00, New: 9:15-9:45 → Overlap
            // Example non-overlaps:
            // - Existing: 9:00-10:00, New: 10:00-11:00 → No overlap (ends when other starts)
            // - Existing: 9:00-10:00, New: 8:00-9:00 → No overlap (ends when other starts)
            const hasOverlap = (newStartMinutes < svcEndMinutes && newEndMinutes > svcStartMinutes);
            
            return hasOverlap;
          });
        });
      },
      
      // Notification actions
      createNotification: (notificationData) => {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const newNotification: TechnicianNotification = {
          ...notificationData,
          id,
          createdAt: new Date().toISOString(),
        };
        
        set((state) => ({
          technicianNotifications: [...state.technicianNotifications, newNotification],
        }));
      },
      
      markNotificationAsRead: (notificationId) => {
        set((state) => ({
          technicianNotifications: state.technicianNotifications.map(n =>
            n.id === notificationId ? { ...n, isRead: true } : n
          ),
        }));
      },
      
      getUnreadNotificationCount: (userId) => {
        const { technicianNotifications } = get();
        return technicianNotifications.filter(n => n.userId === userId && !n.isRead).length;
      },
      
      getUserNotifications: (userId) => {
        const { technicianNotifications } = get();
        return technicianNotifications
          .filter(n => n.userId === userId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },
      
      // Stock Management actions
      createStockInReceipt: (receiptData) => {
        const { currentUser, products, stockInReceipts } = get();
        const id = Date.now().toString();
        const now = new Date().toISOString();
        const date = new Date();
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yy = String(date.getFullYear()).slice(-2);
        const today = `${dd}${mm}${yy}`;
        
        // Generate receipt number: NKddmmyy0001
        const existingReceipts = (stockInReceipts || []).filter(r => 
          r.receiptNumber.startsWith(`NK${today}`)
        );
        const sequenceNum = String(existingReceipts.length + 1).padStart(4, '0');
        const receiptNumber = `NK${today}${sequenceNum}`;
        
        const newReceipt: StockInReceipt = {
          ...receiptData,
          id,
          receiptNumber,
          createdAt: now,
          createdBy: currentUser?.username || 'system',
        };
        
        // Update product stock
        const updatedProducts = products.map(p => {
          const item = receiptData.items.find(i => i.productId === p.id);
          if (item) {
            return {
              ...p,
              stock: p.stock + item.quantity,
            };
          }
          return p;
        });
        
        set((state) => ({
          stockInReceipts: [...(state.stockInReceipts || []), newReceipt],
          products: updatedProducts,
        }));
      },
      
      updateStockInReceipt: (receiptId, receiptData) => {
        const { stockInReceipts, products } = get();
        const oldReceipt = (stockInReceipts || []).find(r => r.id === receiptId);
        
        if (!oldReceipt) return;
        
        // Reverse old stock changes first
        let updatedProducts = products.map(p => {
          const oldItem = oldReceipt.items.find(i => i.productId === p.id);
          if (oldItem) {
            return {
              ...p,
              stock: Math.max(0, p.stock - oldItem.quantity),
            };
          }
          return p;
        });
        
        // Apply new stock changes
        updatedProducts = updatedProducts.map(p => {
          const newItem = receiptData.items.find(i => i.productId === p.id);
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
          stockInReceipts: (state.stockInReceipts || []).map(r => 
            r.id === receiptId ? updatedReceipt : r
          ),
          products: updatedProducts,
        }));
      },
      
      createStockOutReceipt: (receiptData) => {
        const { currentUser, products, stockOutReceipts } = get();
        const id = Date.now().toString();
        const now = new Date().toISOString();
        const date = new Date();
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yy = String(date.getFullYear()).slice(-2);
        const today = `${dd}${mm}${yy}`;
        
        // Generate receipt number: XKddmmyy0001
        const existingReceipts = (stockOutReceipts || []).filter(r => 
          r.receiptNumber.startsWith(`XK${today}`)
        );
        const sequenceNum = String(existingReceipts.length + 1).padStart(4, '0');
        const receiptNumber = `XK${today}${sequenceNum}`;
        
        const newReceipt: StockOutReceipt = {
          ...receiptData,
          id,
          receiptNumber,
          createdAt: now,
          createdBy: currentUser?.username || 'system',
        };
        
        // Update product stock (reduce)
        const updatedProducts = products.map(p => {
          const item = receiptData.items.find(i => i.productId === p.id);
          if (item) {
            return {
              ...p,
              stock: Math.max(0, p.stock - item.quantity),
            };
          }
          return p;
        });
        
        set((state) => ({
          stockOutReceipts: [...(state.stockOutReceipts || []), newReceipt],
          products: updatedProducts,
        }));
      },
      
      deleteStockInReceipt: (receiptId) => {
        const { stockInReceipts, products } = get();
        const receipt = (stockInReceipts || []).find(r => r.id === receiptId);
        
        if (receipt) {
          // Reverse stock changes
          const updatedProducts = products.map(p => {
            const item = receipt.items.find(i => i.productId === p.id);
            if (item) {
              return {
                ...p,
                stock: Math.max(0, p.stock - item.quantity),
              };
            }
            return p;
          });
          
          set((state) => ({
            stockInReceipts: (state.stockInReceipts || []).filter(r => r.id !== receiptId),
            products: updatedProducts,
          }));
        }
      },
      
      updateStockOutReceipt: (receiptId, receiptData) => {
        const { stockOutReceipts, products, currentUser } = get();
        const oldReceipt = (stockOutReceipts || []).find(r => r.id === receiptId);
        
        if (oldReceipt) {
          // 1. Reverse old stock changes (add back old quantities)
          let updatedProducts = products.map(p => {
            const oldItem = oldReceipt.items.find(i => i.productId === p.id);
            if (oldItem) {
              return {
                ...p,
                stock: p.stock + oldItem.quantity,
              };
            }
            return p;
          });
          
          // 2. Apply new stock changes (subtract new quantities)
          updatedProducts = updatedProducts.map(p => {
            const newItem = receiptData.items.find(i => i.productId === p.id);
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
            stockOutReceipts: (state.stockOutReceipts || []).map(r =>
              r.id === receiptId ? updatedReceipt : r
            ),
            products: updatedProducts,
          }));
        }
      },
      
      deleteStockOutReceipt: (receiptId) => {
        const { stockOutReceipts, products } = get();
        const receipt = (stockOutReceipts || []).find(r => r.id === receiptId);
        
        if (receipt) {
          // Reverse stock changes (add back)
          const updatedProducts = products.map(p => {
            const item = receipt.items.find(i => i.productId === p.id);
            if (item) {
              return {
                ...p,
                stock: p.stock + item.quantity,
              };
            }
            return p;
          });
          
          set((state) => ({
            stockOutReceipts: (state.stockOutReceipts || []).filter(r => r.id !== receiptId),
            products: updatedProducts,
          }));
        }
      },
      
      getStockInReceipts: () => {
        return (get().stockInReceipts || []).sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      },
      
      getStockOutReceipts: () => {
        return (get().stockOutReceipts || []).sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
          usedSessionItems: {}, // Initialize empty tracking object
        };
        console.log('🎯 createCustomerTreatmentPackage called:', {
          input: packageData,
          output: newPackage,
          hasSessions: !!newPackage.sessions,
          sessionsCount: newPackage.sessions?.length || 0
        });
        set((state) => {
          const updated = [...state.customerTreatmentPackages, newPackage];
          console.log('📦 Updated customerTreatmentPackages:', {
            before: state.customerTreatmentPackages.length,
            after: updated.length,
            newPackageId: newPackage.id
          });
          return {
            customerTreatmentPackages: updated,
          };
        });
      },
      
      usePackageSession: (packageId, sessionNumber, productId) => {
        set((state) => ({
          customerTreatmentPackages: state.customerTreatmentPackages.map((pkg) => {
            if (pkg.id !== packageId) return pkg;
            
            // Initialize usedSessionItems if not exists
            const usedSessionItems = pkg.usedSessionItems || {};
            const currentSessionItems = usedSessionItems[sessionNumber] || [];
            
            // Add productId if not already in the list
            const updatedSessionItems = currentSessionItems.includes(productId)
              ? currentSessionItems
              : [...currentSessionItems, productId];
            
            // Get session definition to check if all items are used
            const session = pkg.sessions.find(s => s.sessionNumber === sessionNumber);
            const totalItemsInSession = session?.items.length || 0;
            const isSessionFullyUsed = updatedSessionItems.length >= totalItemsInSession;
            
            // Update usedSessionNumbers only if session is fully used
            const usedSessionNumbers = isSessionFullyUsed && !pkg.usedSessionNumbers.includes(sessionNumber)
              ? [...pkg.usedSessionNumbers, sessionNumber]
              : pkg.usedSessionNumbers;
            
            // Calculate remaining sessions (sessions where not all items are used)
            const fullyUsedCount = Object.keys({...usedSessionItems, [sessionNumber]: updatedSessionItems})
              .filter(sNum => {
                const sess = pkg.sessions.find(s => s.sessionNumber === parseInt(sNum));
                const items = {...usedSessionItems, [sessionNumber]: updatedSessionItems}[parseInt(sNum)] || [];
                return items.length >= (sess?.items.length || 0);
              }).length;
            
            return {
              ...pkg,
              usedSessionItems: {
                ...usedSessionItems,
                [sessionNumber]: updatedSessionItems,
              },
              usedSessionNumbers, // For backward compatibility
              remainingSessions: pkg.totalSessions - fullyUsedCount,
              isActive: (pkg.totalSessions - fullyUsedCount) > 0,
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },
      
      // Return (refund) a session item when appointment service is cancelled
      returnPackageSession: (packageId, sessionNumber, productId) => {
        console.log(`♻️ returnPackageSession called:`, { packageId, sessionNumber, productId });
        
        set((state) => ({
          customerTreatmentPackages: state.customerTreatmentPackages.map((pkg) => {
            if (pkg.id !== packageId) return pkg;
            
            console.log(`📦 Found package:`, pkg.treatmentName);
            
            const usedSessionItems = pkg.usedSessionItems || {};
            const currentSessionItems = usedSessionItems[sessionNumber] || [];
            
            console.log(`🔍 Current session ${sessionNumber} items:`, currentSessionItems);
            
            // Remove productId from the session
            const updatedSessionItems = currentSessionItems.filter(id => id !== productId);
            
            console.log(`✅ After removing ${productId}:`, updatedSessionItems);
            
            // Get session definition
            const session = pkg.sessions.find(s => s.sessionNumber === sessionNumber);
            const totalItemsInSession = session?.items.length || 0;
            
            // Update usedSessionNumbers - remove if session becomes not fully used
            const isSessionStillFullyUsed = updatedSessionItems.length >= totalItemsInSession;
            const usedSessionNumbers = isSessionStillFullyUsed
              ? pkg.usedSessionNumbers
              : pkg.usedSessionNumbers.filter(n => n !== sessionNumber);
            
            // Calculate remaining sessions
            const newUsedItems = updatedSessionItems.length > 0
              ? {...usedSessionItems, [sessionNumber]: updatedSessionItems}
              : Object.fromEntries(Object.entries(usedSessionItems).filter(([key]) => parseInt(key) !== sessionNumber));
            
            const fullyUsedCount = Object.keys(newUsedItems)
              .filter(sNum => {
                const sess = pkg.sessions.find(s => s.sessionNumber === parseInt(sNum));
                const items = newUsedItems[parseInt(sNum)] || [];
                return items.length >= (sess?.items.length || 0);
              }).length;
            
            const updatedPkg = {
              ...pkg,
              usedSessionItems: newUsedItems,
              usedSessionNumbers,
              remainingSessions: pkg.totalSessions - fullyUsedCount,
              isActive: true,
              updatedAt: new Date().toISOString(),
            };
            
            console.log(`📊 Package updated:`, {
              remainingSessions: updatedPkg.remainingSessions,
              usedSessionItems: updatedPkg.usedSessionItems,
              isActive: updatedPkg.isActive,
            });
            
            return updatedPkg;
          }),
        }));
      },
      
      getCustomerActivePackages: (customerId) => {
        const { customerTreatmentPackages } = get();
        return customerTreatmentPackages.filter(
          (pkg) => pkg.customerId === customerId && pkg.isActive && pkg.remainingSessions > 0
        );
      },
      
      getPackageForService: (customerId, serviceId) => {
        const { customerTreatmentPackages } = get();
        const activePackages = customerTreatmentPackages.filter(
          (pkg) => pkg.customerId === customerId && pkg.isActive && pkg.remainingSessions > 0
        );
        
        // Find package that includes this service
        for (const pkg of activePackages) {
          if (pkg.serviceIds.includes(serviceId)) {
            return pkg;
          }
        }
        
        return null;
      },
      
      // Bed Management actions
      createBed: (bedData) => {
        const newBed: Bed = {
          id: Date.now().toString(),
          ...bedData,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          beds: [...state.beds, newBed],
        }));
      },
      
      updateBed: (bedId, updates) => {
        set((state) => ({
          beds: state.beds.map((bed) =>
            bed.id === bedId
              ? { ...bed, ...updates, updatedAt: new Date().toISOString() }
              : bed
          ),
        }));
      },
      
      deleteBed: (bedId) => {
        set((state) => ({
          beds: state.beds.filter((bed) => bed.id !== bedId),
        }));
      },
      
      toggleBedStatus: (bedId) => {
        set((state) => ({
          beds: state.beds.map((bed) =>
            bed.id === bedId
              ? {
                  ...bed,
                  status: bed.status === 'active' ? 'inactive' : 'active',
                  updatedAt: new Date().toISOString(),
                }
              : bed
          ),
        }));
      },
    }),
    {
      name: 'pos-storage',
      onRehydrateStorage: () => (state) => {
        // Migration: Add demo data for beds if empty
        if (state?.beds && state.beds.length === 0) {
          state.beds = [
            {
              id: 'bed-1',
              name: 'Giường 01',
              status: 'active',
              notes: 'Phòng VIP 1 - Giường massage cao cấp',
              createdAt: '2024-01-10T08:00:00.000Z',
              updatedAt: '2024-01-10T08:00:00.000Z',
            },
            {
              id: 'bed-2',
              name: 'Giường 02',
              status: 'active',
              notes: 'Phòng VIP 1 - Giường massage cao cấp',
              createdAt: '2024-01-10T08:05:00.000Z',
              updatedAt: '2024-01-10T08:05:00.000Z',
            },
            {
              id: 'bed-3',
              name: 'Giường 03',
              status: 'active',
              notes: 'Phòng VIP 2 - Giường massage điều chỉnh tự động',
              createdAt: '2024-01-10T08:10:00.000Z',
              updatedAt: '2024-01-10T08:10:00.000Z',
            },
            {
              id: 'bed-4',
              name: 'Giường 04',
              status: 'active',
              notes: 'Phòng VIP 2 - Giường massage điều chỉnh tự động',
              createdAt: '2024-01-10T08:15:00.000Z',
              updatedAt: '2024-01-10T08:15:00.000Z',
            },
            {
              id: 'bed-5',
              name: 'Giường 05',
              status: 'active',
              notes: 'Khu chăm sóc da mặt',
              createdAt: '2024-01-10T08:20:00.000Z',
              updatedAt: '2024-01-10T08:20:00.000Z',
            },
            {
              id: 'bed-6',
              name: 'Giường 06',
              status: 'active',
              notes: 'Khu chăm sóc da mặt',
              createdAt: '2024-01-10T08:25:00.000Z',
              updatedAt: '2024-01-10T08:25:00.000Z',
            },
            {
              id: 'bed-7',
              name: 'Giường 07',
              status: 'active',
              notes: 'Khu massage body',
              createdAt: '2024-01-10T08:30:00.000Z',
              updatedAt: '2024-01-10T08:30:00.000Z',
            },
            {
              id: 'bed-8',
              name: 'Giường 08',
              status: 'active',
              notes: 'Khu massage body',
              createdAt: '2024-01-10T08:35:00.000Z',
              updatedAt: '2024-01-10T08:35:00.000Z',
            },
            {
              id: 'bed-9',
              name: 'Giường 09',
              status: 'inactive',
              notes: 'Đang bảo trì - Cần thay vỏ bọc',
              createdAt: '2024-01-10T08:40:00.000Z',
              updatedAt: '2024-01-25T14:30:00.000Z',
            },
            {
              id: 'bed-10',
              name: 'Giường 10',
              status: 'active',
              notes: 'Khu massage foot',
              createdAt: '2024-01-10T08:45:00.000Z',
              updatedAt: '2024-01-10T08:45:00.000Z',
            },
          ];
        }
        
        // Migration: Add demo data for suppliers if empty
        if (state?.suppliers && state.suppliers.length === 0) {
          state.suppliers = [
            {
              id: 'sup-1',
              name: 'Công ty TNHH Mỹ phẩm Sài Gòn',
              contactPerson: 'Nguyễn Văn A',
              phone: '0901234567',
              email: 'contact@myphamsg.com',
              address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
              taxCode: '0123456789',
              notes: 'Nhà cung cấp mỹ phẩm chính',
              isActive: true,
              createdAt: '2024-01-15T08:00:00.000Z',
              createdBy: 'admin',
            },
            {
              id: 'sup-2',
              name: 'Công ty CP Thiết bị Spa Việt',
              contactPerson: 'Trần Thị B',
              phone: '0909876543',
              email: 'sales@spaviet.vn',
              address: '456 Lê Lợi, Quận 3, TP.HCM',
              taxCode: '0987654321',
              notes: 'Cung cấp thiết bị spa, giường massage',
              isActive: true,
              createdAt: '2024-01-20T09:30:00.000Z',
              createdBy: 'admin',
            },
            {
              id: 'sup-3',
              name: 'Nhà Phân Phối Dermalogica Việt Nam',
              contactPerson: 'Lê Văn C',
              phone: '0912345678',
              email: 'info@dermalogica.vn',
              address: '789 Trần Hưng Đạo, Quận 5, TP.HCM',
              taxCode: '0369258147',
              notes: 'Thương hiệu mỹ phẩm cao cấp',
              isActive: true,
              createdAt: '2024-02-01T10:00:00.000Z',
              createdBy: 'admin',
            },
            {
              id: 'sup-4',
              name: 'Công ty TNHH Tinh Dầu Thiên Nhiên',
              contactPerson: 'Phạm Thị D',
              phone: '0923456789',
              email: 'sale@tinhdau.com.vn',
              address: '321 Nguyễn Trãi, Quận 1, TP.HCM',
              taxCode: '0147258369',
              notes: 'Chuyên cung cấp tinh dầu thiên nhiên',
              isActive: true,
              createdAt: '2024-02-10T11:15:00.000Z',
              createdBy: 'admin',
            },
            {
              id: 'sup-5',
              name: 'Công ty CP Dược Mỹ Phẩm An Khang',
              contactPerson: 'Hoàng Văn E',
              phone: '0934567890',
              email: 'ankhangspa@gmail.com',
              address: '654 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM',
              taxCode: '0258369147',
              notes: 'Sản phẩm chăm sóc da chuyên nghiệp',
              isActive: true,
              createdAt: '2024-02-15T14:20:00.000Z',
              createdBy: 'admin',
            },
            {
              id: 'sup-6',
              name: 'Nhà Máy Khăn Spa Hồng Phát',
              contactPerson: 'Vũ Thị F',
              phone: '0945678901',
              email: 'hongphat.towel@outlook.com',
              address: '987 Quang Trung, Quận Gò Vấp, TP.HCM',
              taxCode: '0753951842',
              notes: 'Cung cấp khăn spa, áo choàng',
              isActive: true,
              createdAt: '2024-02-20T15:45:00.000Z',
              createdBy: 'admin',
            },
            {
              id: 'sup-7',
              name: 'Công ty TNHH Nến Thơm Luxury',
              contactPerson: 'Đặng Văn G',
              phone: '0956789012',
              email: 'luxurycandle@yahoo.com',
              address: '147 Võ Văn Tần, Quận 3, TP.HCM',
              taxCode: '0159753486',
              notes: 'Nến thơm, tinh dầu khuếch tán',
              isActive: true,
              createdAt: '2024-03-01T08:30:00.000Z',
              createdBy: 'admin',
            },
            {
              id: 'sup-8',
              name: 'Công ty CP Hóa Chất Spa Pro',
              contactPerson: 'Bùi Thị H',
              phone: '0967890123',
              email: 'spapro@hotmail.com',
              address: '258 Cách Mạng Tháng 8, Quận 10, TP.HCM',
              taxCode: '0357159846',
              isActive: false,
              notes: 'Tạm ngưng hợp tác do chất lượng không đảm bảo',
              createdAt: '2024-03-10T09:00:00.000Z',
              createdBy: 'admin',
            },
            {
              id: 'sup-9',
              name: 'Nhà Cung Cấp Mặt Nạ Korea Beauty',
              contactPerson: 'Kim Min Seo',
              phone: '0978901234',
              email: 'koreabeauty@naver.com',
              address: '369 Nguyễn Đình Chiểu, Quận 3, TP.HCM',
              taxCode: '0852741963',
              notes: 'Nhập khẩu mặt nạ Hàn Quốc chính hãng',
              isActive: true,
              createdAt: '2024-03-15T10:30:00.000Z',
              createdBy: 'admin',
            },
            {
              id: 'sup-10',
              name: 'Công ty TNHH Đồng Phục Spa Elite',
              contactPerson: 'Ngô Văn I',
              phone: '0989012345',
              email: 'elite.uniform@gmail.com',
              address: '741 Lý Thường Kiệt, Quận 11, TP.HCM',
              taxCode: '0654987321',
              notes: 'May đo đồng phục nhân viên spa',
              isActive: true,
              createdAt: '2024-03-20T13:00:00.000Z',
              createdBy: 'admin',
            },
          ];
        }
        
        // Migration: Convert old bed statuses to new format
        if (state?.beds) {
          state.beds = state.beds.map(bed => {
            const oldStatus = bed.status as any;
            if (oldStatus === 'available' || oldStatus === 'occupied') {
              return { ...bed, status: 'active' as Bed['status'] };
            } else if (oldStatus === 'maintenance') {
              return { ...bed, status: 'inactive' as Bed['status'] };
            }
            return bed;
          });
        }
        
        // Migration: Clean up invalid appointment statuses and add missing codes
        if (state?.appointments) {
          const validStatuses: Appointment['status'][] = ['pending', 'in-progress', 'completed', 'cancelled'];
          
          // First pass: Fix statuses
          state.appointments = state.appointments.map(apt => {
            // Nếu status không hợp lệ, mặc định về 'pending'
            if (!validStatuses.includes(apt.status)) {
              return { ...apt, status: 'pending' as Appointment['status'] };
            }
            return apt;
          });
          
          // Second pass: Add missing codes
          let codeCounter = 1;
          state.appointments = state.appointments.map((apt, index) => {
            if (!apt.code) {
              // Generate code for old appointments
              const code = `LH${String(codeCounter).padStart(6, '0')}`;
              codeCounter++;
              return { ...apt, code };
            } else {
              // Track existing codes to avoid duplicates
              const codeNum = parseInt(apt.code.replace('LH', ''));
              if (codeNum >= codeCounter) {
                codeCounter = codeNum + 1;
              }
            }
            return apt;
          });
        }
        
        // Migration: Convert old order IDs to new format HD + YYMMDD + 0001
        if (state?.orders && Array.isArray(state.orders)) {
          // Filter out orders that already have new format
          const oldFormatOrders = state.orders.filter(order => !order.id.startsWith('HD'));
          
          if (oldFormatOrders.length > 0) {
            // Group orders by date
            const ordersByDate = new Map<string, any[]>();
            
            state.orders.forEach(order => {
              const orderDate = new Date(order.date || order.timestamp);
              const day = orderDate.getDate().toString().padStart(2, '0');
              const month = (orderDate.getMonth() + 1).toString().padStart(2, '0');
              const year = orderDate.getFullYear().toString().slice(-2);
              const dateKey = `${day}${month}${year}`;
              
              if (!ordersByDate.has(dateKey)) {
                ordersByDate.set(dateKey, []);
              }
              ordersByDate.get(dateKey)!.push(order);
            });
            
            // Assign new IDs
            state.orders = state.orders.map(order => {
              // Skip if already new format
              if (order.id.startsWith('HD')) {
                return order;
              }
              
              const orderDate = new Date(order.date || order.timestamp);
              const day = orderDate.getDate().toString().padStart(2, '0');
              const month = (orderDate.getMonth() + 1).toString().padStart(2, '0');
              const year = orderDate.getFullYear().toString().slice(-2);
              const dateKey = `${day}${month}${year}`;
              
              const dayOrders = ordersByDate.get(dateKey) || [];
              const sequence = dayOrders.indexOf(order) + 1;
              const sequenceStr = sequence.toString().padStart(4, '0');
              
              return {
                ...order,
                id: `HD${dateKey}${sequenceStr}`
              };
            });
          }
        }
        
        // Migration: Convert old self-service order IDs to new format
        if (state?.selfServiceOrders && Array.isArray(state.selfServiceOrders)) {
          const oldFormatOrders = state.selfServiceOrders.filter(order => !order.id.startsWith('HD'));
          
          if (oldFormatOrders.length > 0) {
            const ordersByDate = new Map<string, any[]>();
            
            state.selfServiceOrders.forEach(order => {
              const orderDate = new Date(order.date || order.timestamp);
              const day = orderDate.getDate().toString().padStart(2, '0');
              const month = (orderDate.getMonth() + 1).toString().padStart(2, '0');
              const year = orderDate.getFullYear().toString().slice(-2);
              const dateKey = `${day}${month}${year}`;
              
              if (!ordersByDate.has(dateKey)) {
                ordersByDate.set(dateKey, []);
              }
              ordersByDate.get(dateKey)!.push(order);
            });
            
            state.selfServiceOrders = state.selfServiceOrders.map(order => {
              if (order.id.startsWith('HD')) {
                return order;
              }
              
              const orderDate = new Date(order.date || order.timestamp);
              const day = orderDate.getDate().toString().padStart(2, '0');
              const month = (orderDate.getMonth() + 1).toString().padStart(2, '0');
              const year = orderDate.getFullYear().toString().slice(-2);
              const dateKey = `${day}${month}${year}`;
              
              const dayOrders = ordersByDate.get(dateKey) || [];
              const sequence = dayOrders.indexOf(order) + 1;
              const sequenceStr = sequence.toString().padStart(4, '0');
              
              return {
                ...order,
                id: `HD${dateKey}${sequenceStr}`
              };
            });
          }
        }
        
        // Migration: Convert stock in receipts from IN-YYYYMMDD-XXX to NKddmmyyXXXX
        if (state?.stockInReceipts && Array.isArray(state.stockInReceipts)) {
          const oldFormatReceipts = state.stockInReceipts.filter(receipt => 
            receipt.receiptNumber.startsWith('IN-')
          );
          
          if (oldFormatReceipts.length > 0) {
            const receiptsByDate = new Map<string, any[]>();
            
            state.stockInReceipts.forEach(receipt => {
              const receiptDate = new Date(receipt.createdAt);
              const dd = receiptDate.getDate().toString().padStart(2, '0');
              const mm = (receiptDate.getMonth() + 1).toString().padStart(2, '0');
              const yy = receiptDate.getFullYear().toString().slice(-2);
              const dateKey = `${dd}${mm}${yy}`;
              
              if (!receiptsByDate.has(dateKey)) {
                receiptsByDate.set(dateKey, []);
              }
              receiptsByDate.get(dateKey)!.push(receipt);
            });
            
            state.stockInReceipts = state.stockInReceipts.map(receipt => {
              if (receipt.receiptNumber.startsWith('NK')) {
                return receipt;
              }
              
              const receiptDate = new Date(receipt.createdAt);
              const dd = receiptDate.getDate().toString().padStart(2, '0');
              const mm = (receiptDate.getMonth() + 1).toString().padStart(2, '0');
              const yy = receiptDate.getFullYear().toString().slice(-2);
              const dateKey = `${dd}${mm}${yy}`;
              
              const dayReceipts = receiptsByDate.get(dateKey) || [];
              const sequence = dayReceipts.indexOf(receipt) + 1;
              const sequenceStr = sequence.toString().padStart(4, '0');
              
              return {
                ...receipt,
                receiptNumber: `NK${dateKey}${sequenceStr}`
              };
            });
          }
        }
        
        // Migration: Convert stock out receipts from OUT-YYYYMMDD-XXX to XKddmmyyXXXX
        if (state?.stockOutReceipts && Array.isArray(state.stockOutReceipts)) {
          const oldFormatReceipts = state.stockOutReceipts.filter(receipt => 
            receipt.receiptNumber.startsWith('OUT-')
          );
          
          if (oldFormatReceipts.length > 0) {
            const receiptsByDate = new Map<string, any[]>();
            
            state.stockOutReceipts.forEach(receipt => {
              const receiptDate = new Date(receipt.createdAt);
              const dd = receiptDate.getDate().toString().padStart(2, '0');
              const mm = (receiptDate.getMonth() + 1).toString().padStart(2, '0');
              const yy = receiptDate.getFullYear().toString().slice(-2);
              const dateKey = `${dd}${mm}${yy}`;
              
              if (!receiptsByDate.has(dateKey)) {
                receiptsByDate.set(dateKey, []);
              }
              receiptsByDate.get(dateKey)!.push(receipt);
            });
            
            state.stockOutReceipts = state.stockOutReceipts.map(receipt => {
              if (receipt.receiptNumber.startsWith('XK')) {
                return receipt;
              }
              
              const receiptDate = new Date(receipt.createdAt);
              const dd = receiptDate.getDate().toString().padStart(2, '0');
              const mm = (receiptDate.getMonth() + 1).toString().padStart(2, '0');
              const yy = receiptDate.getFullYear().toString().slice(-2);
              const dateKey = `${dd}${mm}${yy}`;
              
              const dayReceipts = receiptsByDate.get(dateKey) || [];
              const sequence = dayReceipts.indexOf(receipt) + 1;
              const sequenceStr = sequence.toString().padStart(4, '0');
              
              return {
                ...receipt,
                receiptNumber: `XK${dateKey}${sequenceStr}`
              };
            });
          }
        }
      },
    }
  )
);