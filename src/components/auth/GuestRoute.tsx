import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const GuestRoute = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">A carregar sessão...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={user?.is_platform_admin ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
