import { useState, useMemo } from 'react';
import { User, Phone, Mail, MapPin, Calendar, Edit, Trash2, Cake, AlertCircle, ShoppingBag, Clock, CreditCard, FileText, ArrowLeft, Package, Scissors, TrendingUp, Printer, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../../../../lib/convenience-store-lib/store';
import type { Customer, Order } from '../../../../lib/convenience-store-lib/store';
import { useTranslation } from '../../../../lib/convenience-store-lib/useTranslation';
import { OrderDetailFullScreen } from '../../pages/orders/OrderDetailFullScreen';
import { PrintReceipt } from '../sales/PrintReceipt';

interface CustomerDetailViewProps {
  customer: Customer;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewOrder?: (orderId: string) => void;
}

type TabType = 'overview' | 'purchases';

export function CustomerDetailView({ customer, onClose, onEdit, onDelete, onViewOrder }: CustomerDetailViewProps) {
  const { t } = useTranslation();
  const { orders, products, deleteOrder, customerTreatmentPackages, getCustomerActivePackages, customerTypes } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'cancelled'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [printOrder, setPrintOrder] = useState<Order | null>(null);
  const [deleteConfirmOrder, setDeleteConfirmOrder] = useState<Order | null>(null);
  const [expandedPackages, setExpandedPackages] = useState<string[]>([]);

  // Toggle package expansion
  const togglePackageExpansion = (packageId: string) => {
    setExpandedPackages(prev => 
      prev.includes(packageId) 
        ? prev.filter(id => id !== packageId)
        : [...prev, packageId]
    );
  };

  // Get customer orders
  const customerOrders = useMemo(() => {
    const ordersArray = Array.isArray(orders) ? orders : Object.values(orders || {});
    let result = ordersArray.filter((order) => 
      order && order.customerPhone === customer.phone
    );
    
    if (filterStatus !== 'all') {
      result = result.filter((order) => order.status === filterStatus);
    }
    
    return result.sort((a, b) => new Date(b.timestamp || b.date || '').getTime() - new Date(a.timestamp || a.date || '').getTime());
  }, [orders, customer.phone, filterStatus]);

  // Get customer treatment packages from store
  const customerTreatmentPackagesData = useMemo(() => {
    return customerTreatmentPackages
      .filter(pkg => pkg.customerId === customer._id)
      .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
  }, [customerTreatmentPackages, customer._id]);

  // Extract services from orders
  const customerServices = useMemo(() => {
    const services: any[] = [];
    customerOrders.forEach((order) => {
      const items = Array.isArray(order.items) ? order.items : Object.values(order.items || {});
      items.forEach((item: any) => {
        if (item && (item.type === 'service' || item.productType === 'service')) {
          services.push({
            id: `${order.id}-${item.name}`,
            name: item.name,
            serviceDate: order.timestamp || order.date,
            duration: item.duration || 0,
            price: item.price,
            orderId: order.id,
          });
        }
      });
    });
    return services;
  }, [customerOrders]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalOrders = customer.total_orders; // Use DB value
    const totalSpent = customer.total_spent; // Use DB value
    const totalPaid = customerOrders.reduce((sum, order) => {
      const received = order.receivedAmount || order.paidAmount || 0;
      // Cap received amount at order total for calculation
      const cappedReceived = received > order.total ? order.total : received;
      return sum + cappedReceived;
    }, 0);
    const debt = totalSpent - totalPaid;
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    const lastVisit = customer.last_purchase_at || customer.created_at;
    
    // Get unpaid orders
    const unpaidOrders = customerOrders.filter(order => {
      const received = order.receivedAmount || order.paidAmount || 0;
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
  }, [customerOrders, customer.total_orders, customer.total_spent, customer.last_purchase_at, customer.created_at]);

  const getCustomerGroupBadge = (group?: string) => {
    const badges = {
      vip: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'VIP' },
      acquaintance: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Bạn bè' },
      employee: { bg: 'bg-green-100', text: 'text-green-800', label: 'Nhân viên' },
      regular: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Thường xuyên' },
    };
    const badge = badges[group as keyof typeof badges] || badges.regular;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
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
    if (!name) return colors[0];
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

  const getStatusBadge = (status?: string) => {
    const badges = {
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Hoàn thành' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ xử lý' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã hủy' },
    };
    const badge = badges[status as keyof typeof badges] || badges.completed;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (order: Order) => {
    const received = order.receivedAmount || order.paidAmount || 0;
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
  ];

  // Get customer type
  const customerType = useMemo(() => {
    if (!customer.customer_type_id) return null;
    return customerTypes.find(ct => ct._id === customer.customer_type_id);
  }, [customer.customer_type_id, customerTypes]);

  // Create normalized customer data for backwards compatibility
  const normalizedCustomer = useMemo(() => {
    return {
      ...customer,
      id: customer._id,
      name: customer.full_name,
      avatar: customer.metadata?.avatar,
      dateOfBirth: customer.metadata?.dateOfBirth,
      gender: customer.metadata?.gender,
      notes: customer.metadata?.notes,
      tags: customer.metadata?.tags,
      createdAt: customer.created_at,
      updatedAt: customer.updated_at,
      totalSpent: customer.total_spent,
      totalOrders: customer.total_orders,
      loyaltyPoints: customer.loyalty_points,
      customerType: customerType?.name,
      taxCode: customer.metadata?.taxCode,
      customerGroup: customer.metadata?.customerGroup,
      lastPurchaseAt: customer.last_purchase_at
    };
  }, [customer, customerType]);

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
            <div className={`w-16 h-16 rounded-full ${getAvatarColor(normalizedCustomer.name)} flex items-center justify-center text-white text-lg font-bold flex-shrink-0`}>
              {normalizedCustomer.avatar ? (
                <img src={normalizedCustomer.avatar} alt={normalizedCustomer.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                getInitials(normalizedCustomer.name)
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
                {/* Customer Info */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-4">
                    Thông tin khách hàng
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-sm text-gray-600 mb-1">Mã khách hàng</div>
                      <div className="font-semibold text-gray-900 text-base">{customer.code}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-sm text-gray-600 mb-1">Tên khách hàng</div>
                      <div className="font-semibold text-gray-900 text-base">{customer.full_name}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-sm text-gray-600 mb-1">Số điện thoại</div>
                      <div className="font-semibold text-gray-900 text-base">{customer.phone || <span className="text-gray-400">—</span>}</div>
                    </div>
                    {customer.email && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Email</div>
                        <div className="font-semibold text-gray-900 text-base">{customer.email}</div>
                      </div>
                    )}
                    {customer.metadata?.dateOfBirth && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Ngày sinh</div>
                        <div className="font-semibold text-gray-900 text-base">{formatDate(customer.metadata.dateOfBirth)}</div>
                      </div>
                    )}
                    {customer.metadata?.gender && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Giới tính</div>
                        <div className="font-semibold text-gray-900 text-base">
                          {customer.metadata.gender === 'male' ? 'Nam' : customer.metadata.gender === 'female' ? 'Nữ' : 'Khác'}
                        </div>
                      </div>
                    )}
                    {customerType && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Loại khách hàng</div>
                        <div className="font-semibold text-base" style={{ color: '#FE7410' }}>{customerType.name}</div>
                      </div>
                    )}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-sm text-gray-600 mb-1">Trạng thái</div>
                      <div className="text-base">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          customer.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800' 
                            : customer.status === 'BLOCKED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {customer.status === 'ACTIVE' ? 'Hoạt động' : customer.status === 'BLOCKED' ? 'Đã chặn' : 'Không hoạt động'}
                        </span>
                      </div>
                    </div>
                    {customer.address && (
                      <div className="bg-gray-50 rounded-xl p-4 md:col-span-3">
                        <div className="text-sm text-gray-600 mb-1">Địa chỉ</div>
                        <div className="font-semibold text-gray-900 text-base">{customer.address}</div>
                      </div>
                    )}
                  </div>
                  {customer.metadata?.notes && (
                    <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-yellow-900 mb-1">{t('customerData')?.notes || 'Ghi chú'}</p>
                          <p className="text-sm text-yellow-800">{customer.metadata.notes}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Invoice Information */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-4">
                    Thông tin xuất hóa đơn
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Customer Type */}
                    {customer.metadata?.customerType && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Loại khách hàng</div>
                        <div className="font-semibold text-gray-900 text-base">
                          {customer.metadata.customerType === 'individual' ? 'Cá nhân' : 'Tổ chức'}
                        </div>
                      </div>
                    )}
                    
                    {/* Company Name */}
                    {customer.metadata?.companyName && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Tên công ty</div>
                        <div className="font-semibold text-gray-900 text-base">
                          {customer.metadata.companyName}
                        </div>
                      </div>
                    )}
                    
                    {/* Tax Code */}
                    {customer.metadata?.taxCode && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Mã số thuế</div>
                        <div className="font-semibold text-gray-900 text-base">
                          {customer.metadata.taxCode}
                        </div>
                      </div>
                    )}
                    
                    {/* Buyer Name */}
                    {customer.metadata?.buyerName && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Tên người mua</div>
                        <div className="font-semibold text-gray-900 text-base">
                          {customer.metadata.buyerName}
                        </div>
                      </div>
                    )}
                    
                    {/* ID Number */}
                    {customer.metadata?.idNumber && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Số CCCD/CMND</div>
                        <div className="font-semibold text-gray-900 text-base">
                          {customer.metadata.idNumber}
                        </div>
                      </div>
                    )}
                    
                    {/* Company Address */}
                    {(customer.metadata?.companyAddress || customer.metadata?.invoiceAddress) && (
                      <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
                        <div className="text-sm text-gray-600 mb-1">Địa chỉ công ty</div>
                        <div className="font-semibold text-gray-900 text-base">
                          {customer.metadata.companyAddress || customer.metadata.invoiceAddress}
                        </div>
                      </div>
                    )}
                    
                    {/* Province */}
                    {customer.metadata?.province && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Tỉnh/Thành phố</div>
                        <div className="font-semibold text-gray-900 text-base">
                          {customer.metadata.province === 'HN' ? 'Hà Nội' :
                           customer.metadata.province === 'HCM' ? 'TP. Hồ Chí Minh' :
                           customer.metadata.province === 'DN' ? 'Đà Nẵng' :
                           customer.metadata.province === 'HP' ? 'Hải Phòng' :
                           customer.metadata.province === 'CT' ? 'Cần Thơ' :
                           customer.metadata.province}
                        </div>
                      </div>
                    )}
                    
                    {/* Ward */}
                    {customer.metadata?.ward && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Phường/Xã</div>
                        <div className="font-semibold text-gray-900 text-base">
                          {customer.metadata.ward}
                        </div>
                      </div>
                    )}
                    
                    {/* Invoice Email */}
                    {(customer.metadata?.invoiceEmail || customer.email) && (
                      <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
                        <div className="text-sm text-gray-600 mb-1">Email xuất hóa đơn</div>
                        <div className="font-semibold text-gray-900 text-base">
                          {customer.metadata?.invoiceEmail || customer.email}
                        </div>
                      </div>
                    )}
                    
                    {/* Phone Invoice */}
                    {customer.metadata?.phoneInvoice && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Số điện thoại</div>
                        <div className="font-semibold text-gray-900 text-base">
                          {customer.metadata.phoneInvoice}
                        </div>
                      </div>
                    )}
                    
                    {/* Bank */}
                    {customer.metadata?.bank && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Ngân hàng</div>
                        <div className="font-semibold text-gray-900 text-base">
                          {customer.metadata.bank}
                        </div>
                      </div>
                    )}
                    
                    {/* Bank Account */}
                    {customer.metadata?.bankAccount && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Số tài khoản NH</div>
                        <div className="font-semibold text-gray-900 text-base">
                          {customer.metadata.bankAccount}
                        </div>
                      </div>
                    )}
                    
                    {/* Account Holder */}
                    {customer.metadata?.accountHolder && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Chủ tài khoản</div>
                        <div className="font-semibold text-gray-900 text-base">
                          {customer.metadata.accountHolder}
                        </div>
                      </div>
                    )}
                    
                    {/* Show message if no invoice info */}
                    {!customer.metadata?.customerType && 
                     !customer.metadata?.companyName && 
                     !customer.metadata?.taxCode && 
                     !customer.metadata?.buyerName && 
                     !customer.metadata?.idNumber &&
                     !customer.metadata?.companyAddress && 
                     !customer.metadata?.invoiceAddress &&
                     !customer.metadata?.invoiceEmail &&
                     !customer.metadata?.province &&
                     !customer.metadata?.ward &&
                     !customer.metadata?.phoneInvoice &&
                     !customer.metadata?.bank &&
                     !customer.metadata?.bankAccount &&
                     !customer.metadata?.accountHolder && (
                      <div className="md:col-span-2 text-center py-8">
                        <p className="text-sm text-gray-400">Chưa có thông tin xuất hóa đơn</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Purchases Tab */}
            {activeTab === 'purchases' && (
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                <div className="mb-4">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-gray-700" />
                    {t('customerData')?.purchaseHistory || 'Lịch sử mua hàng'} ({customerOrders.length})
                  </h3>
                </div>

                {customerOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">{t('customerData')?.noOrders || 'Chưa có đơn hàng nào'}</p>
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
                              <span className="font-bold text-gray-900 text-base">#{order.id.slice(-8).toUpperCase()}</span>
                              {getPaymentStatusBadge(order)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{formatDateTime(order.timestamp || order.date)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                              <CreditCard className="w-4 h-4" />
                              <span>{(t('paymentMethods') as any)?.[order.paymentMethod] || order.paymentMethod}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold" style={{ color: '#FE7410' }}>
                              {order.total.toLocaleString('vi-VN')}đ
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
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
          </div>

          {/* Right Column - Summary (1/3) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 lg:sticky lg:top-6">
              <h3 className="text-base font-bold text-gray-900 mb-6">
                {t('customerData')?.summary || 'Tổng quan'}
              </h3>

              {/* Stats */}
              <div className="space-y-4">
                {/* Member Since */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm text-gray-600 mb-1">
                    {t('customerData')?.memberSince || 'Thành viên từ'}
                  </div>
                  <div className="font-semibold text-gray-900 text-base">{formatDate(customer.created_at)}</div>
                </div>

                {/* Last Update */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm text-gray-600 mb-1">
                    Cập nhật lần cuối
                  </div>
                  <div className="font-semibold text-gray-900 text-base">{formatDateTime(customer.updated_at)}</div>
                </div>

                {/* Last Purchase */}
                {customer.last_purchase_at && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-600 mb-1">
                      {t('customerData')?.lastVisit || 'Lần mua cuối'}
                    </div>
                    <div className="font-semibold text-gray-900 text-base">{formatDateTime(customer.last_purchase_at)}</div>
                  </div>
                )}

                {/* Total Spent */}
                <div className="rounded-xl p-4" style={{ backgroundColor: '#FFF5EE', border: '2px solid #FE7410' }}>
                  <div className="text-sm mb-1" style={{ color: '#FE7410' }}>
                    {t('customerData')?.totalSpent || 'Tổng chi tiêu'}
                  </div>
                  <div className="font-bold text-3xl" style={{ color: '#FE7410' }}>
                    {customer.total_spent.toLocaleString('vi-VN')}đ
                  </div>
                </div>

                {/* Total Orders */}
                <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                  <div className="text-sm text-green-700 mb-1">
                    {t('customerData')?.orderCount || 'Số đơn hàng'}
                  </div>
                  <div className="font-bold text-3xl text-green-600">{customer.total_orders}</div>
                </div>

                {/* Birthday Alert */}
                {isBirthday() && (
                  <div className="bg-pink-50 border-2 border-pink-200 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-pink-800">
                        🎉 {t('customerData')?.birthday || 'Sinh nhật hôm nay'}
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
            <h3 className="text-xl font-bold text-gray-900 mb-4">Xác nhận xóa đơn hàng</h3>
            <p className="text-sm text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa đơn hàng <strong>#{deleteConfirmOrder.id.slice(-8).toUpperCase()}</strong> không?
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