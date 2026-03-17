import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./lib/i18n";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CompanySetup from "./pages/CompanySetup";
import ClientDashboard from "./pages/ClientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import Clients from "./pages/dashboard/Clients";
import Products from "./pages/dashboard/Products";
import Quotations from "./pages/dashboard/Quotations";
import Invoices from "./pages/dashboard/Invoices";
import Receipts from "./pages/dashboard/Receipts";
import Sent from "./pages/dashboard/Sent";
import Payments from "./pages/dashboard/Payments";
import Reports from "./pages/dashboard/Reports";
import Settings from "./pages/dashboard/Settings";
import AdminUsers from "./pages/admin/Users";
import AdminTeam from "./pages/admin/Team";
import AdminPackages from "./pages/admin/Packages";
import AdminCompanies from "./pages/admin/Companies";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminSettings from "./pages/admin/Settings";
import AdminSecurity from "./pages/admin/Security";
import DashboardTeam from "./pages/dashboard/Team";
import DashboardSecurity from "./pages/dashboard/Security";
import AcceptInvite from "./pages/AcceptInvite";
import Checkout from "./pages/Checkout";
import BillingLocked from "./pages/BillingLocked";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import GuestRoute from "./components/auth/GuestRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
            <Route path="/" element={<Index />} />
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<Auth mode="login" />} />
              <Route path="/register" element={<Auth mode="register" />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/accept-invite" element={<AcceptInvite />} />
              <Route path="/setup" element={<CompanySetup />} />
              <Route path="/dashboard" element={<ClientDashboard />} />
              <Route path="/dashboard/clients" element={<Clients />} />
              <Route path="/dashboard/products" element={<Products />} />
              <Route path="/dashboard/quotations" element={<Quotations />} />
              <Route path="/dashboard/invoices" element={<Invoices />} />
              <Route path="/dashboard/receipts" element={<Receipts />} />
              <Route path="/dashboard/sent" element={<Sent />} />
              <Route path="/dashboard/payments" element={<Payments />} />
              <Route path="/dashboard/reports" element={<Reports />} />
              <Route path="/dashboard/settings" element={<Settings />} />
              <Route path="/dashboard/team" element={<DashboardTeam />} />
              <Route path="/dashboard/security" element={<DashboardSecurity />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/billing-locked" element={<BillingLocked />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/team" element={<AdminTeam />} />
              <Route path="/admin/packages" element={<AdminPackages />} />
              <Route path="/admin/companies" element={<AdminCompanies />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/security" element={<AdminSecurity />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
