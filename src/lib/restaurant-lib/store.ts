import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language } from './i18n';
// import { supabaseService } from './supabaseService'; // Removed - using localStorage only
import { getIndustryData } from './industryData';
import type { IndustryType } from '../../modules/restaurant/pages/settings/IndustrySelection';
import { systemPermissions, defaultRoleGroups } from './permissionData';

export interface TreatmentSessionDetail {
  sessionNumber: number;
  products: { id: string; quantity: number }[];
  services: { id: string; quantity: number }[];
}

export interface ComboItem {
  productId: string;
  productName: string;
  productImage?: string;
  productCategory: string;
  productPrice: number;
  productUnit?: string;
  quantity: number;
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
  productType?: 'product' | 'service' | 'treatment' | 'combo' | 'food' | 'inventory';
  // F&B: 'food'=Hàng chế biến (món ăn, không tồn kho), 'combo'=Combo (không tồn kho), 'inventory'=Sản phẩm thường (có tồn kho)
  // Spa: 'service'=Dịch vụ, 'treatment'=Liệu trình
  // Retail: 'product'=Sản phẩm
  duration?: number; // For services and treatments (in minutes)
  sessions?: number; // For treatments (number of sessions in package)
  sessionDetails?: TreatmentSessionDetail[]; // Chi tiết từng buổi cho liệu trình
  unit?: string; // For F&B: Ly, Cốc, Phần, Đĩa, Tô, Set
  comboItems?: ComboItem[]; // For F&B combo products
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
  type?: string;
  note?: string;
  selectedOptions?: SelectedOption[];
  notifiedQuantity?: number; // F&B Restaurant: Số lượng đã gửi bếp (đã thông báo)
  cancelledQuantity?: number; // F&B Restaurant: Track số lượng đã hủy (tích lũy qua nhiều lần)
  cancelReason?: string; // F&B Restaurant: Lý do hủy mới nhất
  cancelled?: boolean; // F&B Restaurant: Item đã bị hủy hoàn toàn
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

// Order history for tracking item changes (additions, removals, quantity changes)
export interface OrderHistory {
  id: string;
  type: 'add_item' | 'remove_item' | 'decrease_quantity' | 'increase_quantity' | 'cancel_item';
  itemId: string;
  itemName: string;
  quantity: number; // số lượng bị ảnh hưởng
  reason?: string; // Lý do (bắt buộc khi remove/decrease/cancel)
  performedBy: string; // Người thực hiện
  performedAt: string; // Thời gian thực hiện
  previousQuantity?: number; // Số lượng trước khi thay đổi
  newQuantity?: number; // Số lượng sau khi thay đổi
}

export interface Order {
  id: string;
  orderNumber?: string; // Mã hóa đơn dạng HDddmmyy000x (e.g., HD2501260001)
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  date: string;
  timestamp: string; // Add this for better time tracking
  paymentMethod: 'cash' | 'card' | 'transfer' | 'momo' | 'zalopay' | 'vnpay';
  paymentMethods?: { method: string; amount: number }[]; // For split payment
  customerId?: string;
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
  orderHistory?: OrderHistory[]; // Lịch sử thao tác trên đơn hàng (thêm/xóa/thay đổi món)
  // F&B specific fields
  orderType?: 'dine-in' | 'takeaway' | 'delivery'; // Loại đơn hàng
  tableId?: string; // ID bàn (cho dine-in)
  tableName?: string; // Tên bàn
  tableNumber?: number; // Số bàn (extracted from table name)
  notifiedItemIds?: string[] | { id: string; quantity: number }[]; // Danh sách cart item IDs đã thông báo cho bếp (hỗ trợ cả format cũ và mới)
  itemStatuses?: { [itemId: string]: { completed: number; served: number } }; // Track completed & served quantities per item
}

export type CreateOrderInput = Omit<
  Order,
  'id' | 'items' | 'subtotal' | 'total' | 'date' | 'timestamp' | 'discount'
> & {
  date?: string;
  timestamp?: string;
  discount?: number;
};

// Kitchen order item - NOW status is at ORDER level, not item level
export interface KitchenOrderItem extends CartItem {
  notifiedAt?: string; // Thời gian thông báo bếp
  cancelled?: boolean; // Món bị hủy
  cancelReason?: string; // Lý do hủy
  cancelledQuantity?: number; // Số lượng bị hủy (nếu chỉ giảm một phần)
}

export interface KitchenOrder {
  id: string; // Kitchen order ID (e.g., "KITCHEN-001")
  orderId: string; // Reference to original order ID
  orderNumber: string; // Display order number (e.g., "#001")
  orderType?: 'dine-in' | 'takeaway' | 'delivery';
  tableId?: string;
  tableName?: string;
  tableNumber?: number;
  items: KitchenOrderItem[]; // Items in this kitchen order
  status: 'pending' | 'cooking' | 'completed' | 'served'; // 4 states - tracked at ORDER level
  createdAt: string;
  notifiedAt: string; // Khi nào gửi thông báo cho bếp
  startTime: number; // Timestamp when kitchen order was created
  cookingStartedAt?: string; // When cooking started
  completedAt?: string; // When order completed (ready to serve)
  servedAt?: string; // When order was served to customer
  customerName?: string;
  isAdditionalOrder?: boolean; // TRUE = Món gọi bổ sung sau khi đã thông báo lần đầu
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
  customerGroup?: 'regular' | 'vip' | 'acquaintance' | 'employee';
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

export interface TableArea {
  id: string;
  name: string;
  area?: string;
  notes?: string;
  status: 'active' | 'inactive';
  createdAt: string;
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
  status: 'active' | 'inactive';
  createdAt: string;
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
  category:
    | 'system'
    | 'sales'
    | 'management'
    | 'reports'
    | 'product'
    | 'customer'
    | 'appointment'
    | 'table'
    | 'inventory'
    | 'user';
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
  name: string; // Tên bàn (Bàn 1, Bàn 2, A1, B2...)
  qrCode: string;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  area: string; // Khu vực (VIP, Tầng 1, Tầng 2, Ngoài trời...)
  capacity: number; // Sức chứa (số người)
  currentOrderId?: string; // ID của đơn hàng hiện tại
  currentGuests?: number; // Số khách hiện tại
  notes?: string; // Ghi chú
  createdBy?: string; // Người tạo
  createdAt?: string; // Thời gian tạo
}

export interface TableReservation {
  id: string;
  tableId: string;
  tableName: string;
  customerName: string;
  customerPhone: string;
  numberOfGuests: number;
  reservationDate: string; // YYYY-MM-DD
  reservationTime: string; // HH:mm
  duration?: number; // Thời gian dự kiến (phút)
  status: 'confirmed' | 'arrived' | 'cancelled' | 'no-show' | 'completed';
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SelfServiceOrder extends Order {
  tableId?: string;
  tableName?: string;
  status: 'pending' | 'completed' | 'cancelled'; // Simplified to 3 main statuses only
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
  instanceId?: string;
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
  // Legacy single-tech fields
  technicianId?: string;
  // ⭐ NEW: Time slot for each service
  startTime: string; // HH:mm format (e.g., "09:00")
  endTime: string;   // HH:mm format (e.g., "10:00")
}

export interface Appointment {
  id: string;
  code: string; // Appointment code (e.g., "LH000001")
  customerId: string;
  customerName: string;
  customerPhone: string;
  appointmentDate: string; // ISO date (YYYY-MM-DD)
  appointmentTime?: string; // Legacy time field
  startTime: string; // HH:mm format (e.g., "09:00")
  endTime: string; // HH:mm format - calculated from duration
  services: AppointmentService[];
  totalDuration?: number;
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
  kitchenOrders: KitchenOrder[]; // F&B kitchen orders
  categories: string[];
  productCategories: ProductCategory[];
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
  tableAreas: TableArea[]; // Quản lý phòng/bàn
  suppliers: Supplier[]; // Quản lý nhà cung cấp

