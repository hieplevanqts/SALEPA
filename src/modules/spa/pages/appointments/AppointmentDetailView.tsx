import { ArrowLeft, Calendar, Clock, User, Scissors, FileText, Edit, Trash2, CheckCircle, AlertCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AppSidebar } from '../../components/shared/AppSidebar';
import { useStore } from '../../../../lib/spa-lib/store';
import type { Appointment } from '../../../../lib/spa-lib/store';

interface AppointmentDetailViewProps {
  appointment: Appointment;
  onClose: () => void;
  onEdit?: (appointment: Appointment) => void;
  onDelete?: (appointment: Appointment) => void;
  userRole?: 'admin' | 'cashier' | 'technician';
}

type TabType = 'details' | 'services';

export function AppointmentDetailView({ appointment, onClose, onEdit, onDelete, userRole = 'admin' }: AppointmentDetailViewProps) {
  const { customers, products, users, customerTreatmentPackages } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [expandedSessions, setExpandedSessions] = useState<Record<number, boolean>>({});

  // Get current user info from localStorage
  const currentUser = localStorage.getItem('salepa_username') || '';

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [appointment.id]);

  // Get customer info
  const customer = customers.find(c => c.phone === appointment.customerPhone);
  
  // Get technician info
  const technician = users.find(u => u.username === appointment.technicianId);

  // Calculate total price and duration
  const totalDuration = appointment.services.reduce((sum, s) => sum + s.duration, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Đang chờ',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: AlertCircle,
          iconColor: 'text-yellow-600'
        };
      case 'in-progress':
        return {
          label: 'Đang thực hiện',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Clock,
          iconColor: 'text-blue-600'
        };
      case 'completed':
        return {
          label: 'Hoàn thành',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          iconColor: 'text-green-600'
        };
      case 'cancelled':
        return {
          label: 'Hủy lịch',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          iconColor: 'text-red-600'
        };
      default:
        return {
          label: 'Đang chờ',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: AlertCircle,
          iconColor: 'text-yellow-600'
        };
    }
  };

  const statusInfo = getStatusBadge(appointment.status);
  const StatusIcon = statusInfo.icon;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const tabs = [
    { id: 'details', label: 'Thông tin chi tiết', icon: Calendar },
    { id: 'services', label: 'Dịch vụ', icon: Scissors },
  ];

  // Check if can edit - Block editing for completed and cancelled appointments
  const canEdit = appointment.status !== 'completed' && appointment.status !== 'cancelled';

  // Group services by session number for treatment packages
  const groupServicesBySession = () => {
    const sessionGroups: Record<number, typeof appointment.services> = {};
    const regularServices: typeof appointment.services = [];

    appointment.services.forEach((service) => {
      if (service.useTreatmentPackage && service.sessionNumber) {
        if (!sessionGroups[service.sessionNumber]) {
          sessionGroups[service.sessionNumber] = [];
        }
        sessionGroups[service.sessionNumber].push(service);
      } else {
        regularServices.push(service);
      }
    });

    return { sessionGroups, regularServices };
  };

  const { sessionGroups, regularServices } = groupServicesBySession();

  const toggleSession = (sessionNumber: number) => {
    setExpandedSessions(prev => ({
      ...prev,
      [sessionNumber]: !prev[sessionNumber]
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 flex">
      {/* Sidebar */}
      <AppSidebar 
        activeTab="appointments"
        onTabChange={onClose}
        currentUser={currentUser}
        userRole={userRole}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 bg-white border-b-2 border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between gap-6">
            {/* Left: Back Button + Title */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900 flex-shrink-0"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-gray-900">Chi tiết lịch hẹn</h1>
              </div>
            </div>

            {/* Right: Action Buttons */}
            {userRole === 'admin' && (
              <div className="flex items-center gap-3 flex-shrink-0">
                {onDelete && (
                  <button
                    onClick={() => onDelete(appointment)}
                    className="px-4 py-2 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    Xóa
                  </button>
                )}
                {onEdit && canEdit && (
                  <button
                    onClick={() => onEdit(appointment)}
                    className="px-4 py-2 rounded-xl font-semibold text-white transition-all hover:opacity-90 flex items-center gap-2"
                    style={{ backgroundColor: '#FE7410' }}
                  >
                    <Edit className="w-5 h-5" />
                    Sửa
                  </button>
                )}
              </div>
            )}
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
              {activeTab === 'details' && (
                <>
                  {/* Date & Time Information */}
                  <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                    <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-700" />
                      Thời gian
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Ngày hẹn</div>
                        <div className="font-semibold text-gray-900 text-base">{formatDate(appointment.appointmentDate)}</div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Giờ hẹn</div>
                        <div className="font-semibold text-gray-900 text-base">{formatTime(appointment.startTime)}</div>
                      </div>

                      {totalDuration && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="text-sm text-gray-600 mb-1">Thời lượng dự kiến</div>
                          <div className="font-semibold text-gray-900 text-base">{totalDuration} phút</div>
                        </div>
                      )}

                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Ngày tạo</div>
                        <div className="font-semibold text-gray-900 text-base">
                          {new Date(appointment.createdAt || appointment.appointmentDate).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                    <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-gray-700" />
                      Thông tin khách hàng
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Tên khách hàng</div>
                        <div className="font-semibold text-gray-900 text-base">
                          {customer?.name || appointment.customerName || 'Khách vãng lai'}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Số điện thoại</div>
                        <div className="font-semibold text-gray-900 text-base font-mono">
                          {appointment.customerPhone}
                        </div>
                      </div>

                      {customer?.email && (
                        <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
                          <div className="text-sm text-gray-600 mb-1">Email</div>
                          <div className="font-semibold text-gray-900 text-base">{customer.email}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Technician Information */}
                  {appointment.technicianId && (
                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                      <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-gray-700" />
                        Kỹ thuật viên
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="text-sm text-gray-600 mb-1">Tên kỹ thuật viên</div>
                          <div className="font-semibold text-gray-900 text-base">
                            {technician?.fullName || appointment.technicianName || appointment.technicianId}
                          </div>
                        </div>

                        {technician?.email && (
                          <div className="bg-gray-50 rounded-xl p-4">
                            <div className="text-sm text-gray-600 mb-1">Email</div>
                            <div className="font-semibold text-gray-900 text-base">{technician.email}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {appointment.notes && (
                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                      <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-700" />
                        Ghi chú
                      </h3>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-gray-900 text-base leading-relaxed whitespace-pre-wrap">
                          {appointment.notes}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'services' && (
                <>
                  {/* Service Information */}
                  <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                    <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Scissors className="w-5 h-5 text-gray-700" />
                      Dịch vụ
                    </h3>
                    <div className="space-y-6">
                      {/* Treatment Package Sessions */}
                      {Object.keys(sessionGroups).sort((a, b) => Number(a) - Number(b)).map((sessionNum) => {
                        const sessionNumber = Number(sessionNum);
                        const servicesInSession = sessionGroups[sessionNumber];
                        const isExpanded = expandedSessions[sessionNumber];
                        
                        // Get treatment package name from customerTreatmentPackages using treatmentPackageId
                        const firstService = servicesInSession[0];
                        const customerPackage = customerTreatmentPackages.find(p => p.id === firstService.treatmentPackageId);
                        const treatmentName = customerPackage?.treatmentName || firstService.productName;
                        const maxSessions = customerPackage?.totalSessions || firstService.maxSessions;
                        
                        // Calculate total duration for this session
                        const sessionDuration = servicesInSession.reduce((sum, s) => sum + (s.duration || 0), 0);
                        
                        // Get technicians for this session
                        const sessionTechnicians = servicesInSession
                          .filter(s => s.technicianNames && s.technicianNames.length > 0)
                          .flatMap(s => s.technicianNames || [])
                          .filter((v, i, a) => a.indexOf(v) === i); // unique
                        
                        return (
                          <div key={sessionNumber} className="border-2 border-purple-200 rounded-xl overflow-hidden">
                            {/* Session Header - Collapsible */}
                            <button
                              onClick={() => toggleSession(sessionNumber)}
                              className="w-full bg-purple-50 hover:bg-purple-100 transition-colors p-4 flex items-center justify-between gap-4"
                            >
                              <div className="flex-1 text-left">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-lg">
                                    BUỔI {sessionNumber}/{maxSessions}
                                  </div>
                                  <div className="text-sm font-bold text-purple-900">
                                    Gói: {treatmentName}
                                  </div>
                                </div>
                                <div className="text-sm text-purple-700 flex items-center gap-4">
                                  <span>{servicesInSession.length} dịch vụ/sản phẩm</span>
                                  {sessionDuration > 0 && <span>• {sessionDuration} phút</span>}
                                  {sessionTechnicians.length > 0 && <span>• KTV: {sessionTechnicians.join(', ')}</span>}
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                {isExpanded ? (
                                  <ChevronUp className="w-5 h-5 text-purple-700" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-purple-700" />
                                )}
                              </div>
                            </button>
                            
                            {/* Session Content - Expanded */}
                            {isExpanded && (
                              <div className="border-t-2 border-purple-200 bg-white p-4">
                                <div className="space-y-4">
                                  {servicesInSession.map((service, serviceIndex) => {
                                    return (
                                      <div key={serviceIndex} className={`${serviceIndex > 0 ? 'pt-4 border-t border-gray-200' : ''}`}>
                                        {/* Service/Product header */}
                                        <div className="text-xs font-bold text-gray-500 mb-3">
                                          {service.productType === 'product' ? 'SẢN PHẨM' : 'DỊCH VỤ'} {serviceIndex + 1}
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                          <div className="bg-gray-50 rounded-xl p-3 md:col-span-2">
                                            <div className="text-sm text-gray-600 mb-1">Tên {service.productType === 'product' ? 'sản phẩm' : 'dịch vụ'}</div>
                                            <div className="font-semibold text-gray-900">{service.productName}</div>
                                          </div>
                                          
                                          {service.duration ? (
                                            <div className="bg-gray-50 rounded-xl p-3">
                                              <div className="text-sm text-gray-600 mb-1">Thời lượng</div>
                                              <div className="font-semibold text-gray-900">{service.duration} phút</div>
                                            </div>
                                          ) : null}
                                          
                                          {service.technicianNames && service.technicianNames.length > 0 && (
                                            <div className="bg-purple-50 border border-purple-300 rounded-xl p-3 md:col-span-2">
                                              <div className="text-sm text-purple-700 mb-1 font-semibold">Kỹ thuật viên</div>
                                              <div className="text-purple-900 font-medium">{service.technicianNames.join(', ')}</div>
                                            </div>
                                          )}
                                          
                                          {service.bedName && (
                                            <div className="bg-green-50 border border-green-300 rounded-xl p-3 md:col-span-2">
                                              <div className="text-sm text-green-700 mb-1 font-semibold">Giường</div>
                                              <div className="text-green-900 font-medium">{service.bedName}</div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      
                      {/* Regular Services (non-treatment) */}
                      {regularServices.map((appointmentService, index) => {
                        const productDetail = products.find(p => p.id === appointmentService.productId);
                        
                        return (
                          <div key={`regular-${index}`} className={`${(Object.keys(sessionGroups).length > 0 || index > 0) ? 'pt-6 border-t-2 border-gray-100' : ''}`}>
                            {regularServices.length > 1 && (
                              <div className="text-xs font-bold text-gray-500 mb-3">DỊCH VỤ {index + 1}</div>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
                                <div className="text-sm text-gray-600 mb-1">Tên dịch vụ</div>
                                <div className="font-semibold text-gray-900 text-base">
                                  {appointmentService.productName}
                                </div>
                              </div>

                              <div className="bg-gray-50 rounded-xl p-4">
                                <div className="text-sm text-gray-600 mb-1">Loại dịch vụ</div>
                                <div className="font-semibold text-gray-900 text-base">
                                  {appointmentService.productType === 'service' ? 'Dịch vụ' : appointmentService.productType === 'treatment' ? 'Liệu trình' : 'Sản phẩm'}
                                </div>
                              </div>

                              {appointmentService.duration && (
                                <div className="bg-gray-50 rounded-xl p-4">
                                  <div className="text-sm text-gray-600 mb-1">Thời lượng</div>
                                  <div className="font-semibold text-gray-900 text-base">{appointmentService.duration} phút</div>
                                </div>
                              )}

                              {productDetail?.category && (
                                <div className="bg-gray-50 rounded-xl p-4">
                                  <div className="text-sm text-gray-600 mb-1">Danh mục</div>
                                  <div className="font-semibold text-gray-900 text-base">{productDetail.category}</div>
                                </div>
                              )}

                              {productDetail?.barcode && (
                                <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
                                  <div className="text-sm text-gray-600 mb-1">Mã sản phẩm</div>
                                  <div className="font-mono text-gray-900 text-base">{productDetail.barcode}</div>
                                </div>
                              )}

                              {productDetail?.description && (
                                <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
                                  <div className="text-sm text-gray-600 mb-1">Mô tả</div>
                                  <div className="text-gray-900 text-base leading-relaxed">{productDetail.description}</div>
                                </div>
                              )}

                              {appointmentService.technicianNames && appointmentService.technicianNames.length > 0 && (
                                <div className="rounded-xl p-4 md:col-span-2 border bg-blue-50 border-blue-200">
                                  <div className="text-sm mb-1 font-semibold text-blue-700">
                                    Kỹ thuật viên phụ trách
                                  </div>
                                  <div className="text-base font-medium text-blue-900">
                                    {appointmentService.technicianNames.join(', ')}
                                  </div>
                                </div>
                              )}
                              
                              {appointmentService.bedName && (
                                <div className="rounded-xl p-4 md:col-span-2 border bg-green-50 border-green-200">
                                  <div className="text-sm mb-1 font-semibold text-green-700">
                                    Giường
                                  </div>
                                  <div className="text-base font-medium text-green-900">
                                    {appointmentService.bedName}
                                  </div>
                                </div>
                              )}

                              {appointmentService.productType !== 'product' && appointmentService.startTime && appointmentService.endTime && (
                                <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
                                  <div className="text-sm text-gray-600 mb-1">Khung giờ thực hiện</div>
                                  <div className="text-gray-900 text-base font-semibold">
                                    {appointmentService.startTime} - {appointmentService.endTime}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right Column - Summary (1/3) */}
            <div className="space-y-6">
              {/* Status Card */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                <h3 className="text-base font-bold text-gray-900 mb-4">Trạng thái</h3>
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl border-2 ${statusInfo.color} flex items-center gap-3`}>
                    <StatusIcon className={`w-6 h-6 ${statusInfo.iconColor} flex-shrink-0`} />
                    <div className="flex-1">
                      <div className="font-bold text-base">{statusInfo.label}</div>
                    </div>
                  </div>

                  {/* Removed cancelled status notification banner */}
                </div>
              </div>

              {/* Quick Info */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                <h3 className="text-base font-bold text-gray-900 mb-4">Thông tin nhanh</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-sm text-gray-600">Mã lịch hẹn</span>
                    <span className="font-mono text-sm font-semibold text-gray-900 text-right break-all text-[16px]">
                      {appointment.code}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-sm text-gray-600">Người tạo</span>
                    <span className="text-sm font-semibold text-gray-900 text-right text-[16px]">
                      {appointment.createdBy || 'Hệ thống'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}