import { User, Settings, Lock, LogOut, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from '../../../../lib/fashion-shop-lib/useTranslation';

interface ProfileMenuProps {
  onClose: () => void;
  onLogout: () => void;
}

export function ProfileMenu({ onClose, onLogout }: ProfileMenuProps) {
  const { t, language } = useTranslation();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showProfileDetails, setShowProfileDetails] = useState(false);

  // Get current user info from localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    const username = localStorage.getItem('salepa_username') || 'User';
    const role = localStorage.getItem('salepa_userRole') || 'admin';
    
    // Map role to display name
    let roleName = '';
    let email = '';
    
    if (role === 'admin') {
      roleName = language === 'vi' ? 'Quản trị viên' : 'Administrator';
      email = 'admin@salepa.vn';
    } else if (role === 'cashier') {
      roleName = language === 'vi' ? 'Thu ngân' : 'Cashier';
      email = 'cashier@salepa.vn';
    } else if (role === 'technician') {
      roleName = language === 'vi' ? 'Kỹ thuật viên' : 'Technician';
      email = 'technician@salepa.vn';
    }
    
    return {
      name: username.charAt(0).toUpperCase() + username.slice(1),
      email: email,
      role: roleName,
      phone: '0901234567',
      joinDate: '2023-01-15'
    };
  });

  // Update user info when language changes
  useEffect(() => {
    const role = localStorage.getItem('salepa_userRole') || 'admin';
    const username = localStorage.getItem('salepa_username') || 'User';
    
    let roleName = '';
    let email = '';
    
    if (role === 'admin') {
      roleName = language === 'vi' ? 'Quản trị viên' : 'Administrator';
      email = 'admin@salepa.vn';
    } else if (role === 'cashier') {
      roleName = language === 'vi' ? 'Thu ngân' : 'Cashier';
      email = 'cashier@salepa.vn';
    } else if (role === 'technician') {
      roleName = language === 'vi' ? 'Kỹ thuật viên' : 'Technician';
      email = 'technician@salepa.vn';
    }
    
    setCurrentUser({
      name: username.charAt(0).toUpperCase() + username.slice(1),
      email: email,
      role: roleName,
      phone: '0901234567',
      joinDate: '2023-01-15'
    });
  }, [language]);

  const handleLogout = () => {
    if (window.confirm(language === 'vi' ? 'Bạn có chắc chắn muốn đăng xuất?' : 'Are you sure you want to logout?')) {
      onLogout();
      onClose();
    }
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Menu Popup */}
      <div className="fixed bottom-20 left-4 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FE7410] to-[#FF8C3A] p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-2xl font-bold border-2 border-white/30">
                A
              </div>
              <div>
                <div className="font-bold text-lg">{currentUser.name}</div>
                <div className="text-sm text-white/90">{currentUser.role}</div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="text-sm text-white/90">{currentUser.email}</div>
        </div>

        {/* Menu Items */}
        <div className="p-2">
          <button
            onClick={() => setShowProfileDetails(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <User className="w-5 h-5 text-gray-600" />
            <div>
              <div className="text-[16px] text-gray-900">{language === 'vi' ? 'Hồ sơ cá nhân' : 'My Profile'}</div>
              <div className="text-xs text-gray-500">{language === 'vi' ? 'Xem thông tin tài khoản' : 'View account details'}</div>
            </div>
          </button>

          <button
            onClick={() => setShowChangePassword(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <Lock className="w-5 h-5 text-gray-600" />
            <div>
              <div className="text-[16px] text-gray-900">{language === 'vi' ? 'Đổi mật khẩu' : 'Change Password'}</div>
              <div className="text-xs text-gray-500">{language === 'vi' ? 'Cập nhật mật khẩu mới' : 'Update your password'}</div>
            </div>
          </button>

          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <Settings className="w-5 h-5 text-gray-600" />
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

      {/* Profile Details Modal */}
      {showProfileDetails && (
        <ProfileDetailsModal
          user={currentUser}
          onClose={() => setShowProfileDetails(false)}
        />
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <ChangePasswordModal
          onClose={() => setShowChangePassword(false)}
        />
      )}
    </>
  );
}

export default ProfileMenu;

// Profile Details Modal
function ProfileDetailsModal({ user, onClose }: { user: any; onClose: () => void }) {
  const { language } = useTranslation();

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-[24px] font-bold text-gray-900">
              {language === 'vi' ? 'Hồ sơ cá nhân' : 'My Profile'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-[#FE7410] to-[#FF8C3A] rounded-full flex items-center justify-center text-white text-4xl font-bold mb-3">
                A
              </div>
              <div className="text-xl font-bold text-gray-900">{user.name}</div>
              <div className="text-sm text-gray-500">{user.role}</div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[14px] text-gray-600">{language === 'vi' ? 'Email' : 'Email'}</label>
                <div className="text-[16px] text-gray-900 mt-1">{user.email}</div>
              </div>

              <div>
                <label className="text-[14px] text-gray-600">{language === 'vi' ? 'Số điện thoại' : 'Phone'}</label>
                <div className="text-[16px] text-gray-900 mt-1">{user.phone}</div>
              </div>

              <div>
                <label className="text-[14px] text-gray-600">{language === 'vi' ? 'Ngày tham gia' : 'Join Date'}</label>
                <div className="text-[16px] text-gray-900 mt-1">
                  {new Date(user.joinDate).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-[16px]"
            >
              {language === 'vi' ? 'Đóng' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Change Password Modal
function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const { language } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert(language === 'vi' ? 'Vui lòng điền đầy đủ thông tin!' : 'Please fill in all fields!');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert(language === 'vi' ? 'Mật khẩu mới không khớp!' : 'New passwords do not match!');
      return;
    }

    if (newPassword.length < 6) {
      alert(language === 'vi' ? 'Mật khẩu phải có ít nhất 6 ký tự!' : 'Password must be at least 6 characters!');
      return;
    }

    // Success
    alert(language === 'vi' ? 'Đổi mật khẩu thành công!' : 'Password changed successfully!');
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-[24px] font-bold text-gray-900">
              {language === 'vi' ? 'Đổi mật khẩu' : 'Change Password'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-[14px] text-gray-700 mb-2">
                {language === 'vi' ? 'Mật khẩu hiện tại' : 'Current Password'}
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE7410] text-[16px]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                >
                  {showCurrentPassword ? (language === 'vi' ? 'Ẩn' : 'Hide') : (language === 'vi' ? 'Hiện' : 'Show')}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[14px] text-gray-700 mb-2">
                {language === 'vi' ? 'Mật khẩu mới' : 'New Password'}
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE7410] text-[16px]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                >
                  {showNewPassword ? (language === 'vi' ? 'Ẩn' : 'Hide') : (language === 'vi' ? 'Hiện' : 'Show')}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {language === 'vi' ? 'Tối thiểu 6 ký tự' : 'Minimum 6 characters'}
              </p>
            </div>

            <div>
              <label className="block text-[14px] text-gray-700 mb-2">
                {language === 'vi' ? 'Xác nhận mật khẩu mới' : 'Confirm New Password'}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE7410] text-[16px]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                >
                  {showConfirmPassword ? (language === 'vi' ? 'Ẩn' : 'Hide') : (language === 'vi' ? 'Hiện' : 'Show')}
                </button>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                💡 {language === 'vi' ? 'Mật khẩu mạnh nên bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.' : 'A strong password should include uppercase, lowercase, numbers and special characters.'}
              </p>
            </div>
          </form>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-[16px]"
            >
              {language === 'vi' ? 'Hủy' : 'Cancel'}
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2.5 bg-[#FE7410] text-white rounded-lg hover:bg-[#E66A0F] transition-colors text-[16px]"
            >
              {language === 'vi' ? 'Đổi mật khẩu' : 'Change Password'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}