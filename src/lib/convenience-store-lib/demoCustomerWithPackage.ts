// Demo Customer with Complete Treatment Package Data
import type { Customer, CustomerTreatmentPackage, Appointment } from './store';

const getDaysOffset = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

// Demo Customer
export const demoCustomer: Customer = {
  _id: 'DEMO-CUSTOMER-001',
  tenant_id: 'tenant_001',
  code: 'CUST-DEMO-001',
  full_name: 'Nguyễn Thị Hương',
  phone: '0901234567',
  address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
  email: 'huong.nguyen@example.com',
  total_spent: 25500000,
  total_orders: 15,
  loyalty_points: 0,
  status: 'ACTIVE',
  metadata: {
    dateOfBirth: '1995-05-15',
    gender: 'female',
    notes: 'Khách hàng VIP - Đã sử dụng dịch vụ 3 năm',
    tags: ['vip'],
  },
  created_at: getDaysOffset(365),
  updated_at: getDaysOffset(365),

  // Legacy fields for compatibility
  id: 'DEMO-CUSTOMER-001',
  name: 'Nguyễn Thị Hương',
  dateOfBirth: '1995-05-15',
  gender: 'female',
  customerGroup: 'vip',
  notes: 'Khách hàng VIP - Đã sử dụng dịch vụ 3 năm',
  totalSpent: 25500000,
  orderCount: 15,
  createdAt: getDaysOffset(365),
  updatedAt: getDaysOffset(365),
};

// Demo Treatment Package with Full Session Details
export const demoTreatmentPackage: CustomerTreatmentPackage = {
  id: 'PKG-DEMO-001',
  customerId: 'DEMO-CUSTOMER-001',
  customerName: 'Nguyễn Thị Hương',
  treatmentProductId: 'T1',
  treatmentName: 'Liệu trình trị mụn chuyên sâu 10 buổi',
  totalSessions: 10,
  usedSessionNumbers: [1, 2, 3, 4], // Đã sử dụng 4 buổi
  remainingSessions: 6,
  purchaseDate: getDaysOffset(30),
  expiryDate: getDaysOffset(-60), // Còn 60 ngày
  orderId: 'ORDER-DEMO-001', // Required field
  isActive: true,
  createdAt: getDaysOffset(30),
  sessions: [
    {
      sessionNumber: 1,
      sessionName: 'Buổi 1 - Làm sạch da & Đánh giá',
      items: [
        {
          productId: 'spa-service-serv-04',
          productName: 'Facial trị mụn chuyên sâu',
          productType: 'service',
          quantity: 1,
          duration: 90,
        },
        {
          productId: 'spa-product-prod-01',
          productName: 'Mặt nạ thải độc than hoạt tính',
          productType: 'product',
          quantity: 1,
        },
        {
          productId: 'spa-product-prod-05',
          productName: 'Serum Vitamin C',
          productType: 'product',
          quantity: 1,
        },
      ],
    },
    {
      sessionNumber: 2,
      sessionName: 'Buổi 2 - Tẩy tế bào chết',
      items: [
        {
          productId: 'spa-service-serv-04',
          productName: 'Facial trị mụn chuyên sâu',
          productType: 'service',
          quantity: 1,
          duration: 90,
        },
        {
          productId: 'spa-product-prod-02',
          productName: 'Serum trị mụn BHA 2%',
          productType: 'product',
          quantity: 1,
        },
        {
          productId: 'spa-product-prod-03',
          productName: 'Kem dưỡng ẩm phục hồi',
          productType: 'product',
          quantity: 1,
        },
      ],
    },
    {
      sessionNumber: 3,
      sessionName: 'Buổi 3 - Điều trị mụn sâu',
      items: [
        {
          productId: 'spa-service-serv-04',
          productName: 'Facial trị mụn chuyên sâu',
          productType: 'service',
          quantity: 1,
          duration: 90,
        },
        {
          productId: 'spa-service-serv-06',
          productName: 'LED Light Therapy',
          productType: 'service',
          quantity: 1,
          duration: 30,
        },
        {
          productId: 'spa-product-prod-01',
          productName: 'Mặt nạ thải độc than hoạt tính',
          productType: 'product',
          quantity: 1,
        },
      ],
    },
    {
      sessionNumber: 4,
      sessionName: 'Buổi 4 - Phục hồi & Dưỡng ẩm',
      items: [
        {
          productId: 'spa-service-serv-05',
          productName: 'Facial dưỡng ẩm chuyên sâu',
          productType: 'service',
          quantity: 1,
          duration: 90,
        },
        {
          productId: 'spa-product-prod-04',
          productName: 'Mặt nạ Hyaluronic Acid',
          productType: 'product',
          quantity: 2,
        },
      ],
    },
    {
      sessionNumber: 5,
      sessionName: 'Buổi 5 - Điều trị mụn & Massage',
      items: [
        {
          productId: 'spa-service-serv-04',
          productName: 'Facial trị mụn chuyên sâu',
          productType: 'service',
          quantity: 1,
          duration: 90,
        },
        {
          productId: 'spa-service-serv-03',
          productName: 'Massage foot thư giãn',
          productType: 'service',
          quantity: 1,
          duration: 45,
        },
      ],
    },
    {
      sessionNumber: 6,
      sessionName: 'Buổi 6 - Tái tạo da',
      items: [
        {
          productId: 'spa-service-serv-04',
          productName: 'Facial trị mụn chuyên sâu',
          productType: 'service',
          quantity: 1,
          duration: 90,
        },
        {
          productId: 'spa-product-prod-02',
          productName: 'Serum trị mụn BHA 2%',
          productType: 'product',
          quantity: 1,
        },
      ],
    },
    {
      sessionNumber: 7,
      sessionName: 'Buổi 7 - Điều trị chuyên sâu',
      items: [
        {
          productId: 'spa-service-serv-04',
          productName: 'Facial trị mụn chuyên sâu',
          productType: 'service',
          quantity: 1,
          duration: 90,
        },
        {
          productId: 'spa-service-serv-06',
          productName: 'LED Light Therapy',
          productType: 'service',
          quantity: 1,
          duration: 30,
        },
      ],
    },
    {
      sessionNumber: 8,
      sessionName: 'Buổi 8 - Phục hồi & Làm dịu',
      items: [
        {
          productId: 'spa-service-serv-05',
          productName: 'Facial dưỡng ẩm chuyên sâu',
          productType: 'service',
          quantity: 1,
          duration: 90,
        },
        {
          productId: 'spa-product-prod-01',
          productName: 'Mặt nạ thải độc than hoạt tính',
          productType: 'product',
          quantity: 1,
        },
      ],
    },
    {
      sessionNumber: 9,
      sessionName: 'Buổi 9 - Củng cố kết quả',
      items: [
        {
          productId: 'spa-service-serv-04',
          productName: 'Facial trị mụn chuyên sâu',
          productType: 'service',
          quantity: 1,
          duration: 90,
        },
        {
          productId: 'spa-product-prod-03',
          productName: 'Kem dưỡng ẩm phục hồi',
          productType: 'product',
          quantity: 1,
        },
      ],
    },
    {
      sessionNumber: 10,
      sessionName: 'Buổi 10 - Hoàn thiện & Tư vấn',
      items: [
        {
          productId: 'spa-service-serv-04',
          productName: 'Facial trị mụn chuyên sâu',
          productType: 'service',
          quantity: 1,
          duration: 90,
        },
        {
          productId: 'spa-service-serv-06',
          productName: 'LED Light Therapy',
          productType: 'service',
          quantity: 1,
          duration: 30,
        },
        {
          productId: 'spa-product-prod-05',
          productName: 'Serum Vitamin C',
          productType: 'product',
          quantity: 1,
        },
      ],
    },
  ],
};

