import type { User, Customer } from './store';

// Helper function to get date offset
const getDateOffset = (daysOffset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
};

// Helper function to get today's date
const getToday = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Demo Technician Users
export const demoTechnicians: Omit<User, 'id' | 'createdAt'>[] = [
  {
    username: 'linh.nguyen',
    password: '123456',
    fullName: 'Nguyễn Thảo Linh',
    email: 'linh.nguyen@spa.com',
    phone: '0912345678',
    roleGroupId: '3',
    role: 'technician',
    roleGroup: 'technician',
    isActive: true,
  },
  {
    username: 'mai.tran',
    password: '123456',
    fullName: 'Trần Hương Mai',
    email: 'mai.tran@spa.com',
    phone: '0923456789',
    roleGroupId: '3',
    role: 'technician',
    roleGroup: 'technician',
    isActive: true,
  },
  {
    username: 'hoa.le',
    password: '123456',
    fullName: 'Lê Thanh Hoa',
    email: 'hoa.le@spa.com',
    phone: '0934567890',
    roleGroupId: '3',
    role: 'technician',
    roleGroup: 'technician',
    isActive: true,
  },
  {
    username: 'lan.pham',
    password: '123456',
    fullName: 'Phạm Bích Lan',
    email: 'lan.pham@spa.com',
    phone: '0945678901',
    roleGroupId: '3',
    role: 'technician',
    roleGroup: 'technician',
    isActive: true,
  },
];

// Demo Customers for Appointments
export const demoCustomersForAppointments: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'totalSpent' | 'orderCount'>[] = [
  {
    name: 'Nguyễn Minh Anh',
    phone: '0901234567',
    email: 'minhanh@gmail.com',
    address: '123 Đường Láng, Đống Đa, Hà Nội',
    birthDate: '1995-05-15',
    gender: 'female',
    notes: 'Khách hàng VIP, ưu tiên dịch vụ cao cấp',
  },
  {
    name: 'Trần Thu Hà',
    phone: '0912345678',
    email: 'thuha@gmail.com',
    address: '456 Nguyễn Trãi, Thanh Xuân, Hà Nội',
    birthDate: '1992-08-20',
    gender: 'female',
    notes: 'Da nhạy cảm, cần sản phẩm organic',
  },
  {
    name: 'Lê Phương Thảo',
    phone: '0923456789',
    email: 'phuongthao@gmail.com',
    address: '789 Giải Phóng, Hoàng Mai, Hà Nội',
    birthDate: '1998-12-10',
    gender: 'female',
    notes: 'Khách hàng thân thiết, đến mỗi tuần',
  },
  {
    name: 'Phạm Ngọc Lan',
    phone: '0934567890',
    email: 'ngoclan@gmail.com',
    address: '321 Cầu Giấy, Cầu Giấy, Hà Nội',
    birthDate: '1990-03-25',
    gender: 'female',
    notes: 'Thích massage thư giãn',
  },
  {
    name: 'Hoàng Mai Phương',
    phone: '0945678901',
    email: 'maiphuong@gmail.com',
    address: '654 Hoàng Quốc Việt, Cầu Giấy, Hà Nội',
    birthDate: '1993-07-18',
    gender: 'female',
  },
  {
    name: 'Đỗ Thanh Tâm',
    phone: '0956789012',
    email: 'thanhtam@gmail.com',
    address: '987 Trần Duy Hưng, Cầu Giấy, Hà Nội',
    birthDate: '1996-11-05',
    gender: 'female',
    notes: 'Quan tâm đến liệu trình trị mụn',
  },
];

