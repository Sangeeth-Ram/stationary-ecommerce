import { Suspense, lazy } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { queryClient } from './lib/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/routes/ProtectedRoute';
import { AdminRoute } from './components/routes/AdminRoute';
import { Loader2 } from 'lucide-react';

// Helper function for lazy loading with default export
const lazyLoadPage = (path: string, basePath = '') =>
  lazy(() => import(`./pages/${basePath}${path}`).then(module => ({
    default: module.default || module[Object.keys(module)[0]]
  })));

// Lazy load pages for better performance
const Home = lazyLoadPage('Home');
const ProductDetails = lazyLoadPage('ProductDetail');
const Cart = lazyLoadPage('Cart');
const Checkout = lazyLoadPage('Checkout');
const Orders = lazyLoadPage('Orders');
const Profile = lazyLoadPage('Profile');
const Login = lazyLoadPage('Login');
const Signup = lazyLoadPage('Signup');
const NotFound = lazyLoadPage('NotFound');
const Unauthorized = lazyLoadPage('Unauthorized');

// Admin components
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));

// Admin pages
const Dashboard = lazyLoadPage('Dashboard', 'admin/');
const Products = lazyLoadPage('Products', 'admin/');
const CreateProduct = lazyLoadPage('CreateProduct', 'admin/');
const EditProduct = lazyLoadPage('EditProduct', 'admin/');
const OrderDetail = lazyLoadPage('OrderDetail', 'admin/');
const Customers = lazyLoadPage('Customers', 'admin/');
const CustomerDetail = lazyLoadPage('CustomerDetail', 'admin/');

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
  </div>
);

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
                {/* Protected routes */}
                <Route
                  element={
                    <ProtectedRoute>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/products/:id" element={<ProductDetails />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/profile" element={<Profile />} />
                      </Routes>
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Home />} />
                  <Route path="products/:id" element={<ProductDetails />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="checkout" element={<Checkout />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="profile" element={<Profile />} />
                </Route>

                {/* Admin routes */}
                <Route
                  path="admin"
                  element={
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  }
                >
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="products" element={<Products />} />
                  <Route path="products/new" element={<CreateProduct />} />
                  <Route path="products/:id/edit" element={<EditProduct />} />
                  <Route path="orders" element={<div>Orders List</div>} />
                  <Route path="orders/:id" element={<OrderDetail />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="customers/:id" element={<CustomerDetail />} />
                </Route>

                {/* Error routes */}
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <ReactQueryDevtools initialIsOpen={false} />
            <Toaster position="top-right" />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