  // Order editing
  editingOrder: Order | null; // Order being edited

  // Stock Management
  stockInReceipts: StockInReceipt[];
  stockOutReceipts: StockOutReceipt[];

  // Self-service & Table Management
  tables: Table[];
  selfServiceOrders: SelfServiceOrder[];
  currentTable: Table | null;
  tableReservations: TableReservation[]; // Danh sách đặt bàn

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
  setCart: (items: CartItem[]) => void; // Set cart directly for loading saved orders

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
  setSidebarCollapsed: (collapsed: boolean) => void;

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

  // Table Area actions
  addTableArea: (tableArea: Omit<TableArea, 'id' | 'createdAt'>) => void;
  updateTableArea: (id: string, tableArea: Partial<TableArea>) => void;
  deleteTableArea: (id: string) => void;

  // Supplier actions
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

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

  // Table Management actions
  createTable: (tableData: Omit<Table, 'id' | 'createdAt'>) => void;
  updateTable: (tableId: string, updates: Partial<Table>) => void;
  deleteTable: (tableId: string) => void;
  updateTableStatus: (tableId: string, status: Table['status']) => void;
  assignOrderToTable: (tableId: string, orderId: string, guests?: number) => void;
  clearTable: (tableId: string) => void;

  // Table Reservation actions
  createTableReservation: (reservationData: Omit<TableReservation, 'id' | 'createdAt'>) => void;
  updateTableReservation: (reservationId: string, updates: Partial<TableReservation>) => void;
  deleteTableReservation: (reservationId: string) => void;
  updateReservationStatus: (reservationId: string, status: TableReservation['status']) => void;
  getTableReservations: (date: string) => TableReservation[];

  // Customer Treatment Package actions
  createCustomerTreatmentPackage: (packageData: Omit<CustomerTreatmentPackage, 'id' | 'createdAt' | 'updatedAt'>) => void;
  usePackageSession: (packageId: string, sessionNumber: number) => void;
  returnPackageSession: (packageId: string, sessionNumber: number) => void;
  getCustomerActivePackages: (customerId: string) => CustomerTreatmentPackage[];
  getPackageForService: (customerId: string, serviceId: string) => CustomerTreatmentPackage | null;

