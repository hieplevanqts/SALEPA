import type { Order, CustomerTreatmentPackage, Table, CartItem } from './store';

// Helper function to create date with offset
const getDateOffset = (hoursAgo: number): string => {
  const date = new Date();
  date.setHours(date.getHours() - hoursAgo);
  return date.toISOString();
};

const getDaysOffset = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

const getMinutesOffset = (minutesAgo: number): string => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - minutesAgo);
  return date.toISOString();
};

type RawCartItem = Omit<CartItem, 'discount' | 'category' | 'stock'> &
  Partial<Pick<CartItem, 'discount' | 'category' | 'stock'>>;

const toCartItem = (item: RawCartItem): CartItem => ({
  discount: 0,
  category: 'Khác',
  stock: 0,
  ...item,
});

const normalizeOrderItems = (
  order: Omit<Order, 'items'> & { items: RawCartItem[] },
): Order => ({
  ...order,
  items: order.items.map(toCartItem),
});

// Demo F&B Orders for Kitchen View
const rawDemoFBOrders = [
  // Bàn 1 - Mới vào
  {
    id: 'FB001',
    cart: [
      { id: 'fb-drink-01', name: 'Cà phê sữa đá', price: 25000, quantity: 2, note: '' },
      { id: 'fb-food-01', name: 'Bánh mì trứng', price: 20000, quantity: 1, note: 'Không rau thơm' },
    ],
    items: [
      { id: 'fb-drink-01', name: 'Cà phê sữa đá', price: 25000, quantity: 2, note: '', type: 'product' },
      { id: 'fb-food-01', name: 'Bánh mì trứng', price: 20000, quantity: 1, note: 'Không rau thơm', type: 'product' },
    ],
    subtotal: 70000,
    discount: 0,
    total: 70000,
    date: getMinutesOffset(3),
    timestamp: getMinutesOffset(3),
    paymentMethod: 'cash',
    customerName: 'Nguyễn Văn A',
    customerPhone: '0901234567',
    status: 'completed',
    tableNumber: 1,
    tableName: 'Bàn 1',
    orderType: 'dine-in',
    paidAt: getMinutesOffset(3),
    receivedAmount: 70000,
    changeAmount: 0,
    createdBy: 'Thu ngân',
  },
  // Bàn 5 - Phở bò
  {
    id: 'FB002',
    cart: [
      { id: 'fb-food-02', name: 'Phở bò tái', price: 55000, quantity: 2, note: 'Không hành' },
      { id: 'fb-drink-02', name: 'Nước cam vắt', price: 30000, quantity: 1, note: '' },
      { id: 'fb-food-03', name: 'Chả giò (3 cuộn)', price: 35000, quantity: 1, note: 'Thêm rau sống' },
    ],
    items: [
      { id: 'fb-food-02', name: 'Phở bò tái', price: 55000, quantity: 2, note: 'Không hành', type: 'product' },
      { id: 'fb-drink-02', name: 'Nước cam vắt', price: 30000, quantity: 1, note: '', type: 'product' },
      { id: 'fb-food-03', name: 'Chả giò (3 cuộn)', price: 35000, quantity: 1, note: 'Thêm rau sống', type: 'product' },
    ],
    subtotal: 175000,
    discount: 0,
    total: 175000,
    date: getMinutesOffset(8),
    timestamp: getMinutesOffset(8),
    paymentMethod: 'cash',
    customerName: 'Trần Thị B',
    customerPhone: '0912345678',
    status: 'completed',
    tableNumber: 5,
    tableName: 'Bàn 5',
    orderType: 'dine-in',
    note: 'Khách hàng VIP - ưu tiên',
    paidAt: getMinutesOffset(8),
    receivedAmount: 180000,
    changeAmount: 5000,
    createdBy: 'Admin',
  },
  // Bàn 3 - Combo gia đình
  {
    id: 'FB003',
    cart: [
      { id: 'fb-food-04', name: 'Cơm gà nướng', price: 45000, quantity: 3, note: '' },
      { id: 'fb-food-05', name: 'Gỏi cuốn tôm thịt (4 cuộn)', price: 40000, quantity: 2, note: '' },
      { id: 'fb-drink-03', name: 'Trà đào cam sả', price: 35000, quantity: 2, note: 'Ít đá' },
      { id: 'fb-drink-04', name: 'Coca Cola', price: 15000, quantity: 2, note: '' },
    ],
    items: [
      { id: 'fb-food-04', name: 'Cơm gà nướng', price: 45000, quantity: 3, note: '', type: 'product' },
      { id: 'fb-food-05', name: 'Gỏi cuốn tôm thịt (4 cuộn)', price: 40000, quantity: 2, note: '', type: 'product' },
      { id: 'fb-drink-03', name: 'Trà đào cam sả', price: 35000, quantity: 2, note: 'Ít đá', type: 'product' },
      { id: 'fb-drink-04', name: 'Coca Cola', price: 15000, quantity: 2, note: '', type: 'product' },
    ],
    subtotal: 295000,
    discount: 0,
    total: 295000,
    date: getMinutesOffset(12),
    timestamp: getMinutesOffset(12),
    paymentMethod: 'card',
    customerName: 'Lê Văn C',
    customerPhone: '0923456789',
    status: 'completed',
    tableNumber: 3,
    tableName: 'Bàn 3',
    orderType: 'dine-in',
    paidAt: getMinutesOffset(12),
    receivedAmount: 295000,
    changeAmount: 0,
    createdBy: 'Thu ngân',
  },
  // Bàn 8 - Order lớn
  {
    id: 'FB004',
    cart: [
      { id: 'fb-food-06', name: 'Lẩu Thái hải sản', price: 350000, quantity: 1, note: 'Thêm rau' },
      { id: 'fb-food-07', name: 'Mì trộn hải sản', price: 65000, quantity: 2, note: '' },
      { id: 'fb-drink-05', name: 'Nước dừa tươi', price: 25000, quantity: 3, note: '' },
      { id: 'fb-food-08', name: 'Sườn nướng BBQ', price: 85000, quantity: 1, note: 'Chín kỹ' },
    ],
    items: [
      { id: 'fb-food-06', name: 'Lẩu Thái hải sản', price: 350000, quantity: 1, note: 'Thêm rau', type: 'product' },
      { id: 'fb-food-07', name: 'Mì trộn hải sản', price: 65000, quantity: 2, note: '', type: 'product' },
      { id: 'fb-drink-05', name: 'Nước dừa tươi', price: 25000, quantity: 3, note: '', type: 'product' },
      { id: 'fb-food-08', name: 'Sườn nướng BBQ', price: 85000, quantity: 1, note: 'Chín kỹ', type: 'product' },
    ],
    subtotal: 590000,
    discount: 50000,
    total: 540000,
    date: getMinutesOffset(5),
    timestamp: getMinutesOffset(5),
    paymentMethod: 'transfer',
    customerName: 'Phạm Thị D',
    customerPhone: '0934567890',
    status: 'completed',
    tableNumber: 8,
    tableName: 'Bàn 8',
    orderType: 'dine-in',
    note: 'Khách đ��t tiệc - giảm 50k',
    paidAt: getMinutesOffset(5),
    receivedAmount: 540000,
    changeAmount: 0,
    createdBy: 'Thu ngân',
  },
  // Mang về - Bún chả
  {
    id: 'FB005',
    cart: [
      { id: 'fb-food-09', name: 'Bún chả Hà Nội', price: 50000, quantity: 3, note: 'Thêm chả' },
      { id: 'fb-food-10', name: 'Nem rán (6 cuộn)', price: 45000, quantity: 2, note: '' },
      { id: 'fb-drink-06', name: 'Trà chanh', price: 20000, quantity: 3, note: 'Ít đường' },
    ],
    items: [
      { id: 'fb-food-09', name: 'Bún chả Hà Nội', price: 50000, quantity: 3, note: 'Thêm chả', type: 'product' },
      { id: 'fb-food-10', name: 'Nem rán (6 cuộn)', price: 45000, quantity: 2, note: '', type: 'product' },
      { id: 'fb-drink-06', name: 'Trà chanh', price: 20000, quantity: 3, note: 'Ít đường', type: 'product' },
    ],
    subtotal: 300000,
    discount: 0,
    total: 300000,
    date: getMinutesOffset(15),
    timestamp: getMinutesOffset(15),
    paymentMethod: 'momo',
    customerName: 'Hoàng Văn E',
    customerPhone: '0945678901',
    status: 'completed',
    orderType: 'takeaway',
    paidAt: getMinutesOffset(15),
    receivedAmount: 300000,
    changeAmount: 0,
    createdBy: 'Thu ngân',
  },
  // Giao hàng - Pizza
  {
    id: 'FB006',
    cart: [
      { id: 'fb-food-11', name: 'Pizza hải sản (size L)', price: 250000, quantity: 1, note: 'Không hành tây' },
      { id: 'fb-food-12', name: 'Pizza xúc xích (size M)', price: 180000, quantity: 1, note: '' },
      { id: 'fb-drink-07', name: 'Pepsi lon', price: 15000, quantity: 4, note: '' },
      { id: 'fb-food-13', name: 'Gà rán (4 miếng)', price: 80000, quantity: 1, note: 'Cay vừa' },
    ],
    items: [
      { id: 'fb-food-11', name: 'Pizza hải sản (size L)', price: 250000, quantity: 1, note: 'Không hành tây', type: 'product' },
      { id: 'fb-food-12', name: 'Pizza xúc xích (size M)', price: 180000, quantity: 1, note: '', type: 'product' },
      { id: 'fb-drink-07', name: 'Pepsi lon', price: 15000, quantity: 4, note: '', type: 'product' },
      { id: 'fb-food-13', name: 'Gà rán (4 miếng)', price: 80000, quantity: 1, note: 'Cay vừa', type: 'product' },
    ],
    subtotal: 570000,
    discount: 0,
    total: 570000,
    date: getMinutesOffset(20),
    timestamp: getMinutesOffset(20),
    paymentMethod: 'cash',
    customerName: 'Vũ Thị F',
    customerPhone: '0956789012',
    status: 'completed',
    orderType: 'delivery',
    note: 'Giao đến: 123 Nguyễn Huệ, Q1',
    paidAt: getMinutesOffset(20),
    receivedAmount: 600000,
    changeAmount: 30000,
    createdBy: 'Thu ngân',
  },
  // Bàn 2 - Đồ uống
  {
    id: 'FB007',
    cart: [
      { id: 'fb-drink-08', name: 'Sinh tố bơ', price: 35000, quantity: 2, note: 'Ít đường' },
      { id: 'fb-drink-09', name: 'Cà phê đen đá', price: 20000, quantity: 1, note: '' },
      { id: 'fb-food-14', name: 'Bánh flan', price: 25000, quantity: 2, note: '' },
    ],
    items: [
      { id: 'fb-drink-08', name: 'Sinh tố bơ', price: 35000, quantity: 2, note: 'Ít đường', type: 'product' },
      { id: 'fb-drink-09', name: 'Cà phê đen đá', price: 20000, quantity: 1, note: '', type: 'product' },
      { id: 'fb-food-14', name: 'Bánh flan', price: 25000, quantity: 2, note: '', type: 'product' },
    ],
    subtotal: 135000,
    discount: 0,
    total: 135000,
    date: getMinutesOffset(25),
    timestamp: getMinutesOffset(25),
    paymentMethod: 'cash',
    customerName: 'Đỗ Văn G',
    customerPhone: '0967890123',
    status: 'completed',
    tableNumber: 2,
    orderType: 'dine-in',
    paidAt: getMinutesOffset(25),
    receivedAmount: 150000,
    changeAmount: 15000,
    createdBy: 'Thu ngân',
  },
  // Giao hàng - Combo sáng
  {
    id: 'FB008',
    cart: [
      { id: 'fb-food-15', name: 'Bánh mì pate', price: 18000, quantity: 5, note: '' },
      { id: 'fb-drink-10', name: 'Sữa đậu nành', price: 15000, quantity: 5, note: '' },
      { id: 'fb-food-16', name: 'Xôi gà', price: 30000, quantity: 2, note: 'Thêm đậu phộng' },
    ],
    items: [
      { id: 'fb-food-15', name: 'Bánh mì pate', price: 18000, quantity: 5, note: '', type: 'product' },
      { id: 'fb-drink-10', name: 'Sữa đậu nành', price: 15000, quantity: 5, note: '', type: 'product' },
      { id: 'fb-food-16', name: 'Xôi gà', price: 30000, quantity: 2, note: 'Thêm đậu phộng', type: 'product' },
    ],
    subtotal: 225000,
    discount: 0,
    total: 225000,
    date: getMinutesOffset(30),
    timestamp: getMinutesOffset(30),
    paymentMethod: 'momo',
    customerName: 'Ngô Thị H',
    customerPhone: '0978901234',
    status: 'completed',
    orderType: 'delivery',
    note: 'Giao trước 8h sáng',
    paidAt: getMinutesOffset(30),
    receivedAmount: 225000,
    changeAmount: 0,
    createdBy: 'Thu ngân',
  },
  // Bàn 10 - Món Nhật
  {
    id: 'FB009',
    cart: [
      { id: 'fb-food-17', name: 'Sushi cá hồi (8 miếng)', price: 120000, quantity: 1, note: '' },
      { id: 'fb-food-18', name: 'Ramen tonkotsu', price: 95000, quantity: 2, note: 'Trứng lòng đào' },
      { id: 'fb-drink-11', name: 'Trà xanh Nhật', price: 25000, quantity: 2, note: '' },
      { id: 'fb-food-19', name: 'Takoyaki (6 viên)', price: 55000, quantity: 1, note: 'Nhiều sốt' },
    ],
    items: [
      { id: 'fb-food-17', name: 'Sushi cá hồi (8 miếng)', price: 120000, quantity: 1, note: '', type: 'product' },
      { id: 'fb-food-18', name: 'Ramen tonkotsu', price: 95000, quantity: 2, note: 'Trứng lòng đào', type: 'product' },
      { id: 'fb-drink-11', name: 'Trà xanh Nhật', price: 25000, quantity: 2, note: '', type: 'product' },
      { id: 'fb-food-19', name: 'Takoyaki (6 viên)', price: 55000, quantity: 1, note: 'Nhiều sốt', type: 'product' },
    ],
    subtotal: 415000,
    discount: 0,
    total: 415000,
    date: getMinutesOffset(35),
    timestamp: getMinutesOffset(35),
    paymentMethod: 'card',
    customerName: 'Bùi Văn I',
    customerPhone: '0989012345',
    status: 'completed',
    tableNumber: 10,
    orderType: 'dine-in',
    paidAt: getMinutesOffset(35),
    receivedAmount: 415000,
    changeAmount: 0,
    createdBy: 'Thu ngân',
  },
  // Mang về - Combo trưa
  {
    id: 'FB010',
    cart: [
      { id: 'fb-food-20', name: 'Cơm sườn bì chả', price: 45000, quantity: 4, note: '' },
      { id: 'fb-food-21', name: 'Canh chua cá', price: 60000, quantity: 1, note: 'Ít cay' },
      { id: 'fb-drink-12', name: 'Trá đá', price: 10000, quantity: 4, note: '' },
    ],
    items: [
      { id: 'fb-food-20', name: 'Cơm sườn bì chả', price: 45000, quantity: 4, note: '', type: 'product' },
      { id: 'fb-food-21', name: 'Canh chua cá', price: 60000, quantity: 1, note: 'Ít cay', type: 'product' },
      { id: 'fb-drink-12', name: 'Trá đá', price: 10000, quantity: 4, note: '', type: 'product' },
    ],
    subtotal: 280000,
    discount: 20000,
    total: 260000,
    date: getMinutesOffset(40),
    timestamp: getMinutesOffset(40),
    paymentMethod: 'cash',
    customerName: 'Lý Thị K',
    customerPhone: '0990123456',
    status: 'completed',
    orderType: 'takeaway',
    note: 'Khách quen - giảm 20k',
    paidAt: getMinutesOffset(40),
    receivedAmount: 260000,
    changeAmount: 0,
    createdBy: 'Thu ngân',
  },
  // Bàn 7 - Món Hàn
  {
    id: 'FB011',
    cart: [
      { id: 'fb-food-22', name: 'Bibimbap', price: 75000, quantity: 2, note: 'Cay vừa' },
      { id: 'fb-food-23', name: 'Tokbokki', price: 55000, quantity: 1, note: 'Thêm phô mai' },
      { id: 'fb-food-24', name: 'Gà rán Hàn Quốc', price: 120000, quantity: 1, note: 'Sốt mật ong' },
      { id: 'fb-drink-13', name: 'Trà đào', price: 30000, quantity: 2, note: '' },
    ],
    items: [
      { id: 'fb-food-22', name: 'Bibimbap', price: 75000, quantity: 2, note: 'Cay vừa', type: 'product' },
      { id: 'fb-food-23', name: 'Tokbokki', price: 55000, quantity: 1, note: 'Thêm phô mai', type: 'product' },
      { id: 'fb-food-24', name: 'Gà rán Hàn Quốc', price: 120000, quantity: 1, note: 'Sốt mật ong', type: 'product' },
      { id: 'fb-drink-13', name: 'Trà đào', price: 30000, quantity: 2, note: '', type: 'product' },
    ],
    subtotal: 385000,
    discount: 0,
    total: 385000,
    date: getMinutesOffset(10),
    timestamp: getMinutesOffset(10),
    paymentMethod: 'transfer',
    customerName: 'Mai Văn L',
    customerPhone: '0901234568',
    status: 'completed',
    tableNumber: 7,
    orderType: 'dine-in',
    paidAt: getMinutesOffset(10),
    receivedAmount: 385000,
    changeAmount: 0,
    createdBy: 'Thu ngân',
  },
  // Bàn 4 - Đồ Thái
  {
    id: 'FB012',
    cart: [
      { id: 'fb-food-25', name: 'Pad Thai', price: 65000, quantity: 2, note: 'Không đậu phộng' },
      { id: 'fb-food-26', name: 'Tom Yum Goong', price: 95000, quantity: 1, note: 'Cay nhiều' },
      { id: 'fb-drink-14', name: 'Trà Thái', price: 30000, quantity: 2, note: 'Ít đá' },
    ],
    items: [
      { id: 'fb-food-25', name: 'Pad Thai', price: 65000, quantity: 2, note: 'Không đậu phộng', type: 'product' },
      { id: 'fb-food-26', name: 'Tom Yum Goong', price: 95000, quantity: 1, note: 'Cay nhiều', type: 'product' },
      { id: 'fb-drink-14', name: 'Trà Thái', price: 30000, quantity: 2, note: 'Ít đá', type: 'product' },
    ],
    subtotal: 285000,
    discount: 0,
    total: 285000,
    date: getMinutesOffset(18),
    timestamp: getMinutesOffset(18),
    paymentMethod: 'momo',
    customerName: 'Phan Thị M',
    customerPhone: '0912345679',
    status: 'completed',
    tableNumber: 4,
    orderType: 'dine-in',
    note: 'Ưu tiên - khách đang đói',
    paidAt: getMinutesOffset(18),
    receivedAmount: 285000,
    changeAmount: 0,
    createdBy: 'Thu ngân',
  },
];

