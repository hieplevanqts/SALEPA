import type { Order, KitchenOrder, CartItem, KitchenOrderItem } from './store';

// Helper function to create date with offset
const getMinutesOffset = (minutesAgo: number): string => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - minutesAgo);
  return date.toISOString();
};

const getTimestampOffset = (minutesAgo: number): number => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - minutesAgo);
  return date.getTime();
};

type RawCartItem = Omit<CartItem, 'discount'> & Partial<Pick<CartItem, 'discount'>>;
type RawKitchenOrderItem = Omit<KitchenOrderItem, 'discount'> &
  Partial<Pick<KitchenOrderItem, 'discount'>>;

type RawOrder = Omit<Order, 'items'> & {
  items: RawCartItem[];
  paymentStatus?: string;
};
type RawKitchenOrder = Omit<KitchenOrder, 'items'> & { items: RawKitchenOrderItem[] };

const toCartItem = (item: RawCartItem): CartItem => ({
  discount: 0,
  ...item,
});

const toKitchenItem = (item: RawKitchenOrderItem): KitchenOrderItem => ({
  discount: 0,
  ...item,
});

// ==================== DEMO ORDERS ====================

/**
 * Demo Orders với Kitchen Orders theo logic mới:
 * - Bàn 3: Có món gọi bổ sung (isAdditionalOrder = true)
 * - Bàn 5: Có món bị hủy với lý do
 * - Bàn 7: Đơn chính + gọi thêm + hủy một phần
 */