// Demo Appointments for sessions 1, 2, 3 (completed) and 5 (scheduled)
export const demoAppointments: Appointment[] = [
  {
    id: 'APT-DEMO-001',
    customerId: 'DEMO-CUSTOMER-001',
    customerName: 'Nguyễn Thị Hương',
    customerPhone: '0901234567',
    appointmentDate: getDaysOffset(25),
    appointmentTime: '09:00',
    status: 'completed',
    services: [
      {
        instanceId: 'inst-1',
        productId: 'spa-service-serv-04',
        productName: 'Facial trị mụn chuyên sâu',
        duration: 90,
        technicianId: 'user-tech-001',
        treatmentPackageId: 'PKG-DEMO-001',
        sessionNumber: 1,
      },
    ],
    totalDuration: 90,
    notes: 'Buổi 1 - Đánh giá ban đầu, da có nhiều mụn ẩn',
    createdBy: 'admin',
    createdAt: getDaysOffset(26),
  },
  {
    id: 'APT-DEMO-002',
    customerId: 'DEMO-CUSTOMER-001',
    customerName: 'Nguyễn Thị Hương',
    customerPhone: '0901234567',
    appointmentDate: getDaysOffset(18),
    appointmentTime: '10:00',
    status: 'completed',
    services: [
      {
        instanceId: 'inst-2',
        productId: 'spa-service-serv-04',
        productName: 'Facial trị mụn chuyên sâu',
        duration: 90,
        technicianId: 'user-tech-001',
        treatmentPackageId: 'PKG-DEMO-001',
        sessionNumber: 2,
      },
    ],
    totalDuration: 90,
    notes: 'Buổi 2 - Tẩy tế bào chết, da bắt đầu cải thiện',
    createdBy: 'admin',
    createdAt: getDaysOffset(19),
  },
  {
    id: 'APT-DEMO-003',
    customerId: 'DEMO-CUSTOMER-001',
    customerName: 'Nguyễn Thị Hương',
    customerPhone: '0901234567',
    appointmentDate: getDaysOffset(11),
    appointmentTime: '14:00',
    status: 'completed',
    services: [
      {
        instanceId: 'inst-3',
        productId: 'spa-service-serv-04',
        productName: 'Facial trị mụn chuyên sâu',
        duration: 90,
        technicianId: 'user-tech-002',
        treatmentPackageId: 'PKG-DEMO-001',
        sessionNumber: 3,
      },
      {
        instanceId: 'inst-4',
        productId: 'spa-service-serv-06',
        productName: 'LED Light Therapy',
        duration: 30,
        technicianId: 'user-tech-002',
        treatmentPackageId: 'PKG-DEMO-001',
        sessionNumber: 3,
      },
    ],
    totalDuration: 120,
    notes: 'Buổi 3 - Điều trị sâu với LED therapy',
    createdBy: 'admin',
    createdAt: getDaysOffset(12),
  },
  {
    id: 'APT-DEMO-004',
    customerId: 'DEMO-CUSTOMER-001',
    customerName: 'Nguyễn Thị Hương',
    customerPhone: '0901234567',
    appointmentDate: getDaysOffset(4),
    appointmentTime: '09:30',
    status: 'completed',
    services: [
      {
        instanceId: 'inst-5',
        productId: 'spa-service-serv-05',
        productName: 'Facial dưỡng ẩm chuyên sâu',
        duration: 90,
        technicianId: 'user-tech-001',
        treatmentPackageId: 'PKG-DEMO-001',
        sessionNumber: 4,
      },
    ],
    totalDuration: 90,
    notes: 'Buổi 4 - Phục hồi da, tình trạng tốt',
    createdBy: 'admin',
    createdAt: getDaysOffset(5),
  },
  {
    id: 'APT-DEMO-005',
    customerId: 'DEMO-CUSTOMER-001',
    customerName: 'Nguyễn Thị Hương',
    customerPhone: '0901234567',
    appointmentDate: getDaysOffset(-3), // Scheduled in 3 days
    appointmentTime: '15:00',
    status: 'pending',
    services: [
      {
        instanceId: 'inst-6',
        productId: 'spa-service-serv-04',
        productName: 'Facial trị mụn chuyên sâu',
        duration: 90,
        technicianId: 'user-tech-001',
        treatmentPackageId: 'PKG-DEMO-001',
        sessionNumber: 5,
      },
      {
        instanceId: 'inst-7',
        productId: 'spa-service-serv-03',
        productName: 'Massage foot thư giãn',
        duration: 45,
        technicianId: 'user-tech-002',
        treatmentPackageId: 'PKG-DEMO-001',
        sessionNumber: 5,
      },
    ],
    totalDuration: 135,
    notes: 'Buổi 5 - Đã đặt lịch',
    createdBy: 'admin',
    createdAt: getDaysOffset(0),
  },
];