export const demoFBOrders: Order[] =
  rawDemoFBOrders.map(normalizeOrderItems);

export const demoSpaOrders: Order[] = [
  // Pending orders - Chưa thanh toán
  {
    id: 'SPA001',
    items: [
      { id: 'S1', name: 'Massage body thư giãn', price: 350000, category: 'Massage', stock: 999, quantity: 1, discount: 0, productType: 'service', duration: 90 },
      { id: 'P1', name: 'Tinh dầu Lavender', price: 120000, category: 'Sản phẩm', stock: 45, quantity: 1, discount: 0, productType: 'product' },
    ],
    subtotal: 470000,
    discount: 0,
    total: 470000,
    date: getDateOffset(1),
    timestamp: getDateOffset(1),
    paymentMethod: 'cash',
    customerName: 'Nguyễn Thu Hà',
    customerPhone: '0912345678',
    status: 'pending',
    note: 'Khách hàng yêu cầu kỹ thuật viên nữ',
  },
  {
    id: 'SPA002',
    items: [
      { id: 'S2', name: 'Chăm sóc da mặt cao cấp', price: 450000, category: 'Chăm sóc da', stock: 999, quantity: 1, discount: 0, productType: 'service', duration: 75 },
      { id: 'S3', name: 'Massage mặt collagen', price: 250000, category: 'Chăm sóc da', stock: 999, quantity: 1, discount: 0, productType: 'service', duration: 45 },
    ],
    subtotal: 700000,
    discount: 50000,
    total: 650000,
    date: getDateOffset(0.5),
    timestamp: getDateOffset(0.5),
    paymentMethod: 'card',
    customerName: 'Trần Minh Anh',
    customerPhone: '0987654321',
    status: 'pending',
    note: 'Khách VIP - giảm giá 50k',
  },
  {
    id: 'SPA003',
    items: [
      { id: 'T1', name: 'Liệu trình trị mụn 10 buổi', price: 3500000, category: 'Liệu trình', stock: 999, quantity: 1, discount: 0, productType: 'treatment', sessions: 10, duration: 60 },
    ],
    subtotal: 3500000,
    discount: 500000,
    total: 3000000,
    date: getDateOffset(0.3),
    timestamp: getDateOffset(0.3),
    paymentMethod: 'transfer',
    customerName: 'Lê Phương Thảo',
    customerPhone: '0901234567',
    status: 'pending',
    note: 'Đã đặt cọc 1,000,000đ',
  },

  // Completed orders - Hôm nay
  {
    id: 'SPA004',
    items: [
      { id: 'S4', name: 'Massage foot đá nóng', price: 280000, category: 'Massage', stock: 999, quantity: 1, discount: 0, productType: 'service', duration: 60 },
      { id: 'P2', name: 'Kem massage chân', price: 85000, category: 'Sản phẩm', stock: 32, quantity: 1, discount: 0, productType: 'product' },
    ],
    subtotal: 365000,
    discount: 0,
    total: 365000,
    date: getDateOffset(2),
    timestamp: getDateOffset(2),
    paymentMethod: 'cash',
    customerName: 'Phạm Văn Đức',
    customerPhone: '0923456789',
    status: 'completed',
    paidAt: getDateOffset(2),
    receivedAmount: 400000,
    changeAmount: 35000,
    paymentHistory: [
      {
        id: 'PAY-SPA004-1',
        amount: 400000,
        paymentMethod: 'cash',
        paidAt: getDateOffset(2),
        paidBy: 'admin',
        note: '',
        changeAmount: 35000,
      },
    ],
  },
  {
    id: 'SPA005',
    items: [
      { id: 'S5', name: 'Waxing toàn thân', price: 600000, category: 'Waxing', stock: 999, quantity: 1, discount: 0, productType: 'service', duration: 90 },
      { id: 'P3', name: 'Gel làm dịu da', price: 150000, category: 'Sản phẩm', stock: 28, quantity: 1, discount: 0, productType: 'product' },
    ],
    subtotal: 750000,
    discount: 0,
    total: 750000,
    date: getDateOffset(3),
    timestamp: getDateOffset(3),
    paymentMethod: 'momo',
    customerName: 'Hoàng Thị Mai',
    customerPhone: '0934567890',
    status: 'completed',
    paidAt: getDateOffset(3),
    receivedAmount: 750000,
    changeAmount: 0,
    paymentHistory: [
      {
        id: 'PAY-SPA005-1',
        amount: 750000,
        paymentMethod: 'momo',
        paidAt: getDateOffset(3),
        paidBy: 'admin',
        note: '',
        changeAmount: 0,
      },
    ],
  },
  {
    id: 'SPA006',
    items: [
      { id: 'S6', name: 'Nail gel tay + chân', price: 350000, category: 'Nail', stock: 999, quantity: 1, discount: 0, productType: 'service', duration: 120 },
      { id: 'P4', name: 'Son móng OPI', price: 180000, category: 'Sản phẩm', stock: 15, quantity: 2, discount: 0, productType: 'product' },
    ],
    subtotal: 710000,
    discount: 10000,
    total: 700000,
    date: getDateOffset(4),
    timestamp: getDateOffset(4),
    paymentMethod: 'card',
    customerName: 'Vũ Linh Chi',
    customerPhone: '0945678901',
    status: 'completed',
    paidAt: getDateOffset(4),
    receivedAmount: 700000,
    changeAmount: 0,
    paymentHistory: [
      {
        id: 'PAY-SPA006-1',
        amount: 700000,
        paymentMethod: 'card',
        paidAt: getDateOffset(4),
        paidBy: 'admin',
        note: '',
        changeAmount: 0,
      },
    ],
  },
  {
    id: 'SPA007',
    items: [
      { id: 'S7', name: 'Massage body tinh dầu quế', price: 400000, category: 'Massage', stock: 999, quantity: 1, discount: 0, productType: 'service', duration: 90 },
      { id: 'S8', name: 'Massage đầu vai gáy', price: 200000, category: 'Massage', stock: 999, quantity: 1, discount: 0, productType: 'service', duration: 30 },
    ],
    subtotal: 600000,
    discount: 50000,
    total: 550000,
    date: getDateOffset(5),
    timestamp: getDateOffset(5),
    paymentMethod: 'cash',
    customerName: 'Đặng Quốc Huy',
    customerPhone: '0956789012',
    status: 'completed',
    paidAt: getDateOffset(5),
    receivedAmount: 550000,
    changeAmount: 0,
    note: 'Khách hàng quen - giảm 50k',
    paymentHistory: [
      {
        id: 'PAY-SPA007-1',
        amount: 550000,
        paymentMethod: 'cash',
        paidAt: getDateOffset(5),
        paidBy: 'admin',
        note: 'Khách hàng quen - giảm 50k',
        changeAmount: 0,
      },
    ],
  },
  {
    id: 'SPA008',
    items: [
      { id: 'S9', name: 'Điều trị mụn chuyên sâu', price: 500000, category: 'Chăm sóc da', stock: 999, quantity: 1, discount: 0, productType: 'service', duration: 90 },
      { id: 'P5', name: 'Serum trị mụn', price: 450000, category: 'Sản phẩm', stock: 12, quantity: 1, discount: 0, productType: 'product' },
      { id: 'P6', name: 'Kem dưỡng ẩm', price: 280000, category: 'Sản phẩm', stock: 22, quantity: 1, discount: 0, productType: 'product' },
    ],
    subtotal: 1230000,
    discount: 0,
    total: 1230000,
    date: getDateOffset(6),
    timestamp: getDateOffset(6),
    paymentMethod: 'transfer',
    customerName: 'Bùi Thu Trang',
    customerPhone: '0967890123',
    status: 'completed',
    paidAt: getDateOffset(6),
    receivedAmount: 1230000,
    changeAmount: 0,
    paymentHistory: [
      {
        id: 'PAY-SPA008-1',
        amount: 1230000,
        paymentMethod: 'transfer',
        paidAt: getDateOffset(6),
        paidBy: 'admin',
        note: '',
        changeAmount: 0,
      },
    ],
  },

  // Completed orders - Hôm qua
  {
    id: 'SPA009',
    items: [
      { id: 'T2', name: 'Liệu trình trẻ hóa da 8 buổi', price: 5600000, category: 'Liệu trình', stock: 999, quantity: 1, discount: 0, productType: 'treatment', sessions: 8, duration: 90 },
    ],
    subtotal: 5600000,
    discount: 600000,
    total: 5000000,
    date: getDaysOffset(1),
    timestamp: getDaysOffset(1),
    paymentMethod: 'card',
    customerName: 'Đinh Hương Lan',
    customerPhone: '0978901234',
    status: 'completed',
    paidAt: getDaysOffset(1),
    receivedAmount: 5000000,
    changeAmount: 0,
    note: 'Khách VIP - giảm 600k',
    paymentHistory: [
      {
        id: 'PAY-SPA009-1',
        amount: 5000000,
        paymentMethod: 'card',
        paidAt: getDaysOffset(1),
        paidBy: 'admin',
        note: 'Khách VIP - giảm 600k',
        changeAmount: 0,
      },
    ],
  },
  {
    id: 'SPA010',
    items: [
      { id: 'S10', name: 'Tẩy tế bào chết toàn thân', price: 350000, category: 'Chăm sóc da', stock: 999, quantity: 1, discount: 0, productType: 'service', duration: 60 },
      { id: 'S11', name: 'Massage body dưỡng ẩm', price: 380000, category: 'Massage', stock: 999, quantity: 1, discount: 0, productType: 'service', duration: 75 },
    ],
    subtotal: 730000,
    discount: 30000,
    total: 700000,
    date: getDaysOffset(1),
    timestamp: getDaysOffset(1),
    paymentMethod: 'momo',
    customerName: 'Dương Minh Tuấn',
    customerPhone: '0989012345',
    status: 'completed',
    paidAt: getDaysOffset(1),
    receivedAmount: 700000,
    changeAmount: 0,
    paymentHistory: [
      {
        id: 'PAY-SPA010-1',
        amount: 700000,
        paymentMethod: 'momo',
        paidAt: getDaysOffset(1),
        paidBy: 'admin',
        note: '',
        changeAmount: 0,
      },
    ],
  },
  {
    id: 'SPA011',
    items: [
      { id: 'S12', name: 'Chăm sóc da cơ bản', price: 300000, category: 'Chăm sóc da', stock: 999, quantity: 1, discount: 0, productType: 'service', duration: 60 },
      { id: 'P7', name: 'Mặt nạ collagen', price: 95000, category: 'Sản phẩm', stock: 50, quantity: 3, discount: 0, productType: 'product' },
    ],
    subtotal: 585000,
    discount: 0,
    total: 585000,
    date: getDaysOffset(1),
    timestamp: getDaysOffset(1),
    paymentMethod: 'cash',
    customerName: 'Lý Hải Yến',
    customerPhone: '0990123456',
    status: 'completed',
    paidAt: getDaysOffset(1),
    receivedAmount: 600000,
    changeAmount: 15000,
    paymentHistory: [
      {
        id: 'PAY-SPA011-1',
        amount: 600000,
        paymentMethod: 'cash',
        paidAt: getDaysOffset(1),
        paidBy: 'admin',
        note: '',
        changeAmount: 15000,
      },
    ],
  },

  // Completed orders - Tuần trước
  {
    id: 'SPA012',
    items: [
      { id: 'S13', name: 'Massage body đá nóng cao cấp', price: 550000, category: 'Massage', stock: 999, quantity: 1, discount: 0, productType: 'service', duration: 120 },
      { id: 'P1', name: 'Tinh dầu Lavender', price: 120000, category: 'Sản phẩm', stock: 45, quantity: 1, discount: 0, productType: 'product' },
    ],
    subtotal: 670000,
    discount: 0,
    total: 670000,
    date: getDaysOffset(3),
    timestamp: getDaysOffset(3),
    paymentMethod: 'transfer',
    customerName: 'Mai Xuân Phúc',
    customerPhone: '0901234568',
    status: 'completed',
    paidAt: getDaysOffset(3),
    receivedAmount: 670000,
    changeAmount: 0,
    paymentHistory: [
      {
        id: 'PAY-SPA012-1',
        amount: 670000,
        paymentMethod: 'transfer',
        paidAt: getDaysOffset(3),
        paidBy: 'admin',
        note: '',
        changeAmount: 0,
      },
    ],
  },
  {
    id: 'SPA013',
    items: [
      { id: 'S14', name: 'Triệt lông vĩnh viễn chân', price: 1200000, category: 'Waxing', stock: 999, quantity: 1, discount: 0, productType: 'service', duration: 90 },
    ],
    subtotal: 1200000,
    discount: 200000,
    total: 1000000,
    date: getDaysOffset(4),
    timestamp: getDaysOffset(4),
    paymentMethod: 'card',
    customerName: 'Ngô Thị Lan',
    customerPhone: '0912345679',
    status: 'completed',
    paidAt: getDaysOffset(4),
    receivedAmount: 1000000,
    changeAmount: 0,
    note: 'Khách mới - giảm giá 200k',
    paymentHistory: [
      {
        id: 'PAY-SPA013-1',
        amount: 1000000,
        paymentMethod: 'card',
        paidAt: getDaysOffset(4),
        paidBy: 'admin',
        note: 'Khách mới - giảm giá 200k',
        changeAmount: 0,
      },
    ],
  },
  {
    id: 'SPA014',
    items: [
      { id: 'T3', name: 'Liệu trình giảm mỡ bụng 12 buổi', price: 8400000, category: 'Liệu trình', stock: 999, quantity: 1, discount: 0, productType: 'treatment', sessions: 12, duration: 90 },
    ],
    subtotal: 8400000,
    discount: 1400000,
    total: 7000000,
    date: getDaysOffset(5),
    timestamp: getDaysOffset(5),
    paymentMethod: 'transfer',
    customerName: 'Phan Thu Hà',
    customerPhone: '0923456780',
    status: 'completed',
    paidAt: getDaysOffset(5),
    receivedAmount: 7000000,
    changeAmount: 0,
    note: 'Combo khuyến mãi - giảm 1.4tr',
    paymentHistory: [
      {
        id: 'PAY-SPA014-1',
        amount: 7000000,
        paymentMethod: 'transfer',
        paidAt: getDaysOffset(5),
        paidBy: 'admin',
        note: 'Combo khuyến mãi - giảm 1.4tr',
        changeAmount: 0,
      },
    ],
  },
  {
    id: 'SPA015',
    items: [
      { id: 'S15', name: 'Nail sơn gel cao cấp', price: 250000, category: 'Nail', stock: 999, quantity: 1, discount: 0, productType: 'service', duration: 90 },
      { id: 'S16', name: 'Vẽ móng nghệ thuật', price: 150000, category: 'Nail', stock: 999, quantity: 1, discount: 0, productType: 'service', duration: 45 },
    ],
    subtotal: 400000,
    discount: 0,
    total: 400000,
    date: getDaysOffset(6),
    timestamp: getDaysOffset(6),
    paymentMethod: 'momo',
    customerName: 'Quách Bích Ngọc',
    customerPhone: '0934567891',
    status: 'completed',
    paidAt: getDaysOffset(6),
    receivedAmount: 400000,
    changeAmount: 0,
    paymentHistory: [
      {
        id: 'PAY-SPA015-1',
        amount: 400000,
        paymentMethod: 'momo',
        paidAt: getDaysOffset(6),
        paidBy: 'admin',
        note: '',
        changeAmount: 0,
      },
    ],
  },

  // Cancelled order
  {
    id: 'SPA016',
    items: [
      { id: 'S1', name: 'Massage body thư giãn', price: 350000, category: 'Massage', stock: 999, quantity: 1, discount: 0, productType: 'service', duration: 90 },
    ],
    subtotal: 350000,
    discount: 0,
    total: 350000,
    date: getDaysOffset(2),
    timestamp: getDaysOffset(2),
    paymentMethod: 'cash',
    customerName: 'Trương Văn Nam',
    customerPhone: '0945678902',
    status: 'cancelled',
    note: 'Khách hủy do bận việc đột xuất',
  },
];

