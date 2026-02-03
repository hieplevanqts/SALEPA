import { useState, useEffect } from 'react';
import { useStore } from '../../../../lib/fashion-shop-lib/store';
import type { Appointment, AppointmentService, User, Product } from '../../../../lib/fashion-shop-lib/store';
import {
  Calendar as CalendarIcon, List, Search, Filter, Plus, Edit, Trash2,
  Clock, User as UserIcon, Phone, Mail, X, Check, AlertCircle,
  ChevronLeft, ChevronRight, CalendarCheck, UserCircle2, ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import TreatmentPackageModal from '../../components/modals/TreatmentPackageModal';
import { Pagination } from '../../components/feedback/Pagination';

type ViewMode = 'list' | 'calendar';
type CalendarViewType = 'day' | 'week' | 'month' | 'year';

export default function AppointmentManagement() {
  const { 
    customers, 
    users, 
    products, 
    appointments, 
    createAppointment, 
    updateAppointment, 
    deleteAppointment,
    getPackageForService,
    usePackageSession,
    returnPackageSession,
    isTechnicianBusy,
    getCustomerActivePackages,
    customerTreatmentPackages,
  } = useStore();
  
  // Filter products by type - fallback to category for old products
  const spaCategories = ['Chăm sóc da mặt', 'Massage', 'Nail & Spa', 'Liệu trình trị liệu'];
  const serviceProducts = products.filter(p => {
    // New products with type field
    if (p.type === 'service' || p.type === 'treatment') return true;
    // Old products without type - filter by spa categories
    if (!p.type && spaCategories.includes(p.category)) return true;
    return false;
  });
  
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [calendarViewType, setCalendarViewType] = useState<CalendarViewType>('week');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Appointment['status']>('all');
  const [filterDate, setFilterDate] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingStartDate, setSelectingStartDate] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [deleteConfirmAppointment, setDeleteConfirmAppointment] = useState<Appointment | null>(null);
  const [showPackageModal, setShowPackageModal] = useState(false);
  
  // Form states - Mỗi service có technicianIds riêng (mảng) và time slot riêng
  const [formData, setFormData] = useState({
    customerId: '',
    appointmentDate: '',
    services: [] as { 
      instanceId: string;
      productId: string; 
      productName: string;
      productType: 'product' | 'service' | 'treatment';
      quantity: number;
      technicianIds: string[]; // ⭐ Changed to array
      startTime: string; // ⭐ NEW: Start time for this service
      endTime: string;   // ⭐ NEW: End time for this service
      useTreatmentPackage?: boolean;
      treatmentPackageId?: string;
      treatmentPackageName?: string;
      packageSessionNumber?: number;
      numberOfSessionsToUse?: number; // Số buổi muốn trừ (cho phép chọn nhiều buổi)
    }[],
    notes: '',
    status: 'pending' as Appointment['status'],
  });

  const technicians = users.filter(u => (u.roleGroupId === '3' || u.roleGroupId === '1') && u.isActive);
  const servicesOnly = products.filter(p => p.productType === 'service');

  // ⭐ Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[id^="tech-dropdown-"]') && !target.closest('.tech-dropdown-trigger')) {
        document.querySelectorAll('[id^="tech-dropdown-"]').forEach(dropdown => {
          dropdown.classList.add('hidden');
        });
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // ⭐ AUTO-UPDATE appointment status when time has passed
  useEffect(() => {
    const autoUpdateAppointmentStatus = () => {
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      appointments.forEach(appointment => {
        // Only auto-update if status is pending or in-progress
        if (appointment.status !== 'pending' && appointment.status !== 'in-progress') {
          return;
        }
        
        // Check if appointment date has passed or if it's today and time has passed
        const isPast = appointment.appointmentDate < currentDate || 
                      (appointment.appointmentDate === currentDate && appointment.endTime < currentTime);
        
        if (isPast) {
          // Auto-complete the appointment
          updateAppointment(appointment.id, {
            ...appointment,
            status: 'completed'
          });
        }
      });
    };
    
    // Run on mount
    autoUpdateAppointmentStatus();
    
    // Run every 5 minutes
    const interval = setInterval(autoUpdateAppointmentStatus, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [appointments, updateAppointment]);

  const getStatusBadge = (status: Appointment['status']) => {
    const badges = {
      pending: { label: 'Đang chờ', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      'in-progress': { label: 'Đang thực hiện', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700 border-green-200' },
      cancelled: { label: 'Hủy lịch', color: 'bg-red-100 text-red-700 border-red-200' },
    };
    return badges[status] || badges.pending;
  };

  const formatDate = (dateString: string) => {
    // Avoid timezone issues by appending T00:00:00
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleOpenForm = (appointment?: Appointment) => {
    if (appointment) {
      setEditingAppointment(appointment);
      setFormData({
        customerId: appointment.customerId,
        appointmentDate: appointment.appointmentDate,
        services: appointment.services.map(s => ({
          instanceId: Date.now().toString() + Math.random(),
          productId: s.productId,
          productName: s.productName,
          productType: s.productType,
          quantity: s.quantity || 1,
          technicianIds: s.technicianIds || [], // ⭐ Map to array
          startTime: s.startTime, // ⭐ Map startTime
          endTime: s.endTime,     // ⭐ Map endTime
          packageSessionNumber: s.sessionNumber,
          useTreatmentPackage: s.useTreatmentPackage,
          treatmentPackageId: s.treatmentPackageId,
          treatmentPackageName: s.useTreatmentPackage 
            ? customerTreatmentPackages.find(p => p.id === s.treatmentPackageId)?.treatmentName 
            : undefined,
          numberOfSessionsToUse: 1, // Mặc định 1 buổi khi edit
        })),
        notes: appointment.notes || '',
        status: appointment.status,
      });
    } else {
      setEditingAppointment(null);
      setFormData({
        customerId: '',
        appointmentDate: getTodayString(),
        services: [],
        notes: '',
        status: 'pending' as Appointment['status'],
      });
    }
    setShowForm(true);
  };

  // ⭐ Helper: Calculate end time from start time + duration
  const calculateTimeEnd = (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
  };

  const calculateEndTime = () => {
    // Find latest endTime from all services
    const servicesWithTime = formData.services.filter(s => s.startTime && s.endTime);
    if (servicesWithTime.length === 0) {
      return '09:00'; // Default fallback
    }
    
    // Return the latest endTime
    return servicesWithTime.reduce((latest, svc) => {
      return svc.endTime > latest ? svc.endTime : latest;
    }, servicesWithTime[0].endTime);
  };

  const calculateStartTime = () => {
    // Find earliest startTime from all services
    const servicesWithTime = formData.services.filter(s => s.startTime && s.endTime);
    if (servicesWithTime.length === 0) {
      return '09:00'; // Default fallback
    }
    
    // Return the earliest startTime
    return servicesWithTime.reduce((earliest, svc) => {
      return svc.startTime < earliest ? svc.startTime : earliest;
    }, servicesWithTime[0].startTime);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    
    const customer = customers.find(c => c.id === formData.customerId);
    
    if (!customer) {
      toast.error('Vui lòng chọn khách hàng!');
      return;
    }
    
    if (!formData.appointmentDate) {
      toast.error('Vui lòng chọn ngày hẹn!');
      return;
    }
    
    if (formData.services.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 dịch vụ!');
      return;
    }

    const missingTechnician = formData.services.some(s => 
      (s.productType === 'service' || s.productType === 'treatment') && 
      (!s.technicianIds || s.technicianIds.length === 0)
    );
    if (missingTechnician) {
      toast.error('Vui lòng chọn ít nhất 1 kỹ thuật viên cho tất cả dịch vụ!');
      return;
    }

    // Validate time for services
    const missingTime = formData.services.some(s => 
      (s.productType === 'service' || s.productType === 'treatment') && (!s.startTime || !s.endTime)
    );
    if (missingTime) {
      toast.error('Vui lòng nhập giờ bắt đầu và kết thúc cho tất cả dịch vụ!');
      return;
    }

    // ⭐ NEW: Check trùng kỹ thuật viên trong cùng appointment
    const servicesWithTechnician = formData.services.filter(s => 
      s.technicianIds && s.technicianIds.length > 0 && s.startTime && s.endTime
    );
    for (let i = 0; i < servicesWithTechnician.length; i++) {
      const service1 = servicesWithTechnician[i];
      for (let j = i + 1; j < servicesWithTechnician.length; j++) {
        const service2 = servicesWithTechnician[j];
        
        // Nếu có kỹ thuật viên chung, kiểm tra thời gian overlap
        const commonTechs = service1.technicianIds.filter(id => service2.technicianIds.includes(id));
        if (commonTechs.length > 0) {
          const start1 = service1.startTime;
          const end1 = service1.endTime;
          const start2 = service2.startTime;
          const end2 = service2.endTime;
          
          // Check overlap: (start1 < end2) && (start2 < end1)
          if (start1 < end2 && start2 < end1) {
            const tech = technicians.find(t => t.id === commonTechs[0]);
            toast.error(`Kỹ thuật viên ${tech?.fullName} bị trùng lịch giữa "${service1.productName}" (${start1}-${end1}) và "${service2.productName}" (${start2}-${end2})!`);
            return;
          }
        }
      }
    }

    // ⭐ NEW: Check trùng với lịch hẹn khác
    for (const service of servicesWithTechnician) {
      if (!service.technicianIds || service.technicianIds.length === 0 || !service.startTime || !service.endTime) continue;
      
      // Convert time to minutes for duration calculation
      const [startHour, startMin] = service.startTime.split(':').map(Number);
      const [endHour, endMin] = service.endTime.split(':').map(Number);
      const durationMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
      
      // Check each technician
      for (const techId of service.technicianIds) {
        const isBusy = isTechnicianBusy(
          techId,
          formData.appointmentDate,
          service.startTime,
          durationMinutes,
          editingAppointment?.id // Exclude current appointment when editing
        );
        
        if (isBusy) {
          const tech = technicians.find(t => t.id === techId);
          toast.error(`Kỹ thuật viên ${tech?.fullName} đã có lịch hẹn khác vào ${service.startTime}-${service.endTime} ngày ${formatDate(formData.appointmentDate)}!`);
          return;
        }
      }
    }

    // NEW: Validate package usage
    // DEPRECATED - Not needed in V2 session-based approach
    /*
    if (!validatePackageUsage()) {
      return;
    }
    */

    const appointmentServices: AppointmentService[] = formData.services.map(svc => {
      const product = products.find(p => p.id === svc.productId);
      const technicianNames = svc.technicianIds?.map(id => {
        const tech = technicians.find(t => t.id === id);
        return tech?.fullName || '';
      }).filter(name => name);
      
      // For items from treatment packages, use svc data if product not found
      const finalPrice = svc.useTreatmentPackage ? 0 : (product?.price || 0);
      
      return {
        productId: svc.productId,
        productName: svc.productName,
        productType: svc.productType as 'product' | 'service' | 'treatment',
        duration: product?.duration || 0,
        price: finalPrice,
        quantity: svc.quantity,
        sessionNumber: svc.packageSessionNumber, // Map from packageSessionNumber
        maxSessions: product?.sessions,
        useTreatmentPackage: svc.useTreatmentPackage,
        treatmentPackageId: svc.treatmentPackageId,
        technicianIds: svc.technicianIds || [],
        technicianNames: technicianNames || [],
        startTime: svc.startTime,
        endTime: svc.endTime,
      };
    });
    
    if (editingAppointment) {
      // Xử lý logic trừ/hoàn buổi khi chỉnh sửa lịch hẹn
      const oldServices = editingAppointment.services;
      const newServices = formData.services;
      
      // So sánh dịch vụ cũ và mới để xử lý package sessions
      oldServices.forEach(oldSvc => {
        // Nếu service cũ dùng package, hoàn lại buổi
        if (oldSvc.useTreatmentPackage && oldSvc.treatmentPackageId && oldSvc.sessionNumber) {
          returnPackageSession(oldSvc.treatmentPackageId, oldSvc.sessionNumber);
        }
      });
      
      // Trừ buổi cho các service mới sử dụng package
      newServices.forEach(newSvc => {
        if (newSvc.useTreatmentPackage && newSvc.treatmentPackageId && newSvc.packageSessionNumber) {
          usePackageSession(newSvc.treatmentPackageId, newSvc.packageSessionNumber);
        }
      });
      
      const updateData = {
        customerId: formData.customerId,
        customerName: customer.name,
        customerPhone: customer.phone,
        appointmentDate: formData.appointmentDate,
        startTime: calculateStartTime(),
        endTime: calculateEndTime(),
        services: appointmentServices,
        notes: formData.notes,
        status: formData.status,
        createdBy: editingAppointment.createdBy,
      };
      
      updateAppointment(editingAppointment.id, updateData);
      toast.success('Cập nhật lịch hẹn thành công!');
    } else {
      const newAppointmentData = {
        customerId: formData.customerId,
        customerName: customer.name,
        customerPhone: customer.phone,
        appointmentDate: formData.appointmentDate,
        startTime: calculateStartTime(),
        endTime: calculateEndTime(),
        services: appointmentServices,
        notes: formData.notes,
        status: formData.status,
        createdBy: 'admin',
      };
      
      createAppointment(newAppointmentData);
      
      // Trừ buổi khi tạo lịch hẹn mới
      formData.services.forEach(svc => {
        if (svc.useTreatmentPackage && svc.treatmentPackageId && svc.packageSessionNumber) {
          usePackageSession(svc.treatmentPackageId, svc.packageSessionNumber);
        }
      });
      
      toast.success('Tạo lịch hẹn thành công!');
    }
    
    setShowForm(false);
    
    // Reset form
    setFormData({
      customerId: '',
      appointmentDate: getTodayString(),
      services: [],
      notes: '',
      status: 'pending' as Appointment['status'],
    });
    setEditingAppointment(null);
  };

  const handleAddService = () => {
    // ⭐ Auto-calculate startTime and endTime for new service
    let newStartTime = '09:00';
    let newEndTime = '09:00';
    
    // If there are existing services, start after the last service
    const servicesWithTime = formData.services.filter(s => 
      (s.productType === 'service' || s.productType === 'treatment') && s.endTime
    );
    
    if (servicesWithTime.length > 0) {
      // Find the latest endTime
      const latestEndTime = servicesWithTime.reduce((latest, svc) => {
        return svc.endTime > latest ? svc.endTime : latest;
      }, servicesWithTime[0].endTime);
      newStartTime = latestEndTime;
      newEndTime = latestEndTime; // Will be updated when service is selected
    }
    
    setFormData({
      ...formData,
      services: [...formData.services, { 
        instanceId: Date.now().toString() + Math.random(),
        productId: '',
        productName: '',
        productType: 'service' as const,
        quantity: 1,
        technicianIds: [], // ⭐ Changed to empty array
        startTime: newStartTime,
        endTime: newEndTime,
      }],
    });
  };

  // NEW: Handle session selection from modal (support multiple sessions)
  const handleSelectSession = (packageId: string, sessionNumbers: number[], packageName: string) => {
    const pkg = customerTreatmentPackages.find(p => p.id === packageId);
    if (!pkg) return;

    let allNewServices: any[] = [];

    // Process each selected session
    sessionNumbers.forEach(sessionNumber => {
      const session = pkg.sessions.find(s => s.sessionNumber === sessionNumber);
      if (!session) return;

      // ⭐ Calculate start time for services in this session
      let sessionStartTime = allNewServices.length > 0
        ? allNewServices[allNewServices.length - 1].endTime || '09:00'
        : (formData.services.filter(s => (s.productType === 'service' || s.productType === 'treatment') && s.endTime).length > 0
            ? formData.services.filter(s => (s.productType === 'service' || s.productType === 'treatment') && s.endTime).reduce((latest, svc) => svc.endTime > latest ? svc.endTime : latest, formData.services.filter(s => (s.productType === 'service' || s.productType === 'treatment') && s.endTime)[0].endTime)
            : '09:00');

      // Add all items from the session to services
      const newServices = session.items.map(item => {
        const itemStartTime = sessionStartTime;
        const itemEndTime = item.productType === 'service' 
          ? calculateTimeEnd(sessionStartTime, item.duration || 0)
          : sessionStartTime;
        
        // Update for next item
        if (item.productType === 'service') {
          sessionStartTime = itemEndTime;
        }
        
        return {
          instanceId: Date.now().toString() + Math.random(),
          productId: item.productId,
          productName: item.productName,
          productType: item.productType,
          quantity: item.quantity,
          technicianIds: item.productType === 'service' || item.productType === 'treatment' ? [] : [],
          startTime: itemStartTime, // ⭐ Auto-calculated
          endTime: itemEndTime,     // ⭐ Auto-calculated
          useTreatmentPackage: true,
          treatmentPackageId: packageId,
          treatmentPackageName: packageName,
          packageSessionNumber: sessionNumber,
          numberOfSessionsToUse: 1, // Mỗi session trừ 1 buổi
        };
      });

      allNewServices = [...allNewServices, ...newServices];
    });

    setFormData({
      ...formData,
      services: [...formData.services, ...allNewServices],
    });

    setShowPackageModal(false);
    toast.success(`Đã thêm ${sessionNumbers.length} buổi từ gói "${packageName}"`);
  };

  // OLD: Add service from package (deprecated - remove later)
  const addServiceFromPackage = (
    serviceId: string,
    packageId: string,
    packageName: string
  ) => {
    const product = products.find(p => p.id === serviceId);
    
    if (!product) {
      toast.error('Không tìm thấy dịch vụ!');
      return;
    }
    
    const newService = {
      instanceId: Date.now().toString() + Math.random(),
      productId: serviceId,
      productName: product.name,
      technicianId: '',
      useTreatmentPackage: true,
      treatmentPackageId: packageId,
      treatmentPackageName: packageName,
    };
    
    setFormData({
      ...formData,
      services: [...formData.services, newService],
    });
    
    toast.success(`Đã thêm "${product.name}" từ gói "${packageName}"`);
  };

  // NEW: Count how many times a service from a package has been added
  const countServiceFromPackage = (serviceId: string, packageId: string) => {
    return formData.services.filter(s => 
      s.productId === serviceId && 
      s.treatmentPackageId === packageId &&
      s.useTreatmentPackage
    ).length;
  };

  // NEW: Calculate package usage summary
  const calculatePackageUsage = () => {
    const usage: Record<string, {
      packageId: string;
      packageName: string;
      count: number;
      remainingSessions: number;
    }> = {};
    
    formData.services.forEach(service => {
      if (service.useTreatmentPackage && service.treatmentPackageId) {
        if (!usage[service.treatmentPackageId]) {
          const pkg = customerTreatmentPackages.find(
            p => p.id === service.treatmentPackageId
          );
          usage[service.treatmentPackageId] = {
            packageId: service.treatmentPackageId,
            packageName: service.treatmentPackageName || pkg?.treatmentName || "",
            count: 0,
            remainingSessions: pkg?.remainingSessions || 0,
          };
        }
        usage[service.treatmentPackageId].count++;
      }
    });
    
    return Object.values(usage);
  };

  // NEW: Validate package usage before saving
  const validatePackageUsage = () => {
    const packageUsage = calculatePackageUsage();
    
    for (const usage of packageUsage) {
      if (usage.count > usage.remainingSessions) {
        toast.error(
          `Gói "${usage.packageName}" chỉ còn ${usage.remainingSessions} buổi, không thể sử dụng ${usage.count} buổi!`
        );
        return false;
      }
    }
    
    return true;
  };



  const handleRemoveService = (index: number) => {
    setFormData({
      ...formData,
      services: formData.services.filter((_, i) => i !== index),
    });
  };

  const handleUpdateService = (index: number, productId: string) => {
    const newServices = [...formData.services];
    const product = products.find(p => p.id === productId);
    
    newServices[index] = { 
      ...newServices[index],
      productId,
      productName: product?.name,
      useTreatmentPackage: false,
      treatmentPackageId: undefined,
      treatmentPackageName: undefined,
    };
    
    setFormData({
      ...formData,
      services: newServices,
    });
  };

  const handleUpdateTechnician = (index: number, technicianId: string, checked: boolean) => {
    const newServices = [...formData.services];
    const currentIds = newServices[index].technicianIds || [];
    
    if (checked) {
      // Add technician
      newServices[index].technicianIds = [...currentIds, technicianId];
    } else {
      // Remove technician
      newServices[index].technicianIds = currentIds.filter(id => id !== technicianId);
    }
    
    setFormData({
      ...formData,
      services: newServices,
    });
  };

  const handleUpdateNumberOfSessions = (index: number, numberOfSessions: number) => {
    const newServices = [...formData.services];
    newServices[index].numberOfSessionsToUse = numberOfSessions;
    setFormData({
      ...formData,
      services: newServices,
    });
  };

  // Helper: Format date as YYYY-MM-DD in local timezone (avoid timezone issues)
  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper: Get today's date as YYYY-MM-DD
  const getTodayString = (): string => {
    return formatDateToString(new Date());
  };

  // Filter appointments
  const filteredAppointments = appointments.filter(apt => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      apt.code?.toLowerCase().includes(searchLower) ||
      apt.customerName?.toLowerCase().includes(searchLower) ||
      apt.customerPhone?.includes(searchQuery) ||
      apt.services?.some(s => s.productName?.toLowerCase().includes(searchLower) ||
        (s.technicianNames && s.technicianNames.some(name => name.toLowerCase().includes(searchLower))));
    
    if (!matchesSearch) return false;
    
    // Filter by status
    if (filterStatus !== 'all' && apt.status !== filterStatus) {
      return false;
    }
    
    // Filter by date (works for both list and calendar view)
    if (filterDate !== 'all') {
      const today = new Date();
      const todayStr = formatDateToString(today);
      
      if (filterDate === 'today') {
        if (apt.appointmentDate !== todayStr) return false;
      } else if (filterDate === 'tomorrow') {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = formatDateToString(tomorrow);
        if (apt.appointmentDate !== tomorrowStr) return false;
      } else if (filterDate === 'week') {
        // Check if appointment is within this week (today + 6 days)
        const aptDate = new Date(apt.appointmentDate + 'T00:00:00');
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        today.setHours(0, 0, 0, 0);
        if (aptDate < today || aptDate > weekEnd) return false;
      } else if (filterDate === 'month') {
        // Check if appointment is in the same month and year
        const aptDate = new Date(apt.appointmentDate + 'T00:00:00');
        if (aptDate.getMonth() !== today.getMonth() || 
            aptDate.getFullYear() !== today.getFullYear()) {
          return false;
        }
      } else if (filterDate === 'custom' && customStartDate && customEndDate) {
        const aptDate = new Date(apt.appointmentDate + 'T00:00:00');
        const startDate = new Date(customStartDate + 'T00:00:00');
        const endDate = new Date(customEndDate + 'T23:59:59');
        if (aptDate < startDate || aptDate > endDate) return false;
      }
    }
    
    return true;
  });

  // Date Range Picker Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const isInRange = (date: Date, start: string, end: string) => {
    if (!start || !end) return false;
    const checkDate = new Date(date);
    const startDate = new Date(start);
    const endDate = new Date(end);
    checkDate.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    return checkDate >= startDate && checkDate <= endDate;
  };

  const handleDateClick = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    
    if (selectingStartDate || !customStartDate) {
      setCustomStartDate(dateString);
      setCustomEndDate('');
      setSelectingStartDate(false);
    } else {
      const start = new Date(customStartDate);
      const end = new Date(dateString);
      
      if (end >= start) {
        setCustomEndDate(dateString);
        setSelectingStartDate(true);
      } else {
        setCustomStartDate(dateString);
        setCustomEndDate('');
        setSelectingStartDate(false);
      }
    }
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
    const days = [];
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    // Empty cells for days before the first day of month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-5"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      const isStart = customStartDate === dateString;
      const isEnd = customEndDate === dateString;
      const inRange = isInRange(date, customStartDate, customEndDate);
      const isToday = isSameDay(date, new Date());

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          className={`h-5 flex items-center justify-center rounded text-[10px] transition-colors ${
            isStart || isEnd
              ? 'bg-[#FE7410] text-white font-bold'
              : inRange
              ? 'bg-orange-100 text-orange-900'
              : isToday
              ? 'bg-gray-100 font-semibold'
              : 'hover:bg-gray-100'
          }`}
        >
          {day}
        </button>
      );
    }

    return (
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-0.5 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
          </button>
          <div className="font-semibold text-gray-900 text-xs">
            Tháng {currentMonth.getMonth() + 1}, {currentMonth.getFullYear()}
          </div>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-0.5 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
          </button>
        </div>
        
        {/* Day names */}
        <div className="grid grid-cols-7 gap-0.5 mb-0.5">
          {dayNames.map(name => (
            <div key={name} className="h-4 flex items-center justify-center text-[9px] font-semibold text-gray-500">
              {name}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-0.5">
          {days}
        </div>
      </div>
    );
  };

  // Calendar helper functions
  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);
      days.push(currentDay);
    }
    return days;
  };

  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const offset = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    
    const days: (Date | null)[] = [];
    
    for (let i = 0; i < offset; i++) {
      const prevDate = new Date(year, month, -offset + i + 1);
      days.push(prevDate);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  };

  const timeSlots = Array.from({ length: 14 }, (_, i) => {
    const hour = i + 8;
    return `${String(hour).padStart(2, '0')}:00`;
  });

  const weekDays = getWeekDays(selectedDate);
  const monthDays = getMonthDays(selectedDate);

  const getAppointmentsForDay = (date: Date) => {
    // Fix timezone issue: format date as YYYY-MM-DD in local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return filteredAppointments.filter(apt => apt.appointmentDate === dateStr);
  };

  const calculatePosition = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = (hours - 8) * 60 + minutes;
    const top = (totalMinutes / 60) * 60;
    const height = (duration / 60) * 60;
    return { top, height };
  };

  const goToPrevious = () => {
    const newDate = new Date(selectedDate);
    if (calendarViewType === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (calendarViewType === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (calendarViewType === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (calendarViewType === 'year') {
      newDate.setFullYear(newDate.getFullYear() - 1);
    }
    setSelectedDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(selectedDate);
    if (calendarViewType === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (calendarViewType === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (calendarViewType === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (calendarViewType === 'year') {
      newDate.setFullYear(newDate.getFullYear() + 1);
    }
    setSelectedDate(newDate);
  };

  const getViewTitle = () => {
    if (calendarViewType === 'day') {
      return selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
    } else if (calendarViewType === 'week') {
      return `Tuần ${weekDays[0].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - ${weekDays[6].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
    } else if (calendarViewType === 'month') {
      return selectedDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
    } else {
      return selectedDate.getFullYear().toString();
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAppointments = filteredAppointments.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, filterDate, customStartDate, customEndDate]);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="page-title">Lịch hẹn</h2>
            <p className="text-gray-500 text-sm mt-2">
              {filteredAppointments.length} lịch hẹn
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-[#FE7410] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
                Danh sách
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-white text-[#FE7410] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <CalendarIcon className="w-4 h-4" />
                Lịch
              </button>
            </div>
            <button
              onClick={() => handleOpenForm()}
              className="flex items-center gap-2 px-6 py-3 bg-[#FE7410] text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Tạo lịch hẹn
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-8 py-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo Tên khách hàng, SĐT, Dịch vụ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Đang chờ</option>
                <option value="in-progress">Đang thực hiện</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Hủy lịch</option>
              </select>
            </div>

            {viewMode === 'list' && (
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">Tất cả thời gian</option>
                  <option value="today">Hôm nay</option>
                  <option value="tomorrow">Ngày mai</option>
                  <option value="week">Tuần này</option>
                  <option value="month">Tháng này</option>
                  <option value="custom">Tùy chỉnh</option>
                </select>
              </div>
            )}

            {/* Custom Date Range - Inside grid */}
            {filterDate === 'custom' && viewMode === 'list' && (
              <div className="relative">
                <button
                  onClick={() => setShowDateRangePicker(!showDateRangePicker)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent flex items-center gap-2 hover:bg-gray-50 transition-colors text-sm"
                >
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700 flex-1 text-left">
                    {customStartDate && customEndDate 
                      ? `${new Date(customStartDate).toLocaleDateString('vi-VN')} - ${new Date(customEndDate).toLocaleDateString('vi-VN')}`
                      : 'Chọn khoảng thời gian'}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showDateRangePicker ? 'rotate-180' : ''}`} />
                </button>

                {/* Date Range Picker Popup */}
                {showDateRangePicker && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2.5 z-50">
                    {renderCalendar()}
                    
                    <div className="flex gap-2 pt-2.5 mt-2.5 border-t">
                      <button
                        onClick={() => {
                          setCustomStartDate('');
                          setCustomEndDate('');
                          setSelectingStartDate(true);
                          setShowDateRangePicker(false);
                        }}
                        className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-xs font-medium"
                      >
                        Xóa
                      </button>
                      <button
                        onClick={() => setShowDateRangePicker(false)}
                        disabled={!customStartDate || !customEndDate}
                        className="flex-1 px-2.5 py-1.5 bg-[#FE7410] text-white rounded-lg hover:bg-[#E56809] transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Áp dụng
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-8 pb-8 overflow-auto">
        {viewMode === 'list' ? (
          // LIST VIEW
          filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <CalendarCheck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-500">
                {appointments.length === 0 ? 'Chưa có lịch hẹn nào' : 'Không tìm thấy lịch hẹn'}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {appointments.length === 0 ? 'Nhấn "Tạo lịch hẹn" để bắt đầu' : 'Thử thay đổi bộ lọc hoặc tìm kiếm'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th className="table-header">Mã lịch hẹn</th>
                      <th className="table-header text-center">Ngày & Giờ</th>
                      <th className="table-header">Khách hàng</th>
                      <th className="table-header">Dịch vụ</th>
                      <th className="table-header">Kỹ thuật viên</th>
                      <th className="table-header text-center">Thời lượng</th>
                      <th className="table-header text-center">Trạng thái</th>
                      <th className="table-header actions-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAppointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td className="table-content">
                          <span className="font-bold text-[rgb(16,24,40)] font-normal">{appointment.code}</span>
                        </td>
                        <td className="table-content text-center">
                          <div>
                            <div className="font-medium text-gray-900">
                              {formatDate(appointment.appointmentDate)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {appointment.startTime} - {appointment.endTime}
                            </div>
                          </div>
                        </td>
                        <td className="table-content">
                          <div>
                            <div className="font-medium text-gray-900">
                              {appointment.customerName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {appointment.customerPhone}
                            </div>
                          </div>
                        </td>
                        <td className="table-content">
                          <div className="space-y-0.5">
                            {appointment.services.map((service, idx) => (
                              <div key={idx} className="text-sm text-[16px]">
                                {service.productName}
                                {service.sessionNumber && service.maxSessions && (
                                  <span className="text-gray-500 ml-1">
                                    (Buổi {service.sessionNumber}/{service.maxSessions})
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="table-content">
                          <div className="space-y-0.5">
                            {appointment.services.map((service, idx) => (
                              <div key={idx} className="text-sm">
                                {service.technicianNames && service.technicianNames.length > 0 
                                  ? service.technicianNames.join(', ') 
                                  : '-'}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="table-content text-center">
                          {appointment.services.reduce((total, s) => total + s.duration, 0)} phút
                        </td>
                        <td className="table-content text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium border ${getStatusBadge(appointment.status).color}`}>
                            {getStatusBadge(appointment.status).label}
                          </span>
                        </td>
                        <td className="actions-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenForm(appointment)}
                              className="action-icon p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Sửa"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmAppointment(appointment)}
                              className="action-icon p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {filteredAppointments.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredAppointments.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={(page) => setCurrentPage(page)}
                  onItemsPerPageChange={(items) => {
                    setItemsPerPage(items);
                    setCurrentPage(1);
                  }}
                />
              )}
            </div>
          )
        ) : (
          // CALENDAR VIEW
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            {/* Calendar Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {getViewTitle()}
                </h3>
                {/* View Type Selector */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setCalendarViewType('day')}
                    className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                      calendarViewType === 'day'
                        ? 'bg-white text-[#FE7410] shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Ngày
                  </button>
                  <button
                    onClick={() => setCalendarViewType('week')}
                    className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                      calendarViewType === 'week'
                        ? 'bg-white text-[#FE7410] shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Tuần
                  </button>
                  <button
                    onClick={() => setCalendarViewType('month')}
                    className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                      calendarViewType === 'month'
                        ? 'bg-white text-[#FE7410] shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Tháng
                  </button>
                  <button
                    onClick={() => setCalendarViewType('year')}
                    className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                      calendarViewType === 'year'
                        ? 'bg-white text-[#FE7410] shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Năm
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPrevious}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Trước"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedDate(new Date())}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Hôm nay
                </button>
                <button
                  onClick={goToNext}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Sau"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 380px)' }}>
              {calendarViewType === 'day' && (
                <div className="min-w-[600px]">
                  <div className="grid grid-cols-2 border-b border-gray-200 bg-gray-50">
                    <div className="p-3 text-sm font-semibold text-gray-600 border-r border-gray-200">Giờ</div>
                    <div className="p-3 text-center">
                      <div className="text-xs font-medium text-[#FE7410]">
                        {selectedDate.toLocaleDateString('vi-VN', { weekday: 'long' })}
                      </div>
                      <div className="text-lg font-bold text-[#FE7410] mt-1">
                        {selectedDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    {timeSlots.map((time) => (
                      <div key={time} className="grid grid-cols-2 border-b border-gray-100" style={{ height: '60px' }}>
                        <div className="p-2 text-xs text-gray-500 font-medium border-r border-gray-200 bg-gray-50">
                          {time}
                        </div>
                        <div
                          className="relative hover:bg-gray-50 cursor-pointer transition-colors bg-orange-50/30"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              appointmentDate: formatDateToString(selectedDate),
                            });
                            handleOpenForm();
                          }}
                        />
                      </div>
                    ))}
                    <div className="absolute top-0 left-1/2 right-0">
                      {/* ⭐ NEW: Display each service as individual block */}
                      {getAppointmentsForDay(selectedDate).flatMap((appointment) => {
                        const statusColor = getStatusBadge(appointment.status).color.split(' ')[0];
                        
                        return appointment.services
                          .filter(s => (s.productType === 'service' || s.productType === 'treatment') && s.startTime && s.endTime)
                          .map((service, svcIdx) => {
                            const position = calculatePosition(service.startTime, service.duration);
                            
                            return (
                              <div
                                key={`${appointment.id}-${svcIdx}`}
                                className={`absolute left-1 right-1 ${statusColor} border-l-4 ${
                                  appointment.status === 'in-progress' ? 'border-blue-600' :
                                  appointment.status === 'completed' ? 'border-green-600' :
                                  appointment.status === 'pending' ? 'border-yellow-600' :
                                  'border-red-600'
                                } rounded-r-lg shadow-sm p-2 cursor-pointer hover:shadow-md transition-shadow overflow-hidden`}
                                style={{ 
                                  top: `${position.top}px`, 
                                  height: `${Math.max(position.height, 40)}px`,
                                  minHeight: '40px'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenForm(appointment);
                                }}
                              >
                                <div className="text-xs font-bold text-[#FE7410] truncate">
                                  {appointment.code}
                                </div>
                                <div className="text-xs font-semibold text-gray-900 truncate">
                                  {service.startTime} - {service.endTime}
                                </div>
                                <div className="text-xs text-gray-700 truncate font-medium">
                                  {service.productName}
                                </div>
                                {service.technicianNames && service.technicianNames.length > 0 && position.height >= 70 && (
                                  <div className="text-xs text-gray-600 truncate mt-0.5">
                                    {service.technicianNames.join(', ')}
                                  </div>
                                )}
                                {position.height >= 90 && (
                                  <div className="text-xs text-gray-500 truncate">
                                    {appointment.customerName}
                                  </div>
                                )}
                              </div>
                            );
                          });
                      })}
                    </div>
                  </div>
                </div>
              )}

              {calendarViewType === 'week' && (
                <div className="min-w-[1000px]">
                  <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
                    <div className="p-3 text-sm font-semibold text-gray-600 border-r border-gray-200">Giờ</div>
                    {weekDays.map((day, idx) => {
                      const isToday = day.toDateString() === new Date().toDateString();
                      return (
                        <div
                          key={idx}
                          className={`p-3 text-center border-r border-gray-200 ${
                            isToday ? 'bg-orange-50' : ''
                          }`}
                        >
                          <div className={`text-xs font-medium ${isToday ? 'text-[#FE7410]' : 'text-gray-500'}`}>
                            {day.toLocaleDateString('vi-VN', { weekday: 'short' })}
                          </div>
                          <div className={`text-lg font-bold mt-1 ${
                            isToday ? 'text-[#FE7410]' : 'text-gray-900'
                          }`}>
                            {day.getDate()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="relative">
                    {timeSlots.map((time) => (
                      <div key={time} className="grid grid-cols-8 border-b border-gray-100" style={{ height: '60px' }}>
                        <div className="p-2 text-xs text-gray-500 font-medium border-r border-gray-200 bg-gray-50">
                          {time}
                        </div>
                        {weekDays.map((day, dayIdx) => {
                          const isToday = day.toDateString() === new Date().toDateString();
                          return (
                            <div
                              key={dayIdx}
                              className={`relative border-r border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
                                isToday ? 'bg-orange-50/30' : ''
                              }`}
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  appointmentDate: formatDateToString(day),
                                });
                                handleOpenForm();
                              }}
                            />
                          );
                        })}
                      </div>
                    ))}
                    {weekDays.map((day, dayIdx) => {
                      const dayAppointments = getAppointmentsForDay(day);
                      return (
                        <div key={dayIdx} className="absolute top-0" style={{ left: `${((dayIdx + 1) / 8) * 100}%`, width: `${(1 / 8) * 100}%` }}>
                          {/* ⭐ NEW: Display each service as individual block */}
                          {dayAppointments.flatMap((appointment) => {
                            const statusColor = getStatusBadge(appointment.status).color.split(' ')[0];
                            
                            return appointment.services
                              .filter(s => (s.productType === 'service' || s.productType === 'treatment') && s.startTime && s.endTime)
                              .map((service, svcIdx) => {
                                const position = calculatePosition(service.startTime, service.duration);
                                
                                return (
                                  <div
                                    key={`${appointment.id}-${svcIdx}`}
                                    className={`absolute left-1 right-1 ${statusColor} border-l-4 ${
                                      appointment.status === 'in-progress' ? 'border-blue-600' :
                                      appointment.status === 'completed' ? 'border-green-600' :
                                      appointment.status === 'pending' ? 'border-yellow-600' :
                                      'border-red-600'
                                    } rounded-r-lg shadow-sm p-2 cursor-pointer hover:shadow-md transition-shadow overflow-hidden`}
                                    style={{ 
                                      top: `${position.top}px`, 
                                      height: `${Math.max(position.height, 40)}px`,
                                      minHeight: '40px'
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenForm(appointment);
                                    }}
                                  >
                                    <div className="text-xs font-bold text-[#FE7410] truncate">
                                      {appointment.code}
                                    </div>
                                    <div className="text-xs font-semibold text-gray-900 truncate">
                                      {service.startTime} - {service.endTime}
                                    </div>
                                    <div className="text-xs text-gray-700 truncate font-medium">
                                      {service.productName}
                                    </div>
                                    {service.technicianNames && service.technicianNames.length > 0 && position.height >= 70 && (
                                      <div className="text-xs text-gray-600 truncate mt-0.5">
                                        {service.technicianNames.join(', ')}
                                      </div>
                                    )}
                                    {position.height >= 90 && (
                                      <div className="text-xs text-gray-500 truncate">
                                        {appointment.customerName}
                                      </div>
                                    )}
                                  </div>
                                );
                              });
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {calendarViewType === 'month' && (
                <div>
                  <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                    {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
                      <div key={day} className="p-3 text-center text-sm font-semibold text-gray-600 border-r border-gray-200 last:border-r-0">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7">
                    {monthDays.map((day, idx) => {
                      if (!day) return null;
                      const isToday = day.toDateString() === new Date().toDateString();
                      const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
                      const dayAppointments = getAppointmentsForDay(day);
                      
                      return (
                        <div
                          key={idx}
                          className={`min-h-[120px] border-r border-b border-gray-200 p-2 hover:bg-gray-50 cursor-pointer transition-colors ${
                            !isCurrentMonth ? 'bg-gray-50/50' : ''
                          } ${isToday ? 'bg-orange-50' : ''}`}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              appointmentDate: formatDateToString(day),
                            });
                            handleOpenForm();
                          }}
                        >
                          <div className={`text-sm font-semibold mb-1 ${
                            isToday ? 'text-[#FE7410]' : 
                            !isCurrentMonth ? 'text-gray-400' : 'text-gray-700'
                          }`}>
                            {day.getDate()}
                          </div>
                          <div className="space-y-1">
                            {dayAppointments.slice(0, 3).map((appointment) => {
                              const statusColor = getStatusBadge(appointment.status).color.split(' ')[0];
                              return (
                                <div
                                  key={appointment.id}
                                  className={`text-xs p-1 rounded ${statusColor} truncate cursor-pointer hover:shadow-sm transition-shadow`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenForm(appointment);
                                  }}
                                >
                                  <div className="font-bold text-[#FE7410]">{appointment.code}</div>
                                  <div><span className="font-semibold">{appointment.startTime}</span> {appointment.customerName}</div>
                                </div>
                              );
                            })}
                            {dayAppointments.length > 3 && (
                              <div className="text-xs text-gray-500 font-medium">
                                +{dayAppointments.length - 3} thêm
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {calendarViewType === 'year' && (
                <div className="p-6">
                  <div className="grid grid-cols-4 gap-6">
                    {Array.from({ length: 12 }, (_, monthIdx) => {
                      const monthDate = new Date(selectedDate.getFullYear(), monthIdx, 1);
                      const monthDaysData = getMonthDays(monthDate);
                      const monthAppointments = filteredAppointments.filter(apt => {
                        const aptDate = new Date(apt.appointmentDate + 'T00:00:00');
                        return aptDate.getFullYear() === selectedDate.getFullYear() && 
                               aptDate.getMonth() === monthIdx;
                      });
                      
                      return (
                        <div key={monthIdx} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          <div className="bg-[#FE7410] text-white text-center py-2 font-semibold text-sm">
                            Tháng {monthIdx + 1}
                          </div>
                          <div className="p-2">
                            <div className="grid grid-cols-7 gap-0.5 mb-1">
                              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
                                <div key={day} className="text-center text-xs text-gray-500 font-medium">
                                  {day}
                                </div>
                              ))}
                            </div>
                            <div className="grid grid-cols-7 gap-0.5">
                              {monthDaysData.slice(0, 35).map((day, dayIdx) => {
                                if (!day) return <div key={dayIdx} />;
                                const isCurrentMonth = day.getMonth() === monthIdx;
                                const hasDayAppointments = appointments.some(apt => 
                                  apt.appointmentDate === formatDateToString(day)
                                );
                                
                                return (
                                  <div
                                    key={dayIdx}
                                    className={`aspect-square flex items-center justify-center text-xs cursor-pointer rounded hover:bg-gray-100 ${
                                      !isCurrentMonth ? 'text-gray-300' : 'text-gray-700'
                                    } ${hasDayAppointments ? 'bg-orange-100 font-bold text-[#FE7410]' : ''}`}
                                    onClick={() => {
                                      setSelectedDate(day);
                                      setCalendarViewType('day');
                                    }}
                                  >
                                    {day.getDate()}
                                  </div>
                                );
                              })}
                            </div>
                            <div className="mt-2 text-xs text-gray-500 text-center">
                              {monthAppointments.length} lịch hẹn
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {editingAppointment ? 'Chỉnh sửa lịch hẹn' : 'Tạo lịch hẹn mới'}
              </h3>
              <div className="flex items-center gap-2">
                {/* Debug button to clear localStorage */}
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('⚠️ Clear localStorage?\nĐiều này sẽ xóa hết dữ liệu và reset về demo data mặc định.')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold"
                  title="Clear localStorage để load lại data mới"
                >
                  🔄 Reset Data
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-6">
              {editingAppointment && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Mã lịch hẹn:</span>
                    <span className="text-lg font-bold text-[#FE7410]">{editingAppointment.code}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Khách hàng <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="">-- Chọn khách hàng --</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ngày hẹn <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Button to open package modal */}
              {formData.customerId && (() => {
                const packages = getCustomerActivePackages(formData.customerId);
                const selectedCustomer = customers.find(c => c.id === formData.customerId);
                
                // Debug logging
                console.log('🔍 Selected customer:', selectedCustomer);
                console.log('🔍 Customer packages:', packages);
                console.log('🔍 All packages in store:', customerTreatmentPackages);
                
                if (packages.length === 0) return null;
                
                return (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowPackageModal(true)}
                      className="w-full px-4 py-2.5 border-2 border-[#FE7410] text-[#FE7410] rounded-lg hover:bg-orange-50 transition-colors font-medium text-sm"
                    >
                      Chọn gói liệu trình ({packages.length} gói)
                    </button>
                  </div>
                );
              })()}

              {/* OLD - Remove this entire block */}
              {false && formData.customerId && (() => {
                const customerPackages = getCustomerActivePackages(formData.customerId);
                
                if (customerPackages.length === 0) return null;
                
                return (
                  <div className="border border-orange-200 rounded-lg bg-orange-50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Package className="w-5 h-5 text-[#FE7410]" />
                      <h3 className="text-sm font-bold text-gray-900">
                        Gói liệu trình đang sở hữu ({customerPackages.length} gói)
                      </h3>
                    </div>
                    
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {customerPackages.map((pkg) => {
                        const packageServices = pkg.serviceIds
                          .map(sid => products.find(p => p.id === sid))
                          .filter(Boolean);
                        
                        const isLowSessions = pkg.remainingSessions <= 2;
                        const isMediumSessions = pkg.remainingSessions > 2 && pkg.remainingSessions <= 5;
                        
                        return (
                          <div 
                            key={pkg.id} 
                            className={`border rounded-lg p-3 bg-white ${
                              isLowSessions 
                                ? 'border-orange-300' 
                                : isMediumSessions
                                ? 'border-yellow-300'
                                : 'border-green-300'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-bold ${
                                    isLowSessions 
                                      ? 'text-orange-600' 
                                      : isMediumSessions
                                      ? 'text-yellow-600'
                                      : 'text-green-600'
                                  }`}>
                                    {isLowSessions ? '🟠' : isMediumSessions ? '🟡' : '🟢'}
                                  </span>
                                  <h4 className="text-sm font-bold text-gray-900">
                                    {pkg.treatmentName}
                                  </h4>
                                </div>
                                <div className="mt-1 text-xs text-gray-600 space-y-0.5">
                                  <div>
                                    Đã dùng: <strong>{pkg.usedSessions}/{pkg.totalSessions}</strong> buổi
                                    {' • '}
                                    Còn lại: <strong className={
                                      isLowSessions 
                                        ? 'text-orange-600' 
                                        : isMediumSessions
                                        ? 'text-yellow-600'
                                        : 'text-green-600'
                                    }>{pkg.remainingSessions}</strong> buổi
                                    {isLowSessions && <span className="text-orange-600 font-bold ml-1">⚠️ Sắp hết</span>}
                                  </div>
                                  <div>
                                    Mua ngày: {new Date(pkg.purchaseDate).toLocaleDateString('vi-VN')}
                                    {pkg.expiryDate && (
                                      <> • Hết hạn: {new Date(pkg.expiryDate).toLocaleDateString('vi-VN')}</>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <p className="text-xs font-semibold text-gray-700 mb-1.5">Dịch vụ trong gói:</p>
                              <div className="space-y-1.5">
                                {packageServices.map((service) => {
                                  if (!service) return null;
                                  const addedCount = countServiceFromPackage(service.id, pkg.id);
                                  
                                  return (
                                    <div key={service.id} className="flex items-center justify-between text-xs bg-gray-50 rounded px-2 py-1.5">
                                      <div className="flex-1">
                                        <span className="text-gray-800 font-medium">{service.name}</span>
                                        {service.duration && (
                                          <span className="text-gray-500 ml-2">({service.duration} phút)</span>
                                        )}
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => addServiceFromPackage(service.id, pkg.id, pkg.treatmentName)}
                                        className={`ml-2 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                                          addedCount > 0
                                            ? 'bg-gray-200 text-gray-600 cursor-default'
                                            : 'bg-[#FE7410] text-white hover:bg-[#E56509]'
                                        }`}
                                      >
                                        {addedCount > 0 ? `✓ Đã thêm (${addedCount})` : 'Chọn'}
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              <div className="space-y-6">
                {/* DỊCH VỤ SECTION */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Dịch vụ <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAddService}
                      className="text-sm text-[#FE7410] hover:text-orange-600 font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Thêm dịch vụ
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.services
                      .map((service, actualIndex) => ({ service, actualIndex }))
                      .filter(({ service }) => service.productType === 'service' || service.productType === 'treatment')
                      .map(({ service, actualIndex }, displayIndex) => {
                        const selectedProduct = products.find(p => p.id === service.productId);
                        
                        return (
                          <div key={service.instanceId || actualIndex} className={`border rounded-lg p-4 space-y-3 font-['Inter'] ${
                            service.useTreatmentPackage 
                              ? 'bg-blue-50 border-blue-300' 
                              : 'bg-gray-50 border-gray-200'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-700 text-[16px]">
                                  {displayIndex + 1}. {service.productName || 'Dịch vụ'}
                                </span>
                                {service.useTreatmentPackage && (
                                  <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-semibold rounded">
                                    Dùng gói
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveService(actualIndex)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Xóa dịch vụ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            
                            {/* Product selector for manual services */}
                            {!service.useTreatmentPackage && (
                              <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                  Tên dịch vụ <span className="text-red-500">*</span>
                                </label>
                                <select
                                  required
                                  value={service.productId}
                                  onChange={(e) => {
                                    const selectedProduct = products.find(p => p.id === e.target.value);
                                    if (selectedProduct) {
                                      const updatedServices = [...formData.services];
                                      const currentService = updatedServices[actualIndex];
                                      
                                      // ⭐ Auto-calculate endTime when product changes
                                      const duration = selectedProduct.duration || 60;
                                      const newStartTime = currentService.startTime || formData.startTime;
                                      const newEndTime = calculateTimeEnd(newStartTime, duration);
                                      
                                      updatedServices[actualIndex] = {
                                        ...currentService,
                                        productId: selectedProduct.id,
                                        productName: selectedProduct.name,
                                        productType: selectedProduct.type || 'service',
                                        price: selectedProduct.price,
                                        duration: duration,
                                        startTime: newStartTime,
                                        endTime: newEndTime,
                                      };
                                      setFormData({ ...formData, services: updatedServices });
                                    }
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white text-sm font-['Inter']"
                                >
                                  <option value="">-- Chọn dịch vụ --</option>
                                  {serviceProducts.map((product) => (
                                    <option key={product.id} value={product.id}>
                                      {product.name} ({product.type === 'service' ? 'Dịch vụ' : 'Liệu trình'}) - {product.duration || 60}p - {product.price.toLocaleString('vi-VN')}đ
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                            
                            {/* Display package note if using package */}
                            {service.useTreatmentPackage && service.treatmentPackageName && (
                              <div className="text-sm text-blue-800">
                                <span className="font-semibold">Ghi chú: </span>
                                <span className="font-medium">
                                  Trừ buổi {service.packageSessionNumber} từ gói "{service.treatmentPackageName}"
                                </span>
                              </div>
                            )}
                            
                            {/* ⭐ NEW: Time slot for service */}
                            {(service.productType === 'service' || service.productType === 'treatment') && (
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                    Giờ bắt đầu <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="time"
                                    required
                                    value={service.startTime || ''}
                                    onChange={(e) => {
                                      const newServices = [...formData.services];
                                      newServices[actualIndex].startTime = e.target.value;
                                      // Auto-update endTime based on duration
                                      const product = products.find(p => p.id === service.productId);
                                      if (product?.duration) {
                                        newServices[actualIndex].endTime = calculateTimeEnd(e.target.value, product.duration);
                                      }
                                      setFormData({ ...formData, services: newServices });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm font-['Inter'] text-[16px]"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                    Giờ kết thúc <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="time"
                                    required
                                    value={service.endTime || ''}
                                    onChange={(e) => {
                                      const newServices = [...formData.services];
                                      newServices[actualIndex].endTime = e.target.value;
                                      setFormData({ ...formData, services: newServices });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm font-['Inter'] text-[16px]"
                                  />
                                </div>
                              </div>
                            )}
                            
                            {/* Technician multi-select dropdown */}
                            <div className="relative">
                              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                Kỹ thuật viên <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <div
                                  onClick={() => {
                                    const dropdown = document.getElementById(`tech-dropdown-${actualIndex}`);
                                    if (dropdown) {
                                      dropdown.classList.toggle('hidden');
                                    }
                                  }}
                                  className="tech-dropdown-trigger w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-sm font-['Inter'] cursor-pointer flex items-center justify-between min-h-[42px]"
                                >
                                  <div className="flex-1 flex flex-wrap gap-1">
                                    {service.technicianIds && service.technicianIds.length > 0 ? (
                                      service.technicianIds.map(techId => {
                                        const tech = technicians.find(t => t.id === techId);
                                        return tech ? (
                                          <span key={techId} className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                                            {tech.fullName}
                                            <X 
                                              className="w-3 h-3 cursor-pointer hover:text-orange-900"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleUpdateTechnician(actualIndex, techId, false);
                                              }}
                                            />
                                          </span>
                                        ) : null;
                                      })
                                    ) : (
                                      <span className="text-gray-400">-- Chọn kỹ thuật viên --</span>
                                    )}
                                  </div>
                                  <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0 ml-2" />
                                </div>
                                
                                <div
                                  id={`tech-dropdown-${actualIndex}`}
                                  className="hidden absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {technicians.length === 0 ? (
                                    <div className="text-sm text-gray-500 text-center py-3">
                                      Không có kỹ thuật viên khả dụng
                                    </div>
                                  ) : (
                                    <div className="py-1">
                                      {technicians.map((tech) => {
                                        // Check if technician is busy at this specific service time
                                        let isBusy = false;
                                        if (formData.appointmentDate && service.startTime && service.endTime) {
                                          const [startHour, startMin] = service.startTime.split(':').map(Number);
                                          const [endHour, endMin] = service.endTime.split(':').map(Number);
                                          const durationMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
                                          
                                          isBusy = isTechnicianBusy(
                                            tech.id, 
                                            formData.appointmentDate, 
                                            service.startTime, 
                                            durationMinutes,
                                            editingAppointment?.id
                                          );
                                        }
                                        
                                        const isChecked = service.technicianIds?.includes(tech.id) || false;
                                        
                                        return (
                                          <label 
                                            key={tech.id}
                                            className={`flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer ${
                                              isBusy && !isChecked ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                          >
                                            <input
                                              type="checkbox"
                                              checked={isChecked}
                                              disabled={isBusy && !isChecked}
                                              onChange={(e) => handleUpdateTechnician(actualIndex, tech.id, e.target.checked)}
                                              className="w-4 h-4 text-[#FE7410] border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                                            />
                                            <span className={`text-sm ${isBusy && !isChecked ? 'text-gray-400' : 'text-gray-700'}`}>
                                              {tech.fullName} {isBusy && !isChecked ? '(đang bận)' : ''}
                                            </span>
                                          </label>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    {formData.services.filter(s => s.productType === 'service' || s.productType === 'treatment').length === 0 && (
                      <div className="text-center py-4 text-gray-500 text-sm bg-gray-50 rounded-lg border border-gray-200">
                        Chưa có dịch vụ nào. Click "Thêm dịch vụ thủ công" hoặc chọn từ gói liệu trình bên trên.
                      </div>
                    )}
                  </div>
                </div>
                
                {/* SẢN PHẨM TỪ GÓI LIỆU TRÌNH (Read-only) */}
                {formData.services.filter(s => s.productType === 'product' && s.useTreatmentPackage).length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Sản phẩm đi kèm (Từ gói liệu trình)
                      </label>
                    </div>
                    <div className="space-y-3">
                      {formData.services
                        .map((service, actualIndex) => ({ service, actualIndex }))
                        .filter(({ service }) => service.productType === 'product' && service.useTreatmentPackage)
                        .map(({ service, actualIndex }, displayIndex) => {
                          return (
                            <div key={service.instanceId || actualIndex} className="border rounded-lg p-4 space-y-2 font-['Inter'] bg-green-50 border-green-300">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-gray-700 text-[16px]">
                                    {displayIndex + 1}. {service.productName || 'Sản phẩm'}
                                  </span>
                                  <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-semibold rounded">
                                    Đi kèm gói
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveService(actualIndex)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Xóa sản phẩm"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              
                              <div className="text-xs text-gray-600 flex items-center gap-4">
                                <span className="text-[14px]">Số lượng: <span className="font-semibold">{service.quantity}</span></span>
                                {service.treatmentPackageName && (
                                  <span className="text-green-700 font-medium text-[14px]">
                                    {service.treatmentPackageName} - Buổi {service.packageSessionNumber}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ghi chú
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  placeholder="Ghi chú về lịch hẹn..."
                />
              </div>

              {editingAppointment && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Appointment['status'] })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="pending">Đang chờ</option>
                    <option value="in-progress">Đang thực hiện</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="cancelled">Hủy lịch</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#FE7410] text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                >
                  {editingAppointment ? 'Cập nhật' : 'Tạo lịch hẹn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Xóa lịch hẹn</h3>
                <p className="text-sm text-gray-500">
                  Mã: {deleteConfirmAppointment.code}
                </p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Bạn có chắc chắn muốn xóa lịch hẹn này không? Hành động này không thể hoàn tác.
            </p>
            
            {/* Hiển thị thông tin gói liệu trình nếu có */}
            {deleteConfirmAppointment.services.some(svc => svc.useTreatmentPackage) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-700 mb-1">
                      Lịch hẹn này sử dụng gói liệu trình
                    </p>
                    <p className="text-xs text-green-600">
                      Sau khi xóa, các buổi đã sử dụng sẽ được hoàn lại vào gói của khách hàng.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmAppointment(null)}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  // Hoàn lại buổi liệu trình nếu có
                  deleteConfirmAppointment.services.forEach(svc => {
                    if (svc.useTreatmentPackage && svc.treatmentPackageId && svc.sessionNumber) {
                      returnPackageSession(svc.treatmentPackageId, svc.sessionNumber);
                    }
                  });
                  
                  deleteAppointment(deleteConfirmAppointment.id);
                  toast.success('Xóa lịch hẹn thành công!');
                  setDeleteConfirmAppointment(null);
                }}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Treatment Package Modal */}
      <TreatmentPackageModal
        isOpen={showPackageModal}
        onClose={() => setShowPackageModal(false)}
        packages={formData.customerId ? getCustomerActivePackages(formData.customerId) : []}
        onSelectSession={handleSelectSession}
      />
    </div>
  );
}