const rawDemoFBOrdersWithKitchen: RawOrder[] = [
  // ========== BÀN 3 - Đơn Chính + Món Gọi Bổ Sung ==========
  {
    id: 'ORD-20260126-001',
    orderNumber: '#001',
    items: [
      { 
        id: '1', 
        name: 'Cà phê sữa đá', 
        price: 25000, 
        quantity: 2, 
        note: '',
        category: 'Đồ uống',
        stock: 100,
        type: 'product'
      },
      { 
        id: '2', 
        name: 'Bánh mì trứng', 
        price: 20000, 
        quantity: 1, 
        note: 'Không rau thơm',
        category: 'Đồ ăn',
        stock: 50,
        type: 'product'
      },
      // Món gọi thêm sau
      { 
        id: '3', 
        name: 'Nước cam ép', 
        price: 30000, 
        quantity: 1, 
        note: '',
        category: 'Đồ uống',
        stock: 80,
        type: 'product'
      },
    ],
    subtotal: 100000,
    discount: 0,
    total: 100000,
    date: getMinutesOffset(15),
    timestamp: getMinutesOffset(15),
    paymentMethod: 'cash',
    paymentStatus: 'unpaid',
    status: 'pending',
    customerName: 'Nguyễn Văn A',
    customerPhone: '0901234567',
    orderType: 'dine-in',
    tableId: 'table-3',
    tableName: 'Bàn 3',
    tableNumber: 3,
    createdBy: 'Thu ngân',
    notifiedItemIds: [
      { id: '1', quantity: 2 },
      { id: '2', quantity: 1 },
      { id: '3', quantity: 1 },
    ],
  },

  // ========== BÀN 5 - Đơn Có Món Bị Hủy ==========
  {
    id: 'ORD-20260126-002',
    orderNumber: '#002',
    items: [
      { 
        id: '4', 
        name: 'Phở bò tái', 
        price: 55000, 
        quantity: 2, 
        note: 'Không hành',
        category: 'Đồ ăn',
        stock: 30,
        type: 'product'
      },
      { 
        id: '5', 
        name: 'Trà đào cam sả', 
        price: 35000, 
        quantity: 1, 
        note: 'Ít đá',
        category: 'Đồ uống',
        stock: 60,
        type: 'product'
      },
      // Món bị hủy - đã bị xóa khỏi items
    ],
    subtotal: 145000,
    discount: 0,
    total: 145000,
    date: getMinutesOffset(20),
    timestamp: getMinutesOffset(20),
    paymentMethod: 'cash',
    paymentStatus: 'unpaid',
    status: 'pending',
    customerName: 'Trần Thị B',
    customerPhone: '0912345678',
    orderType: 'dine-in',
    tableId: 'table-5',
    tableName: 'Bàn 5',
    tableNumber: 5,
    createdBy: 'Thu ngân',
    notifiedItemIds: [
      { id: '4', quantity: 2 },
      { id: '5', quantity: 1 },
    ],
  },

  // ========== BÀN 7 - Combo Gia Đình + Gọi Thêm + Hủy Một Phần ==========
  {
    id: 'ORD-20260126-003',
    orderNumber: '#003',
    items: [
      { 
        id: '6', 
        name: 'Cơm gà nướng', 
        price: 45000, 
        quantity: 3, 
        note: '',
        category: 'Đồ ăn',
        stock: 40,
        type: 'product'
      },
      { 
        id: '7', 
        name: 'Gỏi cuốn tôm thịt (4 cuộn)', 
        price: 40000, 
        quantity: 1, 
        note: '',
        category: 'Đồ ăn',
        stock: 25,
        type: 'product'
      },
      { 
        id: '8', 
        name: 'Coca Cola', 
        price: 15000, 
        quantity: 2, 
        note: '',
        category: 'Đồ uống',
        stock: 100,
        type: 'product'
      },
    ],
    subtotal: 205000,
    discount: 0,
    total: 205000,
    date: getMinutesOffset(25),
    timestamp: getMinutesOffset(25),
    paymentMethod: 'cash',
    paymentStatus: 'unpaid',
    status: 'pending',
    customerName: 'Lê Văn C',
    customerPhone: '0923456789',
    orderType: 'dine-in',
    tableId: 'table-7',
    tableName: 'Bàn 7',
    tableNumber: 7,
    createdBy: 'Admin',
    notifiedItemIds: [
      { id: '6', quantity: 3 },
      { id: '7', quantity: 1 },
      { id: '8', quantity: 2 },
    ],
  },

  // ========== BÀN 10 - Đơn Đã Hoàn Thành ==========
  {
    id: 'ORD-20260126-004',
    orderNumber: '#004',
    items: [
      { 
        id: '9', 
        name: 'Bún chả Hà Nội', 
        price: 50000, 
        quantity: 1, 
        note: '',
        category: 'Đồ ăn',
        stock: 20,
        type: 'product'
      },
      { 
        id: '10', 
        name: 'Trà chanh', 
        price: 20000, 
        quantity: 1, 
        note: '',
        category: 'Đồ uống',
        stock: 80,
        type: 'product'
      },
    ],
    subtotal: 70000,
    discount: 0,
    total: 70000,
    date: getMinutesOffset(40),
    timestamp: getMinutesOffset(40),
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    status: 'completed',
    customerName: 'Phạm Thị D',
    customerPhone: '0934567890',
    orderType: 'dine-in',
    tableId: 'table-10',
    tableName: 'Bàn 10',
    tableNumber: 10,
    paidAt: getMinutesOffset(5),
    receivedAmount: 70000,
    changeAmount: 0,
    createdBy: 'Thu ngân',
    notifiedItemIds: [
      { id: '9', quantity: 1 },
      { id: '10', quantity: 1 },
    ],
  },
];

export const demoFBOrdersWithKitchen: Order[] = rawDemoFBOrdersWithKitchen.map(
  (order) => {
    const { items, paymentStatus: _paymentStatus, ...rest } = order;
    return {
      ...rest,
      items: items.map(toCartItem),
    };
  },
);

// ==================== DEMO KITCHEN ORDERS ====================