// Function to load demo Spa orders into localStorage
export function loadDemoSpaOrders() {
  const storage = localStorage.getItem('pos-storage');
  if (storage) {
    const data = JSON.parse(storage);
    const currentOrders = data.state?.orders || [];
    
    // Check if demo orders are already loaded by looking for SPA prefix
    const hasDemo = currentOrders.some((order: Order) => order.id.startsWith('SPA'));
    
    if (!hasDemo) {
      // Add demo orders to the beginning
      data.state.orders = [...demoSpaOrders, ...currentOrders];
      
      // Auto-create customers from demo orders
      const demoCustomers = createCustomersFromOrders(demoSpaOrders);
      const currentCustomers = data.state?.customers || [];
      
      // Merge customers, avoiding duplicates by phone
      const customerMap = new Map();
      [...demoCustomers, ...currentCustomers].forEach(c => {
        if (!customerMap.has(c.phone)) {
          customerMap.set(c.phone, c);
        }
      });
      data.state.customers = Array.from(customerMap.values());
      
      localStorage.setItem('pos-storage', JSON.stringify(data));
      console.log('✅ Demo Spa orders loaded successfully! Total orders:', data.state.orders.length);
      console.log('✅ Auto-created customers from orders! Total customers:', data.state.customers.length);
      return true;
    } else {
      console.log('ℹ️ Demo Spa orders already loaded. Total orders:', currentOrders.length);
      return false;
    }
  } else {
    // If no storage exists, create it with demo orders
    const demoCustomers = createCustomersFromOrders(demoSpaOrders);
    const initialData = {
      state: {
        orders: demoSpaOrders,
        customers: demoCustomers,
        products: [],
        selfServiceOrders: [],
        language: 'vi',
      },
      version: 0,
    };
    localStorage.setItem('pos-storage', JSON.stringify(initialData));
    console.log('✅ Created new storage with demo Spa orders! Total:', demoSpaOrders.length);
    console.log('✅ Auto-created customers from orders! Total:', demoCustomers.length);
    return true;
  }
}