// Function to inject demo technician data to store
export function injectDemoTechnicianData(store: any) {
  try {
    console.log('🔄 Injecting demo technician data...');
    
    const state = store.getState();
    
    // Add demo technicians (check if not exists)
    demoTechnicians.forEach((tech) => {
      const existingUser = state.users.find((u: User) => u.username === tech.username);
      if (!existingUser) {
        state.createUser(tech);
        console.log(`✅ Added technician: ${tech.fullName}`);
      }
    });
    
    // Add demo customers (check if not exists)
    demoCustomersForAppointments.forEach((customer) => {
      const existingCustomer = state.customers.find((c: Customer) => c.phone === customer.phone);
      if (!existingCustomer) {
        state.addCustomer(customer);
        console.log(`✅ Added customer: ${customer.name}`);
      }
    });
    
    // Get updated state with IDs
    const updatedState = store.getState();
    const technicians = updatedState.users.filter((u: User) => u.role === 'technician');
    const customers = updatedState.customers.filter((c: Customer) => 
      demoCustomersForAppointments.some(dc => dc.phone === c.phone)
    );
    const products = updatedState.products;
    
    // Get service products (for spa industry)
    const facialProducts = products.filter((p: any) => 
      p.category === 'Chăm sóc da mặt' && p.productType === 'service'
    );
    const massageProducts = products.filter((p: any) => 
      p.category === 'Massage' && p.productType === 'service'
    );
    const nailProducts = products.filter((p: any) => 
      p.category === 'Nail & Spa' && p.productType === 'service'
    );
    
    if (technicians.length === 0 || customers.length === 0 || products.length === 0) {
      console.warn('⚠️ Not enough data to create appointments. Make sure industry data is loaded first.');
      return;
    }
    
    // Create demo appointments
    const demoAppointments: any[] = [];
    
    // TODAY'S APPOINTMENTS (6 appointments with different time slots)
    const today = getToday();
    
    // Appointment 1: 9:00 AM - Facial
    if (technicians[0] && customers[0] && facialProducts[0]) {
      demoAppointments.push({
        customerId: customers[0].id,
        customerName: customers[0].name,
        customerPhone: customers[0].phone,
        appointmentDate: today,
        startTime: '09:00',
        endTime: '10:30',
        services: [{
          productId: facialProducts[0].id,
          productName: facialProducts[0].name,
          productType: 'service' as const,
          duration: 90,
          price: facialProducts[0].price,
          technicianIds: [technicians[0].id],
          technicianNames: [technicians[0].fullName],
          startTime: '09:00',
          endTime: '10:30',
        }],
        status: 'confirmed' as const,
        note: 'Khách hàng VIP, cần chăm sóc đặc biệt',
        createdBy: 'admin',
      });
    }
    
    // Appointment 2: 10:00 AM - Massage (ongoing now if between 10:00-11:30)
    if (technicians[1] && customers[1] && massageProducts[0]) {
      demoAppointments.push({
        customerId: customers[1].id,
        customerName: customers[1].name,
        customerPhone: customers[1].phone,
        appointmentDate: today,
        startTime: '10:00',
        endTime: '11:30',
        services: [{
          productId: massageProducts[0].id,
          productName: massageProducts[0].name,
          productType: 'service' as const,
          duration: 90,
          price: massageProducts[0].price,
          technicianIds: [technicians[1].id],
          technicianNames: [technicians[1].fullName],
          startTime: '10:00',
          endTime: '11:30',
        }],
        status: 'confirmed' as const,
        note: 'Massage thư giãn toàn thân',
        createdBy: 'admin',
      });
    }
    
    // Appointment 3: 13:00 PM - Nail Service with 2 technicians
    if (technicians[2] && technicians[3] && customers[2] && nailProducts[0] && facialProducts[1]) {
      demoAppointments.push({
        customerId: customers[2].id,
        customerName: customers[2].name,
        customerPhone: customers[2].phone,
        appointmentDate: today,
        startTime: '13:00',
        endTime: '15:00',
        services: [
          {
            productId: nailProducts[0].id,
            productName: nailProducts[0].name,
            productType: 'service' as const,
            duration: 60,
            price: nailProducts[0].price,
            technicianIds: [technicians[2].id],
            technicianNames: [technicians[2].fullName],
            startTime: '13:00',
            endTime: '14:00',
          },
          {
            productId: facialProducts[1].id,
            productName: facialProducts[1].name,
            productType: 'service' as const,
            duration: 60,
            price: facialProducts[1].price,
            technicianIds: [technicians[3].id],
            technicianNames: [technicians[3].fullName],
            startTime: '14:00',
            endTime: '15:00',
          }
        ],
        status: 'confirmed' as const,
        note: 'Combo dịch vụ - nail + facial',
        createdBy: 'admin',
      });
    }
    
    // Appointment 4: 14:00 PM - Facial for technician 0
    if (technicians[0] && customers[3] && facialProducts[0]) {
      demoAppointments.push({
        customerId: customers[3].id,
        customerName: customers[3].name,
        customerPhone: customers[3].phone,
        appointmentDate: today,
        startTime: '14:00',
        endTime: '15:30',
        services: [{
          productId: facialProducts[0].id,
          productName: facialProducts[0].name,
          productType: 'service' as const,
          duration: 90,
          price: facialProducts[0].price,
          technicianIds: [technicians[0].id],
          technicianNames: [technicians[0].fullName],
          startTime: '14:00',
          endTime: '15:30',
        }],
        status: 'confirmed' as const,
        createdBy: 'admin',
      });
    }
    
    // Appointment 5: 16:00 PM - Massage for technician 1
    if (technicians[1] && customers[4] && massageProducts[1]) {
      demoAppointments.push({
        customerId: customers[4].id,
        customerName: customers[4].name,
        customerPhone: customers[4].phone,
        appointmentDate: today,
        startTime: '16:00',
        endTime: '17:00',
        services: [{
          productId: massageProducts[1].id,
          productName: massageProducts[1].name,
          productType: 'service' as const,
          duration: 60,
          price: massageProducts[1].price,
          technicianIds: [technicians[1].id],
          technicianNames: [technicians[1].fullName],
          startTime: '16:00',
          endTime: '17:00',
        }],
        status: 'confirmed' as const,
        createdBy: 'admin',
      });
    }
    
    // Appointment 6: 17:30 PM - Evening appointment
    if (technicians[0] && customers[5] && facialProducts[1]) {
      demoAppointments.push({
        customerId: customers[5].id,
        customerName: customers[5].name,
        customerPhone: customers[5].phone,
        appointmentDate: today,
        startTime: '17:30',
        endTime: '19:00',
        services: [{
          productId: facialProducts[1].id,
          productName: facialProducts[1].name,
          productType: 'service' as const,
          duration: 90,
          price: facialProducts[1].price,
          technicianIds: [technicians[0].id],
          technicianNames: [technicians[0].fullName],
          startTime: '17:30',
          endTime: '19:00',
        }],
        status: 'confirmed' as const,
        note: 'Khách hàng đặt lịch buổi tối',
        createdBy: 'admin',
      });
    }
    
    // TOMORROW'S APPOINTMENTS (4 appointments)
    const tomorrow = getDateOffset(1);
    
    // Tomorrow 9:00 AM
    if (technicians[1] && customers[0] && facialProducts[0]) {
      demoAppointments.push({
        customerId: customers[0].id,
        customerName: customers[0].name,
        customerPhone: customers[0].phone,
        appointmentDate: tomorrow,
        startTime: '09:00',
        endTime: '10:30',
        services: [{
          productId: facialProducts[0].id,
          productName: facialProducts[0].name,
          productType: 'service' as const,
          duration: 90,
          price: facialProducts[0].price,
          technicianIds: [technicians[1].id],
          technicianNames: [technicians[1].fullName],
          startTime: '09:00',
          endTime: '10:30',
        }],
        status: 'confirmed' as const,
        createdBy: 'admin',
      });
    }
    
    // Tomorrow 11:00 AM
    if (technicians[0] && customers[2] && massageProducts[0]) {
      demoAppointments.push({
        customerId: customers[2].id,
        customerName: customers[2].name,
        customerPhone: customers[2].phone,
        appointmentDate: tomorrow,
        startTime: '11:00',
        endTime: '12:30',
        services: [{
          productId: massageProducts[0].id,
          productName: massageProducts[0].name,
          productType: 'service' as const,
          duration: 90,
          price: massageProducts[0].price,
          technicianIds: [technicians[0].id],
          technicianNames: [technicians[0].fullName],
          startTime: '11:00',
          endTime: '12:30',
        }],
        status: 'confirmed' as const,
        createdBy: 'admin',
      });
    }
    
    // Tomorrow 14:00 PM
    if (technicians[2] && customers[1] && nailProducts[0]) {
      demoAppointments.push({
        customerId: customers[1].id,
        customerName: customers[1].name,
        customerPhone: customers[1].phone,
        appointmentDate: tomorrow,
        startTime: '14:00',
        endTime: '15:00',
        services: [{
          productId: nailProducts[0].id,
          productName: nailProducts[0].name,
          productType: 'service' as const,
          duration: 60,
          price: nailProducts[0].price,
          technicianIds: [technicians[2].id],
          technicianNames: [technicians[2].fullName],
          startTime: '14:00',
          endTime: '15:00',
        }],
        status: 'confirmed' as const,
        createdBy: 'admin',
      });
    }
    
    // Tomorrow 16:00 PM
    if (technicians[0] && customers[3] && facialProducts[1]) {
      demoAppointments.push({
        customerId: customers[3].id,
        customerName: customers[3].name,
        customerPhone: customers[3].phone,
        appointmentDate: tomorrow,
        startTime: '16:00',
        endTime: '17:00',
        services: [{
          productId: facialProducts[1].id,
          productName: facialProducts[1].name,
          productType: 'service' as const,
          duration: 60,
          price: facialProducts[1].price,
          technicianIds: [technicians[0].id],
          technicianNames: [technicians[0].fullName],
          startTime: '16:00',
          endTime: '17:00',
        }],
        status: 'confirmed' as const,
        createdBy: 'admin',
      });
    }
    
    // NEXT WEEK APPOINTMENTS (3 appointments)
    const nextWeek1 = getDateOffset(3);
    const nextWeek2 = getDateOffset(5);
    
    // Day +3: 10:00 AM
    if (technicians[0] && customers[4] && massageProducts[0]) {
      demoAppointments.push({
        customerId: customers[4].id,
        customerName: customers[4].name,
        customerPhone: customers[4].phone,
        appointmentDate: nextWeek1,
        startTime: '10:00',
        endTime: '11:30',
        services: [{
          productId: massageProducts[0].id,
          productName: massageProducts[0].name,
          productType: 'service' as const,
          duration: 90,
          price: massageProducts[0].price,
          technicianIds: [technicians[0].id],
          technicianNames: [technicians[0].fullName],
          startTime: '10:00',
          endTime: '11:30',
        }],
        status: 'confirmed' as const,
        createdBy: 'admin',
      });
    }
    
    // Day +5: 13:00 PM
    if (technicians[1] && customers[5] && facialProducts[0]) {
      demoAppointments.push({
        customerId: customers[5].id,
        customerName: customers[5].name,
        customerPhone: customers[5].phone,
        appointmentDate: nextWeek2,
        startTime: '13:00',
        endTime: '14:30',
        services: [{
          productId: facialProducts[0].id,
          productName: facialProducts[0].name,
          productType: 'service' as const,
          duration: 90,
          price: facialProducts[0].price,
          technicianIds: [technicians[1].id],
          technicianNames: [technicians[1].fullName],
          startTime: '13:00',
          endTime: '14:30',
        }],
        status: 'confirmed' as const,
        createdBy: 'admin',
      });
    }
    
    // Day +5: 15:00 PM
    if (technicians[0] && customers[0] && nailProducts[0]) {
      demoAppointments.push({
        customerId: customers[0].id,
        customerName: customers[0].name,
        customerPhone: customers[0].phone,
        appointmentDate: nextWeek2,
        startTime: '15:00',
        endTime: '16:00',
        services: [{
          productId: nailProducts[0].id,
          productName: nailProducts[0].name,
          productType: 'service' as const,
          duration: 60,
          price: nailProducts[0].price,
          technicianIds: [technicians[0].id],
          technicianNames: [technicians[0].fullName],
          startTime: '15:00',
          endTime: '16:00',
        }],
        status: 'confirmed' as const,
        createdBy: 'admin',
      });
    }
    
    // COMPLETED APPOINTMENTS (2 from yesterday)
    const yesterday = getDateOffset(-1);
    
    if (technicians[0] && customers[1] && facialProducts[0]) {
      demoAppointments.push({
        customerId: customers[1].id,
        customerName: customers[1].name,
        customerPhone: customers[1].phone,
        appointmentDate: yesterday,
        startTime: '09:00',
        endTime: '10:30',
        services: [{
          productId: facialProducts[0].id,
          productName: facialProducts[0].name,
          productType: 'service' as const,
          duration: 90,
          price: facialProducts[0].price,
          technicianIds: [technicians[0].id],
          technicianNames: [technicians[0].fullName],
          startTime: '09:00',
          endTime: '10:30',
        }],
        status: 'completed' as const,
        createdBy: 'admin',
      });
    }
    
    if (technicians[1] && customers[2] && massageProducts[0]) {
      demoAppointments.push({
        customerId: customers[2].id,
        customerName: customers[2].name,
        customerPhone: customers[2].phone,
        appointmentDate: yesterday,
        startTime: '14:00',
        endTime: '15:30',
        services: [{
          productId: massageProducts[0].id,
          productName: massageProducts[0].name,
          productType: 'service' as const,
          duration: 90,
          price: massageProducts[0].price,
          technicianIds: [technicians[1].id],
          technicianNames: [technicians[1].fullName],
          startTime: '14:00',
          endTime: '15:30',
        }],
        status: 'completed' as const,
        createdBy: 'admin',
      });
    }
    
    // CANCELLED APPOINTMENT (1 from last week)
    const lastWeek = getDateOffset(-7);
    
    if (technicians[0] && customers[3] && facialProducts[0]) {
      demoAppointments.push({
        customerId: customers[3].id,
        customerName: customers[3].name,
        customerPhone: customers[3].phone,
        appointmentDate: lastWeek,
        startTime: '10:00',
        endTime: '11:30',
        services: [{
          productId: facialProducts[0].id,
          productName: facialProducts[0].name,
          productType: 'service' as const,
          duration: 90,
          price: facialProducts[0].price,
          technicianIds: [technicians[0].id],
          technicianNames: [technicians[0].fullName],
          startTime: '10:00',
          endTime: '11:30',
        }],
        status: 'cancelled' as const,
        note: 'Khách hàng bận việc đột xuất',
        createdBy: 'admin',
      });
    }
    
    // Create all appointments
    demoAppointments.forEach((apt) => {
      state.createAppointment(apt);
    });
    
    console.log(`✅ Created ${demoAppointments.length} demo appointments`);
    console.log('📊 Demo data summary:');
    console.log(`   - Technicians: ${technicians.length}`);
    console.log(`   - Customers: ${customers.length}`);
    console.log(`   - Today's appointments: 6`);
    console.log(`   - Tomorrow's appointments: 4`);
    console.log(`   - Future appointments: 3`);
    console.log(`   - Completed: 2`);
    console.log(`   - Cancelled: 1`);
    console.log('');
    console.log('💡 Test accounts:');
    console.log('   🔧 Technician 1: linh.nguyen / 123456');
    console.log('   🔧 Technician 2: mai.tran / 123456');
    console.log('   🔧 Technician 3: hoa.le / 123456');
    console.log('   🔧 Technician 4: lan.pham / 123456');
    
  } catch (error) {
    console.error('❌ Error injecting demo technician data:', error);
  }
}

// Auto-load function (can be called from window console)
if (typeof window !== 'undefined') {
  (window as any).loadDemoTechnicianData = () => {
    console.log('🚀 Loading demo technician data...');
    // This will be called after store is initialized
  };
}
