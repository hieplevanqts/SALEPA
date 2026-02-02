import { useState, useMemo, useEffect } from 'react';
import { X, User, Phone, Mail, MapPin, Calendar, Edit, Trash2, Cake, Hash, AlertCircle, ShoppingBag, Clock, CreditCard, FileText, Package, CheckCircle, XCircle, CircleDot, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../../../../lib/convenience-store-lib/store';
import type { Customer } from '../../../../lib/convenience-store-lib/store';
import { useTranslation } from '../../../../lib/convenience-store-lib/useTranslation';

interface CustomerDetailProps {
  customer: Customer;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function CustomerDetail({ customer, onClose, onEdit, onDelete }: CustomerDetailProps) {
  const { t } = useTranslation();
  const { orders, customerTreatmentPackages, appointments, users } = useStore();
  const [activeTab, setActiveTab] = useState<'orders' | 'treatments'>('treatments'); // Default to treatments tab
  const [expandedPackages, setExpandedPackages] = useState<string[]>([]);
  const [expandedSessions, setExpandedSessions] = useState<string[]>([]); // Track expanded sessions
  const customerId = customer.id ?? customer._id;
  const customerName = customer.name ?? customer.full_name;
  const customerPhone = customer.phone ?? '';
  const customerAvatar = customer.avatar ?? customer.metadata?.avatar;
  const customerDateOfBirth = customer.dateOfBirth ?? customer.metadata?.dateOfBirth;
  const customerGender = customer.gender ?? customer.metadata?.gender;
  const customerNotes = customer.notes ?? customer.metadata?.notes;
  const customerTaxCode = customer.taxCode ?? customer.tax_code;
  const customerTotalSpent = customer.totalSpent ?? customer.total_spent ?? 0;
  const customerOrderCount = customer.orderCount ?? customer.total_orders ?? 0;

  // Get customer orders
  const customerOrders = useMemo(() => {
    let result = orders.filter((order) => order.customerPhone === customerPhone);

    return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [orders, customerPhone]);

  // Get customer treatment packages
  const customerPackages = useMemo(() => {
    const packages = customerTreatmentPackages.filter((pkg) => pkg.customerId === customerId);
    console.log('🔍 Debug Treatment Packages:', {
      customerId,
      customerName,
      totalPackages: customerTreatmentPackages.length,
      customerPackages: packages.length,
      allPackages: customerTreatmentPackages.map((p) => ({
        id: p.id,
        customerId: p.customerId,
        name: p.treatmentName,
      })),
      filtered: packages.map((p) => ({ id: p.id, name: p.treatmentName })),
    });
    return packages;
  }, [customerTreatmentPackages, customerId, customerName]);

  // Auto-expand all packages when switching to treatments tab
  useEffect(() => {
    if (activeTab === 'treatments' && customerPackages.length > 0) {
      const allPackageIds = customerPackages.map((pkg) => pkg.id);
      setExpandedPackages(allPackageIds);
    }
  }, [activeTab, customerPackages]);

  // Get package appointments  
  const getPackageAppointments = (packageId: string) => {
    return appointments.filter(
      (apt) =>
        apt.customerId === customerId &&
        apt.services.some((s) => s.treatmentPackageId === packageId),
    );
  };

  // Toggle package expansion
  const togglePackage = (packageId: string) => {
    console.log('🔘 Toggle clicked:', packageId, 'Current expanded:', expandedPackages);
    setExpandedPackages(prev => {
      if (prev.includes(packageId)) {
        console.log('▲ Collapsing package');
        return prev.filter(id => id !== packageId);
      } else {
        console.log('▼ Expanding package');
        return [...prev, packageId];
      }
    });
  };

  // Toggle session expansion
  const toggleSession = (packageId: string, sessionNumber: number) => {
    const key = `${packageId}-${sessionNumber}`;
    console.log('🔘 Toggle session clicked:', key, 'Current expanded:', expandedSessions);
    setExpandedSessions(prev => {
      if (prev.includes(key)) {
        console.log('▲ Collapsing session');
        return prev.filter(id => id !== key);
      } else {
        console.log('▼ Expanding session');
        return [...prev, key];
      }
    });
  };

  const getCustomerGroupBadge = (group?: string) => {
    switch (group) {
      case 'vip':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
            VIP
          </span>
        );
      case 'acquaintance':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {t.customerData?.acquaintance || 'Acquaintance'}
          </span>
        );
      case 'employee':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            {t.customerData?.employee || 'Employee'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            {t.customerData?.regular || 'Regular'}
          </span>
        );
    }
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
    const date = new Date(dateString + 'T00:00:00');
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
    if (!customerDateOfBirth) return false;
    const today = new Date();
    const birthDate = new Date(customerDateOfBirth);
    return (
      today.getDate() === birthDate.getDate() &&
      today.getMonth() === birthDate.getMonth()
    );
  };

  const handleCallPhone = () => {
    if (!customerPhone) return;
    window.location.href = `tel:${customerPhone}`;
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {t('completed')}
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            {t('pending')}
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            {t('cancelled')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {t('completed')}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold">{t.customerData?.detailTitle || 'Customer Details'}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className={`w-24 h-24 rounded-full ${getAvatarColor(customerName)} flex items-center justify-center text-white text-2xl font-semibold flex-shrink-0`}>
                {customerAvatar ? (
                  <img src={customerAvatar} alt={customerName} className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(customerName)
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-gray-900">{customerName}</h3>
                  {getCustomerGroupBadge(customer.customerGroup)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Phone */}
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">{customerPhone}</span>
                    <button
                      onClick={handleCallPhone}
                      className="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      {t.customerData?.call || 'Call'}
                    </button>
                  </div>

                  {/* Address */}
                  {customer.address && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span>{customer.address}</span>
                    </div>
                  )}

                  {/* Date of Birth */}
                  {customerDateOfBirth && (
                    <div className="flex items-center gap-2 text-gray-700">
                      {isBirthday() ? (
                        <Cake className="w-5 h-5 text-pink-600" />
                      ) : (
                        <Calendar className="w-5 h-5 text-blue-600" />
                      )}
                      <span>{formatDate(customerDateOfBirth)}</span>
                      {isBirthday() && (
                        <span className="text-xs bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full">
                          🎂 {t.customerData?.birthday || 'Birthday Today'}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Gender */}
                  {customerGender && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="text-blue-600">👤</span>
                      <span>{(t.customerData as Record<string, string> | undefined)?.[customerGender] || customerGender}</span>
                    </div>
                  )}

                  {/* Tax Code */}
                  {customerTaxCode && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Hash className="w-5 h-5 text-blue-600" />
                      <span>{customerTaxCode}</span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {customerNotes && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-900 mb-1">{t.customerData?.notes || 'Notes'}</p>
                        <p className="text-sm text-yellow-800">{customerNotes}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="text-right flex-shrink-0">
                <div className="text-3xl font-bold text-blue-600">
                  {customerTotalSpent.toLocaleString('vi-VN')}đ
                </div>
                <p className="text-sm text-gray-600 mt-1">{t.customerData?.totalSpent || 'Total Spent'}</p>
                <div className="mt-2 text-lg font-semibold text-gray-900">
                  {customerOrderCount} {t.customerData?.orders || 'orders'}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('orders')}
                className={`pb-3 px-1 font-medium transition-colors relative ${
                  activeTab === 'orders'
                    ? 'text-[#FE7410]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  <span>Lịch sử đơn hàng</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {customerOrders.length}
                  </span>
                </div>
                {activeTab === 'orders' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FE7410]"></div>
                )}
              </button>

              <button
                onClick={() => setActiveTab('treatments')}
                className={`pb-3 px-1 font-medium transition-colors relative ${
                  activeTab === 'treatments'
                    ? 'text-[#FE7410]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  <span>Gói liệu trình</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {customerPackages.length}
                  </span>
                </div>
                {activeTab === 'treatments' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FE7410]"></div>
                )}
              </button>
            </div>
          </div>

          {/* Tab Content: Orders */}
          {activeTab === 'orders' && (
            <div>
              {/* Header */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Lịch sử mua hàng</h3>
              </div>

              {/* Orders List */}
              {customerOrders.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Chưa có đơn hàng nào</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {customerOrders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">#{order.id}</span>
                            {getStatusBadge(order.status)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{formatDateTime(order.timestamp)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-900">
                            {order.total.toLocaleString('vi-VN')}đ
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600 justify-end mt-1">
                            <CreditCard className="w-4 h-4" />
                            <span>{order.paymentMethod === 'cash' ? 'Tiền mặt' : order.paymentMethod === 'card' ? 'Thẻ' : 'Chuyển khoản'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm text-gray-600">
                            <span>
                              {item.quantity}x {item.name}
                            </span>
                            <span>{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                          </div>
                        ))}
                      </div>

                      {/* Note */}
                      {order.note && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-sm text-gray-600">
                            <FileText className="w-3 h-3 inline mr-1" />
                            {order.note}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Treatment Packages */}
          {activeTab === 'treatments' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Danh sách gói liệu trình</h3>
                {/* Debug Info */}
                <div className="flex items-center gap-2">
                  <div className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded">
                    Store: {customerTreatmentPackages.length} packages total
                  </div>
                  <div className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded">
                    Customer: {customerPackages.length} packages
                  </div>
                  {/* Test Add Package Button */}
                  <button
                    onClick={() => {
                      console.log('🧪 TEST: Adding test package for customer:', customerId);
                      const testPackage = {
                        customerId,
                        customerName,
                        treatmentProductId: 'TEST-001',
                        treatmentName: 'TEST: Liệu trình test 5 buổi',
                        totalSessions: 5,
                        usedSessionNumbers: [1, 2],
                        remainingSessions: 3,
                        purchaseDate: new Date().toISOString().split('T')[0],
                        orderId: 'TEST-ORDER-001',
                        isActive: true,
                        sessions: [
                          {
                            sessionNumber: 1,
                            sessionName: 'Test Buổi 1',
                            items: [
                              {
                                productId: 'test-1',
                                productName: 'Test Service 1',
                                productType: 'service' as const,
                                quantity: 1,
                                duration: 60,
                              }
                            ]
                          },
                          {
                            sessionNumber: 2,
                            sessionName: 'Test Buổi 2',
                            items: [
                              {
                                productId: 'test-2',
                                productName: 'Test Service 2',
                                productType: 'service' as const,
                                quantity: 1,
                                duration: 60,
                              }
                            ]
                          },
                          {
                            sessionNumber: 3,
                            sessionName: 'Test Buổi 3',
                            items: []
                          },
                          {
                            sessionNumber: 4,
                            sessionName: 'Test Buổi 4',
                            items: []
                          },
                          {
                            sessionNumber: 5,
                            sessionName: 'Test Buổi 5',
                            items: []
                          }
                        ]
                      };
                      
                      const { createCustomerTreatmentPackage } = useStore.getState();
                      if (createCustomerTreatmentPackage) {
                        createCustomerTreatmentPackage(testPackage);
                        console.log('✅ Test package added');
                        alert('✅ Test package added! Close and reopen to see it.');
                      } else {
                        console.error('❌ createCustomerTreatmentPackage not available');
                      }
                    }}
                    className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                  >
                    🧪 Add Test Package
                  </button>
                  {/* Load Demo Button */}
                  <button
                    onClick={() => {
                      import('../../../../lib/convenience-store-lib/demoPackagesV2').then(module => {
                        if (module.loadDemoPackagesV2) {
                          module.loadDemoPackagesV2();
                          alert('✅ Demo data loaded! Refresh page to see changes.');
                        }
                      });
                    }}
                    className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    🔄 Load Demo Data
                  </button>
                </div>
              </div>

              {customerPackages.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Chưa có gói liệu trình nào</p>
                  <p className="text-sm text-gray-400 mt-2">Click "Load Demo Data" để load dữ liệu mẫu</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {customerPackages.map((pkg) => {
                    const pkgAppointments = getPackageAppointments(pkg.id);
                    const usedSessions = pkg.usedSessionNumbers || [];
                    const isExpanded = expandedPackages.includes(pkg.id);
                    
                    console.log('🔍 Package render:', {
                      pkgId: pkg.id,
                      treatmentName: pkg.treatmentName,
                      hasSessions: !!pkg.sessions,
                      sessionsCount: pkg.sessions?.length || 0,
                      isExpanded,
                      sessions: pkg.sessions
                    });

                    return (
                      <div key={pkg.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Package Header */}
                        <div 
                          className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 cursor-pointer hover:bg-orange-100 transition-colors"
                          onClick={() => togglePackage(pkg.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-bold text-gray-900">{pkg.treatmentName}</h4>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  pkg.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {pkg.isActive ? 'Đang hoạt động' : 'Hết hạn'}
                                </span>
                              </div>
                              
                              {/* Progress Bar */}
                              <div className="mb-2">
                                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                                  <span>Tiến độ sử dụng</span>
                                  <span className="font-semibold">
                                    {usedSessions.length}/{pkg.totalSessions} buổi
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-[#FE7410] h-2 rounded-full transition-all"
                                    style={{ width: `${(usedSessions.length / pkg.totalSessions) * 100}%` }}
                                  ></div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="text-gray-600">
                                  <span className="font-medium">Ngày mua:</span> {formatDate(pkg.purchaseDate)}
                                </div>
                                {pkg.expiryDate && (
                                  <div className="text-gray-600">
                                    <span className="font-medium">Hết hạn:</span> {formatDate(pkg.expiryDate)}
                                  </div>
                                )}
                              </div>

                              {/* Click hint */}
                              <div className="mt-3 flex items-center gap-1 text-xs text-[#FE7410] font-medium">
                                {isExpanded ? (
                                  <>
                                    <ChevronUp className="w-4 h-4" />
                                    <span>Ẩn chi tiết</span>
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="w-4 h-4" />
                                    <span>Xem chi tiết {pkg.totalSessions} buổi</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="ml-4 text-right flex flex-col items-center">
                              <div className="text-2xl font-bold text-[#FE7410]">
                                {pkg.remainingSessions}
                              </div>
                              <p className="text-xs text-gray-600">buổi còn lại</p>
                            </div>
                          </div>
                        </div>

                        {/* Package Details (Expanded) - LIST VIEW WITH DETAILED SESSIONS */}
                        {isExpanded && (
                          <div className="p-4 border-t border-gray-200 bg-white">
                            <h5 className="font-semibold text-gray-900 mb-4 text-base">Chi tiết các buổi liệu trình ({pkg.totalSessions} buổi)</h5>
                            
                            <div className="space-y-3">
                              {/* Always generate sessions based on totalSessions */}
                              {Array.from({ length: pkg.totalSessions }, (_, i) => i + 1).map((sessionNum) => {
                                const isUsed = usedSessions.includes(sessionNum);
                                const appointment = pkgAppointments.find(apt => 
                                  apt.services.some(s => s.sessionNumber === sessionNum)
                                );
                                
                                // Get session data if available
                                const sessionData = pkg.sessions?.find(s => s.sessionNumber === sessionNum);
                                
                                const status = isUsed ? 'completed' : 
                                  (appointment && (appointment.status === 'pending' || appointment.status === 'in-progress')) ? 'scheduled' : 
                                  'unused';

                                const statusConfig = {
                                  completed: {
                                    borderColor: 'border-green-300',
                                    bgColor: 'bg-green-50',
                                    headerBg: 'bg-green-100',
                                    icon: <CheckCircle className="w-5 h-5 text-green-600" />,
                                    badge: 'bg-green-600 text-white',
                                    label: 'Đã hoàn thành',
                                  },
                                  scheduled: {
                                    borderColor: 'border-yellow-300',
                                    bgColor: 'bg-yellow-50',
                                    headerBg: 'bg-yellow-100',
                                    icon: <Clock className="w-5 h-5 text-yellow-600" />,
                                    badge: 'bg-yellow-600 text-white',
                                    label: 'Đã đặt lịch',
                                  },
                                  unused: {
                                    borderColor: 'border-gray-300',
                                    bgColor: 'bg-white',
                                    headerBg: 'bg-gray-100',
                                    icon: <CircleDot className="w-5 h-5 text-gray-400" />,
                                    badge: 'bg-gray-400 text-white',
                                    label: 'Chưa sử dụng',
                                  }
                                };

                                const config = statusConfig[status];
                                const sessionKey = `${pkg.id}-${sessionNum}`;
                                const isSessionExpanded = expandedSessions.includes(sessionKey);

                                return (
                                  <div 
                                    key={sessionNum}
                                    className={`border-2 ${config.borderColor} rounded-lg overflow-hidden ${config.bgColor}`}
                                  >
                                    {/* Session Header - Clickable */}
                                    <div 
                                      className={`p-4 ${config.headerBg} cursor-pointer hover:opacity-80 transition-opacity`}
                                      onClick={() => toggleSession(pkg.id, sessionNum)}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1">
                                          {config.icon}
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                              <h6 className="font-bold text-gray-900">
                                                {sessionData?.sessionName || `Buổi ${sessionNum}`}
                                              </h6>
                                              <span className={`text-xs px-2 py-0.5 rounded-full ${config.badge} font-medium`}>
                                                {config.label}
                                              </span>
                                            </div>
                                            
                                            {/* Quick info */}
                                            <div className="mt-1 flex items-center gap-4 text-xs text-gray-600">
                                              {sessionData?.items && sessionData.items.length > 0 && (
                                                <span>📋 {sessionData.items.length} dịch vụ/sản phẩm</span>
                                              )}
                                              {appointment && (
                                                <>
                                                  <span>📅 {formatDate(appointment.appointmentDate)}</span>
                                                  <span>🕐 {appointment.appointmentTime}</span>
                                                </>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-gray-500 font-medium">
                                            {isSessionExpanded ? 'Thu gọn' : 'Xem chi tiết'}
                                          </span>
                                          {isSessionExpanded ? (
                                            <ChevronUp className="w-5 h-5 text-gray-600" />
                                          ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-600" />
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Session Details - Expandable */}
                                    {isSessionExpanded && (
                                      <div className="p-4 bg-white border-t-2 border-gray-200">
                                        {/* Services/Products in this session */}
                                        {sessionData?.items && sessionData.items.length > 0 ? (
                                          <div className="mb-4">
                                            <h6 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                              <Package className="w-4 h-4 text-[#FE7410]" />
                                              Dịch vụ & Sản phẩm trong buổi
                                            </h6>
                                            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                              {(sessionData.items || []).map((item, idx) => (
                                                <div key={idx} className="flex items-start justify-between py-2 border-b border-gray-200 last:border-0">
                                                  <div className="flex-1">
                                                    <div className="font-medium text-gray-900">{item.productName}</div>
                                                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                                                      <span className="inline-flex items-center">
                                                        <span className="font-medium">Loại:</span>
                                                        <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                                          {item.productType === 'service' ? 'Dịch vụ' : 
                                                           item.productType === 'treatment' ? 'Liệu trình' : 'Sản phẩm'}
                                                        </span>
                                                      </span>
                                                      {item.duration && (
                                                        <span className="inline-flex items-center">
                                                          <Clock className="w-3.5 h-3.5 mr-1" />
                                                          {item.duration} phút
                                                        </span>
                                                      )}
                                                      {item.quantity && item.quantity > 1 && (
                                                        <span className="inline-flex items-center font-medium">
                                                          Số lượng: x{item.quantity}
                                                        </span>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="mb-4 p-3 bg-gray-50 rounded-lg text-center text-sm text-gray-500">
                                            Chưa có thông tin chi tiết dịch vụ cho buổi này
                                          </div>
                                        )}
                                        
                                        {/* Appointment Info */}
                                        {appointment ? (
                                          <div>
                                            <h6 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                              <Calendar className="w-4 h-4 text-[#FE7410]" />
                                              Thông tin lịch hẹn
                                            </h6>
                                            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                                              <div className="flex items-center gap-2 text-sm">
                                                <span className="font-medium text-gray-700 w-24">Ngày hẹn:</span>
                                                <span className="text-gray-900">{formatDate(appointment.appointmentDate)}</span>
                                              </div>
                                              <div className="flex items-center gap-2 text-sm">
                                                <span className="font-medium text-gray-700 w-24">Giờ hẹn:</span>
                                                <span className="text-gray-900">{appointment.appointmentTime}</span>
                                              </div>
                                              <div className="flex items-center gap-2 text-sm">
                                                <span className="font-medium text-gray-700 w-24">Trạng thái:</span>
                                                <span>{getStatusBadge(appointment.status)}</span>
                                              </div>
                                              
                                              {/* Technicians */}
                                              {appointment.services
                                                .filter(s => s.sessionNumber === sessionNum && s.technicianId)
                                                .map((service, idx) => {
                                                  const tech = users.find(u => u.id === service.technicianId);
                                                  return tech ? (
                                                    <div key={idx} className="flex items-center gap-2 text-sm">
                                                      <span className="font-medium text-gray-700 w-24">Nhân viên:</span>
                                                      <span className="text-gray-900">{tech.fullName}</span>
                                                    </div>
                                                  ) : null;
                                                })}
                                              
                                              {appointment.notes && (
                                                <div className="pt-2 border-t border-blue-200 mt-2">
                                                  <span className="font-medium text-gray-700 text-sm">Ghi chú:</span>
                                                  <p className="text-sm text-gray-600 mt-1">{appointment.notes}</p>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="p-3 bg-gray-50 rounded-lg text-center text-sm text-gray-500">
                                            Chưa có lịch hẹn cho buổi này
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onDelete}
            className="px-6 py-2.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            {t.customerData?.delete || 'Delete'}
          </button>
          <button
            onClick={onEdit}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Edit className="w-5 h-5" />
            {t.customerData?.edit || 'Edit'}
          </button>
        </div>
      </div>
    </div>
  );
}