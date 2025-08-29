import { Suspense, lazy } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { queryClient } from './lib/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/routes/ProtectedRoute';
import { AdminRoute } from './components/routes/AdminRoute';
import { Loader2 } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';

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
const Orders = lazy(() => import('./pages/Orders').then(m => ({ default: m.default })));
const Profile = lazyLoad(() => import('./pages/Profile'));
const Login = lazyLoad(() => import('./pages/Login'));
const Signup = lazyLoad(() => import('./pages/Signup'));
const NotFound = lazyLoad(() => import('./pages/NotFound'));
const Unauthorized = lazyLoad(() => import('./pages/Unauthorized'));

// Admin components
const AdminLayout = lazyLoad(() => import('./layouts/AdminLayout'));
const Dashboard = lazyLoad(() => import('./pages/admin/Dashboard'));
const Products = lazyLoad(() => import('./pages/admin/Products'));
const CreateProduct = lazyLoad(() => import('./pages/admin/CreateProduct'));
const EditProduct = lazyLoad(() => import('./pages/admin/EditProduct'));
const OrderDetail = lazyLoad(() => import('./pages/admin/OrderDetail'));
const Customers = lazyLoad(() => import('./pages/admin/Customers'));
const CustomerDetail = lazyLoad(() => import('./pages/admin/CustomerDetail'));

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
  </div>
);

function App() {
  // Test class to verify Tailwind is working
  const testClass = 'bg-red-500 text-white p-4';
  
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Suspense fallback={<LoadingSpinner />}>
              <ErrorBoundary>
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  
                  {/* Protected routes */}
                  <Route element={
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <Outlet />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }>
                    <Route index element={<Home />} />
                    <Route path="products/:id" element={<ProductDetails />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="checkout" element={<Checkout />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="profile" element={<Profile />} />
                  </Route>

                  {/* Admin routes */}
                  <Route path="/admin" element={
                    <ErrorBoundary>
                      <AdminRoute>
                        <AdminLayout />
                      </AdminRoute>
                    </ErrorBoundary>
                  }>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="products">
                      <Route index element={<Products />} />
                      <Route path="new" element={<CreateProduct />} />
                      <Route path=":id/edit" element={<EditProduct />} />
                    </Route>
                    <Route path="orders">
                      <Route index element={<div>Orders List</div>} />
                      <Route path=":id" element={<OrderDetail />} />
                    </Route>
                    <Route path="customers">
                      <Route index element={<Customers />} />
                      <Route path=":id" element={<CustomerDetail />} />
                    </Route>
                  </Route>

                  {/* 404 route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ErrorBoundary>
              <Toaster position="top-right" />
              <ReactQueryDevtools initialIsOpen={false} />
            </Suspense>
          </AuthProvider>
        </QueryClientProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
