import type { Order, CustomerTreatmentPackage } from './store';

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
    invoiceStatus: 'not_issued',
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
    invoiceStatus: 'not_issued',
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
    invoiceStatus: 'not_issued',
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
    invoiceStatus: 'issued',
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
    invoiceStatus: 'error',
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
    invoiceStatus: 'issued',
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
    invoiceStatus: 'issued',
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
    invoiceStatus: 'issued',
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
    invoiceStatus: 'issued',
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
    invoiceStatus: 'error',
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
    invoiceStatus: 'issued',
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
    invoiceStatus: 'issued',
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
    invoiceStatus: 'issued',
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
    invoiceStatus: 'issued',
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
    invoiceStatus: 'issued',
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
    invoiceStatus: 'not_issued',
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

// Expose function to window for console testing
if (typeof window !== 'undefined') {
  (window as any).loadDemoPackages = loadDemoTreatmentPackages;
  console.log('💡 Tip: Run loadDemoPackages() in console to load demo treatment packages for testing');
}