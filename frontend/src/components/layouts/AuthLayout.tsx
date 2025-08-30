import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: ReactNode;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="h-screen w-screen flex flex-col lg:flex-row">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-6 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Link to="/" className="inline-block">
              <Logo className="h-12 w-auto mx-auto" />
            </Link>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-sm text-gray-600">
                {subtitle}
              </p>
            )}
          </div>
          <div className="mt-8 bg-white py-8 px-6 shadow-lg rounded-lg sm:px-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
