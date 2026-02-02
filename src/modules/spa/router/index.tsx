import { Routes, Route, useNavigate } from 'react-router-dom';

import MainLayout from "../layouts/ModuleLayout";

/* ===== Screens ===== */
import Dashboard from '../pages/dashboard/Dashboard';
import { TechnicianDashboard } from '../pages/dashboard/TechnicianDashboard';
import ModernSalesScreen from '../pages/sales/ModernSalesScreen';
import ProductManagement from '../pages/products/ProductManagement';
import OrderHistory from '../pages/orders/OrderHistory';
import OrderManagement from '../pages/orders/OrderManagement';
import Reports from '../pages/reports/Reports';
import Settings from '../pages/settings/Settings';
import SelfServiceScreen from '../pages/sales/SelfServiceScreen';
import CustomerView from '../pages/customers/CustomerView';
import CashierView from '../pages/sales/CashierView';
import HelpCenter from '../pages/help/HelpCenter';
import ProfileMenu from '../components/common/ProfileMenu';
import OnboardingScreen from '../pages/onboarding/OnboardingScreen';
import IndustrySelection from '../pages/settings/IndustrySelection';
import LoginScreen from '../pages/auth/LoginScreen';
import CustomerManagement from '../pages/customers/CustomerManagement';
import UserManagement from '../pages/users/UserManagement';
import RoleGroupManagement from '../pages/users/RoleGroupManagement';
import UserPermissionManagement from '../pages/users/UserPermissionManagement';
import AppointmentManagement from '../pages/appointments/AppointmentManagement';
import ProductCategoryManagement from '../pages/products/ProductCategoryManagement';
import BedManagement from '../pages/beds/BedManagement';
import SupplierManagement from '../pages/suppliers/SupplierManagement';
import CustomerGroupManagement from '../pages/customers/CustomerGroupManagement';
import { StockInManagement } from '../pages/inventory/StockInManagement';
import { StockOutManagement } from '../pages/inventory/StockOutManagement';
import { Toaster } from 'sonner';
import { NotificationBell } from '../components/common/NotificationBell';
import DebugPackageLoader from '../components/debug/DebugPackageLoader';
/* ===== Guards & Errors ===== */
import RequireRole from '../components/auth/ProtectedRoute';
import Forbidden403 from '../pages/errors/Forbidden403';
import NotFound404 from '../pages/errors/NotFound404';

export default function SpaRouter() {
  const navigate = useNavigate();

  const handleLogin = (payload: LoginPayload) => {
    console.log('LOGIN', payload);
    localStorage.setItem('auth', JSON.stringify(payload));

    if (payload.role === 'admin') navigate('/spa/');
    if (payload.role === 'cashier') navigate('/spa/sales');
    if (payload.role === 'technician') navigate('/spa/');
  };

  return (
    <Routes>
      {/* ===== AUTH (NO LAYOUT) ===== */}
      <Route path="login" element={<LoginScreen onLogin={handleLogin} />} />

      {/* ===== APP ===== */}
      <Route element={<RequireRole allow={['technician', 'admin', 'cashier']} />}>
      <Route element={<MainLayout />}>
        {/* ===== ADMIN ===== */}
        <Route element={<RequireRole allow={['admin']} />}>

          {/* Users & Roles */}
          <Route path="users" element={<UserManagement />} />
          <Route path="users/roles" element={<RoleGroupManagement />} />
          <Route path="user-permissions" element={<UserPermissionManagement />} />

          {/* Reports */}
          <Route path="reports" element={<Reports />} />
          <Route path="reports/:type" element={<Reports />} />

          {/* Settings */}
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<ProfileMenu />} />
          <Route path="help" element={<HelpCenter />} />
          <Route path="industry-selection" element={<IndustrySelection />} />

          {/* POS / Screens */}
          <Route path="cashier" element={<CashierView />} />
          <Route path="customer-view" element={<CustomerView />} />
          <Route path="self-service" element={<SelfServiceScreen />} />

          {/* Products / Master data */}
          <Route path="product-categories" element={<ProductCategoryManagement />} />
          <Route path="beds" element={<BedManagement />} />
          <Route path="suppliers" element={<SupplierManagement />} />
          <Route path="customer-groups" element={<CustomerGroupManagement />} />

          {/* Debug */}
          
        </Route>

        {/* ===== ADMIN + CASHIER ===== */}
        <Route element={<RequireRole allow={['admin', 'cashier']} />}>
          {/* Sales */}
          <Route path="sales" element={<ModernSalesScreen />} />
          {/* Orders */}
          <Route path="orders" element={<OrderHistory />} />
          <Route path="orders/manage" element={<OrderManagement />} />

          {/* Customers */}
          <Route path="customers" element={<CustomerManagement />} />

          {/* Products */}

          {/* Inventory */}

        </Route>
        <Route element={<RequireRole allow={['technician', 'admin', 'cashier']} />}>
        
          <Route index element={<Dashboard />} />
          <Route path="technician/dashboard" element={<TechnicianDashboard />} />
          <Route path="appointments" element={<AppointmentManagement />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="inventory/stock-in" element={<StockInManagement />} />
          <Route path="inventory/stock-out" element={<StockOutManagement />} />
          <Route path="debug" element={<DebugPackageLoader />} />
        </Route>
        {/* ===== ERRORS ===== */}
        <Route path="403" element={<Forbidden403 />} />
        <Route path="*" element={<NotFound404 />} />
        </Route>
      </Route>
    </Routes>
  );
}
