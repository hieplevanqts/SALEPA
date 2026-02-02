// Demo Customer Treatment Packages V2 - With Session Details

import type { CustomerTreatmentPackage } from './store';

const getDaysOffset = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

export const demoTreatmentPackagesV2: CustomerTreatmentPackage[] = [
  {
    id: 'PKG001',
    customerId: 'CUST-0987654321',
    customerName: 'Trần Minh Anh',
    treatmentProductId: 'T1',
    treatmentName: 'Liệu trình trị mụn 10 buổi',
    totalSessions: 10,
    usedSessionNumbers: [1, 2, 3], // Đã dùng buổi 1, 2, 3
    remainingSessions: 7,
    sessions: [
      {
        sessionNumber: 1,
        sessionName: 'Buổi 1',
        items: [
          {
            productId: 'spa-service-serv-04',
            productName: 'Facial trị mụn',
            productType: 'service',
            quantity: 1,
            duration: 60,
          },
          {
            productId: 'spa-product-prod-01',
            productName: 'Mặt nạ thải độc',
            productType: 'product',
            quantity: 1,
          },
        ],
      },
      {
        sessionNumber: 2,
        sessionName: 'Buổi 2',
        items: [
          {
            productId: 'spa-service-serv-04',
            productName: 'Facial trị mụn',
            productType: 'service',
            quantity: 1,
            duration: 60,
          },
          {
            productId: 'spa-product-prod-02',
            productName: 'Serum trị mụn',
            productType: 'product',
            quantity: 1,
          },
        ],
      },
      {
        sessionNumber: 3,
        sessionName: 'Buổi 3',
        items: [
          {
            productId: 'spa-service-serv-05',
            productName: 'Facial dưỡng ẩm',
            productType: 'service',
            quantity: 1,
            duration: 60,
          },
          {
            productId: 'spa-product-prod-01',
            productName: 'Mặt nạ thải độc',
            productType: 'product',
            quantity: 1,
          },
        ],
      },
      {
        sessionNumber: 4,
        sessionName: 'Buổi 4',
        items: [
          {
            productId: 'spa-service-serv-04',
            productName: 'Facial trị mụn',
            productType: 'service',
            quantity: 1,
            duration: 60,
          },
          {
            productId: 'spa-service-serv-03',
            productName: 'Massage foot',
            productType: 'service',
            quantity: 1,
            duration: 45,
          },
        ],
      },
      {
        sessionNumber: 5,
        sessionName: 'Buổi 5',
        items: [
          {
            productId: 'spa-service-serv-05',
            productName: 'Facial dưỡng ẩm',
            productType: 'service',
            quantity: 1,
            duration: 60,
          },
        ],
      },
      {
        sessionNumber: 6,
        sessionName: 'Buổi 6',
        items: [
          {
            productId: 'spa-service-serv-04',
            productName: 'Facial trị mụn',
            productType: 'service',
            quantity: 1,
            duration: 60,
          },
        ],
      },
      {
        sessionNumber: 7,
        sessionName: 'Buổi 7',
        items: [
          {
            productId: 'spa-service-serv-05',
            productName: 'Facial dưỡng ẩm',
            productType: 'service',
            quantity: 1,
            duration: 60,
          },
          {
            productId: 'spa-product-prod-01',
            productName: 'Mặt nạ thải độc',
            productType: 'product',
            quantity: 1,
          },
        ],
      },
      {
        sessionNumber: 8,
        sessionName: 'Buổi 8',
        items: [
          {
            productId: 'spa-service-serv-04',
            productName: 'Facial trị mụn',
            productType: 'service',
            quantity: 1,
            duration: 60,
          },
        ],
      },
      {
        sessionNumber: 9,
        sessionName: 'Buổi 9',
        items: [
          {
            productId: 'spa-service-serv-05',
            productName: 'Facial dưỡng ẩm',
            productType: 'service',
            quantity: 1,
            duration: 60,
          },
        ],
      },
      {
        sessionNumber: 10,
        sessionName: 'Buổi 10',
        items: [
          {
            productId: 'spa-service-serv-04',
            productName: 'Facial trị mụn',
            productType: 'service',
            quantity: 1,
            duration: 60,
          },
          {
            productId: 'spa-service-serv-03',
            productName: 'Massage foot',
            productType: 'service',
            quantity: 1,
            duration: 45,
          },
          {
            productId: 'spa-product-prod-02',
            productName: 'Serum trị mụn',
            productType: 'product',
            quantity: 1,
          },
        ],
      },
    ],
    purchaseDate: getDaysOffset(15),
    orderId: 'SPA-PREV-001',
    isActive: true,
    createdAt: getDaysOffset(15),
  },
  {
    id: 'PKG002',
    customerId: '2',
    customerName: 'Trần Minh Quân',
    treatmentProductId: 'T2',
    treatmentName: 'Liệu trình trẻ hóa da 8 buổi',
    totalSessions: 8,
    usedSessionNumbers: [1, 2, 3, 5, 6], // Đã dùng 5 buổi
    remainingSessions: 3,
    sessions: [
      {
        sessionNumber: 1,
        sessionName: 'Buổi 1',
        items: [
          {
            productId: 'spa-service-serv-04',
            productName: 'Facial trị mụn',
            productType: 'service',
            quantity: 1,
            duration: 60,
          },
        ],
      },
      {
        sessionNumber: 2,
        sessionName: 'Buổi 2',
        items: [
          {
            productId: 'spa-service-serv-05',
            productName: 'Facial dưỡng ẩm',
            productType: 'service',
            quantity: 1,
            duration: 60,
          },
        ],
      },
      {
        sessionNumber: 3,
        sessionName: 'Buổi 3',
        items: [
          {
            productId: 'spa-service-serv-04',
            productName: 'Facial trị mụn',
            productType: 'service',
            quantity: 1,
            duration: 60,
          },
        ],
      },
      {
        sessionNumber: 4,
        sessionName: 'Buổi 4',
        items: [
          {
            productId: 'spa-service-serv-05',
            productName: 'Facial dưỡng ẩm',
            productType: 'service',
            quantity: 1,
            duration: 60,
          },
        ],
      },
      {
        sessionNumber: 5,
        sessionName: 'Buổi 5',
        items: [
          {
            productId: 'spa-service-serv-04',
            productName: 'Facial trị mụn',
            productType: 'service',
            quantity: 1,
            duration: 60,
          },
        ],
      },
      {
        sessionNumber: 6,
        sessionName: 'Buổi 6',
        items: [
          {
            productId: 'spa-service-serv-05',
            productName: 'Facial dưỡng ẩm',
            productType: 'service',
            quantity: 1,
            duration: 60,
          },
        ],
      },
      {
        sessionNumber: 7,
        sessionName: 'Buổi 7',
        items: [
          {
            productId: 'spa-service-serv-04',
            productName: 'Facial trị mụn',
            productType: 'service',
            quantity: 1,
            duration: 60,
          },
        ],
      },
      {
        sessionNumber: 8,
        sessionName: 'Buổi 8',
        items: [
          {
            productId: 'spa-service-serv-05',
            productName: 'Facial dưỡng ẩm',
            productType: 'service',
            quantity: 1,
            duration: 60,
          },
        ],
      },
    ],
    purchaseDate: getDaysOffset(20),
    orderId: 'SPA009',
    isActive: true,
    createdAt: getDaysOffset(20),
  },
];

// Function to load demo packages V2
export function loadDemoPackagesV2() {
  const storage = localStorage.getItem('pos-storage');
  if (!storage) {
    console.error('❌ Store not found! Please refresh the page.');
    return;
  }

  const data = JSON.parse(storage);
  
  // Replace old packages with new structure
  data.state.customerTreatmentPackages = demoTreatmentPackagesV2;
  
  localStorage.setItem('pos-storage', JSON.stringify(data));
  console.log(`✅ Demo treatment packages V2 loaded! Total: ${demoTreatmentPackagesV2.length}`);
  console.log('📦 Packages:', demoTreatmentPackagesV2.map(p => ({
    customer: p.customerName,
    package: p.treatmentName,
    used: p.usedSessionNumbers,
    remaining: p.remainingSessions,
  })));
}

// Expose to window for easy testing
declare global {
  interface Window {
    loadDemoPackagesV2: typeof loadDemoPackagesV2;
  }
}

if (typeof window !== 'undefined') {
  window.loadDemoPackagesV2 = loadDemoPackagesV2;
}