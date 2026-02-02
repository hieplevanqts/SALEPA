import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, CheckCircle2, X } from 'lucide-react';
import { useTranslation } from '../../../../lib/fashion-shop-lib/useTranslation';
import logoImage from '../../../../assets/5674d75012c6e5648856a4090ea134ccbacf662e.png';

type UserRole = 'admin' | 'cashier' | 'technician';

interface LoginPayload {
  username: string;
  password?: string;
  rememberMe: boolean;
  role: UserRole;
}
interface LoginScreenProps {
  onLogin: (payload: LoginPayload) => void;
}
export function LoginScreen({ onLogin }: LoginScreenProps) {
  const { language } = useTranslation();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Register form states
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [regShowConfirmPassword, setRegShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

   if (!username || !password) {
      alert(language === 'vi'
        ? 'Vui lòng nhập đầy đủ thông tin'
        : 'Please fill in all fields');
      return;
    }

    console.log('LOGIN FORM', { username, password, selectedRole });

    onLogin({
      username,
      password,
      rememberMe,
      role: selectedRole,
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (!regFullName || !regEmail || !regUsername || !regPassword || !regConfirmPassword) {
      alert(language === 'vi' ? 'Vui lòng điền đầy đủ thông tin!' : 'Please fill in all fields!');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      alert(language === 'vi' ? 'Mật khẩu không khớp!' : 'Passwords do not match!');
      return;
    }

    if (regPassword.length < 6) {
      alert(language === 'vi' ? 'Mật khẩu phải có ít nhất 6 ký tự!' : 'Password must be at least 6 characters!');
      return;
    }

    // Success - auto login
    alert(language === 'vi' ? 'Đăng ký thành công!' : 'Registration successful!');
      onLogin({
      username: regUsername,
      password: regPassword,
      rememberMe: false,
      role: 'admin',
    });
  };
  const quickLogin = (role: UserRole) => {
    console.log('QUICK LOGIN', role);

    onLogin({
      username: role,
      password: role,
      rememberMe: true,
      role: role,
    });
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#FE7410] rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FE7410] rounded-full filter blur-3xl"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#FE7410] to-[#FF8C3A] p-8 text-white text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                <img src={logoImage} alt="Salepa Logo" className="h-16 w-auto" style={{ mixBlendMode: 'multiply' }} />
              </div>
            </div>
            
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-4 text-center text-[16px] font-medium transition-colors relative ${
                activeTab === 'login'
                  ? 'text-[#FE7410]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {language === 'vi' ? 'Đăng nhập' : 'Login'}
              {activeTab === 'login' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FE7410]"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-4 text-center text-[16px] font-medium transition-colors relative ${
                activeTab === 'register'
                  ? 'text-[#FE7410]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {language === 'vi' ? 'Đăng ký' : 'Register'}
              {activeTab === 'register' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FE7410]"></div>
              )}
            </button>
          </div>

          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="p-8 space-y-5">
              {/* Username */}
              <div>
                <label className="block text-[14px] text-gray-700 mb-2">
                  {language === 'vi' ? 'Tên đăng nhập' : 'Username'}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE7410] text-[16px]"
                    placeholder={language === 'vi' ? 'Nhập tên đăng nhập' : 'Enter username'}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[14px] text-gray-700 mb-2">
                  {language === 'vi' ? 'Mật khẩu' : 'Password'}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE7410] text-[16px]"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-[#FE7410] border-gray-300 rounded focus:ring-[#FE7410]"
                  />
                  <span className="text-[14px] text-gray-700">
                    {language === 'vi' ? 'Ghi nhớ đăng nhập' : 'Remember me'}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-[14px] text-[#FE7410] hover:underline"
                >
                  {language === 'vi' ? 'Quên mật khẩu?' : 'Forgot password?'}
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full bg-[#FE7410] text-white py-3 rounded-lg hover:bg-[#E66A0F] transition-colors text-[16px] font-medium flex items-center justify-center gap-2 group"
              >
                {language === 'vi' ? 'Đăng nhập' : 'Login'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Quick Login Demo Accounts */}
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      {language === 'vi' ? 'Hoặc đăng nhập nhanh' : 'Or quick login'}
                    </span>
                  </div>
                </div>

                {/* Admin Role */}
                <button
                  type="button"
                  onClick={() => quickLogin('admin')}
                  className="w-full flex items-center gap-3 px-4 py-3 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                    👑
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-[16px] font-medium text-gray-900">
                      {language === 'vi' ? 'Quản trị' : 'Administrator'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {language === 'vi' ? 'Toàn quyền truy cập hệ thống' : 'Full system access'}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                </button>

                {/* Cashier Role */}
                <button
                  type="button"
                     onClick={() => quickLogin('cashier')}
                  className="w-full flex items-center gap-3 px-4 py-3 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-[#FE7410] to-[#FF8C3A] rounded-lg flex items-center justify-center text-white font-bold">
                    💰
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-[16px] font-medium text-gray-900">
                      {language === 'vi' ? 'Thu ngân' : 'Cashier'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {language === 'vi' ? 'Bán hàng và xem thông tin cơ bản' : 'Sales and basic info'}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#FE7410] group-hover:translate-x-1 transition-all" />
                </button>

                {/* Technician Role */}
                <button
                  type="button"
                     onClick={() => quickLogin('technician')}
                  className="w-full flex items-center gap-3 px-4 py-3 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white font-bold">
                    🛠️
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-[16px] font-medium text-gray-900">
                      {language === 'vi' ? 'Kỹ thuật viên' : 'Technician'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {language === 'vi' ? 'Xem sản phẩm và lịch hẹn' : 'View products & appointments'}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                </button>
              </div>

              {/* Demo Info */}
              
            </form>
          )}

          {/* Register Form */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="p-8 space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-[14px] text-gray-700 mb-2">
                  {language === 'vi' ? 'Họ và tên' : 'Full Name'}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE7410] text-[16px]"
                    placeholder={language === 'vi' ? 'Nhập họ và tên' : 'Enter full name'}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[14px] text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE7410] text-[16px]"
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-[14px] text-gray-700 mb-2">
                  {language === 'vi' ? 'Tên đăng nhập' : 'Username'}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE7410] text-[16px]"
                    placeholder={language === 'vi' ? 'Nhập tên đăng nhập' : 'Enter username'}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[14px] text-gray-700 mb-2">
                  {language === 'vi' ? 'Mật khẩu' : 'Password'}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={regShowPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE7410] text-[16px]"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setRegShowPassword(!regShowPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {regShowPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'vi' ? 'Tối thiểu 6 ký tự' : 'Minimum 6 characters'}
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[14px] text-gray-700 mb-2">
                  {language === 'vi' ? 'Xác nhận mật khẩu' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={regShowConfirmPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE7410] text-[16px]"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setRegShowConfirmPassword(!regShowConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {regShowConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                className="w-full bg-[#FE7410] text-white py-3 rounded-lg hover:bg-[#E66A0F] transition-colors text-[16px] font-medium flex items-center justify-center gap-2 group"
              >
                <CheckCircle2 className="w-5 h-5" />
                {language === 'vi' ? 'Đăng ký tài khoản' : 'Create Account'}
              </button>

              {/* Terms */}
              <p className="text-xs text-gray-500 text-center">
                {language === 'vi' 
                  ? 'Bằng việc đăng ký, bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật của Salepa'
                  : 'By registering, you agree to Salepa\'s Terms of Service and Privacy Policy'}
              </p>
            </form>
          )}

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 text-center border-t border-gray-200">
            <p className="text-xs text-gray-500">
              © 2024 Salepa POS. {language === 'vi' ? 'Bản quyền thuộc về' : 'All rights reserved'} Salepa.
            </p>
          </div>
        </div>

        {/* Version */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">
            Version 1.0.0 | {language === 'vi' ? 'Được phát triển bởi' : 'Developed by'} Salepa Team
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
      )}
    </div>
  );
}

