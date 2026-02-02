import { X, User, Mail, Calendar, LogOut } from 'lucide-react';
import { useTranslation } from '../../../../lib/restaurant-lib/useTranslation';
import { useStore } from '../../../../lib/restaurant-lib/store';
import { useState } from 'react';
import { ProfileManagement } from '../../pages/users/ProfileManagement';

interface ProfileMenuProps {
  onClose: () => void;
  onLogout: () => void;
}

export function ProfileMenu({ onClose, onLogout }: ProfileMenuProps) {
  const { t } = useTranslation();
  const { language, selectedIndustry } = useStore();
  
  // State for profile management modal
  const [showProfileManagement, setShowProfileManagement] = useState(false);
  const [profileView, setProfileView] = useState<'profile' | 'password' | 'settings'>('profile');
  
  // Get current user info from localStorage
  const currentUser = localStorage.getItem('salepa_username') || 'user';
  const role = localStorage.getItem('salepa_userRole') as 'admin' | 'cashier' | 'technician' || 'admin';
  
  // Set role display name, email based on role
  let roleName = '';
  let email = '';
  
  if (role === 'admin') {
    roleName = t.roleAdmin;
    email = 'admin@salepa.vn';
  } else if (role === 'cashier') {
    roleName = t.roleCashier;
    email = 'cashier@salepa.vn';
  } else if (role === 'technician') {
    // Different name based on industry
    if (selectedIndustry === 'food-beverage') {
      roleName = t.roleKitchenStaff;
    } else {
      roleName = t.roleTechnician;
    }
    email = 'technician@salepa.vn';
  }
  
  const handleLogout = () => {
   const confirmLogout = window.confirm(
      language === 'vi'
        ? 'Bạn có chắc chắn muốn đăng xuất?'
        : 'Are you sure you want to logout?'
    );

    if (!confirmLogout) return;

    // ✅ Clear auth & related data
    localStorage.removeItem('auth');
    localStorage.removeItem('salepa_username');
    localStorage.removeItem('salepa_userRole');

    // (nếu có thêm token khác thì clear ở đây)
    // localStorage.removeItem('access_token');
    // localStorage.removeItem('refresh_token');

    onLogout(); // thường là navigate('/login')
    onClose();
  };
  
  const handleOpenProfile = (view: 'profile' | 'password' | 'settings') => {
    setProfileView(view);
    setShowProfileManagement(true);
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/20 z-[9998]"
        onClick={onClose}
      />

      {/* Menu Popup */}
      <div className="fixed bottom-20 left-4 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 z-[9999] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FE7410] to-[#FF8C3A] p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-2xl font-bold border-2 border-white/30">
                A
              </div>
              <div>
                <div className="font-bold text-lg">{currentUser.charAt(0).toUpperCase() + currentUser.slice(1)}</div>
                <div className="text-sm text-white/90">{roleName}</div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="text-sm text-white/90">{email}</div>
        </div>

        {/* Menu Items */}
        <div className="p-2">
          <button
            onClick={() => handleOpenProfile('profile')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <User className="w-5 h-5 text-gray-600" />
            <div>
              <div className="text-[16px] text-gray-900">{language === 'vi' ? 'Hồ sơ cá nhân' : 'My Profile'}</div>
              <div className="text-xs text-gray-500">{language === 'vi' ? 'Xem thông tin tài khoản' : 'View account details'}</div>
            </div>
          </button>

          <button
            onClick={() => handleOpenProfile('password')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <Mail className="w-5 h-5 text-gray-600" />
            <div>
              <div className="text-[16px] text-gray-900">{language === 'vi' ? 'Đổi mật khẩu' : 'Change Password'}</div>
              <div className="text-xs text-gray-500">{language === 'vi' ? 'Cập nhật mật khẩu mới' : 'Update your password'}</div>
            </div>
          </button>

          <button
            onClick={() => handleOpenProfile('settings')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <Calendar className="w-5 h-5 text-gray-600" />
            <div>
              <div className="text-[16px] text-gray-900">{language === 'vi' ? 'Cài đặt tài khoản' : 'Account Settings'}</div>
              <div className="text-xs text-gray-500">{language === 'vi' ? 'Tùy chỉnh tài khoản' : 'Customize your account'}</div>
            </div>
          </button>

          <div className="border-t border-gray-200 my-2"></div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors text-left group"
          >
            <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-600" />
            <div>
              <div className="text-[16px] text-gray-900 group-hover:text-red-600">{language === 'vi' ? 'Đăng xuất' : 'Logout'}</div>
              <div className="text-xs text-gray-500">{language === 'vi' ? 'Thoát khỏi hệ thống' : 'Sign out of your account'}</div>
            </div>
          </button>
        </div>
      </div>
      
      {/* Profile Management Modal */}
      {showProfileManagement && (
        <ProfileManagement
          onClose={() => setShowProfileManagement(false)}
          view={profileView}
        />
      )}
    </>
  );
}

export default ProfileMenu;