// Function to clear demo orders
export function clearDemoOrders() {
  const storage = localStorage.getItem('pos-storage');
  if (storage) {
    const data = JSON.parse(storage);
    data.state.orders = [];
    localStorage.setItem('pos-storage', JSON.stringify(data));
    console.log('🗑️ Demo orders cleared!');
  }
}

// Function to force reload demo Spa orders (replace existing)
export function forceLoadDemoSpaOrders() {
  const storage = localStorage.getItem('pos-storage');
  if (storage) {
    const data = JSON.parse(storage);
    data.state.orders = demoSpaOrders;
    
    // Auto-create customers from demo orders
    const customers = createCustomersFromOrders(demoSpaOrders);
    data.state.customers = customers;
    
    localStorage.setItem('pos-storage', JSON.stringify(data));
    console.log('✅ Force loaded demo Spa orders! Total:', demoSpaOrders.length);
    console.log('✅ Auto-created customers from orders! Total:', customers.length);
    window.location.reload(); // Reload page to refresh data
  } else {
    // If no storage exists, create it with demo orders
    const customers = createCustomersFromOrders(demoSpaOrders);
    const initialData = {
      state: {
        orders: demoSpaOrders,
        customers: customers,
        products: [],
        selfServiceOrders: [],
        language: 'vi',
      },
      version: 0,
    };
    localStorage.setItem('pos-storage', JSON.stringify(initialData));
    console.log('✅ Created new storage with demo Spa orders! Total:', demoSpaOrders.length);
    console.log('✅ Auto-created customers from orders! Total:', customers.length);
    window.location.reload();
  }
}

