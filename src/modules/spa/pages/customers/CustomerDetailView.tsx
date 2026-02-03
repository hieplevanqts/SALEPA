import { useState, useMemo } from 'react';
import { User, Edit, Trash2, Cake, ShoppingBag, Clock, CreditCard, ArrowLeft, Package, Scissors, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../../../../lib/spa-lib/store';
import type { Customer, Order } from '../../../../lib/spa-lib/store';
import { useTranslation } from '../../../../lib/spa-lib/useTranslation';
import { OrderDetailFullScreen } from '../orders/OrderDetailFullScreen';
import { PrintReceipt } from '../../components/print/PrintReceipt';

interface CustomerDetailViewProps {
  customer: Customer;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewOrder?: (orderId: string) => void;
}

type TabType = 'overview' | 'purchases' | 'treatments' | 'services';

export function CustomerDetailView({ customer, onClose, onEdit, onDelete }: CustomerDetailViewProps) {
  const { t } = useTranslation();
  const { orders, deleteOrder, customerTreatmentPackages, appointments, customerGroups } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [currentServicesPage, setCurrentServicesPage] = useState(1);
  const servicesPerPage = 10;
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [printOrder, setPrintOrder] = useState<Order | null>(null);
  const [deleteConfirmOrder, setDeleteConfirmOrder] = useState<Order | null>(null);
  const [expandedPackages, setExpandedPackages] = useState<string[]>([]);
  const customerPhone = customer.phone ?? '';

  // Toggle package expansion
  const togglePackageExpansion = (packageId: string) => {
    setExpandedPackages(prev => 
      prev.includes(packageId) 
        ? prev.filter(id => id !== packageId)
        : [...prev, packageId]
    );
  };

  const getPaidAmount = (order: Order) =>
    order.receivedAmount ??
    (order as { paidAmount?: number }).paidAmount ??
    0;

  // Get customer orders
  const customerOrders = useMemo(() => {
    let result = orders.filter((order) => order.customerPhone === customerPhone);

    if (filterStatus !== 'all') {
      result = result.filter((order) => {
        const received = getPaidAmount(order);
        const cappedReceived = received > order.total ? order.total : received;
        return filterStatus === 'paid'
          ? cappedReceived >= order.total
          : cappedReceived < order.total;
      });
    }

    return result.sort(
      (a, b) =>
        new Date(b.timestamp || b.date || '').getTime() -
        new Date(a.timestamp || a.date || '').getTime(),
    );
  }, [orders, customerPhone, filterStatus]);

  // Get customer treatment packages from store
  const customerTreatmentPackagesData = useMemo(() => {
    return customerTreatmentPackages
      .filter(pkg => pkg.customerId === customer.id)
      .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
  }, [customerTreatmentPackages, customer.id]);

  // Extract services from orders
  const customerServices = useMemo(() => {
    const services: any[] = [];
    
    // Get all appointments for this customer
    const customerAppointments = appointments.filter(
      (apt) => apt.customerPhone === customerPhone && apt.status === 'completed',
    );
    
    // Create a map for quick lookup: serviceName + date -> appointment
    const appointmentMap = new Map();
    customerAppointments.forEach(apt => {
      apt.services.forEach(svc => {
        const key = `${svc.productName}-${apt.appointmentDate}`;
        appointmentMap.set(key, {
          appointmentCode: apt.code,
          appointmentId: apt.id,
          technicians: svc.technicianNames || [],
        });
      });
    });
    
    customerOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (item && (item.type === 'service' || item.productType === 'service')) {
          const orderDate = (order.timestamp || order.date).split('T')[0]; // Get YYYY-MM-DD
          const lookupKey = `${item.name}-${orderDate}`;
          const appointmentData = appointmentMap.get(lookupKey);

          services.push({
            id: `${order.id}-${item.name}`,
            name: item.name,
            serviceDate: order.timestamp || order.date,
            duration: item.duration || 0,
            price: item.price,
            orderId: order.id,
            appointmentCode: appointmentData?.appointmentCode || null,
            appointmentId: appointmentData?.appointmentId || null,
            technicians: appointmentData?.technicians || [],
          });
        }
      });
    });
    return services;
  }, [customerOrders, appointments, customerPhone]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalOrders = customerOrders.length;
    const totalSpent = customerOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalPaid = customerOrders.reduce((sum, order) => {
      const received = getPaidAmount(order);
      const cappedReceived = received > order.total ? order.total : received;
      return sum + cappedReceived;
    }, 0);
    const debt = totalSpent - totalPaid;
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    const lastVisit = customerOrders.length > 0 ? (customerOrders[0].timestamp || customerOrders[0].date) : customer.createdAt;
    
    // Get unpaid orders
    const unpaidOrders = customerOrders.filter((order) => {
      const received = getPaidAmount(order);
      const cappedReceived = received > order.total ? order.total : received;
      return cappedReceived < order.total;
    });
    
    return {
      totalOrders,
      totalSpent,
      totalPaid,
      debt,
      avgOrderValue,
      lastVisit,
      unpaidOrders,
    };
  }, [customerOrders, customer.createdAt]);

  const getCustomerGroupName = (groupId?: string) => {
    if (!groupId) return null;
    const group = customerGroups.find(g => g.id === groupId);
    return group ? group.name : null;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-cyan-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isBirthday = () => {
    if (!customer.dateOfBirth) return false;
    const today = new Date();
    const birthDate = new Date(customer.dateOfBirth);
    return (
      today.getDate() === birthDate.getDate() &&
      today.getMonth() === birthDate.getMonth()
    );
  };

  const getPaymentStatusBadge = (order: Order) => {
    const received = getPaidAmount(order);
    const cappedReceived = received > order.total ? order.total : received;
    const isPaid = cappedReceived >= order.total;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        isPaid
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
      }`}>
        {isPaid ? 'Hoàn thành' : 'Còn nợ'}
      </span>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: User },
    { id: 'purchases', label: 'Lịch sử mua hàng', icon: ShoppingBag },
    { id: 'treatments', label: 'Liệu trình', icon: Package },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 bg-white border-b-2 border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between gap-6">
          {/* Left: Back Button + Customer Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900 flex-shrink-0"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            
            {/* Avatar */}
            <div className={`w-16 h-16 rounded-full ${getAvatarColor(customer.name)} flex items-center justify-center text-white text-lg font-bold flex-shrink-0`}>
              {customer.avatar ? (
                <img src={customer.avatar} alt={customer.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                getInitials(customer.name)
              )}
            </div>
            
            {/* Customer Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900">Chi tiết khách hàng</h1>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={onDelete}
              className="px-4 py-2 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Xóa
            </button>
            <button
              onClick={onEdit}
              className="px-4 py-2 rounded-xl font-semibold text-white transition-all hover:opacity-90 flex items-center gap-2"
              style={{ backgroundColor: '#FE7410' }}
            >
              <Edit className="w-5 h-5" />
              Sửa
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 bg-white border-b-2 border-gray-200 px-8">
        <div className="flex gap-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-1 py-3 border-b-2 text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'font-bold border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content - Scrollable with 2 columns */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Left Column - Main Content (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* Personal Information */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-4">
                    {t.customerData?.personalInfo || 'Thông tin cá nhân'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-sm text-gray-600 mb-1">Họ và tên</div>
                      <div className="font-semibold text-gray-900 text-base">{customer.name}</div>
                    </div>
                    
                    {/* Phone */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-sm text-gray-600 mb-1">Số điện thoại</div>
                      <div className="font-semibold text-gray-900 text-base">{customer.phone}</div>
                    </div>
                    
                    {/* Email */}
                    {customer.email && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Email</div>
                        <div className="font-semibold text-gray-900 text-base">{customer.email}</div>
                      </div>
                    )}
                    
                    {/* Date of Birth */}
                    {customer.dateOfBirth && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Ngày sinh</div>
                        <div className="font-semibold text-gray-900 text-base">{formatDate(customer.dateOfBirth)}</div>
                      </div>
                    )}
                    
                    {/* Gender */}
                    {customer.gender && (
                      <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
                        <div className="text-sm text-gray-600 mb-1">Giới tính</div>
                        <div className="font-semibold text-gray-900 text-base">
                          {customer.gender === 'male' ? 'Nam' : customer.gender === 'female' ? 'Nữ' : 'Khác'}
                        </div>
                      </div>
                    )}
                    
                    {/* Customer Group */}
                    {customer.customerGroupId && getCustomerGroupName(customer.customerGroupId) && (
                      <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
                        <div className="text-sm text-gray-600 mb-1">Nhóm khách hàng</div>
                        <div className="font-semibold text-gray-900 text-base">
                          {getCustomerGroupName(customer.customerGroupId)}
                        </div>
                      </div>
                    )}
                    
                    {/* Address */}
                    {customer.address && (
                      <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
                        <div className="text-sm text-gray-600 mb-1">Địa chỉ</div>
                        <div className="font-semibold text-gray-900 text-base">{customer.address}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Invoice Information */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-4">
                    {t.customerData?.invoiceInfo || 'Thông tin xuất hóa đơn'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Customer Type */}
                    {customer.customerType && (
                      <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
                        <div className="text-sm text-gray-600 mb-1">Loại khách hàng</div>
                        <div className="font-semibold text-gray-900 text-base">
                          {customer.customerType === 'individual' ? 'Cá nhân' : 'Tổ chức'}
                        </div>
                      </div>
                    )}
                    
                    {/* Tax Code */}
                    {customer.taxCode && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Mã số thuế</div>
                        <div className="font-semibold text-gray-900 text-base">{customer.taxCode}</div>
                      </div>
                    )}
                    
                    {/* Company Name - Only for Organization */}
                    {customer.customerType === 'organization' && customer.companyName && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Tên công ty</div>
                        <div className="font-semibold text-gray-900 text-base">{customer.companyName}</div>
                      </div>
                    )}
                    
                    {/* Buyer Name */}
                    {customer.buyerName && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Tên người mua</div>
                        <div className="font-semibold text-gray-900 text-base">{customer.buyerName}</div>
                      </div>
                    )}
                    
                    {/* ID Number - Only for Individual */}
                    {customer.customerType === 'individual' && customer.idNumber && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Số CCCD/CMND</div>
                        <div className="font-semibold text-gray-900 text-base">{customer.idNumber}</div>
                      </div>
                    )}
                    
                    {/* Invoice Address */}
                    {customer.invoiceAddress && (
                      <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
                        <div className="text-sm text-gray-600 mb-1">Địa chỉ xuất hóa đơn</div>
                        <div className="font-semibold text-gray-900 text-base">{customer.invoiceAddress}</div>
                      </div>
                    )}
                    
                    {/* Province */}
                    {customer.province && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Tỉnh/Thành phố</div>
                        <div className="font-semibold text-gray-900 text-base">
                          {customer.province === 'HN' ? 'Hà Nội' : 
                           customer.province === 'HCM' ? 'TP. Hồ Chí Minh' :
                           customer.province === 'DN' ? 'Đà Nẵng' :
                           customer.province === 'HP' ? 'Hải Phòng' :
                           customer.province === 'CT' ? 'Cần Thơ' :
                           customer.province === 'BD' ? 'Bình Dương' :
                           customer.province === 'DNA' ? 'Đồng Nai' :
                           customer.province === 'KH' ? 'Khánh Hòa' :
                           customer.province === 'BN' ? 'Bà Rịa - Vũng Tàu' :
                           customer.province === 'QN' ? 'Quảng Nam' :
                           customer.province === 'QB' ? 'Quảng Bình' :
                           customer.province === 'TH' ? 'Thanh Hóa' :
                           customer.province === 'NA' ? 'Nghệ An' :
                           customer.province}
                        </div>
                      </div>
                    )}
                    
                    {/* Ward */}
                    {customer.ward && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Phường/Xã</div>
                        <div className="font-semibold text-gray-900 text-base">{customer.ward}</div>
                      </div>
                    )}
                    
                    {/* Phone Invoice */}
                    {customer.phoneInvoice && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Số điện thoại</div>
                        <div className="font-semibold text-gray-900 text-base">{customer.phoneInvoice}</div>
                      </div>
                    )}
                    
                    {/* Bank */}
                    {customer.bank && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Ngân hàng</div>
                        <div className="font-semibold text-gray-900 text-base">{customer.bank}</div>
                      </div>
                    )}
                    
                    {/* Bank Account */}
                    {customer.bankAccount && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Số tài khoản NH</div>
                        <div className="font-semibold text-gray-900 text-base">{customer.bankAccount}</div>
                      </div>
                    )}
                    
                    {/* Account Holder */}
                    {customer.accountHolder && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Chủ tài khoản</div>
                        <div className="font-semibold text-gray-900 text-base">{customer.accountHolder}</div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Purchases Tab */}
            {activeTab === 'purchases' && (
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-gray-700" />
                    {t.customerData?.purchaseHistory || 'Lịch sử mua hàng'} ({customerOrders.length})
                  </h3>
                  {/* Filter */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilterStatus('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        filterStatus === 'all'
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={filterStatus === 'all' ? { backgroundColor: '#FE7410' } : {}}
                    >
                      Tất cả
                    </button>
                    <button
                      onClick={() => setFilterStatus('paid')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        filterStatus === 'paid'
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={filterStatus === 'paid' ? { backgroundColor: '#FE7410' } : {}}
                    >
                      Đã thanh toán
                    </button>
                    <button
                      onClick={() => setFilterStatus('unpaid')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        filterStatus === 'unpaid'
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={filterStatus === 'unpaid' ? { backgroundColor: '#FE7410' } : {}}
                    >
                      Còn nợ
                    </button>
                  </div>
                </div>

                {customerOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">{t.customerData?.noOrders || 'Chưa có hóa đơn nào'}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customerOrders.map((order) => (
                      <div 
                        key={order.id} 
                        onClick={() => setSelectedOrder(order)}
                        className="border-2 border-gray-200 rounded-xl p-4 hover:border-orange-500 cursor-pointer transition-all hover:bg-orange-50"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-gray-900 text-base">{order.id.slice(-8).toUpperCase()}</span>
                              {getPaymentStatusBadge(order)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span className="text-[16px]">{formatDateTime(order.timestamp || order.date)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                              <CreditCard className="w-4 h-4" />
                              <span className="text-[16px]">{(t('paymentMethods') as any)?.[order.paymentMethod] || order.paymentMethod}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold" style={{ color: '#FE7410' }}>
                              {order.total.toLocaleString('vi-VN')}đ
                            </div>
                            <div className="text-xs text-gray-500 mt-1 text-[14px]">
                              {(Array.isArray(order.items) ? order.items : Object.values(order.items || {})).length} sản phẩm
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Treatments Tab */}
            {activeTab === 'treatments' && (
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-700" />
                  {t.customerData?.treatmentPackages || 'Gói liệu trình'} ({customerTreatmentPackagesData.length})
                </h3>

                {customerTreatmentPackagesData.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">{t.customerData?.noTreatments || 'Chưa mua liệu trình nào'}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {customerTreatmentPackagesData.map((pkg) => {
                      // Generate list of all sessions with status
                      const allSessions = Array.from({ length: pkg.totalSessions }, (_, i) => {
                        const sessionNum = i + 1;
                        const isUsed = pkg.usedSessionNumbers?.includes(sessionNum) || false;
                        const sessionData = pkg.sessions?.find(s => s.sessionNumber === sessionNum);
                        
                        return {
                          sessionNumber: sessionNum,
                          sessionName: sessionData?.sessionName || `Buổi ${sessionNum}`,
                          isUsed,
                          items: sessionData?.items || []
                        };
                      });

                      return (
                        <div key={pkg.id} className={`border-2 rounded-xl p-4 ${
                          pkg.isActive && pkg.remainingSessions > 0
                            ? 'border-green-300 bg-green-50/30'
                            : 'border-gray-200'
                        }`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900 text-base mb-1">{pkg.treatmentName}</h4>
                              <p className="text-sm text-gray-600">
                                {t.customerData?.purchaseDate || 'Ngày mua'}: {formatDate(pkg.purchaseDate)}
                              </p>
                              {pkg.expiryDate && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Hết hạn: {formatDate(pkg.expiryDate)}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {pkg.isActive && pkg.remainingSessions > 0 ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Còn hiệu lực
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                  Đã hết
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">{t.customerData?.sessionsCompleted || 'Buổi đã sử dụng'}</span>
                              <span className="font-bold text-gray-900 text-base">{pkg.usedSessionNumbers?.length || 0}/{pkg.totalSessions}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full transition-all ${
                                  pkg.remainingSessions === 0 ? 'bg-gray-400' : 'bg-green-600'
                                }`}
                                style={{ width: `${((pkg.usedSessionNumbers?.length || 0) / pkg.totalSessions) * 100}%` }}
                              ></div>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                              <span className={`text-sm font-semibold ${
                                pkg.remainingSessions > 0 ? 'text-green-700' : 'text-gray-500'
                              }`}>
                                Còn lại: {pkg.remainingSessions} buổi
                              </span>
                              {pkg.remainingSessions > 0 && pkg.remainingSessions <= 2 && (
                                <span className="text-xs text-orange-600 font-medium">
                                  ⚠️ Gói sắp hết!
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Chi tiết từng buổi liệu trình */}
                          <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                            <button
                              onClick={() => togglePackageExpansion(pkg.id)}
                              className="w-full flex items-center justify-between p-4 hover:bg-gray-100 transition-colors"
                            >
                              <h5 className="font-semibold text-gray-900 text-sm">
                                Chi tiết các buổi ({pkg.totalSessions} buổi)
                              </h5>
                              {expandedPackages.includes(pkg.id) ? (
                                <ChevronUp className="w-5 h-5 text-gray-500" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-500" />
                              )}
                            </button>

                            {expandedPackages.includes(pkg.id) && (
                              <div className="px-4 pb-4">
                                <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                  {allSessions.map((session) => (
                                    <div 
                                      key={session.sessionNumber}
                                      className={`p-3 rounded-lg border-2 ${
                                        session.isUsed 
                                          ? 'bg-green-50 border-green-300' 
                                          : 'bg-white border-gray-200'
                                      }`}
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                              session.isUsed 
                                                ? 'bg-green-600 text-white' 
                                                : 'bg-gray-300 text-gray-700'
                                            }`}>
                                              {session.sessionNumber}
                                            </span>
                                            <span className="font-semibold text-gray-900 text-sm">
                                              {session.sessionName}
                                            </span>
                                          </div>
                                          
                                          {/* Hiển thị danh sách dịch vụ/sản phẩm nếu có */}
                                          {session.items && session.items.length > 0 && (
                                            <div className="ml-8 mt-2 space-y-1">
                                              {session.items.map((item, idx) => (
                                                <div key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                                                  <span className="text-gray-400">•</span>
                                                  <span className="flex-1">
                                                    {item.productName}
                                                    {item.duration && ` (${item.duration} phút)`}
                                                    {item.quantity > 1 && ` x${item.quantity}`}
                                                  </span>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                        
                                        <div>
                                          {session.isUsed ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-600 text-white">
                                              ✓ Đã làm
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
                                              Chưa làm
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-gray-700" />
                  {t.customerData?.servicesUsed || 'Dịch vụ đã dùng'} ({customerServices.length})
                </h3>

                {customerServices.length === 0 ? (
                  <div className="text-center py-12">
                    <Scissors className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">{t.customerData?.noServices || 'Chưa sử dụng dịch vụ nào'}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {customerServices.slice((currentServicesPage - 1) * servicesPerPage, currentServicesPage * servicesPerPage).map((service) => (
                      <div key={service.id} className="border-2 border-gray-200 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-base mb-1">{service.name}</h4>
                            <p className="text-sm text-gray-600">
                              {t.customerData?.serviceDate || 'Ngày dịch vụ'}: {formatDate(service.serviceDate)}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold" style={{ color: '#FE7410' }}>
                              {service.price.toLocaleString('vi-VN')}đ
                            </div>
                          </div>
                        </div>

                        {/* Appointment Code & Technicians */}
                        {(service.appointmentCode || service.technicians.length > 0) && (
                          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                            {service.appointmentCode && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Mã lịch hẹn</span>
                                <span className="font-semibold text-gray-900">{service.appointmentCode}</span>
                              </div>
                            )}
                            {service.technicians.length > 0 && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Kỹ thuật viên</span>
                                <span className="font-semibold text-gray-900">{service.technicians.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    {customerServices.length > servicesPerPage && (
                      <div className="flex items-center justify-center gap-3 mt-6 pt-4 border-t-2 border-gray-200">
                        <button
                          onClick={() => setCurrentServicesPage(currentServicesPage - 1)}
                          disabled={currentServicesPage === 1}
                          className={`px-4 py-2 rounded-xl border-2 font-medium transition-colors ${
                            currentServicesPage === 1
                              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          ← Trang trước
                        </button>
                        <span className="text-sm text-gray-600 font-medium min-w-[120px] text-center">
                          Trang {currentServicesPage} / {Math.ceil(customerServices.length / servicesPerPage)}
                        </span>
                        <button
                          onClick={() => setCurrentServicesPage(currentServicesPage + 1)}
                          disabled={currentServicesPage * servicesPerPage >= customerServices.length}
                          className={`px-4 py-2 rounded-xl border-2 font-medium transition-colors ${
                            currentServicesPage * servicesPerPage >= customerServices.length
                              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          Trang sau →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Summary (1/3) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 lg:sticky lg:top-6">
              <h3 className="text-base font-bold text-gray-900 mb-4">
                {t.customerData?.summary || 'Tổng quan'}
              </h3>

              {/* Customer Avatar & Name */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-gray-200">
                <div className={`w-14 h-14 rounded-full ${getAvatarColor(customer.name)} flex items-center justify-center text-white text-base font-bold flex-shrink-0`}>
                  {customer.avatar ? (
                    <img src={customer.avatar} alt={customer.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    getInitials(customer.name)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 text-base truncate">{customer.name}</div>
                  <div className="text-sm text-gray-600">{customer.phone}</div>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-4">
                {/* Debt Information - Show if customer has debt */}
                {stats.debt > 0 && (
                  <div className="bg-red-50 rounded-xl p-4 border-2 border-red-300">
                    <div className="text-sm text-red-700 mb-1 flex items-center gap-1">
                      Công nợ hiện tại
                    </div>
                    <div className="font-bold text-3xl text-red-600">
                      {stats.debt.toLocaleString('vi-VN')}đ
                    </div>
                    <div className="mt-2 text-xs text-red-600">
                      {stats.unpaidOrders.length} hóa đơn chưa thanh toán đủ
                    </div>
                  </div>
                )}

                {/* Total Paid */}
                <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                  <div className="text-sm text-green-700 mb-1">
                    Đã thanh toán
                  </div>
                  <div className="font-bold text-2xl text-green-600">
                    {stats.totalPaid.toLocaleString('vi-VN')}đ
                  </div>
                </div>

                {/* Total Spent */}
                <div className="rounded-xl p-4" style={{ backgroundColor: '#FFF5EE', border: '2px solid #FE7410' }}>
                  <div className="text-sm mb-1" style={{ color: '#FE7410' }}>
                    {t.customerData?.totalSpent || 'Tổng chi tiêu'}
                  </div>
                  <div className="font-bold text-3xl" style={{ color: '#FE7410' }}>
                    {stats.totalSpent.toLocaleString('vi-VN')}đ
                  </div>
                </div>

                {/* Total Orders */}
                <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                  <div className="text-sm text-blue-600 mb-1 flex items-center gap-1">
                    {t.customerData?.orderCount || 'Số hóa đơn'}
                  </div>
                  <div className="font-bold text-2xl text-blue-900">{stats.totalOrders}</div>
                </div>

                {/* Birthday Alert */}
                {isBirthday() && (
                  <div className="bg-pink-50 border-2 border-pink-200 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <Cake className="w-5 h-5 text-pink-600" />
                      <span className="text-sm font-semibold text-pink-800">
                        🎉 {t.customerData?.birthday || 'Sinh nhật hôm nay'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Detail Full Screen */}
      {selectedOrder && (
        <OrderDetailFullScreen
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onPrintReceipt={() => setPrintOrder(selectedOrder)}
          onDelete={() => setDeleteConfirmOrder(selectedOrder)}
        />
      )}

      {/* Print Receipt */}
      {printOrder && (
        <PrintReceipt
          order={printOrder}
          onClose={() => setPrintOrder(null)}
        />
      )}

      {/* Delete Order Confirmation */}
      {deleteConfirmOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Xác nhận xóa hóa đơn</h3>
            <p className="text-sm text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa hóa đơn <strong>{deleteConfirmOrder.id.slice(-8).toUpperCase()}</strong> không?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmOrder(null)}
                className="px-4 py-2 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  deleteOrder(deleteConfirmOrder.id);
                  setDeleteConfirmOrder(null);
                }}
                className="px-4 py-2 rounded-xl font-semibold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: '#FE7410' }}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}