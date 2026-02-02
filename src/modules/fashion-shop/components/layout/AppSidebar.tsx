import { useState } from 'react';
import { LayoutGrid, ShoppingCart, Package, ClipboardList, BarChart3, Users, User, Calendar, Smartphone, Settings as SettingsIcon, HelpCircle, Languages, ChevronRight, ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../../../../lib/fashion-shop-lib/store';
import logoImage from '../../../../assets/5674d75012c6e5648856a4090ea134ccbacf662e.png';

interface AppSidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  currentUser?: string;
  userRole?: 'admin' | 'cashier' | 'technician';
  onShowHelp?: () => void;
  onShowProfileMenu?: () => void;
}

export function AppSidebar({ 
  activeTab = 'orders', 
  onTabChange,
  currentUser = '',
  userRole = 'admin',
  onShowHelp,
  onShowProfileMenu 
}: AppSidebarProps) {
  const { language, setLanguage, sidebarCollapsed, toggleSidebar } = useStore();
  const [reportMenuExpanded, setReportMenuExpanded] = useState(false);
  const [accountMenuExpanded, setAccountMenuExpanded] = useState(false);
  
  const t = {
    posSystem: language === 'vi' ? 'Hệ thống POS' : 'POS System',
    expand: language === 'vi' ? 'Mở rộng' : 'Expand',
    collapse: language === 'vi' ? 'Thu gọn' : 'Collapse',
    dashboard: language === 'vi' ? 'Tổng quan' : 'Dashboard',
    sales: language === 'vi' ? 'Bán hàng' : 'Sales',
    products: language === 'vi' ? 'Sản phẩm' : 'Products',
    orderManagement: language === 'vi' ? 'Quản lý đơn hàng' : 'Order Management',
    reports: language === 'vi' ? 'Báo cáo' : 'Reports',
    customers: language === 'vi' ? 'Khách hàng' : 'Customers',
    accountManagement: language === 'vi' ? 'Quản lý tài khoản' : 'Account Management',
    appointments: language === 'vi' ? 'Lịch hẹn' : 'Appointments',
    cashier: language === 'vi' ? 'Thu ngân' : 'Cashier',
    settings: language === 'vi' ? 'Cài đặt' : 'Settings',
    selfService: language === 'vi' ? 'Tự phục vụ' : 'Self Service',
    helpCenter: language === 'vi' ? 'Trợ giúp' : 'Help Center',
  };

  const hasPermission = (permissionId: string): boolean => {
    if (userRole === 'admin') return true;
    
    if (userRole === 'cashier') {
      return ['sales', 'products_view', 'orders', 'customers', 'appointments'].includes(permissionId);
    }
    
    if (userRole === 'technician') {
      return ['products_view', 'appointments'].includes(permissionId);
    }
    
    return false;
  };

  const handleTabClick = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
      sidebarCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className={`border-b border-gray-200 ${sidebarCollapsed ? 'p-3' : 'p-6'}`}>
        <div className="flex items-center justify-between mb-3">
          {!sidebarCollapsed && (
            <div className="flex-1 flex items-center gap-3">
              <img src={logoImage} alt="Salepa Logo" className="h-10 w-auto" style={{ mixBlendMode: 'multiply' }} />
              <div>
                <h1 className="text-[#FE7410] font-bold text-xl">Salepa</h1>
                <p className="text-gray-500 text-xs mt-0.5">{t.posSystem}</p>
              </div>
            </div>
          )}
          
          <button
            onClick={toggleSidebar}
            className={`${sidebarCollapsed ? 'w-full' : ''} flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all group`}
            title={sidebarCollapsed ? t.expand : t.collapse}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
        
        {sidebarCollapsed && (
          <div className="flex justify-center mt-3">
            <img src={logoImage} alt="Salepa" className="w-10 h-10 rounded-lg" />
          </div>
        )}
      </div>
      
      <nav className={`flex-1 overflow-y-auto ${sidebarCollapsed ? 'p-2' : 'p-4'}`}>
        {/* Dashboard - Admin only */}
        {hasPermission('dashboard') && (
          <button
            onClick={() => handleTabClick('dashboard')}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-[#FE7410]/10 text-[#FE7410]'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            title={sidebarCollapsed ? t.dashboard : undefined}
          >
            <LayoutGrid className="w-5 h-5" />
            {!sidebarCollapsed && <span>{t.dashboard}</span>}
          </button>
        )}
        
        {/* Sales - Cashier, Admin */}
        {hasPermission('sales') && (
          <button
            onClick={() => handleTabClick('sales')}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeTab === 'sales'
                ? 'bg-[#FE7410]/10 text-[#FE7410]'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            title={sidebarCollapsed ? t.sales : undefined}
          >
            <ShoppingCart className="w-5 h-5" />
            {!sidebarCollapsed && <span>{t.sales}</span>}
          </button>
        )}
        
        {/* Products - All roles (view only for Technician) */}
        {hasPermission('products_view') && (
          <button
            onClick={() => handleTabClick('products')}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeTab === 'products'
                ? 'bg-[#FE7410]/10 text-[#FE7410]'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            title={sidebarCollapsed ? t.products : undefined}
          >
            <Package className="w-5 h-5" />
            {!sidebarCollapsed && <span>{t.products}</span>}
          </button>
        )}
        
        {/* Orders - Cashier, Admin */}
        {hasPermission('orders') && (
          <button
            onClick={() => handleTabClick('orders')}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeTab === 'orders'
                ? 'bg-[#FE7410]/10 text-[#FE7410]'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            title={sidebarCollapsed ? t.orderManagement : undefined}
          >
            <ClipboardList className="w-5 h-5" />
            {!sidebarCollapsed && <span>{t.orderManagement}</span>}
          </button>
        )}
        
        {/* Reports with Submenu - Admin only */}
        {hasPermission('reports') && (
          <div className="mb-2">
            <button
              onClick={() => {
                if (sidebarCollapsed) {
                  handleTabClick('revenue-overview');
                } else {
                  setReportMenuExpanded(!reportMenuExpanded);
                }
              }}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-lg transition-colors ${
                (activeTab?.startsWith('revenue-') || activeTab?.endsWith('-report'))
                  ? 'bg-[#FE7410]/10 text-[#FE7410]'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              title={sidebarCollapsed ? t.reports : undefined}
            >
              <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                <BarChart3 className="w-5 h-5" />
                {!sidebarCollapsed && <span>{t.reports}</span>}
              </div>
              {!sidebarCollapsed && (
                reportMenuExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
              )}
            </button>
            
            {!sidebarCollapsed && reportMenuExpanded && (
              <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-4">
                <button
                  onClick={() => handleTabClick('revenue-overview')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                    activeTab === 'revenue-overview'
                      ? 'bg-[#FE7410]/10 text-[#FE7410]'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-[16px]">DT Tổng hợp</span>
                </button>
                
                <button
                  onClick={() => handleTabClick('revenue-staff')}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                    activeTab === 'revenue-staff'
                      ? 'bg-[#FE7410]/10 text-[#FE7410]'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-[16px]">DT Nhân viên</span>
                  <span className="text-xs bg-[#FE7410] text-white px-1.5 py-0.5 rounded-full font-semibold">HOT</span>
                </button>
                
                <button
                  onClick={() => handleTabClick('revenue-service')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                    activeTab === 'revenue-service'
                      ? 'bg-[#FE7410]/10 text-[#FE7410]'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-[16px]">DT Dịch vụ</span>
                </button>
                
                <button
                  onClick={() => handleTabClick('revenue-package')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                    activeTab === 'revenue-package'
                      ? 'bg-[#FE7410]/10 text-[#FE7410]'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-[16px]">DT Gói</span>
                </button>
                
                <button
                  onClick={() => handleTabClick('revenue-product')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                    activeTab === 'revenue-product'
                      ? 'bg-[#FE7410]/10 text-[#FE7410]'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-[16px]">DT Sản phẩm</span>
                </button>
                
                <div className="border-t border-gray-200 my-1"></div>
                
                <button
                  onClick={() => handleTabClick('customer-report')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                    activeTab === 'customer-report'
                      ? 'bg-[#FE7410]/10 text-[#FE7410]'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-[16px]">KH Tổng quan</span>
                </button>
                
                <div className="border-t border-gray-200 my-1"></div>
                
                <button
                  onClick={() => handleTabClick('appointment-report')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                    activeTab === 'appointment-report'
                      ? 'bg-[#FE7410]/10 text-[#FE7410]'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-[16px]">Lịch hẹn</span>
                </button>
                
                <button
                  onClick={() => handleTabClick('inventory-report')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                    activeTab === 'inventory-report'
                      ? 'bg-[#FE7410]/10 text-[#FE7410]'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-[16px]">Tồn kho</span>
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Customers - Cashier, Admin */}
        {hasPermission('customers') && (
          <button
            onClick={() => handleTabClick('customers')}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeTab === 'customers'
                ? 'bg-[#FE7410]/10 text-[#FE7410]'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            title={sidebarCollapsed ? t.customers : undefined}
          >
            <Users className="w-5 h-5" />
            {!sidebarCollapsed && <span>{t.customers}</span>}
          </button>
        )}
        
        {/* Account Management with Submenu - Admin only */}
        {hasPermission('users') && (
          <div className="mb-2">
            <button
              onClick={() => {
                if (sidebarCollapsed) {
                  handleTabClick('users');
                } else {
                  setAccountMenuExpanded(!accountMenuExpanded);
                }
              }}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-lg transition-colors ${
                (activeTab === 'users' || activeTab === 'role-groups')
                  ? 'bg-[#FE7410]/10 text-[#FE7410]'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              title={sidebarCollapsed ? t.accountManagement : undefined}
            >
              <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                <User className="w-5 h-5" />
                {!sidebarCollapsed && <span>{t.accountManagement}</span>}
              </div>
              {!sidebarCollapsed && (
                accountMenuExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
              )}
            </button>
            
            {!sidebarCollapsed && accountMenuExpanded && (
              <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-4">
                <button
                  onClick={() => handleTabClick('users')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                    activeTab === 'users'
                      ? 'bg-[#FE7410]/10 text-[#FE7410]'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-[16px]">{language === 'vi' ? 'Người dùng' : 'Users'}</span>
                </button>
                
                <button
                  onClick={() => handleTabClick('role-groups')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                    activeTab === 'role-groups'
                      ? 'bg-[#FE7410]/10 text-[#FE7410]'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-[16px]">{language === 'vi' ? 'Nhóm quyền' : 'Role Groups'}</span>
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Appointments - All roles */}
        {hasPermission('appointments') && (
          <button
            onClick={() => handleTabClick('appointments')}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeTab === 'appointments'
                ? 'bg-[#FE7410]/10 text-[#FE7410]'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            title={sidebarCollapsed ? t.appointments : undefined}
          >
            <Calendar className="w-5 h-5" />
            {!sidebarCollapsed && <span>{t.appointments}</span>}
          </button>
        )}
        
        {/* Divider */}
        {!sidebarCollapsed && <div className="border-t border-gray-200 my-2"></div>}
        
        {/* Cashier View - All roles can access */}
        <button
          onClick={() => handleTabClick('cashier')}
          className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg mb-2 transition-colors ${
            activeTab === 'cashier'
              ? 'bg-orange-50 text-orange-600 border-2 border-orange-200'
              : 'text-gray-600 hover:bg-gray-50 border-2 border-transparent'
          }`}
          title={sidebarCollapsed ? t.cashier : undefined}
        >
          <User className="w-5 h-5" />
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <span>{t.cashier}</span>
              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-semibold">POS</span>
            </div>
          )}
        </button>
        
        {!sidebarCollapsed && <div className="border-t border-gray-200 my-2"></div>}
        
        {/* Settings - Admin only */}
        {hasPermission('settings') && (
          <button
            onClick={() => handleTabClick('settings')}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeTab === 'settings'
                ? 'bg-[#FE7410]/10 text-[#FE7410]'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            title={sidebarCollapsed ? t.settings : undefined}
          >
            <SettingsIcon className="w-5 h-5" />
            {!sidebarCollapsed && <span>{t.settings}</span>}
          </button>
        )}
        
        {/* Self Service - All roles */}
        <button
          onClick={() => handleTabClick('self-service')}
          className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg mb-2 transition-colors ${
            activeTab === 'self-service'
              ? 'bg-[#FE7410]/10 text-[#FE7410]'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
          title={sidebarCollapsed ? t.selfService : undefined}
        >
          <Smartphone className="w-5 h-5" />
          {!sidebarCollapsed && <span>{t.selfService}</span>}
        </button>
      </nav>
      
      <div className={`border-t border-gray-200 space-y-3 ${sidebarCollapsed ? 'p-2' : 'p-4'}`}>
        {/* Help Button */}
        <button
          onClick={onShowHelp}
          className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors border border-gray-200`}
          title={sidebarCollapsed ? t.helpCenter : t.helpCenter + ' (F1)'}
        >
          <HelpCircle className="w-5 h-5" />
          {!sidebarCollapsed && (
            <>
              <span>{t.helpCenter}</span>
              <kbd className="ml-auto px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">F1</kbd>
            </>
          )}
        </button>
        
        {/* Language Toggle */}
        <button
          onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
          className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors border border-gray-200`}
          title={sidebarCollapsed ? (language === 'vi' ? 'Tiếng Việt' : 'English') : undefined}
        >
          <Languages className="w-5 h-5" />
          {!sidebarCollapsed && <span>{language === 'vi' ? '🇻🇳 Tiếng Việt' : '🇬🇧 English'}</span>}
        </button>
        
        {!sidebarCollapsed && currentUser && (
          <button
            onClick={onShowProfileMenu}
            className="flex items-center gap-3 w-full hover:bg-gray-50 rounded-lg p-2 transition-colors"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#FE7410] to-[#FF8C3A] rounded-full flex items-center justify-center text-white font-bold">
              {currentUser.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-gray-900">
                {currentUser.charAt(0).toUpperCase() + currentUser.slice(1)}
              </div>
              <div className="text-xs text-gray-500">
                {userRole === 'admin' && (language === 'vi' ? 'Quản trị viên' : 'Administrator')}
                {userRole === 'cashier' && (language === 'vi' ? 'Thu ngân' : 'Cashier')}
                {userRole === 'technician' && (language === 'vi' ? 'Kỹ thuật viên' : 'Technician')}
              </div>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}