// Helper function to create customers from orders
function createCustomersFromOrders(orders: Order[]) {
  const customerMap = new Map();
  
  orders.forEach((order) => {
    if (order.customerPhone && order.customerName) {
      const phone = order.customerPhone;
      
      if (!customerMap.has(phone)) {
        // Determine customer group based on spending
        let customerGroup = 'regular';
        const totalSpent = orders
          .filter(o => o.customerPhone === phone)
          .reduce((sum, o) => sum + (o.total || 0), 0);
        
        if (totalSpent >= 5000000) {
          customerGroup = 'vip';
        } else if (totalSpent >= 2000000) {
          customerGroup = 'acquaintance';
        }
        
        customerMap.set(phone, {
          id: `CUST-${phone}`,
          name: order.customerName,
          phone: phone,
          email: `${phone}@example.com`,
          customerGroup: customerGroup,
          createdAt: order.timestamp || order.date,
          address: '',
          notes: '',
        });
      }
    }
  });
  
  return Array.from(customerMap.values());
}

// Demo Customer Treatment Packages - Các gói liệu trình mẫu
export const demoCustomerTreatmentPackages = [
  {
    id: 'PKG001',
    customerId: 'CUST-0987654321',
    customerName: 'Trần Minh Anh',
    treatmentProductId: 'T1',
    treatmentName: 'Liệu trình trị mụn 10 buổi',
    totalSessions: 10,
    usedSessions: 3,
    remainingSessions: 7,
    serviceIds: ['spa-service-serv-04', 'spa-service-serv-05', 'spa-service-serv-03'], // Facial trị mụn, Facial dưỡng ẩm, Massage foot
    purchaseDate: getDaysOffset(15),
    orderId: 'SPA-PREV-001',
    isActive: true,
    createdAt: getDaysOffset(15),
  },
  {
    id: 'PKG002',
    customerId: 'CUST-0978901234',
    customerName: 'Đinh Hương Lan',
    treatmentProductId: 'T2',
    treatmentName: 'Liệu trình trẻ hóa da 8 buổi',
    totalSessions: 8,
    usedSessions: 5,
    remainingSessions: 3,
    serviceIds: ['spa-service-serv-04', 'spa-service-serv-05'], // Facial trị mụn, Facial dưỡng ẩm
    purchaseDate: getDaysOffset(20),
    orderId: 'SPA009',
    isActive: true,
    createdAt: getDaysOffset(20),
  },
  {
    id: 'PKG003',
    customerId: 'CUST-0923456780',
    customerName: 'Phan Thu Hà',
    treatmentProductId: 'T3',
    treatmentName: 'Liệu trình giảm mỡ bụng 12 buổi',
    totalSessions: 12,
    usedSessions: 1,
    remainingSessions: 11,
    serviceIds: ['spa-service-serv-01', 'spa-service-serv-07'], // Massage body 60, Sơn gel móng tay
    purchaseDate: getDaysOffset(5),
    orderId: 'SPA014',
    isActive: true,
    createdAt: getDaysOffset(5),
  },
  {
    id: 'PKG004',
    customerId: 'CUST-0901234567',
    customerName: 'Lê Phương Thảo',
    treatmentProductId: 'T1',
    treatmentName: 'Liệu trình trị mụn 10 buổi',
    totalSessions: 10,
    usedSessions: 9,
    remainingSessions: 1,
    serviceIds: ['spa-service-serv-04', 'spa-service-serv-05', 'spa-service-serv-03'], // Facial trị mụn, Facial dưỡng ẩm, Massage foot
    purchaseDate: getDaysOffset(60),
    orderId: 'SPA003',
    isActive: true,
    createdAt: getDaysOffset(60),
  },
  {
    id: 'PKG005',
    customerId: 'CUST-0912345678',
    customerName: 'Nguyễn Thu Hà',
    treatmentProductId: 'T2',
    treatmentName: 'Liệu trình trẻ hóa da 8 buổi',
    totalSessions: 8,
    usedSessions: 0,
    remainingSessions: 8,
    serviceIds: ['spa-service-serv-04', 'spa-service-serv-05'], // Facial trị mụn, Facial dưỡng ẩm
    purchaseDate: getDaysOffset(3),
    orderId: 'SPA-NEW-001',
    isActive: true,
    createdAt: getDaysOffset(3),
  },
];

