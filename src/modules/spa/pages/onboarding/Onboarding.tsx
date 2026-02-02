import { useState } from 'react';
import { useTranslation } from '../../../../lib/spa-lib/useTranslation';
import { 
  X, ArrowRight, ArrowLeft, Check, Rocket, Store, Package,
  ShoppingCart, BarChart3, Sparkles
} from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function Onboarding({ onComplete, onSkip }: OnboardingProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Rocket,
      title: t('welcomeTitle'),
      description: t('welcomeDesc'),
      image: '🎉',
      color: 'blue',
      tips: [
        { icon: '✅', text: t('tip1') },
        { icon: '🎯', text: t('tip2') },
        { icon: '⚡', text: t('tip3') },
      ]
    },
    {
      icon: Store,
      title: t('setupStoreTitle'),
      description: t('setupStoreDesc'),
      image: '🏪',
      color: 'green',
      tips: [
        { icon: '📝', text: t('storeNameTip') },
        { icon: '📞', text: t('contactInfoTip') },
        { icon: '🧾', text: t('receiptTip') },
      ]
    },
    {
      icon: Package,
      title: t('addProductsTitle'),
      description: t('addProductsDesc'),
      image: '📦',
      color: 'purple',
      tips: [
        { icon: '➕', text: t('addOneByOne') },
        { icon: '📥', text: t('importCSV') },
        { icon: '🏷️', text: t('useBarcodes') },
      ]
    },
    {
      icon: ShoppingCart,
      title: t('makeSalesTitle'),
      description: t('makeSalesDesc'),
      image: '💰',
      color: 'orange',
      tips: [
        { icon: '🔍', text: t('searchProducts') },
        { icon: '💳', text: t('multiplePayments') },
        { icon: '🖨️', text: t('printReceipts') },
      ]
    },
    {
      icon: BarChart3,
      title: t('trackPerformanceTitle'),
      description: t('trackPerformanceDesc'),
      image: '📊',
      color: 'indigo',
      tips: [
        { icon: '📈', text: t('viewReports') },
        { icon: '💾', text: t('exportData') },
        { icon: '📅', text: t('dailyReports') },
      ]
    },
    {
      icon: Sparkles,
      title: t('readyTitle'),
      description: t('readyDesc'),
      image: '🚀',
      color: 'pink',
      tips: [
        { icon: '❓', text: t('pressF1Help') },
        { icon: '⌨️', text: t('useShortcuts') },
        { icon: '💡', text: t('tooltipsAvailable') },
      ]
    },
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-orange-500 flex items-center justify-center p-4 z-50">
      {/* Background Animation */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl relative overflow-hidden">
        {/* Skip Button */}
        <button
          onClick={onSkip}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
          <div
            className={`h-full bg-gradient-to-r from-${currentStepData.color}-500 to-${currentStepData.color}-600 transition-all duration-500`}
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="p-8 md:p-12">
          {/* Step Counter */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? `w-8 bg-${currentStepData.color}-500`
                    : index < currentStep
                    ? 'w-2 bg-green-500'
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left Side - Image */}
            <div className="order-2 md:order-1">
              <div className={`bg-gradient-to-br from-${currentStepData.color}-100 to-${currentStepData.color}-200 rounded-3xl p-8 aspect-square flex items-center justify-center text-9xl animate-bounce-slow`}>
                {currentStepData.image}
              </div>
            </div>

            {/* Right Side - Content */}
            <div className="order-1 md:order-2 space-y-6">
              {/* Icon */}
              <div className={`w-16 h-16 bg-gradient-to-br from-${currentStepData.color}-500 to-${currentStepData.color}-600 rounded-2xl flex items-center justify-center shadow-lg`}>
                <currentStepData.icon className="w-8 h-8 text-white" />
              </div>

              {/* Title */}
              <div>
                <div className="text-sm text-gray-500 mb-2">
                  {t('step')} {currentStep + 1} {t('of')} {steps.length}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                  {currentStepData.title}
                </h2>
                <p className="text-gray-600 text-lg">
                  {currentStepData.description}
                </p>
              </div>

              {/* Tips */}
              <div className="space-y-3">
                {currentStepData.tips.map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-2xl flex-shrink-0">{tip.icon}</span>
                    <p className="text-gray-700">{tip.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                currentStep === 0
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              {t('previous')}
            </button>

            <div className="flex items-center gap-3">
              {!isLastStep && (
                <button
                  onClick={onSkip}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  {t('skip')}
                </button>
              )}

              <button
                onClick={handleNext}
                className={`flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-${currentStepData.color}-500 to-${currentStepData.color}-600 text-white rounded-xl hover:shadow-lg transition-all font-medium`}
              >
                {isLastStep ? (
                  <>
                    <Check className="w-5 h-5" />
                    {t('getStarted')}
                  </>
                ) : (
                  <>
                    {t('next')}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}