export default LoginScreen;

// Forgot Password Modal
function ForgotPasswordModal({ onClose }: { onClose: () => void }) {
  const { language } = useTranslation();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'success'>('email');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      alert(language === 'vi' ? 'Vui lòng nhập email!' : 'Please enter your email!');
      return;
    }

    // Simulate sending reset email
    setStep('success');
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-[24px] font-bold text-gray-900">
              {language === 'vi' ? 'Quên mật khẩu' : 'Forgot Password'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          {step === 'email' ? (
            <form onSubmit={handleSubmit} className="p-6">
              <p className="text-[16px] text-gray-600 mb-4">
                {language === 'vi' 
                  ? 'Nhập địa chỉ email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.'
                  : 'Enter your email address and we\'ll send you instructions to reset your password.'}
              </p>

              <div className="mb-6">
                <label className="block text-[14px] text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE7410] text-[16px]"
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-[16px]"
                >
                  {language === 'vi' ? 'Hủy' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#FE7410] text-white rounded-lg hover:bg-[#E66A0F] transition-colors text-[16px]"
                >
                  {language === 'vi' ? 'Gửi' : 'Send'}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-[20px] font-bold text-gray-900 mb-2">
                  {language === 'vi' ? 'Email đã được gửi!' : 'Email Sent!'}
                </h3>
                <p className="text-[16px] text-gray-600">
                  {language === 'vi' 
                    ? `Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến ${email}`
                    : `We've sent password reset instructions to ${email}`}
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full px-4 py-2.5 bg-[#FE7410] text-white rounded-lg hover:bg-[#E66A0F] transition-colors text-[16px]"
              >
                {language === 'vi' ? 'Đóng' : 'Close'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}