// Function to load demo treatment packages
export function loadDemoTreatmentPackages() {
  const storage = localStorage.getItem('pos-storage');
  if (storage) {
    const data = JSON.parse(storage);
    
    // Get current packages
    const currentPackages: CustomerTreatmentPackage[] = data.state.customerTreatmentPackages || [];
    
    // Avoid duplicates
    const existingIds = new Set(currentPackages.map((p: CustomerTreatmentPackage) => p.id));
    const newPackages = demoCustomerTreatmentPackages.filter(p => !existingIds.has(p.id));
    
    if (newPackages.length > 0) {
      data.state.customerTreatmentPackages = [...demoCustomerTreatmentPackages, ...currentPackages];
      
      localStorage.setItem('pos-storage', JSON.stringify(data));
      console.log('✅ Demo treatment packages loaded! Total:', data.state.customerTreatmentPackages.length);
      return true;
    } else {
      console.log('ℹ️ Demo treatment packages already loaded. Total:', currentPackages.length);
      return false;
    }
  }
  return false;
}

// Function to load demo F&B orders into localStorage
export function loadDemoFBOrders() {
  const storage = localStorage.getItem('pos-storage');
  if (storage) {
    const data = JSON.parse(storage);
    const currentOrders = data.state?.orders || [];
    
    // Check if demo orders are already loaded by looking for FB prefix
    const hasDemo = currentOrders.some((order: Order) => order.id.startsWith('FB'));
    
    if (!hasDemo) {
      // Add demo orders to the beginning
      data.state.orders = [...demoFBOrders, ...currentOrders];
      
      // Add demo tables
      data.state.tables = demoFBTables;
      
      // Auto-create customers from demo orders
      const demoCustomers = createCustomersFromOrders(demoFBOrders);
      const currentCustomers = data.state?.customers || [];
      
      // Merge customers, avoiding duplicates by phone
      const customerMap = new Map();
      [...demoCustomers, ...currentCustomers].forEach(c => {
        if (!customerMap.has(c.phone)) {
          customerMap.set(c.phone, c);
        }
      });
      data.state.customers = Array.from(customerMap.values());
      
      localStorage.setItem('pos-storage', JSON.stringify(data));
      console.log('✅ Demo F&B orders loaded successfully! Total orders:', data.state.orders.length);
      console.log('✅ Demo F&B tables loaded successfully! Total tables:', data.state.tables.length);
      console.log('✅ Auto-created customers from orders! Total customers:', data.state.customers.length);
      return true;
    } else {
      console.log('ℹ️ Demo F&B orders already loaded. Total orders:', currentOrders.length);
      return false;
    }
  } else {
    // If no storage exists, create it with demo orders
    const demoCustomers = createCustomersFromOrders(demoFBOrders);
    const initialData = {
      state: {
        orders: demoFBOrders,
        tables: demoFBTables,
        customers: demoCustomers,
        products: [],
        selfServiceOrders: [],
        language: 'vi',
      },
      version: 0,
    };
    localStorage.setItem('pos-storage', JSON.stringify(initialData));
    console.log('✅ Created new storage with demo F&B orders! Total:', demoFBOrders.length);
    console.log('✅ Created demo F&B tables! Total:', demoFBTables.length);
    console.log('✅ Auto-created customers from orders! Total:', demoCustomers.length);
    return true;
  }
}

