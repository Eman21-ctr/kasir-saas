import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/admin/Dashboard';
import ActivationPage from './pages/onboarding/ActivationPage';
import OnboardingSetup from './pages/onboarding/OnboardingSetup';
import DashboardLayout from './components/layouts/DashboardLayout';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProductListPage from './pages/dashboard/products/ProductListPage';
import AddProductPage from './pages/dashboard/products/AddProductPage';
import EditProductPage from './pages/dashboard/products/EditProductPage';
import CategoriesPage from './pages/dashboard/products/CategoriesPage';
import AddStockPage from './pages/dashboard/products/AddStockPage';
import StockAlertsPage from './pages/dashboard/products/StockAlertsPage';
import POSPage from './pages/dashboard/pos/POSPage';
import PaymentPage from './pages/dashboard/pos/PaymentPage';
import TransactionHistoryPage from './pages/dashboard/pos/TransactionHistoryPage';
import LoyaltySettingsPage from './pages/dashboard/settings/LoyaltySettingsPage';
import MembersPage from './pages/dashboard/members/MembersPage';
import ReportsPage from './pages/dashboard/ReportsPage';
import ExpensesPage from './pages/dashboard/expenses/ExpensesPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import BusinessInfoPage from './pages/dashboard/settings/BusinessInfoPage';
import PrinterSettingsPage from './pages/dashboard/settings/PrinterSettingsPage';
import UserGuidePage from './pages/dashboard/settings/UserGuidePage';
import PrivacyPolicyPage from './pages/dashboard/settings/PrivacyPolicyPage';
import AuthGuard from './components/AuthGuard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/activate" element={<ActivationPage />} />
        <Route path="/onboarding/setup" element={<OnboardingSetup />} />

        {/* Super Admin Routes (Protected) */}
        <Route path="/admin/dashboard" element={
          <AuthGuard><Dashboard /></AuthGuard>
        } />

        {/* Shop Owner Dashboard (Protected) */}
        <Route path="/dashboard" element={
          <AuthGuard><DashboardLayout /></AuthGuard>
        }>
          <Route index element={<DashboardPage />} />

          {/* Products & Stock */}
          <Route path="products" element={<ProductListPage />} />
          <Route path="products/new" element={<AddProductPage />} />
          <Route path="products/:id" element={<EditProductPage />} />
          <Route path="products/:productId/add-stock" element={<AddStockPage />} />
          <Route path="products/categories" element={<CategoriesPage />} />
          <Route path="products/alerts" element={<StockAlertsPage />} />

          {/* POS & Transactions */}
          <Route path="pos" element={<POSPage />} />
          <Route path="pos/payment" element={<PaymentPage />} />
          <Route path="pos/history" element={<TransactionHistoryPage />} />

          {/* Members */}
          <Route path="members" element={<MembersPage />} />

          {/* Reports & Expenses */}
          <Route path="reports" element={<ReportsPage />} />
          <Route path="expenses" element={<ExpensesPage />} />

          {/* Settings */}
          <Route path="settings" element={<SettingsPage />} />
          <Route path="settings/profile" element={<BusinessInfoPage />} />
          <Route path="settings/loyalty" element={<LoyaltySettingsPage />} />
          <Route path="settings/printer" element={<PrinterSettingsPage />} />
          <Route path="settings/guide" element={<UserGuidePage />} />
          <Route path="settings/privacy" element={<PrivacyPolicyPage />} />
        </Route>

        {/* Default catch all */}
        <Route path="*" element={<div className="p-10 text-center font-sans">404: Halaman tidak ditemukan</div>} />
      </Routes>
    </Router>
  );
}

export default App;