const rawDemoKitchenOrders: RawKitchenOrder[] = [
  // ========== BÀN 3 - KITCHEN ORDER 1: Đơn Chính ==========
  {
    id: 'KITCHEN-1737864000001',
    orderId: 'ORD-20260126-001',
    orderNumber: '#001',
    orderType: 'dine-in',
    tableId: 'table-3',
    tableName: 'Bàn 3',
    tableNumber: 3,
    items: [
      {
        id: '1-1737864000001-0',
        name: 'Cà phê sữa đá',
        price: 25000,
        quantity: 2,
        note: '',
        category: 'Đồ uống',
        stock: 100,
        type: 'product',
        notifiedAt: getMinutesOffset(15),
      },
      {
        id: '2-1737864000001-1',
        name: 'Bánh mì trứng',
        price: 20000,
        quantity: 1,
        note: 'Không rau thơm',
        category: 'Đồ ăn',
        stock: 50,
        type: 'product',
        notifiedAt: getMinutesOffset(15),
      },
    ],
    status: 'cooking',
    createdAt: getMinutesOffset(15),
    notifiedAt: getMinutesOffset(15),
    startTime: getTimestampOffset(15),
    cookingStartedAt: getMinutesOffset(12),
    customerName: 'Nguyễn Văn A',
    isAdditionalOrder: false, // ❌ Đơn chính
  },

  // ========== BÀN 3 - KITCHEN ORDER 2: Món Gọi Bổ Sung ==========
  {
    id: 'KITCHEN-1737864300001',
    orderId: 'ORD-20260126-001', // ✅ CÙNG ORDER ID
    orderNumber: '#001', // ✅ CÙNG SỐ ĐƠN
    orderType: 'dine-in',
    tableId: 'table-3',
    tableName: 'Bàn 3',
    tableNumber: 3,
    items: [
      {
        id: '3-1737864300001-0',
        name: 'Nước cam ép',
        price: 30000,
        quantity: 1,
        note: '',
        category: 'Đồ uống',
        stock: 80,
        type: 'product',
        notifiedAt: getMinutesOffset(10),
      },
    ],
    status: 'pending',
    createdAt: getMinutesOffset(10),
    notifiedAt: getMinutesOffset(10),
    startTime: getTimestampOffset(10),
    customerName: 'Nguyễn Văn A',
    isAdditionalOrder: true, // ✅ MÓN GỌI BỔ SUNG
  },

  // ========== BÀN 5 - KITCHEN ORDER 1: Có Món Bị Hủy ==========
  {
    id: 'KITCHEN-1737863400001',
    orderId: 'ORD-20260126-002',
    orderNumber: '#002',
    orderType: 'dine-in',
    tableId: 'table-5',
    tableName: 'Bàn 5',
    tableNumber: 5,
    items: [
      {
        id: '4-1737863400001-0',
        name: 'Phở bò tái',
        price: 55000,
        quantity: 2,
        note: 'Không hành',
        category: 'Đồ ăn',
        stock: 30,
        type: 'product',
        notifiedAt: getMinutesOffset(20),
      },
      {
        id: '5-1737863400001-1',
        name: 'Trà đào cam sả',
        price: 35000,
        quantity: 1,
        note: 'Ít đá',
        category: 'Đồ uống',
        stock: 60,
        type: 'product',
        notifiedAt: getMinutesOffset(20),
      },
      {
        id: '11-1737863400001-2',
        name: 'Chả giò (3 cuộn)',
        price: 35000,
        quantity: 1,
        note: '',
        category: 'Đồ ăn',
        stock: 40,
        type: 'product',
        notifiedAt: getMinutesOffset(20),
        cancelled: true, // ✅ Món bị hủy
        cancelReason: 'Khách đổi ý', // ✅ Lý do hủy
        cancelledQuantity: 1,
      },
    ],
    status: 'cooking',
    createdAt: getMinutesOffset(20),
    notifiedAt: getMinutesOffset(20),
    startTime: getTimestampOffset(20),
    cookingStartedAt: getMinutesOffset(18),
    customerName: 'Trần Thị B',
    isAdditionalOrder: false,
  },

  // ========== BÀN 7 - KITCHEN ORDER 1: Đơn Chính ==========
  {
    id: 'KITCHEN-1737862900001',
    orderId: 'ORD-20260126-003',
    orderNumber: '#003',
    orderType: 'dine-in',
    tableId: 'table-7',
    tableName: 'Bàn 7',
    tableNumber: 7,
    items: [
      {
        id: '6-1737862900001-0',
        name: 'Cơm gà nướng',
        price: 45000,
        quantity: 3,
        note: '',
        category: 'Đồ ăn',
        stock: 40,
        type: 'product',
        notifiedAt: getMinutesOffset(25),
      },
      {
        id: '7-1737862900001-1',
        name: 'Gỏi cuốn tôm thịt (4 cuộn)',
        price: 40000,
        quantity: 1,
        note: '',
        category: 'Đồ ăn',
        stock: 25,
        type: 'product',
        notifiedAt: getMinutesOffset(25),
      },
      {
        id: '8-1737862900001-2',
        name: 'Coca Cola',
        price: 15000,
        quantity: 2,
        note: '',
        category: 'Đồ uống',
        stock: 100,
        type: 'product',
        notifiedAt: getMinutesOffset(25),
      },
    ],
    status: 'completed',
    createdAt: getMinutesOffset(25),
    notifiedAt: getMinutesOffset(25),
    startTime: getTimestampOffset(25),
    cookingStartedAt: getMinutesOffset(23),
    completedAt: getMinutesOffset(10),
    customerName: 'Lê Văn C',
    isAdditionalOrder: false,
  },

  // ========== BÀN 7 - KITCHEN ORDER 2: Món Gọi Bổ Sung + Hủy Một Phần ==========
  {
    id: 'KITCHEN-1737863700001',
    orderId: 'ORD-20260126-003', // ✅ CÙNG ORDER ID
    orderNumber: '#003', // ✅ CÙNG SỐ ĐƠN
    orderType: 'dine-in',
    tableId: 'table-7',
    tableName: 'Bàn 7',
    tableNumber: 7,
    items: [
      {
        id: '12-1737863700001-0',
        name: 'Trà sữa trân châu',
        price: 35000,
        quantity: 2,
        note: '',
        category: 'Đồ uống',
        stock: 70,
        type: 'product',
        notifiedAt: getMinutesOffset(12),
        cancelled: false,
        cancelledQuantity: 1, // ✅ Hủy 1 trong 2
      },
      {
        id: '13-1737863700001-1',
        name: 'Bún bò Huế',
        price: 55000,
        quantity: 1,
        note: '',
        category: 'Đồ ăn',
        stock: 20,
        type: 'product',
        notifiedAt: getMinutesOffset(12),
        cancelled: true, // ✅ Hủy toàn bộ
        cancelReason: 'Hết nguyên liệu',
        cancelledQuantity: 1,
      },
    ],
    status: 'cooking',
    createdAt: getMinutesOffset(12),
    notifiedAt: getMinutesOffset(12),
    startTime: getTimestampOffset(12),
    cookingStartedAt: getMinutesOffset(10),
    customerName: 'Lê Văn C',
    isAdditionalOrder: true, // ✅ MÓN GỌI BỔ SUNG
  },

  // ========== BÀN 10 - KITCHEN ORDER: Đã Phục Vụ ==========
  {
    id: 'KITCHEN-1737861600001',
    orderId: 'ORD-20260126-004',
    orderNumber: '#004',
    orderType: 'dine-in',
    tableId: 'table-10',
    tableName: 'Bàn 10',
    tableNumber: 10,
    items: [
      {
        id: '9-1737861600001-0',
        name: 'Bún chả Hà Nội',
        price: 50000,
        quantity: 1,
        note: '',
        category: 'Đồ ăn',
        stock: 20,
        type: 'product',
        notifiedAt: getMinutesOffset(40),
      },
      {
        id: '10-1737861600001-1',
        name: 'Trà chanh',
        price: 20000,
        quantity: 1,
        note: '',
        category: 'Đồ uống',
        stock: 80,
        type: 'product',
        notifiedAt: getMinutesOffset(40),
      },
    ],
    status: 'served',
    createdAt: getMinutesOffset(40),
    notifiedAt: getMinutesOffset(40),
    startTime: getTimestampOffset(40),
    cookingStartedAt: getMinutesOffset(38),
    completedAt: getMinutesOffset(30),
    servedAt: getMinutesOffset(5),
    customerName: 'Phạm Thị D',
    isAdditionalOrder: false,
  },
];