  // Kitchen Order actions (F&B) - REFACTORED: Status now at ORDER level
  createKitchenOrder: (orderId: string, items: CartItem[]) => KitchenOrder;
  updateKitchenOrder: (kitchenOrderId: string, updates: Partial<KitchenOrder>) => void;
  updateKitchenOrderStatus: (kitchenOrderId: string, status: KitchenOrder['status']) => void;
  updateKitchenOrderItems: (kitchenOrderId: string, items: KitchenOrderItem[]) => void; // Update items (for cancellations)
  deleteKitchenOrder: (kitchenOrderId: string) => void;
  clearServedKitchenOrders: () => number; // 🆕 Xóa tất cả đơn bếp đã phục vụ
  getKitchenOrdersByTable: (tableId: string) => KitchenOrder[];
  getKitchenOrderByOrderId: (orderId: string) => KitchenOrder | undefined;
  autoServeKitchenOrderOnPayment: (orderId: string) => void; // Auto-mark as served when order is paid
}

const initialProducts: Product[] = [
  // Đồ uống
  {
    id: '1',
    name: 'Cà phê đen',
    price: 25000,
    category: 'Đồ uống',
    stock: 100,
    barcode: '8934567890001',
    description: 'Cà phê đen nguyên chất, hương vị đậm đà truyền thống',
    options: [
      {
        id: 'size-1',
        name: 'Kích thước',
        type: 'single',
        required: true,
        choices: [
          { id: 's', name: 'Nhỏ (S)', priceModifier: 0 },
          { id: 'm', name: 'Vừa (M)', priceModifier: 5000 },
          { id: 'l', name: 'Lớn (L)', priceModifier: 10000 },
        ],
      },
      {
        id: 'ice-1',
        name: 'Đá',
        type: 'single',
        required: false,
        choices: [
          { id: 'normal', name: 'Bình thường', priceModifier: 0 },
          { id: 'less', name: 'Ít đá', priceModifier: 0 },
          { id: 'no', name: 'Không đá', priceModifier: 0 },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Cà phê sữa',
    price: 30000,
    category: 'Đồ ung',
    stock: 100,
    barcode: '8934567890002',
    description: 'Cà phê sữa đá thơm ngon, ngọt ngào',
    options: [
      {
        id: 'size-2',
        name: 'Kích thước',
        type: 'single',
        required: true,
        choices: [
          { id: 's', name: 'Nhỏ (S)', priceModifier: 0 },
          { id: 'm', name: 'Vừa (M)', priceModifier: 5000 },
          { id: 'l', name: 'Lớn (L)', priceModifier: 10000 },
        ],
      },
      {
        id: 'sugar-2',
        name: 'Đường',
        type: 'single',
        required: false,
        choices: [
          { id: 'normal', name: '100%', priceModifier: 0 },
          { id: 'less', name: '50%', priceModifier: 0 },
          { id: 'no', name: '0%', priceModifier: 0 },
        ],
      },
    ],
  },
  {
    id: '3',
    name: 'Trà sữa trân châu',
    price: 35000,
    category: 'Đồ uống',
    stock: 80,
    barcode: '8934567890003',
    description: 'Trà sữa trân châu đường đen, topping đa dạng',
    options: [
      {
        id: 'size-3',
        name: 'Kích thước',
        type: 'single',
        required: true,
        choices: [
          { id: 'm', name: 'Vừa (M)', priceModifier: 0 },
          { id: 'l', name: 'Lớn (L)', priceModifier: 10000 },
        ],
      },
      {
        id: 'topping-3',
        name: 'Topping',
        type: 'multiple',
        required: false,
        choices: [
          { id: 'pearl', name: 'Trân châu', priceModifier: 0 },
          { id: 'jelly', name: 'Thạch', priceModifier: 5000 },
          { id: 'pudding', name: 'Pudding', priceModifier: 8000 },
          { id: 'aloe', name: 'Nha đam', priceModifier: 5000 },
        ],
      },
      {
        id: 'ice-3',
        name: 'Đá',
        type: 'single',
        required: false,
        choices: [
          { id: 'normal', name: 'Bình thường', priceModifier: 0 },
          { id: 'less', name: 'Ít đá', priceModifier: 0 },
          { id: 'no', name: 'Không đá', priceModifier: 0 },
        ],
      },
    ],
  },
  {
    id: '7',
    name: 'Nước cam',
    price: 20000,
    category: 'Đồ uống',
    stock: 60,
    barcode: '8934567890007',
  },
  {
    id: '8',
    name: 'Sinh tố bơ',
    price: 35000,
    category: 'Đồ uống',
    stock: 45,
    barcode: '8934567890008',
  },
  {
    id: '12',
    name: 'Nước suối',
    price: 10000,
    category: 'Đồ uống',
    stock: 120,
    barcode: '8934567890012',
  },
  {
    id: '13',
    name: 'Trà đào',
    price: 30000,
    category: 'Đồ uống',
    stock: 70,
    barcode: '8934567890013',
  },
  {
    id: '14',
    name: 'Soda chanh',
    price: 25000,
    category: 'Đồ uống',
    stock: 85,
    barcode: '8934567890014',
  },
  {
    id: '15',
    name: 'Matcha đ xay',
    price: 45000,
    category: 'Đồ uống',
    stock: 50,
    barcode: '8934567890015',
  },
  {
    id: '16',
    name: 'Cacao nóng',
    price: 35000,
    category: 'Đồ uống',
    stock: 65,
    barcode: '8934567890016',
  },

  // Đồ ăn
  {
    id: '4',
    name: 'Bánh mì thịt',
    price: 20000,
    category: 'Đồ ăn',
    stock: 50,
    barcode: '8934567890004',
  },
  {
    id: '5',
    name: 'Phở bò',
    price: 45000,
    category: 'Đồ ăn',
    stock: 30,
    barcode: '8934567890005',
  },
  {
    id: '6',
    name: 'Cơm gà',
    price: 40000,
    category: 'Đồ ăn',
    stock: 40,
    barcode: '8934567890006',
  },
  {
    id: '9',
    name: 'Bún bò Huế',
    price: 45000,
    category: 'Đồ ăn',
    stock: 25,
    barcode: '8934567890009',
  },
  {
    id: '17',
    name: 'Mì Ý sốt bò bằm',
    price: 55000,
    category: 'Đồ ăn',
    stock: 35,
    barcode: '8934567890017',
  },
  {
    id: '18',
    name: 'Xôi gà',
    price: 25000,
    category: 'Đồ ăn',
    stock: 45,
    barcode: '8934567890018',
  },
  {
    id: '19',
    name: 'Bánh xèo',
    price: 35000,
    category: 'Đồ ăn',
    stock: 30,
    barcode: '8934567890019',
  },
  {
    id: '20',
    name: 'Hủ tiếu Nam Vang',
    price: 40000,
    category: 'Đồ ăn',
    stock: 28,
    barcode: '8934567890020',
  },
  {
    id: '21',
    name: 'Gỏi cuốn',
    price: 30000,
    category: 'Đồ ăn',
    stock: 42,
    barcode: '8934567890021',
  },
  {
    id: '22',
    name: 'Chả giò',
    price: 35000,
    category: 'Đồ ăn',
    stock: 38,
    barcode: '8934567890022',
  },

  // Bánh kẹo
  {
    id: '10',
    name: 'Bánh ngọt',
    price: 15000,
    category: 'Bánh kẹo',
    stock: 60,
    barcode: '8934567890010',
  },
  {
    id: '11',
    name: 'Kem vani',
    price: 25000,
    category: 'Bánh kẹo',
    stock: 40,
    barcode: '8934567890011',
  },
  {
    id: '23',
    name: 'Bánh flan',
    price: 20000,
    category: 'Bánh kẹo',
    stock: 55,
    barcode: '8934567890023',
  },
  {
    id: '24',
    name: 'Mousse socola',
    price: 35000,
    category: 'Bánh kẹo',
    stock: 30,
    barcode: '8934567890024',
  },
  {
    id: '25',
    name: 'Tiramisu',
    price: 40000,
    category: 'Bánh kẹo',
    stock: 25,
    barcode: '8934567890025',
  },
  {
    id: '26',
    name: 'Panna cotta',
    price: 30000,
    category: 'Bánh kẹo',
    stock: 35,
    barcode: '8934567890026',
  },

  // Món ăn nhanh
  {
    id: '27',
    name: 'Hamburger bò',
    price: 45000,
    category: 'Món ăn nhanh',
    stock: 40,
    barcode: '8934567890027',
  },
  {
    id: '28',
    name: 'Pizza Hawaii',
    price: 85000,
    category: 'Món ăn nhanh',
    stock: 20,
    barcode: '8934567890028',
  },
  {
    id: '29',
    name: 'Gà rán (3 miếng)',
    price: 55000,
    category: 'Món ăn nhanh',
    stock: 35,
    barcode: '8934567890029',
  },
  {
    id: '30',
    name: 'Khoai tây chiên',
    price: 25000,
    category: 'Món ăn nhanh',
    stock: 60,
    barcode: '8934567890030',
  },
  {
    id: '31',
    name: 'Hot dog',
    price: 30000,
    category: 'Món ăn nhanh',
    stock: 45,
    barcode: '8934567890031',
  },

  // Món Hàn Quốc
  {
    id: '32',
    name: 'Tteokbokki',
    price: 40000,
    category: 'Món Hàn',
    stock: 30,
    barcode: '8934567890032',
  },
  {
    id: '33',
    name: 'Kimchi jjigae',
    price: 55000,
    category: 'Món Hàn',
    stock: 25,
    barcode: '8934567890033',
  },
  {
    id: '34',
    name: 'Bibimbap',
    price: 60000,
    category: 'Món Hàn',
    stock: 28,
    barcode: '8934567890034',
  },
  {
    id: '35',
    name: 'Ramyeon',
    price: 35000,
    category: 'Món Hàn',
    stock: 50,
    barcode: '8934567890035',
  },

  // Món Nhật
  {
    id: '36',
    name: 'Sushi combo',
    price: 120000,
    category: 'Món Nhật',
    stock: 15,
    barcode: '8934567890036',
  },
  {
    id: '37',
    name: 'Ramen đặc biệt',
    price: 65000,
    category: 'Món Nhật',
    stock: 22,
    barcode: '8934567890037',
  },
  {
    id: '38',
    name: 'Tempura',
    price: 55000,
    category: 'Món Nhật',
    stock: 30,
    barcode: '8934567890038',
  },
  {
    id: '39',
    name: 'Takoyaki',
    price: 40000,
    category: 'Món Nhật',
    stock: 35,
    barcode: '8934567890039',
  },

  // Món Thái
  {
    id: '40',
    name: 'Pad Thai',
    price: 50000,
    category: 'Món Thái',
    stock: 30,
    barcode: '8934567890040',
  },
  {
    id: '41',
    name: 'Tom Yum',
    price: 55000,
    category: 'Món Thái',
    stock: 25,
    barcode: '8934567890041',
  },
  {
    id: '42',
    name: 'Green Curry',
    price: 60000,
    category: 'Món Thái',
    stock: 20,
    barcode: '8934567890042',
  },

];
     export const demoTableAreas: TableArea[] =  [
          { id: 'table_001', name: 'Bàn 1', area: 'Tầng 1', status: 'active', createdAt: new Date().toISOString() },
          { id: 'table_002', name: 'Bàn 2', area: 'Tầng 1', status: 'active', createdAt: new Date().toISOString() },
          { id: 'table_003', name: 'Bàn 3', area: 'Tầng 1', status: 'active', createdAt: new Date().toISOString() },
          { id: 'table_004', name: 'Bàn 4', area: 'Tầng 2', status: 'active', createdAt: new Date().toISOString() },
          { id: 'table_005', name: 'Bàn 5', area: 'Tầng 2', status: 'active', createdAt: new Date().toISOString() },
          { id: 'table_006', name: 'Bàn 6', area: 'Tầng 2', status: 'active', createdAt: new Date().toISOString() },
          { id: 'table_007', name: 'Phòng VIP 1', area: 'Khu VIP', status: 'active', notes: 'Phòng riêng cho 8-10 người', createdAt: new Date().toISOString() },
          { id: 'table_008', name: 'Phòng VIP 2', area: 'Khu VIP', status: 'active', notes: 'Phòng riêng cho 6-8 người', createdAt: new Date().toISOString() },
          { id: 'table_009', name: 'Bàn Sân Vườn 1', area: 'Sân vườn', status: 'active', createdAt: new Date().toISOString() },
          { id: 'table_010', name: 'Bàn Sân Vườn 2', area: 'Sân vườn', status: 'inactive', notes: 'Đang bảo trì', createdAt: new Date().toISOString() },
        ] ;

        // Generate demo suppliers for all industries
        export const demoSuppliers: Supplier[] = [
          { id: 'supplier_001', name: 'Công ty TNHH Thương Mại ABC', contactPerson: 'Nguyễn Văn A', phone: '0901234567', email: 'abc@example.com', address: '123 Đường Lê Lợi, Q1, TP.HCM', taxCode: '0123456789', status: 'active', createdAt: new Date().toISOString() },
          { id: 'supplier_002', name: 'Công ty CP Phân Phối XYZ', contactPerson: 'Trần Thị B', phone: '0912345678', email: 'xyz@example.com', address: '456 Đường Nguyễn Huệ, Q1, TP.HCM', taxCode: '0987654321', status: 'active', createdAt: new Date().toISOString() },
          { id: 'supplier_003', name: 'CTY Nhập Khẩu DEF', contactPerson: 'Lê Văn C', phone: '0923456789', email: 'def@example.com', address: '789 Đường Trần Hưng Đạo, Q5, TP.HCM', status: 'active', createdAt: new Date().toISOString() },
          { id: 'supplier_004', name: 'Nhà Cung Cấp GHI', contactPerson: 'Phạm Thị D', phone: '0934567890', address: '321 Đường Hai Bà Trưng, Q3, TP.HCM', status: 'active', createdAt: new Date().toISOString() },
          { id: 'supplier_005', name: 'Công ty Sản Xuất JKL', contactPerson: 'Hoàng Văn E', phone: '0945678901', email: 'jkl@example.com', status: 'active', createdAt: new Date().toISOString() },
          { id: 'supplier_006', name: 'Đại Lý MNO', contactPerson: 'Vũ Thị F', phone: '0956789012', address: '654 Đường Cách Mạng Tháng 8, Q10, TP.HCM', status: 'inactive', notes: 'Tạm ngừng hợp tác', createdAt: new Date().toISOString() },
        ];
export const initialTableArea: TableArea[] = [
  {
    id: '1',
    name: 'Sảnh chính',
    area: 'Tầng 1',
    notes: 'Khu vực phục vụ khách lẻ',
    status: 'active',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Khu VIP 1',
    area: 'Tầng 1',
    notes: 'Phòng riêng 6–8 khách',
    status: 'active',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '3',
    name: 'Khu VIP 2',
    area: 'Tầng 1',
    notes: 'Phòng riêng 10–12 khách',
    status: 'active',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '4',
    name: 'Khu ngoài trời',
    area: 'Sân trước',
    notes: 'Phù hợp buổi tối',
    status: 'active',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '5',
    name: 'Khu gia đình',
    area: 'Tầng 2',
    notes: 'Bàn lớn cho gia đình',
    status: 'active',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '6',
    name: 'Khu tiệc',
    area: 'Tầng 2',
    notes: 'Đặt tiệc sinh nhật, liên hoan',
    status: 'active',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '7',
    name: 'Khu quầy bar',
    area: 'Tầng 1',
    notes: 'Ngồi quầy, phục vụ nhanh',
    status: 'active',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '8',
    name: 'Phòng họp nhỏ',
    area: 'Tầng 2',
    notes: 'Tiếp khách công việc',
    status: 'inactive',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

// Migration helper: Fix old kitchen orders with duplicate item IDs
const migrateKitchenOrders = () => {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem('pos-store');
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    const kitchenOrders = parsed.state?.kitchenOrders || [];

    // Check if migration is needed (old format has items without timestamp suffix)
    const needsMigration = kitchenOrders.some((ko: KitchenOrder) =>
      ko.items.some((item) => !item.id.includes('-176'))
    );

    if (needsMigration) {
      console.log('Migrating kitchen orders to fix duplicate IDs...');
      // Clear old kitchen orders to prevent duplicate key warnings
      return [];
    }

    return kitchenOrders;
  } catch (e) {
    console.error('Error migrating kitchen orders:', e);
    return [];
  }
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      products: initialProducts,
      cart: [],
      kitchenOrders: migrateKitchenOrders(),
      orders: [
        // Sample order 1: Fully paid with payment history
        {
          id: 'ORD-1737540000001',
          items: [
            {
              id: '1',
              name: 'Cà phê đen',
              price: 30000,
              category: 'Đồ uống',
              stock: 100,
              quantity: 2,
              discount: 0,
              selectedOptions: [
                { optionId: 'size-1', optionName: 'Kích thước', choiceId: 'm', choiceName: 'Vừa (M)', priceModifier: 5000 },
              ],
            },
            {
              id: '3',
              name: 'Trà sữa trân châu',
              price: 35000,
              category: 'Đồ uống',
              stock: 80,
              quantity: 1,
              discount: 0,
            },
          ],
          subtotal: 100000,
          discount: 0,
          total: 100000,
          date: '2026-01-20T14:30:00.000Z',
          timestamp: '2026-01-20T14:30:00.000Z',
          paymentMethod: 'cash',
          paymentStatus: 'paid',
          status: 'completed',
          customerName: 'Nguyễn Văn A',
          customerPhone: '0901234567',
          note: 'Giao hàng tận nơi',
          receivedAmount: 100000,
          changeAmount: 0,
          createdBy: 'Thu Ngân 1',
          paymentHistory: [
            {
              id: 'PAY-001',
              amount: 100000,
              paymentMethod: 'cash',
              paidAt: '2026-01-20T14:30:00.000Z',
              paidBy: 'Thu Ngân 1',
              note: 'Thanh toán đủ',
              changeAmount: 0,
            },
          ],
        },
        // Sample order 2: Partially paid with multiple payment history
        {
          id: 'ORD-1737540000002',
          items: [
            {
              id: '2',
              name: 'Cà phê sữa',
              price: 30000,
              category: 'Đồ uống',
              stock: 100,
              quantity: 3,
              discount: 0,
            },
            {
              id: '4',
              name: 'Bánh mì thịt',
              price: 25000,
              category: 'Đồ ăn',
              stock: 50,
              quantity: 2,
              discount: 0,
            },
          ],
          subtotal: 140000,
          discount: 10000,
          total: 130000,
          date: '2026-01-21T09:15:00.000Z',
          timestamp: '2026-01-21T09:15:00.000Z',
          paymentMethod: 'cash',
          paymentStatus: 'partial',
          status: 'pending',
          customerName: 'Trần Thị B',
          customerPhone: '0912345678',
          note: '',
          receivedAmount: 80000,
          changeAmount: -50000,
          createdBy: 'Thu Ngân 2',
          paymentHistory: [
            {
              id: 'PAY-002-1',
              amount: 50000,
              paymentMethod: 'cash',
              paidAt: '2026-01-21T09:15:00.000Z',
              paidBy: 'Thu Ngân 2',
              note: 'Thanh toán lần 1',
              changeAmount: -80000,
            },
            {
              id: 'PAY-002-2',
              amount: 30000,
              paymentMethod: 'momo',
              paidAt: '2026-01-21T10:00:00.000Z',
              paidBy: 'Thu Ngân 2',
              note: 'Thanh toán lần 2 qua MoMo',
              changeAmount: -50000,
            },
          ],
        },
        // Sample order 3: Overpaid with change
        {
          id: 'ORD-1737540000003',
          items: [
            {
              id: '8',
              name: 'Phở bò',
              price: 50000,
              category: 'Đồ ăn',
              stock: 30,
              quantity: 1,
              discount: 0,
            },
          ],
          subtotal: 50000,
          discount: 0,
          total: 50000,
          date: '2026-01-21T11:45:00.000Z',
          timestamp: '2026-01-21T11:45:00.000Z',
          paymentMethod: 'cash',
          paymentStatus: 'paid',
          status: 'completed',
          customerName: 'Lê Văn C',
          customerPhone: '0923456789',
          note: 'Không hành',
          receivedAmount: 100000,
          changeAmount: 50000,
          createdBy: 'Thu Ngân 1',
          paymentHistory: [
            {
              id: 'PAY-003',
              amount: 100000,
              paymentMethod: 'cash',
              paidAt: '2026-01-21T11:45:00.000Z',
              paidBy: 'Thu Ngân 1',
              note: 'Khách đưa 100k',
              changeAmount: 50000,
            },
          ],
        },
      ],
      stockInReceipts: [],
      stockOutReceipts: [],
      categories: ['Đồ uống', 'Đồ ăn', 'Bánh kẹo', 'Món ăn nhanh', 'Món Hàn', 'Món Nhật', 'Món Thái'],
      productCategories: [
        {
          id: '1',
          name: 'Món chính',
          description: 'Các món ăn chính trong thực đơn nhà hàng',
          color: '#EF4444',
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          createdBy: 'system',
        },
        {
          id: '2',
          name: 'Món ăn nhanh',
          description: 'Các món ăn nhanh, ăn liền, phục vụ nhanh',
          color: '#F97316',
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          createdBy: 'system',
        },
        {
          id: '3',
          name: 'Đồ uống',
          description: 'Nước ngọt, trà, cà phê và các loại đồ uống',
          color: '#22C55E',
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          createdBy: 'system',
        },
        {
          id: '4',
          name: 'Món tráng miệng',
          description: 'Bánh, chè và các món tráng miệng',
          color: '#EC4899',
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          createdBy: 'system',
        },
        {
          id: '5',
          name: 'Combo / Set',
          description: 'Các combo, set món ăn theo suất hoặc theo nhóm',
          color: '#3B82F6',
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
              startTime: '09:00',
              endTime: '10:30',
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
              startTime: '11:00',
              endTime: '12:00',
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
              startTime: '14:00',
              endTime: '15:30',
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
              startTime: '10:00',
              endTime: '11:30',
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
              startTime: '15:00',
              endTime: '16:00',
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
              startTime: '09:30',
              endTime: '11:00',
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
              startTime: '14:00',
              endTime: '14:30',
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
              startTime: '09:00',
              endTime: '10:30',
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
              startTime: '09:00',
              endTime: '10:00',
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
              startTime: '09:00',
              endTime: '10:30',
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
      // bàn đây 
      tables: [],
      suppliers: demoSuppliers,
      tableAreas: demoTableAreas,
      selfServiceOrders: [],
      currentTable: null,
      tableReservations: [],
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
                  ? {
                    ...item,
                    quantity: item.quantity + 1,
                    // ✅ Giữ nguyên notifiedQuantity khi thêm món
                  }
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

      updateCartNote: (productId, note) => {
        console.log('[updateCartNote] 📝 Updating note for item:', productId, '- New note:', note);
        set((state) => {
          const updatedCart = state.cart.map((item) =>
            item.id === productId ? { ...item, note } : item
          );
          console.log('[updateCartNote] 📋 Updated cart:', updatedCart.find(i => i.id === productId));
          return { cart: updatedCart };
        });
      },

      clearCart: () => {
        set({ cart: [] });
      },

      setCart: (items) => {
        set({ cart: items });
      },

      createOrder: (orderData) => {
        const {
          discount: orderLevelDiscount = 0,
          date: orderDate,
          timestamp: orderTimestamp,
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

        // Generate order number: HDddmmyy000x
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = String(now.getFullYear()).slice(-2);
        const dateStr = `${day}${month}${year}`;

        // Count today's orders to get sequence number
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const todayOrders = orders.filter(o => o.date >= todayStart);
        const sequenceNum = String(todayOrders.length + 1).padStart(4, '0');
        const orderNumber = `HD${dateStr}${sequenceNum}`;

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
          id: Date.now().toString(),
          orderNumber: orderNumber,
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
            // 🔥 F&B Mode: DON'T clear cart after creating order
            // Cart should remain so user can continue adding items to the same order
            // cart: [],  // ❌ OLD: Clear cart
            // Only deduct stock when order is completed (paid), not for pending orders
            products: order.status === 'completed' ? state.products.map((p) => {
              const cartItem = cart.find((item) => item.id === p.id);
              if (cartItem) {
                return { ...p, stock: p.stock - cartItem.quantity };
              }
              return p;
            }) : state.products,
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
                customerGroup: 'regular',
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
                      customerName: orderData.customerName || '',
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

        // 🍽️ AUTO-SERVE KITCHEN ORDER if order is paid (status = 'completed')
        if (order.status === 'completed') {
          console.log('💰 Order paid - auto-serving kitchen order');
          setTimeout(() => {
            get().autoServeKitchenOrderOnPayment(order.id);
          }, 100);
        }

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

      // Kitchen Order actions - REFACTORED: Status at ORDER level
      createKitchenOrder: (orderId, items) => {
        const { orders, kitchenOrders } = get();
        const order = orders.find(o => o.id === orderId);
        if (!order) throw new Error('Order not found');

        const now = new Date().toISOString();
        const timestamp = Date.now();

        // ✅ ALWAYS create NEW kitchen order (don't merge with existing ones)
        // Each "Notify Kitchen" action creates a separate kitchen order card
        // But they all share the same orderNumber for tracking

        // 🔍 Check if this is an additional order (not the first notification for this orderId)
        const existingKitchenOrdersForThisOrder = kitchenOrders.filter(ko => ko.orderId === orderId);
        const isAdditionalOrder = existingKitchenOrdersForThisOrder.length > 0;

        console.log('[createKitchenOrder] 🔍 Checking if additional order:', {
          orderId,
          existingCount: existingKitchenOrdersForThisOrder.length,
          isAdditionalOrder
        });

        // Convert CartItem to KitchenOrderItem (no itemStatus - status is at order level)
        const itemsWithUniqueIds: KitchenOrderItem[] = items.map((item, index) => {
          const kitchenItem = {
            ...item,
            notifiedAt: now,
            // Unique ID for tracking
            id: `${item.id}-${timestamp}-${index}`
          };

          // Log if item has note
          if (item.note) {
            console.log('[createKitchenOrder] 📝 Item has note:', item.name, '- Note:', item.note);
          }

          return kitchenItem;
        });

        // Create new kitchen order - use order's orderNumber for consistency
        const kitchenOrder: KitchenOrder = {
          id: `KITCHEN-${Date.now()}`,
          orderId: order.id,
          orderNumber: order.orderNumber || `#${Date.now()}`, // Use order's orderNumber for tracking
          orderType: order.orderType,
          tableId: order.tableId,
          tableName: order.tableName,
          tableNumber: order.tableNumber,
          items: itemsWithUniqueIds,
          status: 'pending', // Default status
          createdAt: now,
          notifiedAt: now,
          startTime: timestamp,
          customerName: order.customerName,
          isAdditionalOrder, // 🆕 Đánh dấu nếu là món gọi bổ sung
        };

        set((state) => ({
          kitchenOrders: [...state.kitchenOrders, kitchenOrder],
        }));

        console.log('[createKitchenOrder] ✅ Created new kitchen order:', kitchenOrder.id, 'for order:', order.orderNumber, 'isAdditional:', isAdditionalOrder);
        console.log('[createKitchenOrder] 📋 Kitchen order items:', kitchenOrder.items.map(i => ({
          name: i.name,
          note: i.note
        })));

        return kitchenOrder;
      },

      updateKitchenOrder: (kitchenOrderId, updates) => {
        set((state) => ({
          kitchenOrders: state.kitchenOrders.map((ko) =>
            ko.id === kitchenOrderId ? { ...ko, ...updates } : ko
          ),
        }));

        // Dispatch event for cross-tab sync
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('kitchen-status-changed', {
            detail: { kitchenOrderId, updates }
          }));
        }, 0);
      },

      updateKitchenOrderStatus: (kitchenOrderId, status) => {
        console.log('[updateKitchenOrderStatus] 🔄 Changing order status:', { kitchenOrderId, status });

        const now = new Date().toISOString();
        const updates: Partial<KitchenOrder> = { status };

        // Update timestamps based on status
        if (status === 'cooking') {
          updates.cookingStartedAt = now;
        } else if (status === 'completed') {
          updates.completedAt = now;
        } else if (status === 'served') {
          updates.servedAt = now;
        }

        set((state) => ({
          kitchenOrders: state.kitchenOrders.map((ko) =>
            ko.id === kitchenOrderId ? { ...ko, ...updates } : ko
          ),
        }));

        // Dispatch event for cross-tab sync
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('kitchen-status-changed', {
            detail: { kitchenOrderId, status }
          }));
          console.log('[updateKitchenOrderStatus] 📡 Dispatched event');
        }, 0);
      },

      updateKitchenOrderItems: (kitchenOrderId, items) => {
        console.log('[updateKitchenOrderItems] 📝 Updating kitchen order items:', { kitchenOrderId, itemsCount: items.length });
        console.log('[updateKitchenOrderItems] 📋 Items detail:', items.map(i => ({
          name: i.name,
          cancelled: i.cancelled,
          cancelReason: i.cancelReason,
          cancelledQuantity: i.cancelledQuantity,
          note: i.note // Add note to log
        })));

        // Check if ALL items are cancelled
        const allItemsCancelled = items.length > 0 && items.every(item => item.cancelled);
        console.log('[updateKitchenOrderItems] 🔍 All items cancelled?', allItemsCancelled);

        if (allItemsCancelled) {
          // Get kitchen order before deleting to get table info
          const currentState = get();
          const kitchenOrder = currentState.kitchenOrders.find(ko => ko.id === kitchenOrderId);

          if (kitchenOrder) {
            console.log('[updateKitchenOrderItems] 🗑️ All items cancelled - deleting kitchen order:', kitchenOrderId);

            // Delete ONLY the kitchen order (not the main Order)
            get().deleteKitchenOrder(kitchenOrderId);

            // ✅ FIX: Kiểm tra xem còn kitchen orders nào ACTIVE cho order này không
            const remainingActiveKitchenOrders = currentState.kitchenOrders.filter(
              ko => ko.orderId === kitchenOrder.orderId &&
                ko.id !== kitchenOrderId &&
                ko.status !== 'served'
            );

            console.log('[updateKitchenOrderItems] 🔍 Remaining active kitchen orders:', remainingActiveKitchenOrders.length);

            // CHỈ xóa Order và free table nếu KHÔNG còn kitchen order nào active
            if (remainingActiveKitchenOrders.length === 0) {
              console.log('[updateKitchenOrderItems] 🎯 No more active kitchen orders - can free table and delete order');

              // Update table status back to available
              if (kitchenOrder.tableId) {
                console.log('[updateKitchenOrderItems] 🪑 Returning table to available:', kitchenOrder.tableName);

                set((state) => ({
                  tables: state.tables.map(table =>
                    table.id === kitchenOrder.tableId
                      ? { ...table, status: 'available' as const, currentOrderId: undefined }
                      : table
                  )
                }));
              }

              // Xóa Order
              if (kitchenOrder.orderId) {
                set((state) => ({
                  orders: state.orders.filter(order => order.id !== kitchenOrder.orderId)
                }));
                console.log('[updateKitchenOrderItems] 🗑️ DELETED order completely:', kitchenOrder.orderId);
              }
            } else {
              console.log('[updateKitchenOrderItems] ⚠️ Still have active kitchen orders - keep Order and table occupied');
              console.log('[updateKitchenOrderItems] 📋 Active kitchen orders:', remainingActiveKitchenOrders.map(ko => ({
                id: ko.id,
                status: ko.status,
                isAdditional: ko.isAdditionalOrder,
                items: ko.items.length
              })));
            }

            console.log('[updateKitchenOrderItems] ✅ Kitchen order deleted');
            return; // Exit early, no need to update items
          }
        }

        // Use set callback to ensure we get fresh state
        set((state) => {
          const updatedOrders = state.kitchenOrders.map((ko) => {
            if (ko.id === kitchenOrderId) {
              console.log('[updateKitchenOrderItems] 🎯 Found kitchen order to update:', ko.id);
              // Create completely new object with new items array
              const updated = {
                ...ko,
                items: items.map(item => ({ ...item })) // Deep copy items
              };
              console.log('[updateKitchenOrderItems] 📝 Updated order:', {
                id: updated.id,
                itemsCount: updated.items.length,
                cancelledItems: updated.items.filter(i => i.cancelled).map(i => i.name)
              });
              return updated;
            }
            return ko;
          });

          console.log('[updateKitchenOrderItems] ✅ Final state update:', {
            totalOrders: updatedOrders.length,
            updatedOrder: updatedOrders.find(ko => ko.id === kitchenOrderId)?.items.map(i => ({
              name: i.name,
              cancelled: i.cancelled
            }))
          });

          return { kitchenOrders: updatedOrders };
        });

        // Verify state was actually updated
        setTimeout(() => {
          const currentState = get();
          const verifyOrder = currentState.kitchenOrders.find(ko => ko.id === kitchenOrderId);
          console.log('[updateKitchenOrderItems] 🔍 Verify in-memory state:', {
            found: !!verifyOrder,
            items: verifyOrder?.items.map(i => ({ name: i.name, cancelled: i.cancelled }))
          });

          // Also verify localStorage
          const stored = localStorage.getItem('pos-storage');
          if (stored) {
            const parsed = JSON.parse(stored);
            const persistedOrder = parsed.state.kitchenOrders.find((ko: any) => ko.id === kitchenOrderId);
            console.log('[updateKitchenOrderItems] 💾 Verify localStorage:', {
              found: !!persistedOrder,
              items: persistedOrder?.items.map((i: any) => ({ name: i.name, cancelled: i.cancelled }))
            });
          }
        }, 100);

        // Dispatch event for cross-tab sync
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('kitchen-items-changed', {
            detail: { kitchenOrderId, items, timestamp: Date.now() }
          }));
          console.log('[updateKitchenOrderItems] 📡 Dispatched kitchen-items-changed event');
        }, 0);
      },