// Function to load demo data into localStorage
export function loadDemoCustomerWithPackage() {
  try {
    // Get existing data
    const existingCustomers = JSON.parse(localStorage.getItem('pos-customers') || '[]');
    const existingPackages = JSON.parse(localStorage.getItem('pos-customerTreatmentPackages') || '[]');
    const existingAppointments = JSON.parse(localStorage.getItem('pos-appointments') || '[]');

    // Remove existing demo data
    const filteredCustomers = existingCustomers.filter((c: Customer) => c.id !== 'DEMO-CUSTOMER-001');
    const filteredPackages = existingPackages.filter((p: CustomerTreatmentPackage) => p.id !== 'PKG-DEMO-001');
    const filteredAppointments = existingAppointments.filter((a: Appointment) => !a.id.startsWith('APT-DEMO-'));

    // Add new demo data
    filteredCustomers.push(demoCustomer);
    filteredPackages.push(demoTreatmentPackage);
    filteredAppointments.push(...demoAppointments);

    // Save to localStorage
    localStorage.setItem('pos-customers', JSON.stringify(filteredCustomers));
    localStorage.setItem('pos-customerTreatmentPackages', JSON.stringify(filteredPackages));
    localStorage.setItem('pos-appointments', JSON.stringify(filteredAppointments));

    console.log('✅ Demo data loaded successfully!');
    console.log('📦 Customer:', demoCustomer);
    console.log('📦 Package:', demoTreatmentPackage);
    console.log('📦 Appointments:', demoAppointments.length);
    console.log('📦 Total customers in localStorage:', filteredCustomers.length);

    return true;
  } catch (error) {
    console.error('❌ Error loading demo data:', error);
    return false;
  }
}

// Function to inject demo data directly into store (use this instead)
export function injectDemoDataToStore(store: any) {
  try {
    console.log('🔄 Injecting demo data directly to store...');
    
    // Add customer
    store.getState().addCustomer(demoCustomer);
    
    // Add treatment package  
    const addPackage = store.getState().addCustomerTreatmentPackage;
    if (addPackage) {
      addPackage(demoTreatmentPackage);
    }
    
    // Add appointments
    const addAppointment = store.getState().addAppointment;
    if (addAppointment) {
      demoAppointments.forEach(apt => addAppointment(apt));
    }
    
    console.log('✅ Demo data injected to store successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error injecting demo data:', error);
    return false;
  }
}