// Function to force reload demo F&B orders (replace existing)
export function forceLoadDemoFBOrders() {
  const storage = localStorage.getItem('pos-storage');
  if (storage) {
    const data = JSON.parse(storage);
    data.state.orders = demoFBOrders;
    
    // Add demo tables
    data.state.tables = demoFBTables;
    
    // Auto-create customers from demo orders
    const customers = createCustomersFromOrders(demoFBOrders);
    data.state.customers = customers;
    
    localStorage.setItem('pos-storage', JSON.stringify(data));
    console.log('✅ Force loaded demo F&B orders! Total:', demoFBOrders.length);
    console.log('✅ Force loaded demo F&B tables! Total:', demoFBTables.length);
    console.log('✅ Auto-created customers from orders! Total:', customers.length);
    window.location.reload(); // Reload page to refresh data
  } else {
    // If no storage exists, create it with demo orders
    const customers = createCustomersFromOrders(demoFBOrders);
    const initialData = {
      state: {
        orders: demoFBOrders,
        tables: demoFBTables,
        customers: customers,
        products: [],
        selfServiceOrders: [],
        language: 'vi',
      },
      version: 0,
    };
    localStorage.setItem('pos-storage', JSON.stringify(initialData));
    console.log('✅ Created new storage with demo F&B orders! Total:', demoFBOrders.length);
    console.log('✅ Created demo F&B tables! Total:', demoFBTables.length);
    console.log('✅ Auto-created customers from orders! Total:', customers.length);
    window.location.reload();
  }
}

