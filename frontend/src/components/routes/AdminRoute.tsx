import { Navigate, useLocation, Outlet } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/layouts/AdminLayout';

interface AdminRouteProps {
  children?: ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  // Wrap the content with AdminLayout
  const content = children || <Outlet />;
  
  return <AdminLayout>{content}</AdminLayout>;
};
