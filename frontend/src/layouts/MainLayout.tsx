import type { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { Navbar } from '../components/ui/Navbar';
import { Footer } from '../components/ui/Footer';

interface MainLayoutProps {
  children?: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <Toaster position="bottom-right" />
    </div>
  );
};
