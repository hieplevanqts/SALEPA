import { useState } from 'react';
import { useTranslation } from '../../../../lib/spa-lib/useTranslation';
import { 
  X, Book, Video, Keyboard, HelpCircle, Lightbulb,
  Play, Search, ChevronRight, MessageCircle, Phone, Mail,
  FileText, Download, ExternalLink, Zap, ShoppingCart, Package,
  BarChart3
} from 'lucide-react';

interface HelpCenterProps {
  onClose: () => void;
}

export function HelpCenter({ onClose }: HelpCenterProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'guides' | 'videos' | 'shortcuts' | 'faq' | 'contact'>('guides');
  const [searchQuery, setSearchQuery] = useState('');

  const guides = [
    {
      id: 1,
      icon: ShoppingCart,
      title: t('quickStartGuide'),
      description: t('learnBasics'),
      color: 'blue',
      steps: [
        { icon: '1️⃣', text: t('step1AddProducts') },
        { icon: '2️⃣', text: t('step2OpenShift') },
        { icon: '3️⃣', text: t('step3MakeSale') },
        { icon: '4️⃣', text: t('step4CloseShift') },
      ]
    },
    {
      id: 2,
      icon: Package,
      title: t('productManagementGuide'),
      description: t('manageInventory'),
      color: 'green',
      steps: [
        { icon: '➕', text: t('addProductsOneByOne') },
        { icon: '📥', text: t('importProductsCSV') },
        { icon: '🔍', text: t('searchAndEdit') },
        { icon: '📊', text: t('trackStock') },
      ]
    },
    {
      id: 3,
      icon: BarChart3,
      title: t('reportsGuide'),
      description: t('understandReports'),
      color: 'purple',
      steps: [
        { icon: '📈', text: t('viewDashboard') },
        { icon: '📋', text: t('checkOrderHistory') },
        { icon: '💰', text: t('analyzeRevenue') },
        { icon: '💾', text: t('exportData') },
      ]
    },
  ];

  const videos = [
    {
      id: 1,
      title: t('video1Title'),
      duration: '5:30',
      thumbnail: '🎬',
      url: '#',
      category: t('gettingStarted')
    },
    {
      id: 2,
      title: t('video2Title'),
      duration: '3:45',
      thumbnail: '🎥',
      url: '#',
      category: t('sales')
    },
    {
      id: 3,
      title: t('video3Title'),
      duration: '4:20',
      thumbnail: '📹',
      url: '#',
      category: t('inventory')
    },
  ];

  const shortcuts = [
    { key: 'F1', action: t('openHelp'), icon: '❓' },
    { key: 'F2', action: t('focusSearch'), icon: '🔍' },
    { key: 'F3', action: t('holdBill'), icon: '💾' },
    { key: 'F4', action: t('recallBill'), icon: '📋' },
    { key: 'F8', action: t('focusBarcode'), icon: '📷' },
    { key: 'F9', action: t('checkout'), icon: '💳' },
    { key: 'F10', action: t('clearCart'), icon: '🗑️' },
    { key: 'ESC', action: t('cancel'), icon: '❌' },
    { key: 'Ctrl+S', action: t('save'), icon: '💾' },
    { key: 'Ctrl+P', action: t('print'), icon: '🖨️' },
  ];

  const faqs = [
    {
      question: t('faq1Question'),
      answer: t('faq1Answer'),
      category: 'general'
    },
    {
      question: t('faq2Question'),
      answer: t('faq2Answer'),
      category: 'sales'
    },
    {
      question: t('faq3Question'),
      answer: t('faq3Answer'),
      category: 'products'
    },
    {
      question: t('faq4Question'),
      answer: t('faq4Answer'),
      category: 'shifts'
    },
    {
      question: t('faq5Question'),
      answer: t('faq5Answer'),
      category: 'reports'
    },
  ];

  const tabs = [
    { id: 'guides' as const, icon: Book, label: t('guides') },
    { id: 'videos' as const, icon: Video, label: t('videos') },
    { id: 'shortcuts' as const, icon: Keyboard, label: t('shortcuts') },
    { id: 'faq' as const, icon: HelpCircle, label: t('faq') },
    { id: 'contact' as const, icon: MessageCircle, label: t('contact') },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <HelpCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-white text-2xl">{t('helpCenter')}</h2>
                  <p className="text-blue-100 text-sm">{t('howCanWeHelp')}</p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('searchHelp')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-blue-200 focus:outline-none focus:border-white/40"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Guides Tab */}
          {activeTab === 'guides' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-medium mb-2">{t('proTip')}</h3>
                    <p className="text-gray-700 text-sm">{t('proTipMessage')}</p>
                  </div>
                </div>
              </div>

              {guides.map((guide) => (
                <div
                  key={guide.id}
                  className={`bg-gradient-to-br from-${guide.color}-50 to-${guide.color}-100 border border-${guide.color}-200 rounded-xl p-6 hover:shadow-lg transition-shadow`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-14 h-14 bg-${guide.color}-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <guide.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-gray-900 font-semibold text-lg mb-1">{guide.title}</h3>
                      <p className="text-gray-600 text-sm">{guide.description}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {guide.steps.map((step, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 bg-white/60 backdrop-blur-sm p-4 rounded-lg"
                      >
                        <span className="text-2xl">{step.icon}</span>
                        <div className="flex-1">
                          <p className="text-gray-900">{step.text}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    ))}
                  </div>

                  <button className={`mt-4 w-full bg-${guide.color}-600 text-white py-3 rounded-lg hover:bg-${guide.color}-700 transition-colors font-medium flex items-center justify-center gap-2`}>
                    <Play className="w-5 h-5" />
                    {t('startGuide')}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Videos Tab */}
          {activeTab === 'videos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className="aspect-video bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform">
                    {video.thumbnail}
                  </div>
                  <div className="p-5">
                    <div className="text-xs text-blue-600 font-medium mb-2">{video.category}</div>
                    <h3 className="text-gray-900 font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                      {video.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">⏱️ {video.duration}</span>
                      <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm">
                        <Play className="w-4 h-4" />
                        {t('watch')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-dashed border-purple-300 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                <Video className="w-12 h-12 text-purple-500 mb-4" />
                <h3 className="text-gray-900 font-semibold mb-2">{t('moreVideos')}</h3>
                <p className="text-gray-600 text-sm mb-4">{t('visitYoutube')}</p>
                <button className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                  {t('openYoutube')}
                </button>
              </div>
            </div>
          )}

          {/* Shortcuts Tab */}
          {activeTab === 'shortcuts' && (
            <div>
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Keyboard className="w-6 h-6 text-indigo-600" />
                  <h3 className="text-gray-900 font-semibold">{t('keyboardShortcuts')}</h3>
                </div>
                <p className="text-gray-600 text-sm">{t('shortcutsDesc')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <span className="text-3xl">{shortcut.icon}</span>
                    <div className="flex-1">
                      <div className="text-gray-900 font-medium">{shortcut.action}</div>
                      <div className="text-sm text-gray-500 mt-1">{t('pressKey')}</div>
                    </div>
                    <kbd className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg font-mono text-sm font-semibold text-gray-900 shadow-sm">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="text-gray-900 font-medium mb-1">{t('quickTip')}</h4>
                    <p className="text-gray-700 text-sm">{t('quickTipMessage')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden group"
                >
                  <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <HelpCircle className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-gray-900 font-medium">{faq.question}</h3>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="px-5 pb-5">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2">
                      <p className="text-gray-700">{faq.answer}</p>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                <h3 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  {t('needMoreHelp')}
                </h3>
                <p className="text-gray-700 mb-4">{t('contactMessage')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-7 h-7 text-blue-600" />
                  </div>
                  <h4 className="text-gray-900 font-semibold mb-2">{t('phoneSupport')}</h4>
                  <p className="text-gray-600 text-sm mb-3">{t('callUs')}</p>
                  <a href="tel:1900-XXX-XXX" className="text-blue-600 font-semibold">
                    1900-XXX-XXX
                  </a>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-7 h-7 text-green-600" />
                  </div>
                  <h4 className="text-gray-900 font-semibold mb-2">{t('emailSupport')}</h4>
                  <p className="text-gray-600 text-sm mb-3">{t('sendEmail')}</p>
                  <a href="mailto:support@pos.com" className="text-green-600 font-semibold">
                    support@pos.com
                  </a>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-7 h-7 text-purple-600" />
                  </div>
                  <h4 className="text-gray-900 font-semibold mb-2">{t('liveChat')}</h4>
                  <p className="text-gray-600 text-sm mb-3">{t('chatWithUs')}</p>
                  <button className="text-purple-600 font-semibold hover:text-purple-700">
                    {t('startChat')}
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  {t('documentation')}
                </h4>
                <div className="space-y-3">
                  <a
                    href="#"
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Download className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-900 group-hover:text-blue-600">{t('userManual')}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </a>
                  <a
                    href="#"
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Download className="w-5 h-5 text-green-600" />
                      <span className="text-gray-900 group-hover:text-green-600">{t('quickReference')}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-4 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              💡 {t('helpFooter')}
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-medium"
            >
              {t('gotIt')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpCenter;