// Demo Data for Services Tab - Multiple Services with Appointments
import type { Customer, Order, Appointment } from './store';

const getDaysOffset = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

const getDateOnly = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

// Demo Customer with many services
export const demoCustomerWithServices: Customer = {
  id: 'DEMO-SVC-CUSTOMER-001',
  name: 'Trần Thị Mai',
  phone: '0912345678',
  address: '456 Lê Lợi, Quận 3, TP.HCM',
  email: 'mai.tran@example.com',
  dateOfBirth: '1992-08-20',
  gender: 'female',
  customerGroup: 'vip',
  notes: 'Khách hàng thân thiết - Sử dụng dịch vụ thường xuyên',
  totalSpent: 8500000,
  orderCount: 15,
  createdAt: getDaysOffset(180),
};

// Demo Orders with Services (15 orders)
export const demoServiceOrders: Order[] = [
  {
    id: 'ORDER-SVC-001',
    items: [
      {
        id: 'spa-service-serv-01',
        name: 'Facial dưỡng ẩm',
        price: 400000,
        category: 'Dịch vụ Spa',
        stock: 0,
        productType: 'service',
        duration: 60,
        quantity: 1,
        discount: 0,
      },
    ],
    subtotal: 400000,
    discount: 0,
    total: 400000,
    date: getDaysOffset(1),
    timestamp: getDaysOffset(1),
    paymentMethod: 'cash',
    customerName: 'Trần Thị Mai',
    customerPhone: '0912345678',
    status: 'completed',
    createdBy: 'admin',
  },
  {
    id: 'ORDER-SVC-002',
    items: [
      {
        id: 'spa-service-serv-02',
        name: 'Massage foot 45 phút',
        price: 200000,
        category: 'Dịch vụ Spa',
        stock: 0,
        productType: 'service',
        duration: 45,
        quantity: 1,
        discount: 0,
      },
    ],
    subtotal: 200000,
    discount: 0,
    total: 200000,
    date: getDaysOffset(1),
    timestamp: getDaysOffset(1),
    paymentMethod: 'card',
    customerName: 'Trần Thị Mai',
    customerPhone: '0912345678',
    status: 'completed',
    createdBy: 'admin',
  },
  {
    id: 'ORDER-SVC-003',
    items: [
      {
        id: 'spa-service-serv-04',
        name: 'Facial trị mụn',
        price: 350000,
        category: 'Dịch vụ Spa',
        stock: 0,
        productType: 'service',
        duration: 75,
        quantity: 1,
        discount: 0,
      },
    ],
    subtotal: 350000,
    discount: 0,
    total: 350000,
    date: getDaysOffset(1),
    timestamp: getDaysOffset(1),
    paymentMethod: 'transfer',
    customerName: 'Trần Thị Mai',
    customerPhone: '0912345678',
    status: 'completed',
    createdBy: 'admin',
  },
  {
    id: 'ORDER-SVC-004',
    items: [
      {
        id: 'spa-service-serv-04',
        name: 'Facial trị mụn',
        price: 350000,
        category: 'Dịch vụ Spa',
        stock: 0,
        productType: 'service',
        duration: 75,
        quantity: 1,
        discount: 0,
      },
    ],
    subtotal: 350000,
    discount: 0,
    total: 350000,
    date: getDaysOffset(1),
    timestamp: getDaysOffset(1),
    paymentMethod: 'cash',
    customerName: 'Trần Thị Mai',
    customerPhone: '0912345678',
    status: 'completed',
    createdBy: 'admin',
  },
  {
    id: 'ORDER-SVC-005',
    items: [
      {
        id: 'spa-service-serv-01',
        name: 'Facial dưỡng ẩm',
        price: 400000,
        category: 'Dịch vụ Spa',
        stock: 0,
        productType: 'service',
        duration: 60,
        quantity: 1,
        discount: 0,
      },
    ],
    subtotal: 400000,
    discount: 0,
    total: 400000,
    date: getDaysOffset(1),
    timestamp: getDaysOffset(1),
    paymentMethod: 'cash',
    customerName: 'Trần Thị Mai',
    customerPhone: '0912345678',
    status: 'completed',
    createdBy: 'admin',
  },
  {
    id: 'ORDER-SVC-006',
    items: [
      {
        id: 'spa-service-serv-01',
        name: 'Facial dưỡng ẩm',
        price: 400000,
        category: 'Dịch vụ Spa',
        stock: 0,
        productType: 'service',
        duration: 60,
        quantity: 1,
        discount: 0,
      },
    ],
    subtotal: 400000,
    discount: 0,
    total: 400000,
    date: getDaysOffset(1),
    timestamp: getDaysOffset(1),
    paymentMethod: 'card',
    customerName: 'Trần Thị Mai',
    customerPhone: '0912345678',
    status: 'completed',
    createdBy: 'admin',
  },
  {
    id: 'ORDER-SVC-007',
    items: [
      {
        id: 'spa-service-serv-05',
        name: 'Vẽ nail họa tiết',
        price: 50000,
        category: 'Dịch vụ Spa',
        stock: 0,
        productType: 'service',
        duration: 30,
        quantity: 1,
        discount: 0,
      },
    ],
    subtotal: 50000,
    discount: 0,
    total: 50000,
    date: getDaysOffset(1),
    timestamp: getDaysOffset(1),
    paymentMethod: 'cash',
    customerName: 'Trần Thị Mai',
    customerPhone: '0912345678',
    status: 'completed',
    createdBy: 'admin',
  },
  {
    id: 'ORDER-SVC-008',
    items: [
      {
        id: 'spa-service-serv-02',
        name: 'Massage body 90 phút',
        price: 500000,
        category: 'Dịch vụ Spa',
        stock: 0,
        productType: 'service',
        duration: 90,
        quantity: 1,
        discount: 0,
      },
    ],
    subtotal: 500000,
    discount: 0,
    total: 500000,
    date: getDaysOffset(2),
    timestamp: getDaysOffset(2),
    paymentMethod: 'transfer',
    customerName: 'Trần Thị Mai',
    customerPhone: '0912345678',
    status: 'completed',
    createdBy: 'admin',
  },
  {
    id: 'ORDER-SVC-009',
    items: [
      {
        id: 'spa-service-serv-04',
        name: 'Facial trị mụn',
        price: 350000,
        category: 'Dịch vụ Spa',
        stock: 0,
        productType: 'service',
        duration: 75,
        quantity: 1,
        discount: 0,
      },
    ],
    subtotal: 350000,
    discount: 0,
    total: 350000,
    date: getDaysOffset(3),
    timestamp: getDaysOffset(3),
    paymentMethod: 'cash',
    customerName: 'Trần Thị Mai',
    customerPhone: '0912345678',
    status: 'completed',
    createdBy: 'admin',
  },
  {
    id: 'ORDER-SVC-010',
    items: [
      {
        id: 'spa-service-serv-01',
        name: 'Facial dưỡng ẩm',
        price: 400000,
        category: 'Dịch vụ Spa',
        stock: 0,
        productType: 'service',
        duration: 60,
        quantity: 1,
        discount: 0,
      },
    ],
    subtotal: 400000,
    discount: 0,
    total: 400000,
    date: getDaysOffset(5),
    timestamp: getDaysOffset(5),
    paymentMethod: 'card',
    customerName: 'Trần Thị Mai',
    customerPhone: '0912345678',
    status: 'completed',
    createdBy: 'admin',
  },
  {
    id: 'ORDER-SVC-011',
    items: [
      {
        id: 'spa-service-serv-02',
        name: 'Massage foot 45 phút',
        price: 200000,
        category: 'Dịch vụ Spa',
        stock: 0,
        productType: 'service',
        duration: 45,
        quantity: 1,
        discount: 0,
      },
    ],
    subtotal: 200000,
    discount: 0,
    total: 200000,
    date: getDaysOffset(7),
    timestamp: getDaysOffset(7),
    paymentMethod: 'cash',
    customerName: 'Trần Thị Mai',
    customerPhone: '0912345678',
    status: 'completed',
    createdBy: 'admin',
  },
  {
    id: 'ORDER-SVC-012',
    items: [
      {
        id: 'spa-service-serv-04',
        name: 'Facial trị mụn',
        price: 350000,
        category: 'Dịch vụ Spa',
        stock: 0,
        productType: 'service',
        duration: 75,
        quantity: 1,
        discount: 0,
      },
    ],
    subtotal: 350000,
    discount: 0,
    total: 350000,
    date: getDaysOffset(10),
    timestamp: getDaysOffset(10),
    paymentMethod: 'transfer',
    customerName: 'Trần Thị Mai',
    customerPhone: '0912345678',
    status: 'completed',
    createdBy: 'admin',
  },
  {
    id: 'ORDER-SVC-013',
    items: [
      {
        id: 'spa-service-serv-01',
        name: 'Facial dưỡng ẩm',
        price: 400000,
        category: 'Dịch vụ Spa',
        stock: 0,
        productType: 'service',
        duration: 60,
        quantity: 1,
        discount: 0,
      },
    ],
    subtotal: 400000,
    discount: 0,
    total: 400000,
    date: getDaysOffset(12),
    timestamp: getDaysOffset(12),
    paymentMethod: 'cash',
    customerName: 'Trần Thị Mai',
    customerPhone: '0912345678',
    status: 'completed',
    createdBy: 'admin',
  },
  {
    id: 'ORDER-SVC-014',
    items: [
      {
        id: 'spa-service-serv-02',
        name: 'Massage body 90 phút',
        price: 500000,
        category: 'Dịch vụ Spa',
        stock: 0,
        productType: 'service',
        duration: 90,
        quantity: 1,
        discount: 0,
      },
    ],
    subtotal: 500000,
    discount: 0,
    total: 500000,
    date: getDaysOffset(15),
    timestamp: getDaysOffset(15),
    paymentMethod: 'card',
    customerName: 'Trần Thị Mai',
    customerPhone: '0912345678',
    status: 'completed',
    createdBy: 'admin',
  },
  {
    id: 'ORDER-SVC-015',
    items: [
      {
        id: 'spa-service-serv-05',
        name: 'Vẽ nail họa tiết',
        price: 50000,
        category: 'Dịch vụ Spa',
        stock: 0,
        productType: 'service',
        duration: 30,
        quantity: 1,
        discount: 0,
      },
    ],
    subtotal: 50000,
    discount: 0,
    total: 50000,
    date: getDaysOffset(20),
    timestamp: getDaysOffset(20),
    paymentMethod: 'cash',
    customerName: 'Trần Thị Mai',
    customerPhone: '0912345678',
    status: 'completed',
    createdBy: 'admin',
  },
];

