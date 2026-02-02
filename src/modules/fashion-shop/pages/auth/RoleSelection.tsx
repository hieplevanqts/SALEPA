import { useState } from 'react';
import { useTranslation } from '../../../../lib/fashion-shop-lib/useTranslation';
import { 
  Shield, DollarSign, Sparkles, Check, ArrowRight, ChevronRight 
} from 'lucide-react';

export type RoleType = 'admin' | 'cashier' | 'technician';

interface RoleSelectionProps {
  onSelect: (role: RoleType) => void;
}

export function RoleSelection({ onSelect }: RoleSelectionProps) {
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);

  const roles = [
    {
      id: 'admin' as RoleType,
      icon: Shield,
      title: t('adminRole'),
      description: t('adminRoleDesc'),
      color: 'purple',
      gradient: 'from-purple-500 to-indigo-600',
      bgGradient: 'from-purple-50 to-indigo-50',
      access: t('fullAccess'),
      features: [
        'Dashboard tổng quan',
        'Quản lý sản phẩm & dịch vụ',
        'Báo cáo & thống kê',
        'Quản lý nhân viên',
        'Cài đặt hệ thống'
      ]
    },
    {
      id: 'cashier' as RoleType,
      icon: DollarSign,
      title: t('cashierRole'),
      description: t('cashierRoleDesc'),
      color: 'green',
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50',
      access: t('limitedAccess'),
      features: [
        'Màn hình bán hàng',
        'Thanh toán & in hóa đơn',
        'Quản lý ca làm việc',
        'Xem lịch sử đơn hàng',
        'Giữ & gọi hóa đơn'
      ]
    },
    {
      id: 'technician' as RoleType,
      icon: Sparkles,
      title: t('technicianRole'),
      description: t('technicianRoleDesc'),
      color: 'pink',
      gradient: 'from-pink-500 to-rose-600',
      bgGradient: 'from-pink-50 to-rose-50',
      access: t('limitedAccess'),
      features: [
        'Xem lịch hẹn khách hàng',
        'Cập nhật trạng thái dịch vụ',
        'Quản lý khách hàng',
        'Xem sản phẩm/dịch vụ',
        'Ghi chú dịch vụ'
      ]
    },
  ];

  const handleContinue = () => {
    if (selectedRole) {
      onSelect(selectedRole);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-pink-600 via-purple-700 to-purple-600 flex items-center justify-center p-4 z-50 overflow-auto">
      {/* Background Animation */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl relative p-8 md:p-12 my-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            ✨ Spa Management System
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            {t('selectYourRole')}
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            {t('selectRoleDesc')}
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;

            return (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`relative group text-left rounded-2xl p-6 transition-all duration-300 border-2 ${ 
                  isSelected
                    ? `border-${role.color}-500 bg-gradient-to-br ${role.bgGradient} shadow-xl scale-105`
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-lg bg-white'
                }`}
              >
                {/* Selected Checkmark */}
                {isSelected && (
                  <div className={`absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br ${role.gradient} rounded-full flex items-center justify-center shadow-lg animate-bounce-slow z-10`}>
                    <Check className="w-6 h-6 text-white" />
                  </div>
                )}

                {/* Icon */}
                <div className={`w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {role.title}
                </h3>
                <div className={`inline-block text-xs font-semibold px-2 py-1 rounded-full mb-3 ${
                  role.id === 'admin' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {role.access}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {role.description}
                </p>

                {/* Features List */}
                <div className="space-y-2">
                  {role.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs text-gray-600">
                      <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 text-${role.color}-500`} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Hover Arrow */}
                <div className={`absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity`}>
                  <ChevronRight className={`w-5 h-5 text-${role.color}-500`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-center">
          <button
            onClick={handleContinue}
            disabled={!selectedRole}
            className={`flex items-center gap-2 px-10 py-4 rounded-xl font-semibold text-lg transition-all ${ 
              selectedRole
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:shadow-xl hover:scale-105'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {t('continueWithRole')}
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        {/* Note */}
        <p className="text-center text-sm text-gray-500 mt-6 flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 bg-purple-600 rounded-full"></span>
          Bạn có thể đổi vai trò bất kỳ lúc nào trong Cài Đặt
        </p>
      </div>
    </div>
  );
}