export const demoKitchenOrders: KitchenOrder[] = rawDemoKitchenOrders.map(
  (order) => ({
    ...order,
    items: order.items.map(toKitchenItem),
  }),
);

// Function to load demo F&B data with Kitchen Orders
export function loadDemoFBWithKitchen() {
  const storage = localStorage.getItem('pos-store');
  if (storage) {
    const data = JSON.parse(storage);
    
    // Check if already has demo data
    const hasDemo = data.state?.orders?.some((order: Order) => 
      order.id.startsWith('ORD-20260126')
    );
    
    if (!hasDemo) {
      // Add demo orders
      const currentOrders = data.state?.orders || [];
      data.state.orders = [...demoFBOrdersWithKitchen, ...currentOrders];
      
      // Add demo kitchen orders
      const currentKitchenOrders = data.state?.kitchenOrders || [];
      data.state.kitchenOrders = [...demoKitchenOrders, ...currentKitchenOrders];
      
      localStorage.setItem('pos-store', JSON.stringify(data));
      console.log('✅ Demo F&B Orders with Kitchen Orders loaded successfully!');
      console.log('   - Orders:', demoFBOrdersWithKitchen.length);
      console.log('   - Kitchen Orders:', demoKitchenOrders.length);
      console.log('   - Additional Orders (with badge):', demoKitchenOrders.filter(ko => ko.isAdditionalOrder).length);
      console.log('   - Cancelled Items:', demoKitchenOrders.reduce((sum, ko) => 
        sum + ko.items.filter(i => i.cancelled).length, 0
      ));
      return true;
    } else {
      console.log('ℹ️ Demo F&B data already loaded');
      return false;
    }
  } else {
    // Create new storage with demo data
    const initialData = {
      state: {
        orders: demoFBOrdersWithKitchen,
        kitchenOrders: demoKitchenOrders,
        products: [],
        cart: [],
        language: 'vi',
      },
      version: 0,
    };
    localStorage.setItem('pos-store', JSON.stringify(initialData));
    console.log('✅ Created new storage with demo F&B data!');
    return true;
  }
}

// Function to force reload demo data (replace existing)
export function forceLoadDemoFBWithKitchen() {
  const storage = localStorage.getItem('pos-store');
  if (storage) {
    const data = JSON.parse(storage);
    
    // Replace orders and kitchen orders
    data.state.orders = demoFBOrdersWithKitchen;
    data.state.kitchenOrders = demoKitchenOrders;
    
    localStorage.setItem('pos-store', JSON.stringify(data));
    console.log('✅ Force loaded demo F&B data!');
    console.log('   - Orders:', demoFBOrdersWithKitchen.length);
    console.log('   - Kitchen Orders:', demoKitchenOrders.length);
    window.location.reload();
  }
}

// Expose to window for console testing
if (typeof window !== 'undefined') {
  (window as any).loadDemoFBWithKitchen = loadDemoFBWithKitchen;
  (window as any).forceLoadDemoFBWithKitchen = forceLoadDemoFBWithKitchen;
  console.log('💡 Tip: Run loadDemoFBWithKitchen() to load demo data with Kitchen Orders');
  console.log('💡 Tip: Run forceLoadDemoFBWithKitchen() to force reload demo data');
}