// Expose function to window for console testing
if (typeof window !== 'undefined') {
  (window as any).loadDemoPackages = loadDemoTreatmentPackages;
  (window as any).loadDemoFBOrders = loadDemoFBOrders;
  (window as any).forceLoadDemoFBOrders = forceLoadDemoFBOrders;
  console.log('💡 Tip: Run loadDemoPackages() in console to load demo treatment packages for testing');
  console.log('💡 Tip: Run loadDemoFBOrders() in console to load demo F&B orders for Kitchen View');
}

// Demo Tables for F&B
export const demoFBTables: Table[] = [
  // Tầng 1 - Khu trong nhà
  {
    id: 'table-001',
    name: 'Bàn 1',
    qrCode: 'TABLE-001',
    status: 'occupied',
    area: 'Tầng 1',
    capacity: 4,
    currentGuests: 2,
    currentOrderId: 'FB001',
    notes: '',
    createdBy: 'admin',
    createdAt: getDaysOffset(30),
  },
  {
    id: 'table-002',
    name: 'Bàn 2',
    qrCode: 'TABLE-002',
    status: 'available',
    area: 'Tầng 1',
    capacity: 4,
    createdBy: 'admin',
    createdAt: getDaysOffset(30),
  },
  {
    id: 'table-003',
    name: 'Bàn 3',
    qrCode: 'TABLE-003',
    status: 'occupied',
    area: 'Tầng 1',
    capacity: 6,
    currentGuests: 4,
    currentOrderId: 'FB003',
    createdBy: 'admin',
    createdAt: getDaysOffset(30),
  },
  {
    id: 'table-004',
    name: 'Bàn 4',
    qrCode: 'TABLE-004',
    status: 'reserved',
    area: 'Tầng 1',
    capacity: 4,
    notes: 'Đặt trước 30 phút',
    createdBy: 'admin',
    createdAt: getDaysOffset(30),
  },
  {
    id: 'table-005',
    name: 'Bàn 5',
    qrCode: 'TABLE-005',
    status: 'occupied',
    area: 'Tầng 1',
    capacity: 4,
    currentGuests: 3,
    currentOrderId: 'FB002',
    createdBy: 'admin',
    createdAt: getDaysOffset(30),
  },
  // Khu VIP
  {
    id: 'table-006',
    name: 'Bàn VIP 1',
    qrCode: 'TABLE-006',
    status: 'available',
    area: 'Khu VIP',
    capacity: 8,
    createdBy: 'admin',
    createdAt: getDaysOffset(30),
  },
  {
    id: 'table-007',
    name: 'Bàn 7',
    qrCode: 'TABLE-007',
    status: 'occupied',
    area: 'Khu VIP',
    capacity: 6,
    currentGuests: 5,
    currentOrderId: 'FB011',
    createdBy: 'admin',
    createdAt: getDaysOffset(30),
  },
  {
    id: 'table-008',
    name: 'Bàn 8',
    qrCode: 'TABLE-008',
    status: 'occupied',
    area: 'Khu VIP',
    capacity: 10,
    currentGuests: 8,
    currentOrderId: 'FB004',
    createdBy: 'admin',
    createdAt: getDaysOffset(30),
  },
  // Ngoài trời
  {
    id: 'table-009',
    name: 'Bàn 9',
    qrCode: 'TABLE-009',
    status: 'cleaning',
    area: 'Ngoài trời',
    capacity: 4,
    notes: 'Vừa dọn xong, cần lau lại',
    createdBy: 'admin',
    createdAt: getDaysOffset(30),
  },
  {
    id: 'table-010',
    name: 'Bàn 10',
    qrCode: 'TABLE-010',
    status: 'occupied',
    area: 'Ngoài trời',
    capacity: 4,
    currentGuests: 3,
    currentOrderId: 'FB009',
    createdBy: 'admin',
    createdAt: getDaysOffset(30),
  },
  {
    id: 'table-011',
    name: 'Bàn 11',
    qrCode: 'TABLE-011',
    status: 'available',
    area: 'Ngoài trời',
    capacity: 4,
    createdBy: 'admin',
    createdAt: getDaysOffset(30),
  },
  {
    id: 'table-012',
    name: 'Bàn 12',
    qrCode: 'TABLE-012',
    status: 'available',
    area: 'Ngoài trời',
    capacity: 6,
    createdBy: 'admin',
    createdAt: getDaysOffset(30),
  },
];