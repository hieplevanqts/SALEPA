import { useState } from 'react';
import { useStore } from '../../../../lib/restaurant-lib/store';
import { useTranslation } from '../../../../lib/restaurant-lib/useTranslation';
import { 
  Download, Upload, Trash2, Save, Building, Bell, 
  Palette, Database, Zap, Moon, Sun,
  Printer, CreditCard, HardDrive, Package,
  ShoppingBag, Clock, Mail, Settings2, Info,
  ChevronRight, AlertTriangle, CheckCircle2,
  Landmark, Wallet
} from 'lucide-react';

export function Settings() {
  const { products, orders: ordersRaw, shifts, clearAllData } = useStore();
  const { t, language, setLanguage } = useTranslation();
  
  // Normalize orders to array (handle persisted object format)
  const orders = Array.isArray(ordersRaw) ? ordersRaw : Object.values(ordersRaw || {});

  const [activeSection, setActiveSection] = useState<'general' | 'store' | 'data' | 'notifications' | 'appearance' | 'advanced' | 'payment'>('general');
  const [storeName, setStoreName] = useState('Quản Lý Bán Hàng');
  const [storeAddress, setStoreAddress] = useState('123 Đường ABC, Quận 1, TP.HCM');
  const [storePhone, setStorePhone] = useState('0123456789');
  const [storeEmail, setStoreEmail] = useState('contact@store.com');
  const [taxRate, setTaxRate] = useState(10);
  const [currency, setCurrency] = useState('VND');
  const [receiptFooter, setReceiptFooter] = useState('Cảm ơn quý khách!');
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  
  // Appearance settings
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [compactMode, setCompactMode] = useState(false);
  
  // Notification settings
  const [lowStockAlert, setLowStockAlert] = useState(true);
  const [orderNotification, setOrderNotification] = useState(true);
  const [shiftReminder, setShiftReminder] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  
  // Advanced settings
  const [autoPrint, setAutoPrint] = useState(false);
  const [autoOpenCashDrawer, setAutoOpenCashDrawer] = useState(true);
  const [offlineMode] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [receiptCopies, setReceiptCopies] = useState(1);

  // Load payment settings from localStorage
  const loadPaymentSettings = () => {
    const savedPaymentSettings = localStorage.getItem('pos-payment-settings');
    if (savedPaymentSettings) {
      try {
        return JSON.parse(savedPaymentSettings);
      } catch (e) {
        return {};
      }
    }
    return {};
  };

  const initialPaymentSettings = loadPaymentSettings();

  // Payment settings
  const [bankName, setBankName] = useState(initialPaymentSettings.bankName || '');
  const [accountNumber, setAccountNumber] = useState(initialPaymentSettings.accountNumber || '');
  const [accountName, setAccountName] = useState(initialPaymentSettings.accountName || '');
  const [momoPhone, setMomoPhone] = useState(initialPaymentSettings.momoPhone || '');
  const [momoName, setMomoName] = useState(initialPaymentSettings.momoName || '');
  const [zalopayPhone, setZalopayPhone] = useState(initialPaymentSettings.zalopayPhone || '');
  const [zalopayName, setZalopayName] = useState(initialPaymentSettings.zalopayName || '');
  const [vnpayPhone, setVnpayPhone] = useState(initialPaymentSettings.vnpayPhone || '');
  const [vnpayName, setVnpayName] = useState(initialPaymentSettings.vnpayName || '');

  // Calculate storage size
  const calculateDataSize = () => {
    const data = { products, orders, shifts };
    const size = new Blob([JSON.stringify(data)]).size;
    return (size / 1024).toFixed(2) + ' KB';
  };

  const handleSaveSettings = () => {
    // Save settings to localStorage
    const settings = {
      storeName,
      storeAddress,
      storePhone,
      storeEmail,
      taxRate,
      currency,
      receiptFooter,
      theme,
      fontSize,
      compactMode,
      lowStockAlert,
      orderNotification,
      shiftReminder,
      soundEnabled,
      emailNotifications,
      autoPrint,
      autoOpenCashDrawer,
      offlineMode,
      lowStockThreshold,
      receiptCopies,
    };
    localStorage.setItem('pos-settings', JSON.stringify(settings));
    
    // Save payment settings separately
    const paymentSettings = {
      bankName,
      accountNumber,
      accountName,
      momoPhone,
      momoName,
      zalopayPhone,
      zalopayName,
      vnpayPhone,
      vnpayName,
    };
    localStorage.setItem('pos-payment-settings', JSON.stringify(paymentSettings));
    
    setShowSaveNotification(true);
    setTimeout(() => setShowSaveNotification(false), 3000);
  };

  const handleExportData = () => {
    const data = {
      products,
      orders,
      shifts,
      settings: {
        storeName,
        storeAddress,
        storePhone,
        currency,
        taxRate,
      },
      exportDate: new Date().toISOString(),
      version: '1.0',
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pos-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('✓ ' + t.exportSuccess);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        console.log('Import data:', data);
        alert('✓ ' + t.importSuccess);
      } catch (error) {
        alert('✗ ' + t.importError);
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (confirm(t.clearDataConfirm)) {
      if (confirm(t.clearDataWarning)) {
        clearAllData();
        alert('✓ ' + t.dataCleared);
      }
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Category', 'Price', 'Stock', 'Barcode'];
    const rows = products.map(p => [p.id, p.name, p.category, p.price, p.stock, p.barcode || '']);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('✓ ' + t.exportSuccess);
  };

  const menuItems = [
    { id: 'general' as const, icon: Palette, label: t.generalSettings },
    { id: 'store' as const, icon: Building, label: t.storeInfo },
    { id: 'appearance' as const, icon: Moon, label: t.appearance },
    { id: 'notifications' as const, icon: Bell, label: t.notifications },
    { id: 'advanced' as const, icon: Settings2, label: t.advanced },
    { id: 'data' as const, icon: Database, label: t.dataManagement },
    { id: 'payment' as const, icon: CreditCard, label: t.paymentSettings },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h2 className="page-title text-gray-900">{t.settings}</h2>
          <p className="text-gray-500 mt-1">{t.systemConfig}</p>
        </div>
        
        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-2 bg-[#FE7410] text-white px-6 py-3 rounded-lg hover:bg-[#E56809] transition-all shadow-lg font-medium"
        >
          <Save className="w-5 h-5" />
          {t.saveSettings}
        </button>
      </div>

      {/* Save Notification */}
      {showSaveNotification && (
        <div className="fixed top-6 right-6 bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in z-50">
          <CheckCircle2 className="w-6 h-6" />
          <div>
            <div className="font-medium">{t.actionSuccess}</div>
            <div className="text-sm opacity-90">{t.settingsSaved}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Menu */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            {menuItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center justify-between gap-3 px-6 py-4 transition-all ${
                  index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
                } ${
                  activeSection === item.id 
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 border-l-4 border-blue-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium text-sm text-[16px]">{item.label}</span>
                </div>
                {activeSection === item.id && <ChevronRight className="w-4 h-4" />}
              </button>
            ))}
          </div>

          {/* Quick Stats */}
          
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          {/* General Settings */}
          {activeSection === 'general' && (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Palette className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-gray-900 font-bold">{t.generalSettings}</h3>
                  <p className="text-sm text-gray-500">{t.basicConfiguration}</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2 font-medium">
                      {t.language}
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as 'vi' | 'en')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="vi">Tiếng Việt</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2 font-medium">
                      {t.currency}
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="VND">Vietnamese Dong (VND)</option>
                      <option value="USD">US Dollar (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                      <option value="JPY">Japanese Yen (JPY)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2 font-medium">
                      {t.taxRate} (%)
                    </label>
                    <input
                      type="number"
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2 font-medium">
                      {t.receiptCopies}
                    </label>
                    <input
                      type="number"
                      value={receiptCopies}
                      onChange={(e) => setReceiptCopies(parseInt(e.target.value))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      max="5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2 font-medium">
                    {t.receiptFooter}
                  </label>
                  <textarea
                    value={receiptFooter}
                    onChange={(e) => setReceiptFooter(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder={t.enterReceiptFooter}
                  />
                  <p className="text-xs text-gray-500 mt-1">{t.receiptFooterHint}</p>
                </div>
              </div>
            </div>
          )}

          {/* Store Info */}
          {activeSection === 'store' && (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-gray-900 font-bold">{t.storeInformation}</h3>
                  <p className="text-sm text-gray-500">{t.businessDetails}</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-700 mb-2 font-medium">
                    {t.storeName}
                  </label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t.enterStoreName}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2 font-medium">
                      {t.storePhone}
                    </label>
                    <input
                      type="tel"
                      value={storePhone}
                      onChange={(e) => setStorePhone(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t.enterStorePhone}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2 font-medium">
                      {t.storeEmail}
                    </label>
                    <input
                      type="email"
                      value={storeEmail}
                      onChange={(e) => setStoreEmail(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t.enterStoreEmail}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2 font-medium">
                    {t.storeAddress}
                  </label>
                  <textarea
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder={t.enterStoreAddress}
                  />
                </div>

                {/* Store Preview */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                  <div className="text-sm text-blue-600 mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    {t.receiptPreview}
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-blue-200 font-mono text-sm">
                    <div className="text-center mb-2">
                      <div className="font-bold">{storeName}</div>
                      <div className="text-xs text-gray-600">{storeAddress}</div>
                      <div className="text-xs text-gray-600">📞 {storePhone} | 📧 {storeEmail}</div>
                    </div>
                    <div className="border-t border-dashed border-gray-300 my-2"></div>
                    <div className="text-xs text-gray-500 text-center">{receiptFooter}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appearance */}
          {activeSection === 'appearance' && (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Moon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-gray-900 font-bold">{t.appearance}</h3>
                  <p className="text-sm text-gray-500">{t.customizeInterface}</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-700 mb-3 font-medium">
                    {t.theme}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setTheme('light')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        theme === 'light' 
                          ? 'border-blue-600 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Sun className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                      <div className="text-sm text-gray-900">{t.lightMode}</div>
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        theme === 'dark' 
                          ? 'border-blue-600 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Moon className="w-6 h-6 mx-auto mb-2 text-indigo-500" />
                      <div className="text-sm text-gray-900">{t.darkMode}</div>
                    </button>
                    <button
                      onClick={() => setTheme('auto')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        theme === 'auto' 
                          ? 'border-blue-600 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Zap className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                      <div className="text-sm text-gray-900">{t.autoMode}</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-3 font-medium">
                    {t.fontSize}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['small', 'medium', 'large'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          fontSize === size 
                            ? 'border-blue-600 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`mx-auto mb-2 ${
                          size === 'small' ? 'text-sm' : size === 'medium' ? 'text-base' : 'text-lg'
                        }`}>
                          Aa
                        </div>
                        <div className="text-sm text-gray-900 capitalize">{t[size]}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-gray-900 mb-1 font-medium">{t.compactMode}</div>
                    <div className="text-sm text-gray-500">{t.compactModeDesc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={compactMode}
                      onChange={(e) => setCompactMode(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-gray-900 font-bold">{t.notificationSettings}</h3>
                  <p className="text-sm text-gray-500">{t.manageAlerts}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <div className="text-gray-900 mb-1 font-medium">{t.lowStockAlert}</div>
                      <div className="text-sm text-gray-600">{t.lowStockAlertDesc}</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={lowStockAlert}
                      onChange={(e) => setLowStockAlert(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-start gap-3">
                    <ShoppingBag className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="text-gray-900 mb-1 font-medium">{t.orderNotification}</div>
                      <div className="text-sm text-gray-600">{t.orderNotificationDesc}</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={orderNotification}
                      onChange={(e) => setOrderNotification(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="text-gray-900 mb-1 font-medium">{t.shiftReminder}</div>
                      <div className="text-sm text-gray-600">{t.shiftReminderDesc}</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={shiftReminder}
                      onChange={(e) => setShiftReminder(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Bell className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <div className="text-gray-900 mb-1 font-medium">{t.soundNotifications}</div>
                      <div className="text-sm text-gray-600">{t.playSoundOnEvents}</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={soundEnabled}
                      onChange={(e) => setSoundEnabled(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-indigo-600 mt-0.5" />
                    <div>
                      <div className="text-gray-900 mb-1 font-medium">{t.emailNotifications}</div>
                      <div className="text-sm text-gray-600">{t.sendDailySummary}</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Settings */}
          {activeSection === 'advanced' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Settings2 className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-bold">{t.advanced}</h3>
                    <p className="text-sm text-gray-500">{t.advancedOptions}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Printer className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="text-gray-900 mb-1 font-medium">{t.autoPrint}</div>
                        <div className="text-sm text-gray-600">{t.autoPrintDesc}</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={autoPrint}
                        onChange={(e) => setAutoPrint(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CreditCard className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="text-gray-900 mb-1 font-medium">{t.autoOpenCashDrawer}</div>
                        <div className="text-sm text-gray-600">{t.openDrawerOnPayment}</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={autoOpenCashDrawer}
                        onChange={(e) => setAutoOpenCashDrawer(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2 font-medium">
                      {t.lowStockThreshold}
                    </label>
                    <input
                      type="number"
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(parseInt(e.target.value))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      max="100"
                    />
                    <p className="text-xs text-gray-500 mt-1">💡 {t.lowStockThresholdHint}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Settings */}
          {activeSection === 'payment' && (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-gray-900 font-bold">{t.paymentSettings}</h3>
                  <p className="text-sm text-gray-500">{t.paymentConfiguration}</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Bank Transfer Settings */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="text-gray-700 font-medium mb-4 flex items-center gap-2 font-bold">
                    <Landmark className="w-5 h-5" />
                    {t.bankInfo}
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2 font-medium">
                        {t.bankName}
                      </label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t.enterBankName}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2 font-medium">
                          {t.accountNumber}
                        </label>
                        <input
                          type="text"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={t.enterAccountNumber}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2 font-medium">
                          {t.accountName}
                        </label>
                        <input
                          type="text"
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={t.enterAccountName}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* E-wallet Settings */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="text-gray-700 font-medium mb-4 flex items-center gap-2 font-bold">
                    <Wallet className="w-5 h-5" />
                    {t.ewalletInfo}
                  </h4>
                  
                  {/* MoMo */}
                  <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                    <div className="font-medium text-gray-700 flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      MoMo
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2 font-medium">
                          {t.accountNumber}
                        </label>
                        <input
                          type="text"
                          value={momoPhone}
                          onChange={(e) => setMomoPhone(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={t.enterAccountNumber}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2 font-medium">
                          {t.accountName}
                        </label>
                        <input
                          type="text"
                          value={momoName}
                          onChange={(e) => setMomoName(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={t.enterAccountName}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ZaloPay */}
                  <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                    <div className="font-medium text-gray-700 flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      ZaloPay
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2 font-medium">
                          {t.accountNumber}
                        </label>
                        <input
                          type="text"
                          value={zalopayPhone}
                          onChange={(e) => setZalopayPhone(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={t.enterAccountNumber}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2 font-medium">
                          {t.accountName}
                        </label>
                        <input
                          type="text"
                          value={zalopayName}
                          onChange={(e) => setZalopayName(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={t.enterAccountName}
                        />
                      </div>
                    </div>
                  </div>

                  {/* VNPay */}
                  <div className="space-y-4">
                    <div className="font-medium text-gray-700 flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      VNPay
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2 font-medium">
                          {t.accountNumber}
                        </label>
                        <input
                          type="text"
                          value={vnpayPhone}
                          onChange={(e) => setVnpayPhone(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={t.enterAccountNumber}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2 font-medium">
                          {t.accountName}
                        </label>
                        <input
                          type="text"
                          value={vnpayName}
                          onChange={(e) => setVnpayName(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={t.enterAccountName}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">{t.paymentInfoSaved}</p>
                      <p>{t.qrCodeWillGenerate}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data Management */}
          {activeSection === 'data' && (
            <div className="space-y-6">
              {/* Export/Import */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Database className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-bold">{t.backupRestore}</h3>
                    <p className="text-sm text-gray-500">{t.manageData}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={handleExportData}
                    className="p-6 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:shadow-lg transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                        <Download className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-gray-900 font-medium">{t.exportData}</div>
                        <div className="text-sm text-gray-600">{t.backupAllData}</div>
                      </div>
                    </div>
                  </button>

                  <label className="p-6 border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:shadow-lg transition-all text-left cursor-pointer group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-gray-900 font-medium">{t.importData}</div>
                        <div className="text-sm text-gray-600">{t.restoreFromBackup}</div>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={handleExportCSV}
                    className="p-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:shadow-lg transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                        <Download className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-gray-900 font-medium">{t.exportCSV}</div>
                        <div className="text-sm text-gray-600">{t.exportProductsCSV}</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={handleClearData}
                    className="p-6 border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100 rounded-xl hover:shadow-lg transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                        <Trash2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-gray-900 font-medium">{t.clearAllData}</div>
                        <div className="text-sm text-red-600">{t.deleteAllData}</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Database Info */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <h3 className="text-gray-900 mb-6">{t.databaseInfo}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                      <Package className="w-4 h-4" />
                      <div className="text-sm font-medium">{t.totalProducts}</div>
                    </div>
                    <div className="text-2xl text-blue-900 font-bold">{products.length}</div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 text-green-600 mb-2">
                      <ShoppingBag className="w-4 h-4" />
                      <div className="text-sm font-medium">{t.totalOrders}</div>
                    </div>
                    <div className="text-2xl text-green-900 font-bold">{orders.length}</div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 text-purple-600 mb-2">
                      <Clock className="w-4 h-4" />
                      <div className="text-sm font-medium">{t.totalShifts}</div>
                    </div>
                    <div className="text-2xl text-purple-900 font-bold">{shifts.length}</div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 text-orange-600 mb-2">
                      <HardDrive className="w-4 h-4" />
                      <div className="text-sm font-medium">{t.dataSize}</div>
                    </div>
                    <div className="text-lg text-orange-900 font-bold">{calculateDataSize()}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;