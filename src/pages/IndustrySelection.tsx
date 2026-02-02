import { useState } from 'react';
import { useTranslation } from '../lib/convenience-store-lib/useTranslation';
import { 
  Coffee, Sparkles, Shirt, ShoppingBag, Smartphone, Heart,
  Check, ArrowRight, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DebugPackageLoader from '../components/DebugPackageLoader';

export type IndustryType = 'food-beverage' | 'spa-service' | 'fashion' | 'retail' | 'electronics' | 'pharmacy';

interface IndustrySelectionProps {
  onSelect?: (industry: IndustryType) => void;
  onSkip?: () => void;
}
const INDUSTRY_ROUTE_MAP: Record<IndustryType, string> = {
  'food-beverage': '/restaurant/',
  'spa-service': '/spa/',
  fashion: '/fashion/shop/',
  retail: '/convenience/',
  electronics: '/electronics/', // nếu chưa có có thể bỏ
  pharmacy: '/pharmacy/',       // nếu chưa có có thể bỏ
};

export function IndustrySelection({ onSelect, onSkip }: IndustrySelectionProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryType | null>(null);
  const industries = [
    {
      id: 'food-beverage' as IndustryType,
      icon: Coffee,
      title: t('foodBeverage'),
      description: t('foodBeverageDesc'),
      color: 'orange',
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50',
    },
    {
      id: 'spa-service' as IndustryType,
      icon: Sparkles,
      title: t('spaServiceTitle'),
      description: t('spaServiceDesc'),
      color: 'pink',
      gradient: 'from-pink-500 to-purple-500',
      bgGradient: 'from-pink-50 to-purple-50',
    },
    {
      id: 'fashion' as IndustryType,
      icon: Shirt,
      title: t('fashion'),
      description: t('fashionDesc'),
      color: 'purple',
      gradient: 'from-purple-500 to-indigo-500',
      bgGradient: 'from-purple-50 to-indigo-50',
    },
    {
      id: 'retail' as IndustryType,
      icon: ShoppingBag,
      title: t('retail'),
      description: t('retailDesc'),
      color: 'green',
      gradient: 'from-green-500 to-teal-500',
      bgGradient: 'from-green-50 to-teal-50',
    },
    
  ];

  const handleContinue = () => {
    if (!selectedIndustry) return;

    // callback nếu cần lưu state bên ngoài
    onSelect?.(selectedIndustry);

    const targetRoute = INDUSTRY_ROUTE_MAP[selectedIndustry];

    if (targetRoute) {
      navigate(targetRoute, { replace: true });
    } else {
      console.warn('No route mapped for industry:', selectedIndustry);
    }
  };

  const handleSkip = onSkip ?? (() => navigate("/"));


  return (
    <>
    <DebugPackageLoader />
    <div className="fixed inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-orange-500 flex items-center justify-center p-4 z-50 overflow-auto">
      {/* Background Animation */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="bg-white rounded-3xl w-full max-w-6xl shadow-2xl relative p-8 md:p-12 my-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-purple-600 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            {t('step')} 2 {t('of')} 2
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            {t('selectIndustry')}
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            {t('selectIndustryDesc')}
          </p>
          
        </div>

        {/* Industry Cards Grid */}
       <div className="grid grid-cols-2 grid-rows-2 gap-6 auto-rows-fr mb-8">

          {industries.map((industry) => {
            const Icon = industry.icon;
            const isSelected = selectedIndustry === industry.id;

            return (
              <button
                key={industry.id}
                onClick={() => setSelectedIndustry(industry.id)}
                className={`relative group h-full flex flex-col text-left rounded-2xl p-6 transition-all duration-300 border-2 ${
                  isSelected
                    ? `border-${industry.color}-500 bg-gradient-to-br ${industry.bgGradient} shadow-xl scale-105`
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-lg bg-white'
                }`}
              >
                {/* Selected Checkmark */}
                {isSelected && (
                  <div className={`absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br ${industry.gradient} rounded-full flex items-center justify-center shadow-lg animate-bounce-slow`}>
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}

                {/* Icon */}
                <div className={`w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br ${industry.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {industry.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {industry.description}
                </p>

                {/* Hover Arrow */}
                <div className={`absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity`}>
                  <ChevronRight className={`w-5 h-5 text-${industry.color}-500`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            onClick={handleSkip}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            {/* {t('skipIndustry')} */}
          </button>

          <button
            onClick={handleContinue}
            disabled={!selectedIndustry}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-all ${
              selectedIndustry
                ? 'bg-gradient-to-r from-purple-600 to-orange-500 text-white hover:shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {t('continueWithIndustry')}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
    </>
  );
}

export default IndustrySelection;