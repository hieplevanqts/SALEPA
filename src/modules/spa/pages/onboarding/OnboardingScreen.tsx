import { useState, useEffect } from 'react';
import { ArrowRight, Check, ShoppingCart, BarChart3, Users, Package, Calendar, Zap } from 'lucide-react';
import { useTranslation } from '../../../../lib/spa-lib/useTranslation';
import logoImage from '../../../../assets/5674d75012c6e5648856a4090ea134ccbacf662e.png';

interface OnboardingScreenProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export function OnboardingScreen({ onComplete, onSkip }: OnboardingScreenProps) {
  const { language } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: ShoppingCart,
      title: language === 'vi' ? 'Bán hàng nhanh chóng' : 'Fast Sales',
      description: language === 'vi' 
        ? 'Giao diện bán hàng trực quan, thanh toán nhanh chỉ trong vài giây. Hỗ trợ nhiều phương thức thanh toán.'
        : 'Intuitive sales interface with quick checkout in seconds. Support multiple payment methods.',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: Package,
      title: language === 'vi' ? 'Quản lý sản phẩm dễ dàng' : 'Easy Product Management',
      description: language === 'vi'
        ? 'Quản lý sản phẩm, dịch vụ và liệu trình chuyên ngành Spa. Hỗ trợ mã vạch, tồn kho tự động.'
        : 'Manage products, services and spa packages. Support barcode and automatic inventory.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: BarChart3,
      title: language === 'vi' ? 'Báo cáo chi tiết' : 'Detailed Reports',
      description: language === 'vi'
        ? 'Thống kê doanh thu theo nhân viên, dịch vụ, sản phẩm. Báo cáo khách hàng và tồn kho realtime.'
        : 'Revenue statistics by staff, services, products. Real-time customer and inventory reports.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Users,
      title: language === 'vi' ? 'Quản lý khách hàng' : 'Customer Management',
      description: language === 'vi'
        ? 'Lưu trữ thông tin khách hàng, lịch sử mua hàng. Chăm sóc khách hàng chuyên nghiệp.'
        : 'Store customer information and purchase history. Professional customer care.',
      gradient: 'from-green-500 to-teal-500',
    },
  ];

  // Reset currentStep if it exceeds the number of steps
  useEffect(() => {
    if (currentStep >= steps.length) {
      setCurrentStep(steps.length - 1);
    }
  }, [currentStep, steps.length]);

  const currentStepData = steps[currentStep] || steps[0];
  const StepIcon = currentStepData.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#FE7410] rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FE7410] rounded-full filter blur-3xl"></div>
      </div>

      {/* Content Card */}
      <div className="relative w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#FE7410] to-[#FF8C3A] p-8 text-white text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                <img src={logoImage} alt="Salepa Logo" className="h-16 w-auto" style={{ mixBlendMode: 'multiply' }} />
              </div>
            </div>
            <h1 className="text-[32px] font-bold mb-2">
              {language === 'vi' ? 'Chào mừng đến với Salepa POS' : 'Welcome to Salepa POS'}
            </h1>
            <p className="text-white/90 text-[16px]">
              {language === 'vi' 
                ? 'Hệ thống quản lý bán hàng chuyên nghiệp cho mọi ngành nghề' 
                : 'Professional sales management system for all industries'}
            </p>
          </div>

          {/* Main Content */}
          <div className="p-12">
            {/* Icon */}
            <div className="flex justify-center mb-8">
              <div className={`w-24 h-24 bg-gradient-to-br ${currentStepData.gradient} rounded-3xl flex items-center justify-center shadow-xl`}>
                <StepIcon className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Title & Description */}
            <div className="text-center mb-8">
              <h2 className="text-[28px] font-bold text-gray-900 mb-4">
                {currentStepData.title}
              </h2>
              <p className="text-[18px] text-gray-600 leading-relaxed max-w-xl mx-auto">
                {currentStepData.description}
              </p>
            </div>

            {/* Features List (only on last step) */}
            {currentStep === steps.length - 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-[16px]">
                      {language === 'vi' ? 'Giao diện thân thiện' : 'User-friendly Interface'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {language === 'vi' ? 'Dễ sử dụng cho mọi người' : 'Easy to use for everyone'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-[16px]">
                      {language === 'vi' ? 'Song ngữ Anh - Việt' : 'Bilingual Support'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {language === 'vi' ? 'Hỗ trợ đầy đủ 2 ngôn ngữ' : 'Full support for 2 languages'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-[16px]">
                      {language === 'vi' ? 'Phân quyền linh hoạt' : 'Flexible Permissions'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {language === 'vi' ? '3 nhóm quyền tùy chỉnh' : '3 customizable role groups'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                  <div className="w-6 h-6 bg-[#FE7410] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-[16px]">
                      {language === 'vi' ? 'Nhanh chóng' : 'Lightning Fast'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {language === 'vi' ? 'Xử lý tức thì, không chờ đợi' : 'Instant processing, no waiting'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4">
              {currentStep < steps.length - 1 ? (
                <>
                  <button
                    onClick={handleSkip}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-[16px] font-medium text-gray-700"
                  >
                    {language === 'vi' ? 'Bỏ qua' : 'Skip'}
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 px-6 py-3 bg-[#FE7410] text-white rounded-lg hover:bg-[#E66A0F] transition-colors text-[16px] font-medium flex items-center justify-center gap-2 group"
                  >
                    {language === 'vi' ? 'Tiếp theo' : 'Next'}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleNext}
                  className="w-full px-6 py-3 bg-[#FE7410] text-white rounded-lg hover:bg-[#E66A0F] transition-colors text-[16px] font-medium flex items-center justify-center gap-2 group"
                >
                  {language === 'vi' ? 'Bắt đầu sử dụng' : 'Get Started'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          </div>

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
            Version 1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}

export default OnboardingScreen;