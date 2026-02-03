import { useStore } from '../../../../lib/spa-lib/store';
import { useTranslation } from '../../../../lib/spa-lib/useTranslation';
import { Calendar, Clock, CheckCircle2, AlertCircle, User, Phone } from 'lucide-react';
import { useMemo } from 'react';

interface TechnicianDashboardProps {
  currentUser: string;
}

export function TechnicianDashboard({ currentUser }: TechnicianDashboardProps) {
  const { appointments, users } = useStore();
  const { language } = useTranslation();

  // Get current technician
  const currentTechnician = useMemo(() => {
    return users.find(u => u.username === currentUser);
  }, [users, currentUser]);

  // Get appointments for this technician
  const technicianAppointments = useMemo(() => {
    if (!currentTechnician) return [];
    
    return appointments.filter(apt => {
      // Check if technician is assigned to any service in this appointment
      return apt.services.some(service => 
        service.technicianIds?.includes(currentTechnician.id)
      );
    }).sort((a, b) => {
      // Sort by date and time
      const dateCompare = a.appointmentDate.localeCompare(b.appointmentDate);
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });
  }, [appointments, currentTechnician]);

  // Get today's date
  const today = new Date().toISOString().split('T')[0];

  // Filter appointments by time
  const todayAppointments = useMemo(() => {
    return technicianAppointments.filter(apt => apt.appointmentDate === today);
  }, [technicianAppointments, today]);

  const upcomingAppointments = useMemo(() => {
    return technicianAppointments.filter(apt => apt.appointmentDate > today);
  }, [technicianAppointments, today]);

  const completedAppointments = useMemo(() => {
    return technicianAppointments.filter(apt => 
      apt.status === 'completed'
    );
  }, [technicianAppointments]);

  const cancelledAppointments = useMemo(() => {
    return technicianAppointments.filter(apt => 
      apt.status === 'cancelled'
    );
  }, [technicianAppointments]);

  // Format time display
  const formatTime = (time: string) => {
    return time; // Already in HH:mm format
  };

  // Format date display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return date.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', options);
  };

  // Get current time
  const currentTime = new Date().toTimeString().slice(0, 5); // HH:mm format

  // Get next appointment
  const nextAppointment = useMemo(() => {
    const now = new Date();
    const currentDateStr = now.toISOString().split('T')[0];
    const currentTimeStr = now.toTimeString().slice(0, 5);

    return technicianAppointments.find(apt => {
      if (apt.status === 'completed' || apt.status === 'cancelled') return false;
      
      if (apt.appointmentDate > currentDateStr) return true;
      if (apt.appointmentDate === currentDateStr && apt.startTime >= currentTimeStr) return true;
      return false;
    });
  }, [technicianAppointments]);

  return (
    <div className="h-full overflow-y-auto bg-gray-50 pb-24">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {language === 'vi' ? 'Bảng điều khiển kỹ thuật viên' : 'Technician Dashboard'}
          </h1>
          <p className="text-gray-600">
            {language === 'vi' 
              ? `Chào mừng, ${currentTechnician?.fullName || currentUser}` 
              : `Welcome, ${currentTechnician?.fullName || currentUser}`}
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Today's Appointments */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{todayAppointments.length}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">
              {language === 'vi' ? 'Lịch hẹn hôm nay' : 'Today\'s Appointments'}
            </h3>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                <Clock className="w-6 h-6 text-[#FE7410]" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{upcomingAppointments.length}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">
              {language === 'vi' ? 'Lịch hẹn sắp tới' : 'Upcoming Appointments'}
            </h3>
          </div>

          {/* Completed */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{completedAppointments.length}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">
              {language === 'vi' ? 'Đã hoàn thành' : 'Completed'}
            </h3>
          </div>

          {/* Cancelled */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{cancelledAppointments.length}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">
              {language === 'vi' ? 'Đã hủy' : 'Cancelled'}
            </h3>
          </div>
        </div>

        {/* Next Appointment Highlight */}
        {nextAppointment && (
          <div className="bg-gradient-to-r from-[#FE7410] to-orange-500 rounded-2xl p-6 mb-8 text-white">
            <h2 className="text-lg font-bold mb-4">
              {language === 'vi' ? '🔔 Lịch hẹn tiếp theo' : '🔔 Next Appointment'}
            </h2>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4" />
                    <span className="font-semibold">{nextAppointment.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{nextAppointment.customerPhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{formatDate(nextAppointment.appointmentDate)}</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{formatTime(nextAppointment.startTime)} - {formatTime(nextAppointment.endTime)}</span>
                  </div>
                  <div className="mt-2">
                    <div className="text-xs font-medium mb-1">
                      {language === 'vi' ? 'Dịch vụ:' : 'Services:'}
                    </div>
                    {nextAppointment.services
                      .filter(s => s.technicianIds?.includes(currentTechnician?.id || ''))
                      .map((service, idx) => (
                        <div key={idx} className="text-sm bg-white/10 rounded px-2 py-1 mb-1">
                          {service.productName} ({service.duration} {language === 'vi' ? 'phút' : 'mins'})
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Today's Schedule */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#FE7410]" />
            {language === 'vi' ? 'Lịch trình hôm nay' : 'Today\'s Schedule'}
          </h2>

          {todayAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {language === 'vi' ? 'Không có lịch hẹn nào hôm nay' : 'No appointments today'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayAppointments.map((apt) => {
                const isPast = apt.endTime < currentTime;
                const isNow = apt.startTime <= currentTime && apt.endTime >= currentTime;
                const isCancelled = apt.status === 'cancelled';
                const isCompleted = apt.status === 'completed';

                return (
                  <div
                    key={apt.id}
                    className={`border-2 rounded-xl p-4 transition-all ${
                      isCancelled
                        ? 'border-red-200 bg-red-50 opacity-60'
                        : isCompleted
                        ? 'border-green-200 bg-green-50'
                        : isNow
                        ? 'border-[#FE7410] bg-orange-50 shadow-md'
                        : isPast
                        ? 'border-gray-200 bg-gray-50 opacity-60'
                        : 'border-gray-200 bg-white hover:border-[#FE7410] hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900">{apt.customerName}</span>
                          {isNow && (
                            <span className="text-xs font-medium px-2 py-1 bg-[#FE7410] text-white rounded">
                              {language === 'vi' ? 'ĐANG DIỄN RA' : 'ONGOING'}
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-xs font-medium px-2 py-1 bg-green-600 text-white rounded">
                              {language === 'vi' ? 'HOÀN THÀNH' : 'COMPLETED'}
                            </span>
                          )}
                          {isCancelled && (
                            <span className="text-xs font-medium px-2 py-1 bg-red-600 text-white rounded">
                              {language === 'vi' ? 'ĐÃ HỦY' : 'CANCELLED'}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          <Phone className="w-3 h-3 inline mr-1" />
                          {apt.customerPhone}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#FE7410] mb-1">
                          {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {apt.code}
                        </div>
                      </div>
                    </div>

                    {/* Services for this technician */}
                    <div className="border-t pt-3">
                      <div className="text-xs font-medium text-gray-600 mb-2">
                        {language === 'vi' ? 'Dịch vụ của bạn:' : 'Your Services:'}
                      </div>
                      <div className="space-y-1">
                        {apt.services
                          .filter(s => s.technicianIds?.includes(currentTechnician?.id || ''))
                          .map((service, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 rounded px-3 py-2">
                              <span className="font-medium text-gray-900">{service.productName}</span>
                              <div className="flex items-center gap-3 text-gray-600">
                                <span>
                                  {formatTime(service.startTime)} - {formatTime(service.endTime)}
                                </span>
                                <span className="text-xs">
                                  {service.duration} {language === 'vi' ? 'phút' : 'mins'}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {apt.notes && (
                      <div className="mt-3 text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded px-3 py-2">
                        <span className="font-medium">{language === 'vi' ? 'Ghi chú:' : 'Note:'}</span> {apt.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Appointments (Next 7 Days) */}
        {upcomingAppointments.length > 0 && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#FE7410]" />
              {language === 'vi' ? 'Lịch hẹn sắp tới (7 ngày)' : 'Upcoming Appointments (7 Days)'}
            </h2>

            <div className="space-y-3">
              {upcomingAppointments.slice(0, 10).map((apt) => (
                <div
                  key={apt.id}
                  className="border-2 border-gray-200 rounded-xl p-4 hover:border-[#FE7410] hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 mb-1">{apt.customerName}</div>
                      <div className="text-sm text-gray-600 mb-2">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {formatDate(apt.appointmentDate)}
                      </div>
                      <div className="text-sm">
                        {apt.services
                          .filter(s => s.technicianIds?.includes(currentTechnician?.id || ''))
                          .map((service, idx) => (
                            <span key={idx} className="inline-block bg-gray-100 rounded px-2 py-1 mr-2 mb-1 text-xs">
                              {service.productName}
                            </span>
                          ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#FE7410]">
                        {formatTime(apt.startTime)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {apt.code}
                      </div>
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
}