      deleteKitchenOrder: (kitchenOrderId) => {
        set((state) => ({
          kitchenOrders: state.kitchenOrders.filter((ko) => ko.id !== kitchenOrderId),
        }));
      },

      // 🆕 Clear all served kitchen orders (for end of shift cleanup)
      clearServedKitchenOrders: () => {
        const { kitchenOrders } = get();
        const servedCount = kitchenOrders.filter(ko => ko.status === 'served').length;

        console.log(`[clearServedKitchenOrders] 🧹 Clearing ${servedCount} served orders`);

        set((state) => ({
          kitchenOrders: state.kitchenOrders.filter((ko) => ko.status !== 'served'),
        }));

        // Dispatch event for cross-tab sync
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('kitchen-status-changed', {
            detail: { action: 'clear-served', count: servedCount }
          }));
        }, 0);

        return servedCount;
      },

      // LEGACY - Keep for backward compatibility but log warning
      updateKitchenItemStatus: (
        kitchenOrderId: string,
        _itemId: string,
        status: KitchenOrder['status'],
      ) => {
        console.warn('[updateKitchenItemStatus] ⚠️ DEPRECATED - Use updateKitchenOrderStatus instead');
        // Just update the order status directly
        get().updateKitchenOrderStatus(kitchenOrderId, status);
      },

      autoServeKitchenOrderOnPayment: (orderId) => {
        console.log('[autoServeKitchenOrderOnPayment] 🍽️ Auto-serving all kitchen orders for paid order:', orderId);

        const { kitchenOrders } = get();
        // ✅ Find ALL kitchen orders for this orderId (not just the first one)
        const relatedKitchenOrders = kitchenOrders.filter(ko => ko.orderId === orderId && ko.status !== 'served');

        if (relatedKitchenOrders.length > 0) {
          console.log(`[autoServeKitchenOrderOnPayment] ✅ Found ${relatedKitchenOrders.length} kitchen order(s) to serve`);
          relatedKitchenOrders.forEach(ko => {
            get().updateKitchenOrderStatus(ko.id, 'served');
          });
        } else {
          console.log('[autoServeKitchenOrderOnPayment] ℹ️ No kitchen orders to serve');
        }
      },

      getKitchenOrdersByTable: (tableId) => {
        const { kitchenOrders } = get();
        return kitchenOrders.filter(ko =>
          ko.tableId === tableId && ko.status !== 'served'
        );
      },

      getKitchenOrderByOrderId: (orderId) => {
        const { kitchenOrders } = get();
        return kitchenOrders.find(ko => ko.orderId === orderId);
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
          tableAreas: initialTableArea,
          suppliers: [],
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
          tableReservations: [],
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

      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),

      // Self-service actions
      setCurrentTable: (table) => {
        set({ currentTable: table });
      },

      createSelfServiceOrder: (orderData) => {
        const {
          discount: orderLevelDiscount = 0,
          date: orderDate,
          timestamp: orderTimestamp,
          ...restOrderData
        } = orderData;
        const { cart, currentShift } = get();
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
          id: Date.now().toString(),
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
          if (p.productType === 'combo') prefix = 'combo';

          return {
            ...p,
            id: `${industry}-${prefix}-${String(index + 1).padStart(2, '0')}`,
          };
        });


        set({
          products: productsWithIds,
          categories: data.categories,
          productCategories: data.productCategories || [],
          selectedIndustry: industry,
          hasSelectedIndustry: true,
          tableAreas: initialTableArea,
          suppliers: demoSuppliers,
        });

        // Auto-load demo data based on industry
        if (industry === 'food-beverage') {
          // Load F&B demo orders with Kitchen Orders (new format)
          import('./demoDataKitchen').then(({ loadDemoFBWithKitchen }) => {
            const loaded = loadDemoFBWithKitchen();
            if (loaded) {
              // Reload state from localStorage after demo data is loaded
              setTimeout(() => {
                window.location.reload();
              }, 100);
            }
          });
        } else if (industry === 'spa-service') {
          // Load Spa demo orders
          import('./demoData').then(({ loadDemoSpaOrders }) => {
            const loaded = loadDemoSpaOrders();
            if (loaded) {
              // Reload state from localStorage after demo data is loaded
              setTimeout(() => {
                window.location.reload();
              }, 100);
            }
          });
        }
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

      // Table Area actions
      addTableArea: (tableArea) => {
        const id = `table_${Date.now()}`;
        set((state) => ({
          tableAreas: [
            ...(Array.isArray(state.tableAreas) ? state.tableAreas : []),
            {
              ...tableArea,
              id,
              createdAt: new Date().toISOString(),
            },
          ],
        }));
      },

      updateTableArea: (id, tableArea) => {
        set((state) => ({
          tableAreas: Array.isArray(state.tableAreas)
            ? state.tableAreas.map((t) =>
              t.id === id ? { ...t, ...tableArea } : t
            )
            : [],
        }));
      },

      deleteTableArea: (id) => {
        set((state) => ({
          tableAreas: Array.isArray(state.tableAreas)
            ? state.tableAreas.filter((t) => t.id !== id)
            : [],
        }));
      },


      // Supplier actions
      addSupplier: (supplier) => {
        const id = `supplier_${Date.now()}`;
        set((state) => ({
          suppliers: [
            ...(Array.isArray(state.suppliers) ? state.suppliers : []),
            {
              ...supplier,
              id,
              createdAt: new Date().toISOString(),
            },
          ],
        }));
      },

      updateSupplier: (id, supplier) => {
        set((state) => ({
          suppliers: Array.isArray(state.suppliers)
            ? state.suppliers.map((s) =>
              s.id === id ? { ...s, ...supplier } : s
            )
            : [],
        }));
      },

      deleteSupplier: (id) => {
        set((state) => ({
          suppliers: Array.isArray(state.suppliers)
            ? state.suppliers.filter((s) => s.id !== id)
            : [],
        }));
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
        const today = new Date().toISOString().split('T')[0].replace(/-/g, '');

        // Generate receipt number: IN-YYYYMMDD-XXX
        const existingReceipts = (stockInReceipts || []).filter(r =>
          r.receiptNumber.startsWith(`IN-${today}`)
        );
        const sequenceNum = String(existingReceipts.length + 1).padStart(3, '0');
        const receiptNumber = `IN-${today}-${sequenceNum}`;

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
        const today = new Date().toISOString().split('T')[0].replace(/-/g, '');

        // Generate receipt number: OUT-YYYYMMDD-XXX
        const existingReceipts = (stockOutReceipts || []).filter(r =>
          r.receiptNumber.startsWith(`OUT-${today}`)
        );
        const sequenceNum = String(existingReceipts.length + 1).padStart(3, '0');
        const receiptNumber = `OUT-${today}-${sequenceNum}`;

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
        const { stockOutReceipts, products } = get();
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

      usePackageSession: (packageId, sessionNumber) => {
        set((state) => ({
          customerTreatmentPackages: state.customerTreatmentPackages.map((pkg) =>
            pkg.id === packageId
              ? {
                ...pkg,
                usedSessionNumbers: [...pkg.usedSessionNumbers, sessionNumber],
                remainingSessions: pkg.remainingSessions - 1,
                isActive: pkg.remainingSessions - 1 > 0,
                updatedAt: new Date().toISOString(),
              }
              : pkg
          ),
        }));
      },

      // Return (refund) a session when appointment is cancelled
      returnPackageSession: (packageId, sessionNumber) => {
        set((state) => ({
          customerTreatmentPackages: state.customerTreatmentPackages.map((pkg) =>
            pkg.id === packageId && pkg.usedSessionNumbers.includes(sessionNumber)
              ? {
                ...pkg,
                usedSessionNumbers: pkg.usedSessionNumbers.filter(n => n !== sessionNumber),
                remainingSessions: pkg.remainingSessions + 1,
                isActive: true,
                updatedAt: new Date().toISOString(),
              }
              : pkg
          ),
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
          const hasService = pkg.sessions.some((session) =>
            session.items.some(
              (item) => item.productType === 'service' && item.productId === serviceId,
            ),
          );
          if (hasService) {
            return pkg;
          }
        }

        return null;
      },

      // ==================== TABLE MANAGEMENT ====================
      createTable: (tableData) => {
        const newTable: Table = {
          ...tableData,
          id: `table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          tables: [...state.tables, newTable],
        }));
      },

      updateTable: (tableId, updates) => {
        set((state) => ({
          tables: state.tables.map((table) =>
            table.id === tableId ? { ...table, ...updates } : table
          ),
        }));
      },

      deleteTable: (tableId) => {
        set((state) => ({
          tables: state.tables.filter((table) => table.id !== tableId),
        }));
      },

      updateTableStatus: (tableId, status) => {
        set((state) => ({
          tables: state.tables.map((table) =>
            table.id === tableId ? { ...table, status } : table
          ),
        }));
      },

      assignOrderToTable: (tableId, orderId, guests) => {
        set((state) => ({
          tables: state.tables.map((table) =>
            table.id === tableId
              ? {
                ...table,
                status: 'occupied' as const,
                currentOrderId: orderId,
                currentGuests: guests,
              }
              : table
          ),
        }));
      },

      clearTable: (tableId) => {
        set((state) => ({
          tables: state.tables.map((table) =>
            table.id === tableId
              ? {
                ...table,
                status: 'available' as const,
                currentOrderId: undefined,
                currentGuests: undefined,
              }
              : table
          ),
        }));
      },

      // ==================== TABLE RESERVATIONS ====================
      createTableReservation: (reservationData) => {
        const newReservation: TableReservation = {
          ...reservationData,
          id: `reservation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          tableReservations: [...state.tableReservations, newReservation],
        }));

        // Update table status to reserved if not already occupied
        const { updateTableStatus, tables } = get();
        const table = tables.find(t => t.id === reservationData.tableId);
        if (table && table.status === 'available') {
          updateTableStatus(reservationData.tableId, 'reserved');
        }
      },

      updateTableReservation: (reservationId, updates) => {
        set((state) => ({
          tableReservations: state.tableReservations.map((reservation) =>
            reservation.id === reservationId
              ? { ...reservation, ...updates, updatedAt: new Date().toISOString() }
              : reservation
          ),
        }));
      },

      deleteTableReservation: (reservationId) => {
        set((state) => ({
          tableReservations: state.tableReservations.filter(
            (reservation) => reservation.id !== reservationId
          ),
        }));
      },

      updateReservationStatus: (reservationId, status) => {
        set((state) => ({
          tableReservations: state.tableReservations.map((reservation) =>
            reservation.id === reservationId
              ? { ...reservation, status, updatedAt: new Date().toISOString() }
              : reservation
          ),
        }));

        // If status changed to 'arrived', update table to occupied
        // If cancelled or no-show, update table back to available
        const { tableReservations, updateTableStatus } = get();
        const reservation = tableReservations.find(r => r.id === reservationId);
        if (reservation) {
          if (status === 'arrived') {
            updateTableStatus(reservation.tableId, 'occupied');
          } else if (status === 'cancelled' || status === 'no-show') {
            updateTableStatus(reservation.tableId, 'available');
          }
        }
      },

      getTableReservations: (date) => {
        const { tableReservations } = get();
        return tableReservations.filter(
          (reservation) => reservation.reservationDate === date
        );
      },
    }),
    {
      name: 'pos-storage',
      onRehydrateStorage: () => (state) => {
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
          state.appointments = state.appointments.map((apt) => {
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

      },

    }

  )
);