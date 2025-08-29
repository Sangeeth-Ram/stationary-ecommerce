import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[];
}

export const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (roles && roles.length > 0 && user?.role && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

interface AdminRouteProps {
  children: ReactNode;
  element?: ReactNode;
}

export const AdminRoute = ({ children, element }: AdminRouteProps) => {
  return (
    <ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}>
      {element || children}
    </ProtectedRoute>
  );
};
