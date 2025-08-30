import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/login',
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: Location })?.from || { pathname: '/' };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  // If we're still initializing, don't do anything yet
  if (isLoading === undefined) {
    return null;
  }

  // If route requires auth and user is not authenticated, redirect to login
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location.pathname !== '/' ? location : undefined }}
        replace
      />
    );
  }

  // If route is for guests only and user is authenticated, redirect to home
  if (!requireAuth && isAuthenticated) {
    return <Navigate to={from.pathname} replace />;
  }

  return <>{children}</>;
};
