import { useState } from 'react';
import { X, User, Mail, Lock, Eye, EyeOff, Save } from 'lucide-react';
import { useTranslation } from '../../../../lib/restaurant-lib/useTranslation';
import { useStore } from '../../../../lib/restaurant-lib/store';

interface ProfileManagementProps {
  onClose: () => void;
  view: 'profile' | 'password' | 'settings';
}

export function ProfileManagement({ onClose, view }: ProfileManagementProps) {
  const { t, language } = useTranslation();
  const { selectedIndustry } = useStore();
  
  // Get current user info
  const currentUser = localStorage.getItem('salepa_username') || 'admin';
  const role = localStorage.getItem('salepa_userRole') as 'admin' | 'cashier' | 'technician' || 'admin';
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    fullName: currentUser.charAt(0).toUpperCase() + currentUser.slice(1),
    email: `${currentUser}@salepa.vn`,
    phone: '+84 123 456 789',
  });
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Settings state
  const [settingsData, setSettingsData] = useState({
    emailNotifications: true,
    pushNotifications: false,
    soundEffects: true,
    autoSave: true,
  });
  
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validate
    if (!profileData.fullName.trim()) {
      setError(language === 'vi' ? 'Vui lòng nhập họ tên' : 'Please enter full name');
      return;
    }
    
    if (!profileData.email.trim() || !profileData.email.includes('@')) {
      setError(language === 'vi' ? 'Vui lòng nhập email hợp lệ' : 'Please enter a valid email');
      return;
    }
    
    // Save to localStorage
    localStorage.setItem('salepa_profile', JSON.stringify(profileData));
    setSuccess(language === 'vi' ? 'Cập nhật hồ sơ thành công!' : 'Profile updated successfully!');
    
    setTimeout(() => {
      setSuccess('');
    }, 3000);
  };
  
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validate
    if (!passwordData.currentPassword) {
      setError(language === 'vi' ? 'Vui lòng nhập mật khẩu hiện tại' : 'Please enter current password');
      return;
    }
    
    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      setError(language === 'vi' ? 'Mật khẩu mới phải có ít nhất 6 ký tự' : 'New password must be at least 6 characters');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError(language === 'vi' ? 'Mật khẩu xác nhận không khớp' : 'Passwords do not match');
      return;
    }
    
    // Save new password
    localStorage.setItem('salepa_password', passwordData.newPassword);
    setSuccess(language === 'vi' ? 'Đổi mật khẩu thành công!' : 'Password changed successfully!');
    
    // Reset form
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    
    setTimeout(() => {
      setSuccess('');
    }, 3000);
  };
  
  const handleSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save settings
    localStorage.setItem('salepa_settings', JSON.stringify(settingsData));
    setSuccess(language === 'vi' ? 'Cài đặt đã được lưu!' : 'Settings saved successfully!');
    
    setTimeout(() => {
      setSuccess('');
    }, 3000);
  };
  
  const getTitle = () => {
    switch (view) {
      case 'profile':
        return language === 'vi' ? 'Hồ sơ cá nhân' : 'My Profile';
      case 'password':
        return language === 'vi' ? 'Đổi mật khẩu' : 'Change Password';
      case 'settings':
        return language === 'vi' ? 'Cài đặt tài khoản' : 'Account Settings';
    }
  };
  
  const getRoleName = () => {
    if (role === 'admin') {
      return language === 'vi' ? 'Quản trị viên' : 'Administrator';
    } else if (role === 'cashier') {
      return language === 'vi' ? 'Thu ngân' : 'Cashier';
    } else if (role === 'technician') {
      if (selectedIndustry === 'food-beverage') {
        return language === 'vi' ? 'Đội bếp' : 'Kitchen Staff';
      }
      return language === 'vi' ? 'Kỹ thuật viên' : 'Technician';
    }
    return '';
  };
  
  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-[9998]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#FE7410] to-[#FF8C3A] p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{getTitle()}</h2>
                <p className="text-sm text-white/90 mt-1">{getRoleName()}</p>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          {/* Body */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
            {/* Success/Error Messages */}
            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                {success}
              </div>
            )}
            
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}
            
            {/* Profile View */}
            {view === 'profile' && (
              <form onSubmit={handleProfileSave} className="space-y-5">
                {/* Avatar */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#FE7410] to-[#FF8C3A] rounded-full flex items-center justify-center text-white text-4xl font-bold">
                      {currentUser.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>
                
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'vi' ? 'Họ và tên' : 'Full Name'} *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                      placeholder={language === 'vi' ? 'Nhập họ và tên' : 'Enter full name'}
                    />
                  </div>
                </div>
                
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
                
                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'vi' ? 'Số điện thoại' : 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                    placeholder="+84 123 456 789"
                  />
                </div>
                
                {/* Role (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'vi' ? 'Vai trò' : 'Role'}
                  </label>
                  <input
                    type="text"
                    value={getRoleName()}
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
                
                {/* Save Button */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {language === 'vi' ? 'Hủy' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#FE7410] text-white rounded-lg hover:bg-[#E56809] transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {language === 'vi' ? 'Lưu thay đổi' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
            
            {/* Password View */}
            {view === 'password' && (
              <form onSubmit={handlePasswordChange} className="space-y-5">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'vi' ? 'Mật khẩu hiện tại' : 'Current Password'} *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'vi' ? 'Mật khẩu mới' : 'New Password'} *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'vi' ? 'Ít nhất 6 ký tự' : 'At least 6 characters'}
                  </p>
                </div>
                
                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'vi' ? 'Xác nhận mật khẩu mới' : 'Confirm New Password'} *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                {/* Save Button */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {language === 'vi' ? 'Hủy' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#FE7410] text-white rounded-lg hover:bg-[#E56809] transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {language === 'vi' ? 'Đổi mật khẩu' : 'Change Password'}
                  </button>
                </div>
              </form>
            )}
            
            {/* Settings View */}
            {view === 'settings' && (
              <form onSubmit={handleSettingsSave} className="space-y-5">
                <div className="space-y-4">
                  {/* Email Notifications */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {language === 'vi' ? 'Thông báo email' : 'Email Notifications'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {language === 'vi' ? 'Nhận thông báo qua email' : 'Receive notifications via email'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsData.emailNotifications}
                        onChange={(e) => setSettingsData({ ...settingsData, emailNotifications: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FE7410]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FE7410]"></div>
                    </label>
                  </div>
                  
                  {/* Push Notifications */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {language === 'vi' ? 'Thông báo đẩy' : 'Push Notifications'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {language === 'vi' ? 'Nhận thông báo trên trình duyệt' : 'Receive browser push notifications'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsData.pushNotifications}
                        onChange={(e) => setSettingsData({ ...settingsData, pushNotifications: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FE7410]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FE7410]"></div>
                    </label>
                  </div>
                  
                  {/* Sound Effects */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {language === 'vi' ? 'Âm thanh' : 'Sound Effects'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {language === 'vi' ? 'Bật âm thanh thông báo' : 'Enable notification sounds'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsData.soundEffects}
                        onChange={(e) => setSettingsData({ ...settingsData, soundEffects: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FE7410]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FE7410]"></div>
                    </label>
                  </div>
                  
                  {/* Auto Save */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {language === 'vi' ? 'Tự động lưu' : 'Auto Save'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {language === 'vi' ? 'Tự động lưu thay đổi' : 'Automatically save changes'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsData.autoSave}
                        onChange={(e) => setSettingsData({ ...settingsData, autoSave: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FE7410]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FE7410]"></div>
                    </label>
                  </div>
                </div>
                
                {/* Save Button */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {language === 'vi' ? 'Hủy' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#FE7410] text-white rounded-lg hover:bg-[#E56809] transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {language === 'vi' ? 'Lưu cài đặt' : 'Save Settings'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ProfileManagement;