// Demo Appointments matching the services (with appointment codes and technicians)
export const demoServiceAppointments: Appointment[] = [
  {
    id: 'APT-SVC-001',
    code: 'LH000012',
    customerId: 'DEMO-SVC-CUSTOMER-001',
    customerName: 'Trần Thị Mai',
    customerPhone: '0912345678',
    appointmentDate: getDateOnly(1),
    startTime: '09:00',
    endTime: '10:00',
    appointmentTime: '09:00',
    services: [
      {
        productId: 'spa-service-serv-01',
        productName: 'Facial dưỡng ẩm',
        productType: 'service',
        duration: 60,
        price: 400000,
        startTime: '09:00',
        endTime: '10:00',
        technicianNames: ['Nguyễn Văn C'],
      },
    ],
    status: 'completed',
    createdAt: getDaysOffset(2),
    createdBy: 'admin',
  },
  {
    id: 'APT-SVC-002',
    code: 'LH000013',
    customerId: 'DEMO-SVC-CUSTOMER-001',
    customerName: 'Trần Thị Mai',
    customerPhone: '0912345678',
    appointmentDate: getDateOnly(1),
    startTime: '10:30',
    endTime: '11:15',
    appointmentTime: '10:30',
    services: [
      {
        productId: 'spa-service-serv-02',
        productName: 'Massage foot 45 phút',
        productType: 'service',
        duration: 45,
        price: 200000,
        startTime: '10:30',
        endTime: '11:15',
        technicianNames: ['Lê Thị D', 'Nguyễn Văn E'],
      },
    ],
    status: 'completed',
    createdAt: getDaysOffset(2),
    createdBy: 'admin',
  },
  {
    id: 'APT-SVC-003',
    code: 'LH000012',
    customerId: 'DEMO-SVC-CUSTOMER-001',
    customerName: 'Trần Thị Mai',
    customerPhone: '0912345678',
    appointmentDate: getDateOnly(1),
    startTime: '14:00',
    endTime: '15:15',
    appointmentTime: '14:00',
    services: [
      {
        productId: 'spa-service-serv-04',
        productName: 'Facial trị mụn',
        productType: 'service',
        duration: 75,
        price: 350000,
        startTime: '14:00',
        endTime: '15:15',
        technicianNames: ['Nguyễn Văn C'],
      },
    ],
    status: 'completed',
    createdAt: getDaysOffset(2),
    createdBy: 'admin',
  },
  {
    id: 'APT-SVC-004',
    code: 'LH000012',
    customerId: 'DEMO-SVC-CUSTOMER-001',
    customerName: 'Trần Thị Mai',
    customerPhone: '0912345678',
    appointmentDate: getDateOnly(1),
    startTime: '16:00',
    endTime: '17:15',
    appointmentTime: '16:00',
    services: [
      {
        productId: 'spa-service-serv-04',
        productName: 'Facial trị mụn',
        productType: 'service',
        duration: 75,
        price: 350000,
        startTime: '16:00',
        endTime: '17:15',
        technicianNames: ['Nguyễn Văn C'],
      },
    ],
    status: 'completed',
    createdAt: getDaysOffset(2),
    createdBy: 'admin',
  },
  {
    id: 'APT-SVC-005',
    code: 'LH000014',
    customerId: 'DEMO-SVC-CUSTOMER-001',
    customerName: 'Trần Thị Mai',
    customerPhone: '0912345678',
    appointmentDate: getDateOnly(1),
    startTime: '09:00',
    endTime: '10:00',
    appointmentTime: '09:00',
    services: [
      {
        productId: 'spa-service-serv-01',
        productName: 'Facial dưỡng ẩm',
        productType: 'service',
        duration: 60,
        price: 400000,
        startTime: '09:00',
        endTime: '10:00',
        technicianNames: ['Trần Thị F'],
      },
    ],
    status: 'completed',
    createdAt: getDaysOffset(2),
    createdBy: 'admin',
  },
];

