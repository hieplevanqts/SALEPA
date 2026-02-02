import { useState } from 'react';
import { Eye, EyeOff, Lock, User, ArrowRight, Crown, Wallet, ChefHat, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { useTranslation } from '../../../../lib/restaurant-lib/useTranslation';
import { useStore } from '../../../../lib/restaurant-lib/store';
import logoImage from '../../../../assets/5674d75012c6e5648856a4090ea134ccbacf662e.png';
type UserRole = 'admin' | 'cashier' | 'technician';
export interface LoginPayload {
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
  const { selectedIndustry } = useStore();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Register form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const handleSubmit = (e: React.FormEvent) => {
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
    // Handle registration logic here
    if (fullName && email && registerUsername && registerPassword && confirmPassword) {
      if (registerPassword === confirmPassword) {
        // Registration successful - auto login as cashier role by default
        onLogin({
          username: registerUsername,
          password: registerPassword,
          rememberMe: false,
          role: 'cashier',
        });
      }
    }
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
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#FE7410] px-8 py-8 text-center">
            <div className="flex justify-center">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
                <img 
                  src={logoImage} 
                  alt="Salepa Logo" 
                  className="h-16 object-contain"
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'login' 
                  ? 'text-[#FE7410]' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Đăng nhập
              {activeTab === 'login' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FE7410]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'register' 
                  ? 'text-[#FE7410]' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Đăng ký
              {activeTab === 'register' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FE7410]" />
              )}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={activeTab === 'login' ? handleSubmit : handleRegister} className="p-8 space-y-5">
            {activeTab === 'login' ? (
              <>
                {/* Login Form */}
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên đăng nhập
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Nhập tên đăng nhập"
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FE7410] focus:ring-1 focus:ring-[#FE7410] transition-colors"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FE7410] focus:ring-1 focus:ring-[#FE7410] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember me & Forgot password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[#FE7410] focus:ring-[#FE7410]"
                    />
                    <span className="text-sm text-gray-700">Ghi nhớ đăng nhập</span>
                  </label>
                  <button
                    type="button"
                    className="text-sm text-[#FE7410] hover:text-[#E56609] transition-colors font-medium"
                  >
                    Quên mật khẩu?
                  </button>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full bg-[#FE7410] text-white py-3.5 rounded-xl font-semibold hover:bg-[#E56609] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <span>Đăng nhập</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                {/* Quick Login Section */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-center text-sm text-gray-500 mb-4">
                    Hoặc đăng nhập nhanh
                  </p>
                  
                  <div className="space-y-3">
                    {/* Admin */}
                    <button
                      type="button"
                      onClick={() => quickLogin('admin')}
                      className="w-full flex items-center gap-3 p-4 border border-purple-200 rounded-xl hover:bg-purple-50 hover:border-purple-300 transition-all group"
                    >
                      <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-gray-900">Quản trị</div>
                        <div className="text-xs text-gray-500">Toàn quyền truy cập hệ thống</div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                    </button>

                    {/* Cashier */}
                    <button
                      type="button"
                      onClick={() => quickLogin('cashier')}
                      className="w-full flex items-center gap-3 p-4 border border-orange-200 rounded-xl hover:bg-orange-50 hover:border-orange-300 transition-all group"
                    >
                      <div className="w-10 h-10 bg-[#FE7410] rounded-xl flex items-center justify-center flex-shrink-0">
                        <Wallet className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-gray-900">Thu ngân</div>
                        <div className="text-xs text-gray-500">Bán hàng và xem thông tin cơ bản</div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#FE7410] group-hover:translate-x-1 transition-all" />
                    </button>

                    {/* Kitchen Staff (Đội bếp for F&B, Kỹ thuật viên for Spa) */}
                    <button
                      type="button"
                      onClick={() => quickLogin('technician')}
                      className="w-full flex items-center gap-3 p-4 border border-green-200 rounded-xl hover:bg-green-50 hover:border-green-300 transition-all group"
                    >
                      <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <ChefHat className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-gray-900">
                          {selectedIndustry === 'food-beverage' ? 'Đội bếp' : 'Kỹ thuật viên'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {selectedIndustry === 'food-beverage' 
                            ? 'Xem đơn hàng và quản lý bếp' 
                            : 'Thực hiện dịch vụ và chăm sóc khách'}
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Register Form */}
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nhập họ và tên"
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FE7410] focus:ring-1 focus:ring-[#FE7410] transition-colors"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FE7410] focus:ring-1 focus:ring-[#FE7410] transition-colors"
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên đăng nhập
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={registerUsername}
                      onChange={(e) => setRegisterUsername(e.target.value)}
                      placeholder="Nhập tên đăng nhập"
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FE7410] focus:ring-1 focus:ring-[#FE7410] transition-colors"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FE7410] focus:ring-1 focus:ring-[#FE7410] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showRegisterPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FE7410] focus:ring-1 focus:ring-[#FE7410] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full bg-[#FE7410] text-white py-3.5 rounded-xl font-semibold hover:bg-[#E56609] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Đăng ký tài khoản</span>
                </button>

                {/* Terms text */}
                <p className="text-xs text-center text-gray-500 leading-relaxed">
                  Bằng việc đăng ký, bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật của Salepa
                </p>
              </>
            )}
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          © 2024 Salepa POS. Bản quyền thuộc về Salepa.
        </p>
      </div>
    </div>
  );
}

export default LoginScreen;