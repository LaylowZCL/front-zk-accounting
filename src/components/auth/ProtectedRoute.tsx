import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getWorkspaceEntitlements, WorkspaceEntitlements } from '@/lib/business-api';

const ProtectedRoute = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [entitlements, setEntitlements] = useState<WorkspaceEntitlements | null>(null);
  const [isLoadingEntitlements, setIsLoadingEntitlements] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!isAuthenticated || user?.is_platform_admin) {
        setIsLoadingEntitlements(false);
        return;
      }

      setIsLoadingEntitlements(true);
      try {
        const data = await getWorkspaceEntitlements();
        setEntitlements(data ?? null);
      } catch {
        setEntitlements(null);
      } finally {
        setIsLoadingEntitlements(false);
      }
    };

    load();
  }, [isAuthenticated, user?.is_platform_admin, location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">A carregar sessao...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!user?.is_platform_admin && isLoadingEntitlements) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">A validar acesso...</p>
      </div>
    );
  }

  if (!user?.is_platform_admin && entitlements) {
    if (!entitlements.company_setup_completed && location.pathname !== '/setup') {
      return <Navigate to="/setup" replace state={{ from: location }} />;
    }

    if (entitlements.company_setup_completed && location.pathname === '/setup') {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;