// Function to load demo services data
export function loadDemoServicesData() {
  try {
    // Get existing data
    const existingCustomers = JSON.parse(localStorage.getItem('pos-customers') || '[]');
    const existingOrders = JSON.parse(localStorage.getItem('pos-orders') || '[]');
    const existingAppointments = JSON.parse(localStorage.getItem('pos-appointments') || '[]');

    // Remove existing demo data
    const filteredCustomers = existingCustomers.filter((c: Customer) => c.id !== 'DEMO-SVC-CUSTOMER-001');
    const filteredOrders = existingOrders.filter((o: Order) => !o.id.startsWith('ORDER-SVC-'));
    const filteredAppointments = existingAppointments.filter((a: Appointment) => !a.id.startsWith('APT-SVC-'));

    // Add new demo data
    filteredCustomers.push(demoCustomerWithServices);
    filteredOrders.push(...demoServiceOrders);
    filteredAppointments.push(...demoServiceAppointments);

    // Save to localStorage
    localStorage.setItem('pos-customers', JSON.stringify(filteredCustomers));
    localStorage.setItem('pos-orders', JSON.stringify(filteredOrders));
    localStorage.setItem('pos-appointments', JSON.stringify(filteredAppointments));

    console.log('✅ Demo services data loaded successfully!');
    console.log('📦 Customer:', demoCustomerWithServices);
    console.log('📦 Orders:', demoServiceOrders.length);
    console.log('📦 Appointments:', demoServiceAppointments.length);

    return true;
  } catch (error) {
    console.error('❌ Error loading demo services data:', error);
    return false;
  }
}
