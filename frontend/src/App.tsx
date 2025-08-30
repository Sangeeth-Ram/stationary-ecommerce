import { Suspense, lazy } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Routes, Route, Outlet } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { queryClient } from './lib/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Loader2 } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';
import { MainLayout } from './layouts/MainLayout';

// Helper function to handle both default and named exports
const lazyLoad = (importer: () => Promise<any>) =>
  lazy(async () => {
    try {
      const module = await importer();
      // If the module has a default export, use it, otherwise use the module itself
      return { default: module.default || module };
    } catch (error) {
      console.error('Error loading module:', error);
      throw error;
    }
  });

// Lazy load pages for better performance
const Home = lazyLoad(() => import('./pages/Home'));
const ProductDetails = lazyLoad(() => import('./pages/ProductDetail'));
const Cart = lazyLoad(() => import('./pages/Cart'));
const Checkout = lazyLoad(() => import('./pages/Checkout'));
const Orders = lazyLoad(() => import('./pages/Orders'));
const Profile = lazyLoad(() => import('./pages/Profile'));
const Login = lazyLoad(() => import('./pages/Login'));
const Signup = lazyLoad(() => import('./pages/Signup'));
const NotFound = lazyLoad(() => import('./pages/NotFound'));
const Unauthorized = lazyLoad(() => import('./pages/Unauthorized'));

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Suspense fallback={<LoadingSpinner />}>
              <ErrorBoundary>
                <Routes>
                  {/* Public routes - only accessible when not authenticated */}
                  <Route element={
                    <ProtectedRoute requireAuth={false} redirectTo="/">
                      <MainLayout>
                        <Outlet />
                      </MainLayout>
                    </ProtectedRoute>
                  }>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />
                  </Route>
                  
                  {/* Protected routes - only accessible when authenticated */}
                  <Route element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Outlet />
                      </MainLayout>
                    </ProtectedRoute>
                  }>
                    <Route index element={<Home />} />
                    <Route path="products/:id" element={<ProductDetails />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="checkout" element={<Checkout />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="profile" element={<Profile />} />
                  </Route>

                  {/* 404 route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <ReactQueryDevtools initialIsOpen={false} />
              </ErrorBoundary>
            </Suspense>
          </AuthProvider>
        </QueryClientProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
